import * as http  from "http";
import { Request, Response } from "express";
import passport from "passport";
import config from "./config";
import app from "./app";
import { logError } from "./logging";
import { Issuer, Strategy as OpenIdStrategy, TokenSet, UserinfoResponse } from "openid-client";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { User } from "./core/user";
import * as responses from "./responses";
import * as dbUsers from "./db/users";
import { popB2AccessSession } from "./db/sessions";

const b2accessSessionKey = "b2access";

config.dumpConfig();

// Initialise B2ACCESS auth

Issuer.discover(config.b2accessUrl + config.b2accessConfigurationPath).then(b2accessInfo => {
  console.log("Received B2ACCESS OIDC Configuration Response");
  app.use(passport.initialize());
  app.use(passport.session());
  const b2accessClient = new b2accessInfo.Client({
    client_id: config.b2accessClientId,
    client_secret: config.b2accessClientSecret,
    redirect_uris: [config.b2accessRedirectUrl],
    response_types: ["code"],
  });
  const strategy = new OpenIdStrategy(
    {
      client: b2accessClient,
      sessionKey: b2accessSessionKey,
      params: { scope: "openid profile email"}
    },
    (tokenSet: TokenSet, userInfo: UserinfoResponse, done: (err: Error|null, user: User|null) => void) => {
      dbUsers.upsertUserProfileFromAuth(userInfo, tokenSet)
      .then((userRecord) => {
        const mbUser = dbUsers.record2user(userRecord);
        if (!mbUser) {
          logError("Access token missing");
          done(new Error("Access token missing"), null);
        } else {
          done(null, mbUser);
        }
      })
      .catch(err => done(err, null));
    }
  );

  passport.serializeUser((user: User, done: (err: Error|null, id: string) => void) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done: (err: Error|null, user: User|null) => void) => {
    dbUsers.getUserById(id).then((mbUser: User|null) => {
      if (mbUser) {
        done(null, mbUser);
      } else {
        done(new Error("Cannot find user with id=" + id + " in the database"), null);
      }
    });
  });
  
  passport.use("b2access", strategy);

  app.get("/api/login", (req: Request, resp: Response) => {
    passport.authenticate("b2access", { session: false })(req, resp);
  });

  app.get("/api/auth_callback", (req: Request, resp: Response) => {
    // As B2ACCESS does not support cookies, we must retrieve the session info manually from DB
    popB2AccessSession(req.query.state)
    .then(b2accessRecord => {
      if (req.session) {
        req.session[b2accessSessionKey] = b2accessRecord;
        passport.authenticate("b2access")(req, resp, (err: any) => {
          if (err) {
            logError(err);
            responses.serverErr(resp, "Error processing auth callback");
          } else {
            if (req.user) {
              responses.windowWithMessage(resp, JSON.stringify(req.user));
            } else {
              responses.serverErr(resp, "req.user is empty");
            }
          }
        });
      } else { logError("Session support missing"); }
    })
    .catch(err => logError("Failed retrieving b2access session from DB: " + err));
  });

  passport.use(new BearerStrategy(
    (token, done) => {
      dbUsers.getUserByToken(token).then(user => {
        if (!user) { 
          return done(null, false);
        } else {
          // console.log("Bearer Authorization user: " + user.id);
          return done(null, user);
        }
      });
    }
  ));

  app.get('/api/logout', 
    passport.authenticate("bearer", { session: false }),
    (req: Request, resp: Response) => {
      req.logout();
      responses.ok(resp, { message: "You are logged out"});
    });

  // Server initialisation

  function onListening(): void {
    const addr = server.address();
    const bind = typeof addr === "string"
      ? "pipe " + addr
      : "port " + (addr ? addr.port : "");
    console.log("B2NOTE server listening on " + bind);
  }

  const server = http.createServer(app);
  const port = config.b2notePort;
  app.set("port", port);
  server.on("listening", onListening);
  server.listen(port);

},
(err) => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err))
.catch(err => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err));
