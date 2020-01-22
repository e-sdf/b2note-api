import { Response } from "express";
import { logError } from './logging';

export function clientErr(resp: Response, result: object): void {
  resp.status(400);
  resp.json(result);
}

export function serverErr(resp: Response, error: string, msg?: string): void {
  logError(error);
  resp.status(500);
  resp.send(msg || "Internal server error");
}

export function ok(resp: Response, result?: object): void {
  resp.status(200);
  resp.json(result || { message: "Success" });
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

export function created(resp: Response, location: string, result?: object): void {
  resp.status(201);
  resp.setHeader("Content-Type", "application/ld+json");
  resp.setHeader("profile", "http://www.w3.org/ns/anno.jsonld");
  resp.setHeader("Location", location);
  resp.setHeader("Access-Control-Expose-Headers", "Location, profile");
  resp.json(result || { message: "Created" });
}

export function notAuthenticated(resp: Response): void {
  resp.status(401);
  resp.json( { message: "User not authenticated" });
}

export function forbidden(resp: Response, result?: object): void {
  resp.status(403);
  resp.json(result || { message: "Forbidden" });
}

export function notFound(resp: Response, result?: object): void {
  resp.status(404);
  resp.json(result || { message: "Not found" });
}

export function windowWithMessage(resp: Response, msg: string): void {
  if (!process.env.CLIENT_URL) { logError("CLIENT_URL env variable is not defined");}
  resp.status(200);
  resp.setHeader("Content-Type","text/html");
  resp.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>B2NOTE Authorization Response</title>
    </head>
      <body>
        <p>The page sends message to its opener containing the logged user</p>
      </body>
      <script>
        window.opener.postMessage('${msg}', '${process.env.CLIENT_URL || ""}');
        console.log("message posted");
      </script>
    </html>
  `);
}