import type { Request, Response } from "express";
import { Router } from "express";
import config from "../config";
import type { OIDCconfig } from "./auth";
import * as auth from "./auth";

const authConfig: auth.AuthConfig = {
  clientId: config.openaireClientId,
  clientSecret: config.openaireClientSecret,
  redirectUrl: config.openaireRedirectUrl
};

export function retrieveConfigurationPm(): Promise<OIDCconfig> {
  return auth.retrieveConfigurationPm(config.openaireConfigurationUrl);
}

export function router(oidConfig: OIDCconfig): Router {
  const router = Router();

  router.get("/openaire/login", (req: Request, resp: Response) => {
    auth.authorize(authConfig, oidConfig, resp);
  });

  router.get("/openaire/auth_callback", (req: Request, resp: Response) => {
    auth.loginUser(authConfig, oidConfig, req, resp);
  });

  return router;
}

