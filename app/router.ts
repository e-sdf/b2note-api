import { Request, Response, Router } from "express";
import * as express from "express";
import { clientErrRes, serverErrRes, okRes } from "./results";
import mongodb from "mongodb";

var router = Router();

router.post("/annotations", (req: Request, res: Response) => {
  okRes(res, { result: req.body});  
});

export default router;
