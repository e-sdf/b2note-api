import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { OpenApiValidator } from "express-openapi-validator";
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

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/spec", express.static("api.yaml"));

app.use("/api/v1", router);

// Register error handler
app.use((err: any, req: Request, resp: Response, next: NextFunction) => {
  logError(err);
  resp.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

export default app;
