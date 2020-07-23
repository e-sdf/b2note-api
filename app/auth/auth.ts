import type { Request, Response } from "express";
import { $enum } from "ts-enum-util";
import axios from "axios";
import type { Method } from "axios";
import { axiosErrToMsg } from "../core/utils";
import jwt from "jsonwebtoken";
import config from "../config";
import { genUuid, deleteUuid } from "../db/uuid";
import * as dbClient from "../db/client";
import qs from "qs";
import * as responses from "../responses";
import * as db from "../db/users";

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

export enum OIDCkeysEnum {
  authorization_endpoint = "authorization_endpoint",
  token_endpoint = "token_endpoint",
  userinfo_endpoint = "userinfo_endpoint"
};

export type OIDCconfig = Record<keyof typeof OIDCkeysEnum, string>;

export type Token = string;

export interface JWT {
  email?: string;
}

export interface OIDUserinfo {
  name: string;
  given_name?: string;
  family_name?: string;
  email: string;
  orcid?: string;
}

export function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("oauth", dbOp);
}

export function formUrlEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

export function checkFields(data: Record<string, string>): string[] {
  return $enum(OIDCkeysEnum).getKeys().reduce((res: string[] , f: string) => data[f] ? res : [...res, f], []);
}

export function mkToken(userInfo: OIDUserinfo): Token {
  return jwt.sign({ email: userInfo.email }, config.jwtSecret, { expiresIn: "14d" });
}

export function retrieveConfigurationPm(url: string): Promise<OIDCconfig> {
  console.log("Sending OIDC Configuration Request to " + url);
  return new Promise((resolve, reject) => {
    axios.get(url).then(
      resp => {
        const missing = checkFields(resp.data);
        if (missing.length > 0) {
          reject("the OIDC response is missing the following fields: " + JSON.stringify(missing));
        } else {
          console.log("Got OIDC Configuration Response from " + url);
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

export function authorize(authConfig: AuthConfig, oidConfig: OIDCconfig, resp: Response): void {
  genUuid().then(
    state => {
      const params = {
        scope: "openid profile email orcid",
        redirect_uri: authConfig.redirectUrl,
        response_type: "code",
        client_id: authConfig.clientId,
        state,
        session: false
      };
      storeState(state).then(() => resp.redirect(oidConfig.authorization_endpoint + "?" + qs.stringify(params)));
    }
  );
}

export function loadUserInfoPm(oidConfig: OIDCconfig, providerToken: Token): Promise<OIDUserinfo> {

  function retrieveProfilePm(oidConfig: OIDCconfig): Promise<OIDUserinfo> {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          "Authorization": "Bearer " + providerToken
        }
      };
      axios.get(oidConfig.userinfo_endpoint, options).then(
        resp => {
          resolve(resp.data);
        }
      )
      .catch(error => reject(axiosErrToMsg(error)));
    });
  }

  return new Promise((resolve, reject) =>
    retrieveProfilePm(oidConfig).then(
      userinfo => db.upsertUserProfileFromUserinfo(userinfo).then(
        () => resolve(userinfo),
        err => reject(err)
      )
    )
  );
}

export function loginUser(authConfig: AuthConfig, oidConfig: OIDCconfig, req: Request, resp: Response): void {

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
        redirect_uri: authConfig.redirectUrl,
      };
      const authEncoded = `${formUrlEncode(authConfig.clientId)}:${formUrlEncode(authConfig.clientSecret)}`;
      const cred = Buffer.from(authEncoded).toString("base64");
      const options = {
        url: oidConfig.token_endpoint,
        method: "POST" as Method,
        headers: {
          "Authorization": "Basic " + cred,
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
      t => loadUserInfoPm(oidConfig, t).then(
        userinfo => {
          const token = mkToken(userinfo);
          responses.windowWithMessage(resp, token);
        },
        err => {
          responses.forbidden(resp, err);
        }
      ),
      err => responses.serverErr(resp, err, true)
    );
  }
}
