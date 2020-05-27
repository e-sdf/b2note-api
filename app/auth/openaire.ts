import type { Request, Response } from "express";
import { Router } from "express";
import axios from "axios";
import type { Method } from "axios";
import { axiosErrToMsg } from "../core/utils";
import * as qs from "qs";
import config from "../config";
import type { OIDCconfig, OIDUserinfo } from "./auth";
import * as auth from "./auth";
import { genUuid, deleteUuid } from "../db/uuid";
import * as responses from "../responses";
import * as db from "../db/users";

export function retrieveConfigurationPm(url: string): Promise<OIDCconfig> {
  console.log("Sending OIDC Configuration Request to " + url);
  return new Promise((resolve, reject) => {
    axios.get(url).then(
      resp => {
        const missing = auth.checkFields(resp.data);
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
  return auth.withCollection(
    stateCol => stateCol.insertOne( { state } )
  );
}

export function authorize(oidcConfig: OIDCconfig, resp: Response): void {
  genUuid().then(
    state => {
      const params = {
        scope: "openid profile email",
        redirect_uri: config.openaireRedirectUrl,
        response_type: "code",
        client_id: config.openaireClientId,
        state,
        session: false
      };
      storeState(state).then(() => resp.redirect(oidcConfig.authorization_endpoint + "?" + qs.stringify(params)));
    }
  );
}

export function loginUser(openaireAuthConf: OIDCconfig, req: Request, resp: Response): void {

  function verifyStatePm(state: string): Promise<boolean> {
    return auth.withCollection(
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
        redirect_uri: config.openaireRedirectUrl,
      };
      const authEncoded = `${auth.formUrlEncode(config.openaireClientId)}:${auth.formUrlEncode(config.openaireClientSecret)}`;
      const cred = Buffer.from(authEncoded).toString("base64");
      const options = {
        url: openaireAuthConf.token_endpoint,
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

  function retrieveProfilePm(token: string): Promise<OIDUserinfo> {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          "Authorization": "Bearer " + token
        }
      };
      axios.get(openaireAuthConf.userinfo_endpoint, options).then(
        resp => {
          resolve(resp.data);
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
      t => retrieveProfilePm(t).then(
        userinfo => db.upsertUserProfileFromUserinfo(userinfo).then(
          () => {
            const token = auth.mkToken(userinfo.email); 
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

export function router(b2accessAuthConf: OIDCconfig): Router {
  const router = Router();

  router.get("/openaire/login", (req: Request, resp: Response) => {
    authorize(b2accessAuthConf, resp);
  });

  router.get("/openaire/auth_callback", (req: Request, resp: Response) => {
    loginUser(b2accessAuthConf, req, resp);
  });

  return router;
}

