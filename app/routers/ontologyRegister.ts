import _ from "lodash";
import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import type { UserProfile } from "../core/user";
import type { OntologyQuery } from "../core/apiModels/ontologyQueryModel";
import { defaultOntologySources, OntologySources } from "../core/apiModels/ontologyQueryModel";
import { validateGetOntologyQuery } from "../validators/ontology";
import * as oreg from "../core/ontologyRegister";
import * as db from "../db/ontologyRegister";
import * as responses from "../responses";

console.log("Initialising ontologies router...");

const router = Router();

// Terms searching {{{1

function mkOntologySourcesPm(sourcesIds: Array<string>): Promise<OntologySources> {
  return new Promise((resolve,reject) => {
    const includesSolr = sourcesIds.includes("solr");
    const customSourcesIds = sourcesIds.filter(s => s !== "solr");
    Promise.all(customSourcesIds.map(db.getOntology)).then(
      ontologies => resolve({
        solr: includesSolr,
        custom: ontologies.filter(o => o !== null) as Array<oreg.Ontology>
      }),
      err => reject(err)
    );
  });
}

//  Getting ontologies {{{2
router.get(oreg.ontologiesUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const userId = (req.user as UserProfile).id;
  const errors = validateGetOntologyQuery(req.query);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const query = req.query as OntologyQuery;
    if (query.value) {
      const value = query.value;
      if (_.last(value) === "*") {
        const sourcesIds = query["sources-ids"];
        if (sourcesIds) {
          mkOntologySourcesPm(sourcesIds).then(
            sources => db.findOTermsStarting(value.substring(0, value.length - 1), sources).then(
              terms => responses.ok(resp, terms),
              err => responses.serverErr(resp, err)
            ),
            err => responses.reqErr(resp, { error: "source-ids could not be processed"})
          );
        } else {
          db.findOTermsStarting(value.substring(0, value.length - 1), defaultOntologySources).then(
            terms => responses.ok(resp, terms),
            err => responses.serverErr(resp, err)
          );
        }
      } else {
        db.getOTerm(value).then(
          terms => responses.ok(resp, terms),
          err => responses.serverErr(resp, err)
        );
      }
    } else if (query.uri) {
      const uri = query.uri;
      db.getOTermByUri(uri).then(
        term => responses.ok(resp, term),
        err => responses.serverErr(resp, err)
      );
    } else { // get list of ontologies
      db.getOntologiesMetaRs().then(
        ois => responses.ok(resp, ois),
        err => responses.serverErr(resp, err)
      );
    }
  }
});

// Get ontology {{{2

router.get(oreg.ontologiesUrl + "/:ontId", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const ontId = req.params.ontId as string;
  if (!ontId) {
    responses.reqErr(resp, { error: "missing ontology id"});
  } else {
    db.getOntology(ontId).then(
      o => o ? 
        responses.ok(resp, o)
      : responses.notFound(resp, "Ontology with id=" + ontId + "not found"),
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
router.delete(oreg.ontologiesUrl + "/:ontId", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const ontId = req.params.ontId;
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