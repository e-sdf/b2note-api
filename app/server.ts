import * as http  from "http";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import app from "./app";
import { Issuer, Strategy as OpenIdStrategy, TokenSet, UserinfoResponse } from "openid-client";
import { Strategy as BearerStrategy, VerifyFunction } from "passport-http-bearer";
import * as responses from "./responses";
import { logError } from "./logging";
import { User } from "./core/profile";
import * as dbUsers from "./db/users";

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
  const strategy = new OpenIdStrategy(
    {
      client: b2accessClient,
      sessionKey: "b2access",
      params: { scope: "openid profile email"}
    },
    (tokenSet: TokenSet, userInfo: UserinfoResponse, done: (err: any, user?: any) => void) => {
      dbUsers.upsertUserFromAuth(userInfo, tokenSet)
      .then((userRecord) => done(null, dbUsers.record2user(userRecord)));
    }
  );

  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    dbUsers.getUserById(id).then(mbUser => {
      if (mbUser) {
        done(null, dbUsers.record2user(mbUser));
      } else {
        done(new Error("Cannot find user with id=" + id + " in the database"));
      }
    });
  });
  
  passport.use("b2access", strategy);

  app.get("/api/login", passport.authenticate("b2access", { session: false }));

  app.get("/api/auth_callback", (req: Request, resp: Response) => {
    // As B2ACCESS does not support cookies, we must retrieve the session info manually from DB
    console.log(req.sessionID);
    dbUsers.getClient().then(dbClient => {
      // TODO: OK, this is messy, how do we identify the right session record?
      dbClient.db().collection("sessions").findOne({ session: { "$regex": /.*b2access.*/ } })
      .then(sessionRecord => {
        const b2accessRecord = JSON.parse(sessionRecord.session)?.b2access;
        if (b2accessRecord) {
          if (req.session) {
            req.session.b2access = b2accessRecord;
            passport.authenticate("b2access")(req, resp, () => {
              responses.windowWithMessage(resp, JSON.stringify(req.user));
            });
          }
        } else {
          logError("Failed parsing b2access session item");
        }
      })
      .catch(err => logError("Failed retrieving b2access session from DB: " + err));
    });  
  });

  passport.use(new BearerStrategy(
    (token, done) => {
      dbUsers.getUserByToken(token).then(user => {
        if (!user) { 
          console.log("Bearer Authorization failed");
          return done(null, false);
        } else {
          console.log("Bearer Authorization user: " + user.id);
          return done(null, user);
        }
      });
    }
  ));

  app.get('/api/logout', 
    passport.authenticate("bearer", { session: false }),
    (req: Request, resp: Response) => {
      console.log(req.user);
      req.logout();
      console.log(req.user);
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
  const port = process.env.PORT || 3050;
  app.set("port", port);
  server.on("listening", onListening);
  server.listen(port);

},
(err) => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err))
.catch(err => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err));
