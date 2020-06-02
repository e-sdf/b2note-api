import type { Request, Response } from "express";
import { Router } from "express";
import config from "../config";
import type { OIDCconfig } from "./auth";
import * as auth from "./auth";

const authConfig: auth.AuthConfig = {
  clientId: config.b2accessClientId,
  clientSecret: config.b2accessClientSecret,
  redirectUrl: config.b2accessRedirectUrl
};

export function retrieveConfigurationPm(): Promise<OIDCconfig> {
  return auth.retrieveConfigurationPm(config.b2accessConfigurationUrl);
}

export function router(oidConfig: OIDCconfig): Router {
  const router = Router();

  router.get("/b2access/login", (req: Request, resp: Response) => {
    auth.authorize(authConfig, oidConfig, resp);
  });

  router.get("/b2access/auth_callback", (req: Request, resp: Response) => {
    auth.loginUser(authConfig, oidConfig, req, resp);
  });

  return router;
}

