import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectMongo from "connect-mongo";
import logger from "morgan";
import { OpenApiValidator } from "express-openapi-validator";
import config from "./config";
import { apiUrl } from "./core/server";
import "source-map-support/register";
import { logError } from "./logging";
import * as db from "./db/client";
import annotationsRouter from "./routers/annotations";
import profileRouter from "./routers/profile";
import homeRouter from "./routers/home";
import widgetRouter from "./routers/widget";

console.log("Starting webserver at " + __dirname);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(cookieParser());

const MongoStore = connectMongo(session);
app.use(session({
  secret: config.sessionSecret,
  cookie: { secure: false },
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ clientPromise: db.getClient() })
}));

app.use(cors());
app.options("*", cors());

//new OpenApiValidator({
  //apiSpec: "api.yaml",
  //validateRequests: true, 
  //validateResponses: false
//}).install(app);

// Add Allow header middleware
// app.use((req: Request, resp: Response, next: NextFunction) => {
//   resp.setHeader("Allow", "PUT,GET,OPTIONS,HEAD,DELETE,PATCH");
//   next();
// });

// Register error handler
app.use((err: any, req: Request, resp: Response, next: NextFunction) => {
  logError(err);
  resp.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.set("view engine", "ejs");

app.use("/favicon.ico", express.static("favicon.ico"));

app.use("/", homeRouter);
app.use("/", widgetRouter);
app.use(apiUrl, annotationsRouter);
app.use(apiUrl, profileRouter);

export default app;
