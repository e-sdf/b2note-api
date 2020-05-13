import * as http from "http";
import type { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import config from "./config";
import app from "./app";
import { logError } from "./logging";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import type { JWT } from "./auth";
import type { UserProfile } from "./core/user";
import * as auth from "./auth";
import * as responses from "./responses";
import * as dbUsers from "./db/users";

const b2accessSessionKey = "b2access";

config.dumpConfig();

// Initialise B2ACCESS auth

console.log("Sending B2ACCESS OIDC Configuration Request to: ");
console.log(config.b2accessConfigurationUrl);

auth.retrieveConfigurationPm(config.b2accessConfigurationUrl).then(
  b2accessAuthConf => {

    console.log("Received B2ACCESS OIDC Configuration Response");

    app.get("/api/b2access/login", (req: Request, resp: Response) => {
      auth.authorizeRoute(b2accessAuthConf, resp);
    });

    app.get("/api/b2access/auth_callback", (req: Request, resp: Response) => {
      auth.loginUser(b2accessAuthConf, req, resp);
    });

    passport.use(new BearerStrategy(
      (token: string, done: (x: any, y: boolean|UserProfile) => void) => {
        jwt.verify(token, config.jwtSecret, (err, decoded) => {
          if (err) {
            done(null, false);
          } else {
            const email = (decoded as JWT).email;
            if (!email) {
              throw new Error("email not present in the JWT token"); 
              return done(null, false);
            } else {
              dbUsers.getUserProfileByEmail(email).then(userProfile => {
                if (!userProfile) { 
                  logError(`JWT verification failed: User with email ${email} does not exist`);
                  return done(null, false);
                } else {
                  return done(null, userProfile);
                }
              });
            }
          }
        });
      }
    ));

    // Server initialisation

    function onListening(): void {
      const addr = server.address();
      const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + (addr ? addr.port : "");
      console.log("B2NOTE server listening on " + bind);
    }

    const server = http.createServer(app);
    const port = config.serverPort;
    app.set("port", port);
    server.on("listening", onListening);
    server.listen(port);
  },

  err => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err)
);
