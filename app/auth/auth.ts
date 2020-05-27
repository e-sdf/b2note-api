import { $enum } from "ts-enum-util";
import jwt from "jsonwebtoken";
import config from "../config";
import * as dbClient from "../db/client";

export interface OIDUserinfo {
  name: string;
  given_name?: string;
  family_name?: string;
  email: string;
}

export function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("oauth", dbOp);
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

export function formUrlEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

export function checkFields(data: Record<string, string>): string[] {
  return $enum(OIDCkeysEnum).getKeys().reduce((res: string[] , f: string) => data[f] ? res : [...res, f], []);
}

export function mkToken(email: string): string {
  return jwt.sign({ email }, config.jwtSecret, { expiresIn: "14d" });
}

