import { Request, Response, Router } from "express";
import { logError } from "./logging";
import * as validator from "./validator";
import * as anModel from "./core/annotationsModel";
import * as sModel from "./core/searchModel";
import * as searchQueryParser from "./core/searchQueryParser";
import * as responses from "./responses";
import * as db from "./db";
import { endpointUrl, apiUrl } from "./core/server";
import * as rdf from "./rdf";

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

function mkLocation(id: string): string {
  return endpointUrl + apiUrl + "/annotations/" + id;
}

function handleError(resp: Response, error: any): void {
  logError(error);
  responses.serverErr(resp, error, "Internal server error");
}

function setDownloadHeader(resp: Response, fname: string, format: anModel.Format): void {
  const ext = anModel.mkFileExt(format);
  resp.setHeader("Content-Disposition", "attachment");
  resp.setHeader("filename", fname + "." + ext);
}

// Handlers {{{1

// Get list of annotations
router.get(anModel.annotationsUrl, (req: Request, resp: Response) => {
  try {
    const query2 = {
      ... req.query,
      download: req.query.download ? JSON.parse(req.query.download) : false
    };
    const errors = validator.validateGetQuery(query2);
    if (errors) {
      responses.clientErr(resp, errors);
    } else {
      const query3 = query2 as anModel.GetQuery;
      db.getClient().then(
        client => db.getAnnotations(db.getCollection(client), query3).then(
          anl => {
            const format = query3.format || anModel.Format.JSONLD;
            if (query3.download) {
              setDownloadHeader(resp, "annotations_" + anModel.mkTimestamp(), format);
            }
            if (format === anModel.Format.JSONLD) {
              responses.jsonld(resp, anl);
            } else if (query3.format === anModel.Format.RDF) {
              responses.xml(resp, rdf.mkRDF(anl));
            } else {
              throw new Error("Unknown download format");
            }
          },
          error => handleError(resp, error)
        ),
        error => handleError(resp, error)
      );
    }
  } catch (error) { responses.clientErr(resp, { message: "download parameter is expected to be boolean" } ); }
});

// Get annotation
router.get(anModel.annotationsUrl + "/:id", (req: Request, resp: Response) => {
  db.getClient().then(
    client => db.getAnnotation(db.getCollection(client), req.params.id).then(
      an => an ? responses.jsonld(resp, an) : responses.notFound(resp),
      error => handleError(resp, error)
    ),
    error => handleError(resp, error)
  );
});

// Create a new annotation 
router.post(anModel.annotationsUrl, (req: Request, resp: Response) => {
  const errors = validator.validateAnRecord(req.body);
  if (errors) {
    responses.clientErr(resp, errors);
  } else {
    const annotation = req.body as anModel.AnRecord;
    db.addAnnotation(annotation).then(
      newAn => {
        if (newAn) { // annotation saved
          responses.created(resp, newAn.id, newAn);
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
router.get(sModel.searchUrl, (req: Request, resp: Response) => {
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

// Get targets for a certain tag
router.get(anModel.targetsUrl, (req: Request, resp: Response) => {
  const errors = validator.validateTargetsQuery(req.query);
  if (errors) {
    responses.clientErr(resp, errors);
  } else {
    const query = req.query as anModel.TargetsQuery;
    db.getClient().then(
      client => db.getAnnotationsForTag(db.getCollection(client), query.tag).then(
        annotations => responses.ok(resp, annotations.map(a => a.target)),
        error => handleError(resp, error)
      ),
      error => handleError(resp, error)
    );
  }
});

export default router;
