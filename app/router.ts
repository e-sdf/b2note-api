import * as _ from "lodash";
import { Request, Response, Router } from "express";
import { logError } from "./logging";
import * as validator from "./validator";
import * as anModel from "./shared/annotationsModel";
import * as sModel from "./shared/searchModel";
import * as searchQueryParser from "./shared/searchQueryParser";
import * as responses from "./responses";
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
  const ts = anModel.mkTimestamp();
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
router.get(anModel.annotationsUrl, (req: Request, resp: Response) => {
  const errors = validator.validateGetQuery(req.query);
  if (errors) {
    responses.clientErr(resp, errors);
  } else {
    db.getClient().then(
      client => db.getAnnotations(db.getCollection(client), req.query as anModel.GetQuery).then(
        anl => responses.ok(resp, anl),
        error => handleError(resp, error)
      ),
      error => handleError(resp, error)
    );
  }
});

// Create a new annotation 
router.post(anModel.annotationsUrl, (req: Request, resp: Response) => {
  const errors = validator.validateAnRecord(req.body);
  if (errors) {
    responses.clientErr(resp, errors);
  } else {
    const annotation = req.body as anModel.AnRecord;
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
  }
});

// Edit an annotation
router.patch(anModel.annotationsUrl + "/:id", (req: Request, resp: Response) => {
  const anId = req.params.id;
  const errors = validator.validateAnRecordOpt(req.body);
  if (errors) {
    responses.clientErr(resp, errors);
  } else {
    const changes = req.body as Record<keyof anModel.AnRecord, string>;
    db.updateAnnotation(anId, changes).then(
      modified => {
        if (modified > 0) { // operation successful 
          responses.ok(resp);
        } else { // annotation not found
          responses.notFound(resp);
        }
      }
    ).catch(
      err => responses.serverErr(resp, err, "Internal server error")
    );
  }
});

// Delete an annotation
router.delete(anModel.annotationsUrl + "/:id", (req: Request, resp: Response) => {
  const anId = req.params.id;
  db.deleteAnnotation(anId).then(
    deletedNo => {
      if (deletedNo > 0) { // annotation deleted
        responses.ok(resp, { message: "Deleted successfuly" });
      } else { // id does not exist
        responses.notFound(resp);
      }
    }
  ).catch(
    err => responses.serverErr(resp, err, "Internal server error")
  );
});

// Search annotations
router.get(anModel.searchUrl, (req: Request, resp: Response) => {
  const expr = req.query.expression;
  if (!expr) {
    responses.clientErr(resp, { error: "parameter missing: expression" });
  } else {
    const parseResult = searchQueryParser.parse(expr);
    if (parseResult.error) {
      responses.clientErr(resp, { error: "expression syntax error", details: parseResult.error });
    } else {
      if (!parseResult.result) {
        throw new Error("result field expected but missing");
      } else {
        db.getClient().then(
          client => db.searchAnnotations(db.getCollection(client), parseResult.result as sModel.Sexpr).then(
            anl => responses.ok(resp, anl),
            error => handleError(resp, error)
          ),
          error => handleError(resp, error)
        );
      }
    }
  }
});

// Get files for a certain tag
router.get(anModel.filesUrl, (req: Request, resp: Response) => {
  const errors = validator.validateFilesQuery(req.query);
  if (errors) {
    responses.clientErr(resp, errors);
  } else {
    const query = req.query as anModel.FilesQuery;
    db.getClient().then(
      client => db.getAnnotationsForTag(db.getCollection(client), query.tag).then(
        annotations => responses.ok(resp, annotations.map(a => a.target.source)),
        error => handleError(resp, error)
      ),
      error => handleError(resp, error)
    );
  }
});

export default router;
