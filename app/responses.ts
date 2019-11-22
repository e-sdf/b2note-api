import { Response } from "express";
import { logError } from './logging';

export function clientErr(resp: Response, msg: string): void {
  resp.status(400);
  resp.send(msg);
}

export function serverErr(resp: Response, error: string, msg: string): void {
  logError(error);
  resp.status(500);
  resp.send(msg);
}

export function ok(resp: Response, result?: object): void {
  resp.status(200);
  resp.json(result || { message: "OK" });
}

export function created(resp: Response, result?: object): void {
  resp.status(201);
  resp.json(result || { message: "Created" });
}

export function forbidden(resp: Response, result?: object): void {
  resp.status(403);
  resp.json(result || { message: "Forbidden" });
}

export function notFound(resp: Response, result?: object): void {
  resp.status(404);
  resp.json(result || { message: "Not found" });
}
