import _ from "lodash";
import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import type { UserProfile } from "../core/user";
import * as oreg from "../core/ontologyRegister";
import * as db from "../db/ontologyRegister";
import * as responses from "../responses";

console.log("Initialising ontologies router...");

const router = Router();

// Terms searching {{{1

// Terms search {{{2
router.get(oreg.ontologiesUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const value = req.query.value as string;
  const uri = req.query.uri as string;
  const ontologySources = req.query.sources;
  const userId = (req.user as UserProfile).id;
  if (value) {
    if (_.last(value) === "*") {
      db.findOTermsStarting(value.substring(0, value.length - 1), userId).then(
        terms => responses.ok(resp, terms),
        err => responses.serverErr(resp, err)
      );
    } else {
      db.getOTerm(value).then(
        terms => responses.ok(resp, terms),
        err => responses.serverErr(resp, err)
      );
    }
  } else if (uri) {
    db.getOTermByUri(uri).then(
      term => responses.ok(resp, term),
      err => responses.serverErr(resp, err)
    );
  } else { // get list of ontologies
    db.getOntologies().then(
      ontologies => responses.ok(resp, ontologies),
      err => responses.serverErr(resp, err)
    );
  }
});

// Upload ontology {{{2
router.post(oreg.ontologiesUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const url = req.body.url;
  const format = req.body.format;
  const creatorId = (req.user as UserProfile).id;
  if (!url) {
    responses.reqErr(resp, { errors: "Missing URL parameter in body" } );
  }
  if (!format) {
    responses.reqErr(resp, { errors: "Missing format parameter in body" } );
  }
  db.addOntology(url, format, creatorId).then(
    res => responses.ok(resp, JSON.stringify(res)),
    formatErr => responses.processingErr(resp, formatErr)
  );
});

// Delete ontology {{{2
router.delete(oreg.ontologiesUrl + "/:id", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const ontId = req.params.id;
  db.getOntology(ontId).then(
    ont =>
      ont ?
        ont.creatorId === (req.user as UserProfile).id ?
          db.deleteOntology(ontId)
          .then(() => responses.ok(resp))
          .catch(err => responses.serverErr(resp, err))
        : responses.forbidden(resp, "Ontology creator does not match")
      : responses.notFound(resp, `Ontology with id=${ontId} not found`),
    error => responses.serverErr(resp, error)
  );
});

//}}}1

console.log("Ontologies router initialised.");

export default router;