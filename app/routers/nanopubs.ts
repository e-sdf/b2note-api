import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import type { UserProfile } from "../core/user";
import config from "../config";
import * as validator from "../validators/nanopubs";
import * as npModel from "../core/nanopubModel";
import * as qModel from "../core/npQueryModel";
import * as user from "../core/user";
import { ErrorCodes } from "../responses";
import * as responses from "../responses";
import * as db from "../db/nanopubs";
//import * as rdf from "../core/export/rdf";
//import * as ttl from "../core/export/turtle";
import * as formats from "../core/formats";
import * as utils from "../core/utils";

console.log("Initialising nanopubs router...");

const router = Router();

// Utils {{{1

function urlize(np: npModel.Nanopub): npModel.Nanopub {
  return {
    ...np,
    id: config.domainUrl + npModel.nanopubsUrl + "/" + np.id,
    provenance: {
      ...np.provenance,
      creator: {
        ...np.provenance.creator,
        id: config.domainUrl + user.usersUrl + "/" + np.provenance.creator
      }
    }
  };
}

// Handlers {{{1

// Get list of nanopubs {{{2
router.get(npModel.nanopubsUrl, (req: Request, resp: Response) => {
  let query2;
  try {
    query2 = {
      ... req.query,
      download: req.query.download ? JSON.parse(req.query.download as string) : false,
    };
  } catch (error) { responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "Download parameter is expected to be boolean"); }
  if (query2) {
    const errors = validator.validateGetNpQuery(query2);
    if (errors) {
      responses.reqErr(resp, errors);
    } else {
      const query3 = query2 as qModel.GetNpQuery;
      db.getNanopubs(query3).then(
        nplRecs => {
          const npl = nplRecs.map(urlize);
          const format = query3.format || formats.FormatType.JSONLD;
          if (query3.download) {
            responses.setDownloadHeader(resp, "nanopubs_" + utils.mkTimestamp(), format);
          }
          if (format === formats.FormatType.JSONLD) {
            responses.jsonld(resp, npl);
          //} else if (query3.format === formats.FormatType.RDF) {
            //responses.xml(resp, rdf.mkRDF(npl, config.domainUrl));
          //} else if (query3.format === formats.FormatType.TTL) {
            //responses.xml(resp, ttl.nanopubs2ttl(npl, config.domainUrl));
          } else {
            throw new Error("Unknown download format");
          }
        },
        error => responses.serverErr(resp, error, true)
      );
    }
  }
});

// Get nanopub {{{2
router.get(npModel.nanopubsUrl + "/:id", (req: Request, resp: Response) => {
  const anId = req.params.id;
  db.getNanopub(anId).then(
    npr => npr ? responses.jsonld(resp, urlize(npr)) : responses.notFound(resp, `Nanopub with id=${anId}) not found`),
    error => responses.serverErr(resp, error)
  );
});

// Create a new nanopub {{{2
router.post(npModel.nanopubsUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const errors = validator.validateNanopub(req.body);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const nanopub = req.body as npModel.Nanopub;
    if (nanopub.provenance.creator.id !== (req.user as UserProfile).id) {
      responses.forbidden(resp, "Creator id does not match the logged user");
    } else {
      db.addNanopub(nanopub).then(
        newAn => {
          if (newAn) { // nanopub saved
            responses.created(resp, newAn.id, newAn);
          } else { // nanopub already exists
            responses.forbidden(resp, "Nanopub already exists");
          }
        }
      ).catch(
      err => responses.serverErr(resp, err)
      );
    }
  }
});

// Update an nanopub {{{2
router.patch(npModel.nanopubsUrl + "/:id", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const anId = req.params.id;
  const errors = validator.validateNanopubPartial(req.body);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const changes = req.body as Partial<npModel.Nanopub>;
    db.getNanopub(anId).then(
      npr => {
        if (npr) {
          if (npr.provenance.creator.id === (req.user as UserProfile).id) {
            db.updateNanopub(anId, changes)
            .then(
              () => db.getNanopub(anId).then(
                npr2 => {
                  if (npr2) {
                    responses.jsonld(resp, urlize(npr2));
                  } else {
                    responses.notFound(resp, `Nanopub with id=${anId} not found`);
                  }
                },
                error => responses.serverErr(resp, error)
              ),
              error => responses.forbidden(resp, error)
            ).catch(err => responses.serverErr(resp, err));
          } else {
            responses.forbidden(resp, "Nanopub creator does not match");
          }
        } else {
          responses.notFound(resp, `Nanopub with id=${anId} not found`);
        }
      },
      error => responses.serverErr(resp, error)
    );
  }
});

// Delete an nanopub {{{2
router.delete(npModel.nanopubsUrl + "/:id", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const anId = req.params.id;
  db.getNanopub(anId).then(
    npr =>
      npr ?
      npr.provenance.creator.id === (req.user as UserProfile).id ?
      db.deleteNanopub(anId)
    .then(() => responses.ok(resp))
    .catch(err => responses.serverErr(resp, err))
      : responses.forbidden(resp, "Nanopub creator does not match")
        : responses.notFound(resp, `Nanopub with id=${anId} not found`),
        error => responses.serverErr(resp, error)
  );
});

console.log("Nanopubs router initialised.");

export default router;
