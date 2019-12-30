import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { OpenApiValidator } from "express-openapi-validator";
import { apiUrl } from "./core/server";
import router from "./router";
import "source-map-support/register";
import { logError } from "./logging";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.options("*", cors());

//new OpenApiValidator({
  //apiSpec: "api.yaml",
  //validateRequests: true, 
  //validateResponses: false
//}).install(app);

// Add Allow header middleware
app.use((req: Request, resp: Response, next: NextFunction) => {
  resp.setHeader("Allow", "PUT,GET,OPTIONS,HEAD,DELETE,PATCH");
  next();
});

// Register error handler
app.use((err: any, req: Request, resp: Response, next: NextFunction) => {
  logError(err);
  resp.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"), { index: false }));

app.use("/favicon.ico", express.static("favicon.ico"));
app.use(apiUrl + "/spec", express.static("api.yaml"));

app.use(apiUrl, router);

export default app;
