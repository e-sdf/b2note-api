import { $enum } from "ts-enum-util";
import type { Request, Response, NextFunction } from "express";
import axios from "axios";
import type { Method } from "axios";
import { axiosErrToMsg } from "./core/utils";
import * as qs from "qs";
import { v4 as uuidv4 } from "uuid";
import config from "./config";
import * as responses from "./responses";
import * as db from "./db/users";
import type { MongoClient, Collection } from "mongodb";
import { getClient } from "./db/client";

function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("oauth");
}

enum OIDCkeysEnum { 
  authorization_endpoint = "authorization_endpoint",
  token_endpoint = "token_endpoint",
  userinfo_endpoint = "userinfo_endpoint"
};

export type OIDCconfig = Record<keyof typeof OIDCkeysEnum, string>;

export type Token = string;

export interface UserinfoResponse {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  updated_at?: number;
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function authenticated(req: Request, resp: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next(); 
  } else {
    responses.notAuthenticated(resp);
  }
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

async function storeState(state: string): Promise<any> {
  const client = await getClient();
  const col = getCollection(client);
  return col.insertOne( { state } );
}

export function authorizeRoute(oidcConfig: OIDCconfig, resp: Response): void {
  const state = uuidv4();
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

export async function verifyStatePm(state: string): Promise<boolean> {
  const client = await getClient();
  const col = getCollection(client);
  const res = await col.findOneAndDelete({ state });
  return res.value != null;
}

export function loginUserPm(b2accessAuthConf: OIDCconfig, code: string): Promise<any> {

  function retrieveTokenPm() : Promise<string> {
    return new Promise((resolve, reject) => {
      const data = { 
        client_id: config.b2accessClientId,
        client_secret: config.b2accessClientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.b2accessRedirectUrl,
      };
      const options = {
        url: b2accessAuthConf.token_endpoint,
        method: "POST" as Method,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data: qs.stringify(data),
      };
      axios(options).then(
        resp => {
          console.log("token:");
          console.log(resp.data);
          resolve(resp.data);
        }
      )
      .catch(error => reject(axiosErrToMsg(error)));
    });
  }

  function retrieveProfilePm(token: string) : Promise<UserinfoResponse> {
    return new Promise((resolve, reject) => {
      const params = { code: token };
      axios.get(b2accessAuthConf.userinfo_endpoint, { params }).then(
        resp => resolve(resp.data)
      )
      .catch(error => reject(axiosErrToMsg(error)));
    });
  }

  return new Promise((resolve, reject) => {
    retrieveTokenPm().then(
      t => retrieveProfilePm(t).then(
        profile => {
          console.log("profile:");
          console.log(profile);
          db.upsertUserProfile(profile).then(
            () => resolve("some jwt"),
            err => reject(err)
          )
        }
      ),
      err => reject(err)
    );
  });
}
