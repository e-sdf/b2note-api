import express from "express";
import cors from "cors";
import * as path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import * as results from "./results";

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/api/annotations", (req, res: any) => {
  results.okRes(res, { result: "works"});  
});

export default app;
