import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import type { UserProfile } from "../core/user";
import config from "../config";
import * as validator from "../validators/annotations";
import * as anModel from "../core/annotationsModel";
import * as sModel from "../core/searchModel";
import * as searchQueryParser from "../core/searchQueryParser";
import * as user from "../core/user";
import { ErrorCodes } from "../responses";
import * as responses from "../responses";
import * as db from "../db/annotations";
import * as rdf from "../core/export/rdf";
import * as ttl from "../core/export/turtle";
import { resolveSourceFilenameFromHandle } from "../utils";

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

function setDownloadHeader(resp: Response, fname: string, format: anModel.Format): void {
  const ext = anModel.mkFileExt(format);
  resp.setHeader("Content-Disposition", "attachment");
  resp.setHeader("filename", fname + "." + ext);
}

function urlize(an: anModel.AnRecord): anModel.AnRecord {
  return {
    ...an,
    id: config.domainUrl + anModel.annotationsUrl + "/" + an.id,
    creator: {
      ...an.creator,
      id: config.domainUrl + user.usersUrl + "/" + an.creator.id
    }
  };
}

// Handlers {{{1

// Get list of annotations
router.get(anModel.annotationsUrl, (req: Request, resp: Response) => {
  try {
    const query2 = {
      ... req.query,
      download: req.query.download ? JSON.parse(req.query.download as string) : false
    };
    const errors = validator.validateGetQuery(query2);
    if (errors) {
      responses.reqErr(resp, errors);
    } else {
      const query3 = query2 as anModel.GetQuery;
      db.getAnnotations(query3).then(
        anlRecs => {
          const anl = anlRecs.map(urlize);
          const format = query3.format || anModel.Format.JSONLD;
          if (query3.download) {
            setDownloadHeader(resp, "annotations_" + anModel.mkTimestamp(), format);
          }
          if (format === anModel.Format.JSONLD) {
            responses.jsonld(resp, anl);
          } else if (query3.format === anModel.Format.RDF) {
            responses.xml(resp, rdf.mkRDF(anl, config.domainUrl));
          } else if (query3.format === anModel.Format.TTL) {
            responses.xml(resp, ttl.anRecords2ttl(anl, config.domainUrl));
          } else {
            throw new Error("Unknown download format");
          }
        },
        error => responses.serverErr(resp, error, true)
      );
    }
  } catch (error) { responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "Download parameter is expected to be boolean"); }
});

// Get annotation
router.get(anModel.annotationsUrl + "/:id", (req: Request, resp: Response) => {
  const anId = req.params.id;
  db.getAnnotation(anId).then(
    an => an ? responses.jsonld(resp, urlize(an)) : responses.notFound(resp, `Annotation with id=${anId}) not found`),
    error => responses.serverErr(resp, error)
  );
});

// Create a new annotation 
router.post(anModel.annotationsUrl, passport.authenticate("bearer", { session: false }),
  (req: Request, resp: Response) => {
    const errors = validator.validateAnRecord(req.body);
    if (errors) {
      responses.reqErr(resp, errors);
    } else {
      const annotation = req.body as anModel.AnRecord;
      if (annotation.creator.id !== (req.user as UserProfile).id) {
        responses.forbidden(resp, "Creator id does not match the logged user");
      } else {
        db.addAnnotation(annotation).then(
          newAn => {
            if (newAn) { // annotation saved
              responses.created(resp, newAn.id, newAn);
            } else { // annotation already exists
              responses.forbidden(resp, "Annotation already exists");
            }
          }
        ).catch(
          err => responses.serverErr(resp, err)
        );
      }
    }
  });

// Edit an annotation
router.patch(anModel.annotationsUrl + "/:id", passport.authenticate("bearer", { session: false }),
  (req: Request, resp: Response) => {
    const anId = req.params.id;
    const errors = validator.validateAnRecordOpt(req.body);
    if (errors) {
      responses.reqErr(resp, errors);
    } else {
      const changes = req.body as Partial<anModel.AnRecord>;
      db.getAnnotation(anId).then(
        an => 
          an ? 
            an.creator.id === (req.user as UserProfile).id ?
              db.updateAnnotation(anId, changes)
              .then(() => responses.ok(resp))
              .catch(err => responses.serverErr(resp, err))
            : responses.forbidden(resp, "Annotation creator does not match")
          : responses.notFound(resp, `Annotation with id=${anId} not found`),
        error => responses.serverErr(resp, error)
      );
    }
  });

// Delete an annotation
router.delete(anModel.annotationsUrl + "/:id", passport.authenticate("bearer", { session: false }),
  (req: Request, resp: Response) => {
    const anId = req.params.id;
    db.getAnnotation(anId).then(
      an => 
        an ? 
          an.creator.id === (req.user as UserProfile).id ?
            db.deleteAnnotation(anId)
            .then(() => responses.ok(resp))
            .catch(err => responses.serverErr(resp, err))
          : responses.forbidden(resp, "Annotation creator does not match")
        : responses.notFound(resp, `Annotation with id=${anId} not found`),
      error => responses.serverErr(resp, error)
    );
  });

// Search annotations
router.get(sModel.searchUrl, (req: Request, resp: Response) => {
  const expr = req.query.expression;
  if (!expr) {
    responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "parameter missing: expression");
  } else {
    const parseResult = searchQueryParser.parse(expr as string);
    if (parseResult.error) {
      responses.syntaxErr(resp, parseResult.error);
    } else {
      if (!parseResult.result) {
        throw new Error("result field expected but missing");
      } else {
        db.searchAnnotations(parseResult.result as sModel.Sexpr).then(
          anl => responses.ok(resp, anl),
          error => responses.serverErr(resp, error)
        );
      }
    }
  }
});

// Get targets for a certain tag
router.get(anModel.targetsUrl, (req: Request, resp: Response) => {
  const errors = validator.validateTargetsQuery(req.query);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const query = req.query as unknown as anModel.TargetsQuery;
    db.getAnnotationsForTag(query.tag).then(
      annotations => responses.ok(resp, annotations.map(a => a.target)),
      error => responses.serverErr(resp, error)
    );
  }
});

// Resolve source filename
// Prepared here for future use once the Target structure is changed to resolvable handles:
// https://esciencedatalab.atlassian.net/browse/B2NT-137
router.get(anModel.resolveSourceUrl, (req: Request, resp: Response) => {
  const handleUrl = req.query.handleUrl as string;
  if (!handleUrl) {
    responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "Missing handlerUrl parameter");
  } else {
    resolveSourceFilenameFromHandle(handleUrl).then(
      res => responses.ok(resp, res),
      err => responses.serverErr(resp, "Failed resolving handleUrl: " + err)
    );
  }
});

export default router;
