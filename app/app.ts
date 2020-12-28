import express from "express";
// import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import logger from "morgan";
import "source-map-support/register";
import config from "./config";
import annotationsRouter from "./routers/annotations";
import annotatorRouter from "./routers/annotator";
import ontologyRegisterRouter from "./routers/ontologyRegister";
import usersRouter from "./routers/users";
import domainsRouter from "./routers/domains";
console.log("Starting webserver at " + __dirname);

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV == "production") {
  app.use(logger("common"));
} else {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Add Allow header middleware
// app.use((req: Request, resp: Response, next: NextFunction) => {
//   resp.setHeader("Allow", "PUT,GET,OPTIONS,HEAD,DELETE,PATCH");
//   next();
// });

// Register error handler
//app.use((err: any, req: Request, resp: Response) => {
  //logError(err);
  //console.error(err);
  //resp.status(err.status || 500).json({
    //message: err.message,
    //errors: err.errors,
  //});
//});

const publicDir = path.join(__dirname, "public/");

app.use(`${config.serverPath}/static/dist`, express.static(publicDir + "dist"));
app.use(config.serverPath, express.static(publicDir + "openapi3.json"));
app.use(config.serverPath, annotationsRouter);
app.use(config.serverPath, annotatorRouter);
app.use(config.serverPath, ontologyRegisterRouter);
app.use(config.serverPath, usersRouter);
app.use(config.serverPath, domainsRouter);

export default app;
