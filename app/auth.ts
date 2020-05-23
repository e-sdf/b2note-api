import { $enum } from "ts-enum-util";
import type { Request, Response } from "express";
import axios from "axios";
import type { Method } from "axios";
import { axiosErrToMsg } from "./core/utils";
import * as qs from "qs";
import jwt from "jsonwebtoken";
import config from "./config";
import { mkUuid, deleteUuid } from "./db/uuid";
import * as responses from "./responses";
import * as db from "./db/users";
import * as dbClient from "./db/client";

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("oauth", dbOp);
}
enum OIDCkeysEnum { 
  authorization_endpoint = "authorization_endpoint",
  token_endpoint = "token_endpoint",
  userinfo_endpoint = "userinfo_endpoint"
};

export type OIDCconfig = Record<keyof typeof OIDCkeysEnum, string>;

export type Token = string;

export interface JWT {
  email?: string;
}

export interface B2accessUserinfoResponse {
  name: string;
  email: string;
}

function formUrlEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

function checkFields(data: Record<string, string>): string[] {
  return $enum(OIDCkeysEnum).getKeys().reduce((res: string[] , f: string) => data[f] ? res : [...res, f], []);
}

export function retrieveConfigurationPm(url: string): Promise<OIDCconfig> {
  return new Promise((resolve, reject) => {
    axios.get(url).then(
      resp => {
        const missing = checkFields(resp.data);
        if (missing.length > 0) {
          reject("the OIDC response is missing the following fields: " + JSON.stringify(missing));
        } else {
          const data = resp.data as OIDCconfig;
          resolve({
            authorization_endpoint: data.authorization_endpoint,
            token_endpoint: data.token_endpoint,
            userinfo_endpoint: data.userinfo_endpoint
          });
        }
      }
    )
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

function storeState(state: string): Promise<any> {
  return withCollection(
    stateCol => stateCol.insertOne( { state } )
  );
}

export function authorizeRoute(oidcConfig: OIDCconfig, resp: Response): void {
  mkUuid().then(
    state => {
      const params = {
        scope: "openid profile email",
        redirect_uri: config.b2accessRedirectUrl,
        response_type: "code",
        client_id: config.b2accessClientId,
        state,
        session: false
      };
      storeState(state).then(() => resp.redirect(oidcConfig.authorization_endpoint + "?" + qs.stringify(params)));
    }
  );
}

export function loginUser(b2accessAuthConf: OIDCconfig, req: Request, resp: Response): void {

  function verifyStatePm(state: string): Promise<boolean> {
    return withCollection(
      stateCol => new Promise((resolve) => {
        stateCol.findOneAndDelete({ state }).then(
          res => deleteUuid(state).then(() => resolve(res.value != null))
        );
      })
    );
  }

  function retrieveTokenPm(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const data = { 
        grant_type: "authorization_code",
        code,
        redirect_uri: config.b2accessRedirectUrl,
      };
      const authEncoded = `${formUrlEncode(config.b2accessClientId)}:${formUrlEncode(config.b2accessClientSecret)}`;
      const auth = Buffer.from(authEncoded).toString("base64");
      const options = {
        url: b2accessAuthConf.token_endpoint,
        method: "POST" as Method,
        headers: { 
          "Authorization": "Basic " + auth,
          "content-type": "application/x-www-form-urlencoded"
        },
        data: qs.stringify(data),
      };
      axios(options).then(
        resp => {
          if (!resp.data.access_token) {
            reject("access_token not present in response");
          } else {
            resolve(resp.data.access_token);
          }
        }
      )
      .catch(error => reject(axiosErrToMsg(error)));
    });
  }

  function retrieveProfilePm(token: string): Promise<B2accessUserinfoResponse> {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          "Authorization": "Bearer " + token
        }
      };
      axios.get(b2accessAuthConf.userinfo_endpoint, options).then(
        resp => resolve(resp.data)
      )
      .catch(error => reject(axiosErrToMsg(error)));
    });
  }

  function mkToken(email: string): string {
    return jwt.sign({ email }, config.jwtSecret, { expiresIn: "14d" });
  }

  const state = req.query.state as string|null;
  const code = req.query.code as string|null;

  if (!state) {
    responses.notAuthorized(resp, "auth callback did not return state");
  } else if (!verifyStatePm(state)) {
    responses.notAuthorized(resp, "auth callback contained wrong state.");
  } else if (!code) {
    responses.notAuthorized(resp, "auth callback did not return code.");
  } else {
    retrieveTokenPm(code).then(
      t => retrieveProfilePm(t).then(
        profile => db.upsertUserProfileFromB2ACCESS(profile).then(
          () => {
            const token = mkToken(profile.email); 
            responses.windowWithMessage(resp, token);
          },
          err => {
            responses.forbidden(resp, err);
          }
        )
      ),
      err => responses.serverErr(resp, err, true)
    );
  }
}
