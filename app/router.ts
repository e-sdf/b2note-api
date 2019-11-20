import { Request, Response, Router } from "express";
import { logError } from "./logging";
import * as responses from "./responses";
import * as an from "./shared/annotation";
import * as db from "./db";

const router = Router();

interface AnResponse {
  _updated: string;
  _created: string;
  _id: string;
  _links: {
    self: {
      title: string;
      href: string;
    };
  };
  _status: string;
}

function mkResponse(id: string): AnResponse {
  const ts = an.mkTimestamp();
  return {
    _updated: ts,
    _created: ts,
    _id: id,
    _links: {
      self: {
        title: "Annotation",
        href: "annotations/" + id
      }
    },
    _status: "OK"
  };
}

function handleError(resp: Response, error: any): void {
  logError(error);
  responses.serverErr(resp, error, "Internal server error");
}

// Handlers {{{1

// Get list of annotations
router.get("/annotations", (req: Request, resp: Response) => {
  db.getClient().then(
    client => db.getAnnotations(db.getCollection(client), req.query as an.GetQuery).then(
      anl => responses.ok(resp, anl),
      error => handleError(resp, error)
    ),
    error => handleError(resp, error)
  );
});

// Create a new annotation 
router.post("/annotations", (req: Request, resp: Response) => {
  const annotation = req.body as an.AnRecord;
  db.addAnnotation(annotation).then(
    newId => {
      if (newId) { // annotation saved
        responses.created(resp, mkResponse(newId));
      } else { // annotation already exists
        responses.forbidden(resp, { message: "Annotation already exists" });
      }
    }
  ).catch(
    err => responses.serverErr(resp, err, "Internal server error")
  );
});

router.get("/files", (req: Request, resp: Response) => {
  db.getClient().then(
    client => db.getAnnotationsForTag(db.getCollection(client), req.query as an.FilesQuery).then(
      annotations => responses.ok(resp, annotations.map(a => a.target.source)),
      error => handleError(resp, error)
    ),
    error => handleError(resp, error)
  );
});


export default router;
