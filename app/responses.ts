import { Response } from "express";
import { logError } from './logging';
import config from "./config";

export function clientErr(resp: Response, reason: object): void {
  resp.status(400);
  resp.json(reason);
}

export function serverErr(resp: Response, error: string, msg?: string): void {
  logError(error);
  resp.status(500);
  resp.send(msg || "Internal server error");
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

export function notAuthenticated(resp: Response): void {
  resp.status(401);
  resp.send("User not authenticated");
}

export function forbidden(resp: Response, msg: string): void {
  resp.status(403);
  resp.send(msg);
}

export function notFound(resp: Response, msg?: string): void {
  resp.status(404);
  resp.send(msg || "Not found");
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
        <p>The page sends message to its opener containing the logged user Bearer Token</p>
      </body>
      <script>
        window.opener.postMessage('${msg}', '*');
      </script>
    </html>
  `);
}