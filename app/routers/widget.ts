import type { Request, Response } from "express";
import { Router } from "express";
import * as responses from "../responses";

const router = Router();

// Get the widget without filling it with a Target
// router.get("/widget", (req: Request, resp: Response) => {
//   resp.render("widget");
// });

// Historic URL, redirect to "/widget"
router.post("/interface_main.html", (req: Request, resp: Response) => {
  resp.redirect(307, "/widget");
});

// Return widget; from historical reasons, loading a widget with a Target is POST
router.post("/widget", (req: Request, resp: Response) => {
  if (!req.body.pid_tofeed) {
    responses.clientErr(resp, { error: "pid_tofeed missing in body" });
  } else {
    const pid = req.body.pid_tofeed;
    if (!req.body.subject_tofeed)  {
      responses.clientErr(resp, { error: "subject_tofeed missing in the body" });
    } else {
      const source = req.body.subject_tofeed;
      resp.render("widget", { pid, source });
    }
  }
});

export default router;
