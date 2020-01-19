import * as http  from "http";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import app from "./app";
import { Issuer, Strategy, TokenSet, UserinfoResponse } from "openid-client";
import * as responses from "./responses";
import { logError } from "./logging";
import * as db from "./db/users";

// Read env variables

const configurationURL = process.env.B2ACCESS_CONFIGURATION_URL;
if (!configurationURL) { logError("B2ACCESS_CONFIGURATION_URL env variable missing"); }

const  clientID = process.env.B2ACCESS_CLIENT_ID;
if (!clientID) { logError("B2ACCESS_CLIENT_ID env variable missing"); }

const  clientSecret = process.env.B2ACCESS_CLIENT_SECRET;
if (!clientSecret) { logError("B2ACCESS_CLIENT_SECRET env variable missing"); }

const  callbackURL = process.env.B2ACCESS_REDIRECT_URL;
if (!callbackURL) { logError("B2ACCESS_REDIRECT_URL env variable missing"); }

// Initialise B2ACCESS auth

console.log("Sending B2ACCESS OIDC Configuration Request...");
Issuer.discover(configurationURL || "").then(b2accessInfo => {
  console.log("Received B2ACCESS OIDC Configuration Response");
  app.use(passport.initialize());
  app.use(passport.session());
  const b2accessClient = new b2accessInfo.Client({
    client_id: clientID || "",
    client_secret: clientSecret || "",
    redirect_uris: [callbackURL || ""],
    response_types: ["code"],
  });
  const strategy = new Strategy(
    {
      client: b2accessClient,
      sessionKey: "b2access",
      params: { scope: "openid profile email"}
    },
    (tokenSet: TokenSet, userInfo: UserinfoResponse, done: (err: any, user?: any) => void) => {
      db.upsertUserFromAuth(userInfo, tokenSet).then(() => done(null, userInfo));
    }
  );

  passport.serializeUser((user, done) => {
    // console.log("serialize");
    // console.log(user);
    done(null, user);
  });

  passport.deserializeUser((id, done) => {
    // console.log("deserialize");
    // console.log(id);
    done(null, id);
  });

  passport.use("b2access", strategy);

  app.get("/api/login", passport.authenticate("b2access", { session: false }));

  app.get("/api/auth_callback", (req: Request, resp: Response) => {
    // As B2ACCESS does not support cookies, we must retrieve the session info manually from DB
    db.getClient().then(dbClient => {
      dbClient.db().collection("sessions").findOne({ session: { "$regex": /.*b2access.*/ } })
      .then(sessionRecord => {
        const b2accessRecord = JSON.parse(sessionRecord.session)?.b2access;
        if (b2accessRecord) {
          if (req.session) {
            req.session.b2access = b2accessRecord;
            passport.authenticate("b2access")(req, resp, () => {
              db.getAccessToken((req.user as any)?.sub)
              .then(access_token => responses.ok(resp, { access_token }));
            });
          }
        } else {
          logError("Failed parsing b2access session item");
        }
      })
      .catch(err => logError("Failed retrieving b2access session from DB: " + err));
    });  
  });

  app.get("/api/userinfo", (req: Request, resp: Response) => {
    console.log("session for userinfo:");
    console.log(req.session);
    // if (!tokenSet) {
    //   responses.serverErr(resp, "tokenSet is undefined");
    // } else {
    //   b2accessClient.userinfo(tokenSet).then(userInfo => {
    //     console.log(userInfo);
    //     responses.ok(resp);
    //   });
    // }
    responses.ok(resp);
  });

  app.get('/api/logout', (req: Request, resp: Response) => {
    req.logout();
    responses.ok(resp);
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
  const port = process.env.PORT || 3050;
  app.set("port", port);
  server.on("listening", onListening);
  server.listen(port);

},
(err) => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err))
.catch(err => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err));
