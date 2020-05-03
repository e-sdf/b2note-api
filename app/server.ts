import * as http from "http";
import type { Request, Response } from "express";
import passport from "passport";
import config from "./config";
import app from "./app";
import { logError } from "./logging";
import { custom, Issuer, Strategy as OpenIdStrategy, TokenSet, UserinfoResponse, ClientMetadata } from "openid-client";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { User } from "./core/user";
import * as auth from "./auth";
import * as responses from "./responses";
import * as dbUsers from "./db/users";
import { popB2AccessSession } from "./db/sessions";

const b2accessSessionKey = "b2access";

require("axios-debug-log")({
  request: (debug: any, config: any) => {
    //debug("Request with " + JSON.stringify(config, null, 2));
  },
  response: (debug: any, response: any) => {
    //debug(
      //"Response with " + response.headers["content-type"],
      //"from " + response.config.url
    //)
  },
  error: (debug: any, error: any) => {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug("Axios error", error);
  }
})

config.dumpConfig();

custom.setHttpOptionsDefaults({
  timeout: 10000,
});

// Setup auth configs
// const authConfig: AuthConfig|null = matchSwitch(config.authProvider, {
//   [AuthProvider.NONE]: () => { throw new Error("Auth provider not set"); return null; },
//   [AuthProvider.B2ACCESS]: () => ({
//     configurationUrl: config.b2accessConfigurationUrl,
//     client_id: config.b2accessClientId,
//     client_secret: config.b2accessClientSecret,
//     redirect_uris: [config.b2accessRedirectUrl],
//     response_types: ["code"]
//   }),
//   [AuthProvider.GAUTH]: () => ({
//     configurationUrl: config.gAuthConfigurationUrl,
//     client_id: config.gAuthClientId,
//     client_secret: config.gAuthClientSecret,
//     redirect_uris: [config.gAuthRedirectUrl],
//     response_types: ["code"],
//   })
// });

// const b2AccessInfoPromise = () => 
//   config.b2access ? Issuer.discover(config.b2accessConfigurationUrl) : Promise.reject();

// const gAuthInfoPromise = () => 
//   config.gAuth ? Issuer.discover(config.gAuthConfigurationUrl) : Promise.reject();

// Initialise B2ACCESS auth

console.log("Sending B2ACCESS OIDC Configuration Request to: ");
console.log(config.b2accessConfigurationUrl);

//Issuer.discover(config.b2accessConfigurationUrl).then(authInfo => {
  //console.log("Received B2ACCESS OIDC Configuration Response");
  //app.use(passport.initialize());
  //app.use(passport.session());
  //const authClient = new authInfo.Client({
    //client_id: config.b2accessClientId,
    //client_secret: config.b2accessClientSecret,
    //redirect_uris: [config.b2accessRedirectUrl],
    //response_types: ["code"]
  //});
  //const strategy = new OpenIdStrategy(
    //{
      //client: authClient,
      //sessionKey: b2accessSessionKey,
      //params: { scope: "openid profile email"}
    //},
    //(tokenSet: TokenSet, userInfo: UserinfoResponse, done: (err: Error|null, user: User|null) => void) => {
      //dbUsers.upsertUserProfileFromAuth(userInfo, tokenSet)
      //.then((userRecord) => {
        //const mbUser = dbUsers.record2user(userRecord);
        //if (!mbUser) {
          //logError("Access token missing");
          //done(new Error("Access token missing"), null);
        //} else {
          //done(null, mbUser);
        //}
      //})
      //.catch(err => done(err, null));
    //}
  //);

  //passport.serializeUser((user: User, done: (err: Error|null, id: string) => void) => {
    //done(null, user.id);
  //});

  //passport.deserializeUser((id: string, done: (err: Error|null, user: User|null) => void) => {
    //dbUsers.getUserById(id).then((mbUser: User|null) => {
      //if (mbUser) {
        //done(null, mbUser);
      //} else {
        //done(new Error("Cannot find user with id=" + id + " in the database"), null);
      //}
    //});
  //});
  
  //passport.use("b2access", strategy);

auth.retrieveConfigurationPm(config.b2accessConfigurationUrl).then(
  b2accessAuthConf => {

    console.log("Received B2ACCESS OIDC Configuration Response");

    app.get("/api/b2access/login", (req: Request, resp: Response) => {
      auth.authorizeRoute(b2accessAuthConf, resp);
      //passport.authenticate("b2access", { session: false })(req, resp);
    });

    // app.get("/api/gauth/login", (req: Request, resp: Response) => {
    //   passport.authenticate("auth", { session: false })(req, resp);
    // });

    app.get("/api/b2access/auth_callback", (req: Request, resp: Response) => {
      const state = req.query.state as string|null;
      const code = req.query.code as string|null;

      if (!state) {
        responses.notAuthenticated(resp, "B2ACCESS auth callback did not return state");
      } else if (!auth.verifyStatePm(state)) {
        responses.notAuthenticated(resp, "B2ACCESS auth callback contained wrong state.");
      } else if (!code) {
        responses.notAuthenticated(resp, "B2ACCESS auth callback did not return code.");
      } else {
        auth.loginUserPm(b2accessAuthConf, code).then(
          jwt => {
            console.log(jwt);
            responses.windowWithMessage(resp, jwt);
          },
          err => {
            logError(err);
            responses.forbidden(resp, err);
          }
        );
      }

      // As B2ACCESS does not support cookies, we must retrieve the session info manually from DB
      //popB2AccessSession(req.query.state as string)
      //.then(authRecord => {
        //if (req.session) {
          //req.session[b2accessSessionKey] = authRecord;
          //passport.authenticate("b2access")(req, resp, (err: any) => {
            //if (err) {
              //logError(err);
              //responses.serverErr(resp, "Error processing B2ACCESS callback");
            //} else {
              //if (req.user) {
                //responses.windowWithMessage(resp, JSON.stringify(req.user));
              //} else {
                //responses.serverErr(resp, "req.user is empty");
              //}
            //}
          //});
        //} else { logError("Session support missing"); }
      //})
      //.catch(err => logError("Failed retrieving B2ACCESS session from DB: " + err));
    });

    passport.use(new BearerStrategy(
      (jwt, done) => {
        const email = "decoded e-mail from JWT";
        dbUsers.getUserByEmail(email).then(user => {
          if (!user) { 
            throw new Error("Email does not exist: " + email);
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      }
    ));

    app.get("/api/logout", 
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
    const port = config.serverPort;
    app.set("port", port);
    server.on("listening", onListening);
    server.listen(port);
  },

  err => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err)
);
//},
//(err) => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err))
//.catch(err => logError("Failed receiving B2ACCESS OIDC Configuration Response: " + err));
