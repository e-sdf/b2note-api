import { Request, Response, NextFunction } from "express";
import * as responses from "./responses";

export function authenticated(req: Request, resp: Response, next: NextFunction): void {
  console.log(req.session);
  if (req.isAuthenticated()) {
    return next(); 
  } else {
    responses.notAuthenticated(resp);
  }
}
