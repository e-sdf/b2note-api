import { Response } from "express";
import { logError } from './logging';

export interface RestError {
  error: string;
  message: string;
}

export enum ErrorCodes { 
  SERVER_ERR = "InternalServerError",
  NOT_AUTHORIZED = "NotAuthorized",
  FORBIDDEN = "Forbidden",
  NO_USER_IN_REQUEST = "NoUserInRequest",
  REQ_FORMAT_ERR = "RequestFormatError",
  SYNTAX_ERR = "RequestParameterSyntaxError",
  NOT_FOUND = "NotFound"
};

function mkErr(code: ErrorCodes, message: string): RestError {
  return {
    error: code,
    message
  };
}

export function clientErr(resp: Response, code: ErrorCodes, message: string): void {
  resp.status(400);
  resp.json(mkErr(code, message));
}

export function reqErr(resp: Response, errors: Record<any, any>): void {
  clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, JSON.stringify(errors));
}

export function syntaxErr(resp: Response, errors: Record<any, any>): void {
  clientErr(resp, ErrorCodes.SYNTAX_ERR, JSON.stringify(errors));
}
export function serverErr(resp: Response, logMsg: string, fatal = false): void {
  if (fatal) {
    throw new Error(logMsg);
  } else {
    logError(logMsg);
  }
  resp.status(500);
  resp.json(mkErr(ErrorCodes.SERVER_ERR, "Internal server error"));
}

export function ok(resp: Response, result?: object|string): void {
  resp.status(200);
  if (result) {
    if (typeof result === "string") {
      resp.send(result);
    } else {
      resp.json(result);
    }
  } else {
    resp.send("Success");
  }
}

export function jsonld(resp: Response, result: Record<string, any>): void {
  resp.status(200);
  resp.setHeader("Vary", "Accept");
  resp.setHeader("Content-Type", "application/ld+json");
  resp.setHeader("profile", "http://www.w3.org/ns/anno.jsonld");
  resp.setHeader("Access-Control-Expose-Headers", "Content-Disposition, filename, profile");
  resp.send(result);
}

export function xml(resp: Response, result: string): void {
  resp.status(200);
  resp.setHeader("Vary", "Accept");
  resp.setHeader("Content-Type","text/xml");
  resp.setHeader("Access-Control-Expose-Headers", "Content-Disposition, filename");
  resp.send(result);
}

export function created(resp: Response, location: string, result: object): void {
  resp.status(201);
  resp.setHeader("Content-Type", "application/ld+json");
  resp.setHeader("profile", "http://www.w3.org/ns/anno.jsonld");
  resp.setHeader("Location", location);
  resp.setHeader("Access-Control-Expose-Headers", "Location, profile");
  resp.json(result);
}

export function notAuthorized(resp: Response, message: string): void {
  resp.status(401);
  resp.json(mkErr(ErrorCodes.NOT_AUTHORIZED, message));
}

export function forbidden(resp: Response, message: string): void {
  resp.status(403);
  resp.json(mkErr(ErrorCodes.FORBIDDEN, message));
}

export function notFound(resp: Response, message: string): void {
  resp.status(404);
  resp.json(mkErr(ErrorCodes.NOT_FOUND, message));
}

export function windowWithMessage(resp: Response, msg: string): void {
  resp.status(200);
  resp.setHeader("Content-Type","text/html");
  resp.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>B2NOTE Authorization Response</title>
    </head>
      <body>
        <p>The page sends message to its opener containing the logged user Bearer token</p>
      </body>
      <script>
        window.opener.postMessage('${msg}', '*');
      </script>
    </html>
  `);
}