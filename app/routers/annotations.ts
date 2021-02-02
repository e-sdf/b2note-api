import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import type { UserProfile } from "../core/user";
import config from "../config";
import * as validator from "../validators/annotations";
import * as anModel from "../core/annotationsModel";
import * as qModel from "../core/apiModels/anQueryModel";
import * as sModel from "../core/searchModel";
import * as searchQueryParser from "../core/searchQueryParser";
import * as userModel from "../core/user";
import { ErrorCodes } from "../responses";
import * as responses from "../responses";
import * as db from "../db/annotations";
import * as rdf from "../core/export/rdf";
import * as ttl from "../core/export/turtle";
import * as formats from "../core/formats";
import * as utils from "../core/utils";
// import { resolveSourceFilenameFromHandle } from "../utils.ts";

console.log("Initialising annotations router...");

const router = Router();

// Utils {{{1

function urlize(an: anModel.Annotation): anModel.Annotation {
  return {
    ...an,
    id: config.domainUrl + anModel.annotationsUrl + "/" + an.id,
    creator: {
      ...an.creator,
      id: config.domainUrl + userModel.usersUrl + "/" + an.creator.id
    }
  };
}

// Handlers {{{1

// Get list of annotations {{{2
router.get(anModel.annotationsUrl, (req: Request, resp: Response) => {
  passport.authenticate("bearer", (err, user, info) => {
    const mbUser = user ? user as UserProfile: null;
    let query2 = null;
    try {
      query2 = {
        ... req.query,
        download: req.query.download ? JSON.parse(req.query.download as string) : false,
      };
    } catch (error) { responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "Download must be boolean"); }
    if (query2) {
      const errors = validator.validateGetAnQuery(query2);
      if (errors) {
        responses.reqErr(resp, errors);
      } else {
        const query3 = query2 as qModel.GetAnQuery;
        db.getAnnotations(mbUser,  query3).then(
          anlRecs => {
            const anl = anlRecs.map(urlize);
            const format = query3.format || formats.FormatType.JSONLD;
            if (query3.download) {
              responses.setDownloadHeader(resp, "annotations_" + utils.mkTimestamp(), format);
            }
            if (format === formats.FormatType.JSONLD) {
              responses.jsonld(resp, anl);
            } else if (query3.format === formats.FormatType.RDF) {
              responses.xml(resp, rdf.mkRDF(anl, config.domainUrl));
            } else if (query3.format === formats.FormatType.TTL) {
              responses.xml(resp, ttl.annotations2ttl(anl, config.domainUrl));
            } else {
              throw new Error("Unknown download format");
            }
          },
          error => responses.serverErr(resp, error, true)
        );
      }
    }
  })(req);
});

// Get annotation {{{2
router.get(anModel.annotationsUrl + "/:id", (req: Request, resp: Response) => {
  const anId = req.params.id;
  db.getAnnotation(anId).then(
    anr => anr ? responses.jsonld(resp, urlize(anr)) : responses.notFound(resp, `Annotation with id=${anId}) not found`),
    error => responses.serverErr(resp, error)
  );
});

// Create a new annotation {{{2
router.post(anModel.annotationsUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const errors = validator.validateAnnotation(req.body);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const annotation = req.body as anModel.Annotation;
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

// Update an annotation {{{2
router.patch(anModel.annotationsUrl + "/:id", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const anId = req.params.id;
  const errors = validator.validateAnnotationPartial(req.body);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const changes = req.body as Partial<anModel.Annotation>;
    db.getAnnotation(anId).then(
      anr => {
        if (anr) {
          if (anr.creator.id === (req.user as UserProfile).id) {
            db.updateAnnotation(anId, changes)
            .then(
              () => db.getAnnotation(anId).then(
                anr2 => {
                  if (anr2) {
                    responses.jsonld(resp, urlize(anr2));
                  } else {
                    responses.notFound(resp, `Annotation with id=${anId} not found`);
                  }
                },
                error => responses.serverErr(resp, error)
              ),
              error => responses.forbidden(resp, error)
            ).catch(err => responses.serverErr(resp, err));
          } else {
            responses.forbidden(resp, "Annotation creator does not match");
          }
        } else {
          responses.notFound(resp, `Annotation with id=${anId} not found`);
        }
      },
      error => responses.serverErr(resp, error)
    );
  }
});

// Delete an annotation {{{2
router.delete(anModel.annotationsUrl + "/:id", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const anId = req.params.id;
  db.getAnnotation(anId).then(
    anr =>
      anr ?
        anr.creator.id === (req.user as UserProfile).id ?
          db.deleteAnnotation(anId)
          .then(() => responses.ok(resp))
          .catch(err => responses.serverErr(resp, err))
        : responses.forbidden(resp, "Annotation creator does not match")
      : responses.notFound(resp, `Annotation with id=${anId} not found`),
    error => responses.serverErr(resp, error)
  );
});

// Search annotations {{{2
router.get(sModel.searchUrl, (req: Request, resp: Response) => {
  passport.authenticate("bearer", (err, user, info) => {
    const mbUser = user ? user as UserProfile : null;
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
          db.searchAnnotations(mbUser, parseResult.result as sModel.Sexpr).then(
            anl => responses.ok(resp, anl.map(urlize)),
            error => responses.serverErr(resp, error)
          );
        }
      }
    }
  })(req);
});

// Get targets for a certain tag {{{2
router.get(anModel.targetsUrl, (req: Request, resp: Response) => {
  const errors = validator.validateAnTargetsQuery(req.query);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const query = req.query as unknown as qModel.AnTargetsQuery;
    db.getAnnotationsForTag(query.tag).then(
      annotations => responses.ok(resp, annotations.map(a => a.target)),
      error => responses.serverErr(resp, error)
    );
  }
});

// Resolve source filename
// Prepared here for future use once the Target structure is changed to resolvable handles:
// https://esciencedatalab.atlassian.net/browse/B2NT-137
// router.get(anModel.resolveSourceUrl, (req: Request, resp: Response) => {
//   const handleUrl = req.query.handleUrl as string;
//   if (!handleUrl) {
//     responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "Missing handlerUrl parameter");
//   } else {
//     resolveSourceFilenameFromHandle(handleUrl).then(
//       res => responses.ok(resp, res),
//       err => responses.serverErr(resp, "Failed resolving handleUrl: " + err)
//     );
//   }
// });

console.log("Annotations router initialised.");

export default router;
