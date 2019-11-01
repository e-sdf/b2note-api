import express from "express";
import cors from "cors";
import * as path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import router from "./router";

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", router);

export default app;
