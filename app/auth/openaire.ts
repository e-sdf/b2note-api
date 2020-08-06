import type { Request, Response } from "express";
import { Router } from "express";
import config from "../config";
import type { OIDCconfig } from "./auth";
import * as auth from "./auth";
import { ErrorCodes } from "../responses";
import * as responses from "../responses";

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

  router.get("/openaire/take-login", (req: Request, resp: Response) => {
    if (req.query.token) { // validate the service's token received via client messaging
      const servicesToken = req.query.token as string;
      console.log("Received service's token " + servicesToken);
      auth.loadUserInfoPm(oidConfig, servicesToken).then(
        userinfo => {
          const token = auth.mkToken(userinfo);
          console.log("Verified, sending token");
          responses.ok(resp, token);
        },
        err => { // invalid service's token
          console.log("Verification failed");
          responses.forbidden(resp, err);
        }
      );
    } else {
      responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "Missing service token parametre");
    }
  });

  router.get("/openaire/login", (req: Request, resp: Response) => {
    auth.authorize(authConfig, oidConfig, resp);
  });

  router.get("/openaire/auth_callback", (req: Request, resp: Response) => {
    auth.loginUser(authConfig, oidConfig, req, resp);
  });

  return router;
}
