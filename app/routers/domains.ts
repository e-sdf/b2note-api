import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import * as model from "../core/domainModel";
import type { UserProfile } from "../core/user";
import type { DomainPostQuery, DomainPatchQuery } from "../core/apiModels/domainQueryModel";
import { validatePostDomainQuery, validatePatchDomainQuery } from "../validators/domain";
import * as db from "../db/domains";
import * as ontDb from "../db/ontologyRegister";
import * as responses from "../responses";

console.log("Initialising domains router...");

const router = Router();

//  Getting domain {{{2

router.get(model.domainsUrl + "/:domainId", (req: Request, resp: Response) => {
  const domainId = req.params.domainId as string;
  if (!domainId) {
    responses.reqErr(resp, { error: "missing domain id"});
  } else {
    db.getDomainById(domainId).then(
      d => d ? 
        responses.ok(resp, d)
      : responses.notFound(resp, "Domain [" + domainId + "] not found"),
      err => responses.serverErr(resp, err)
    );
  }
});

// Get domains {{{1

router.get(model.domainsUrl, (req: Request, resp: Response) => {
  db.getDomains().then(
    ds => responses.ok(resp, ds),
    err => responses.serverErr(resp, err)
  );
});

// Add domain {{{2
router.post(model.domainsUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const errors = validatePostDomainQuery(req.body);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const name = (req.body as DomainPostQuery).name;
    const creatorId = (req.user as UserProfile).id;
    if (!name) {
      responses.reqErr(resp, { errors: "Missing name parameter in body" } );
    }
    db.addDomain(name, creatorId).then(
      res => responses.ok(resp, JSON.stringify(res)),
      formatErr => responses.processingErr(resp, formatErr)
    );
  }
});

// Edit domain
router.patch(model.domainsUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const errors = validatePatchDomainQuery(req.body);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const changes = req.body as DomainPatchQuery;
    const domainId = changes.id;
    db.getDomainById(domainId).then(
      domain => {
        if (domain) {
          if (domain.creatorId === (req.user as UserProfile).id) {
            db.updateDomain(domainId, changes)
            .then(
              () => db.getDomainById(domainId).then(
                domain2 => {
                  if (domain2) {
                    responses.jsonld(resp, domain2);
                  } else {
                    responses.notFound(resp, `Domain [${domainId}] not found`);
                  }
                },
                error => responses.serverErr(resp, error)
              ),
              error => responses.forbidden(resp, error)
            ).catch(err => responses.serverErr(resp, err));
          } else {
            responses.forbidden(resp, "Domain creator does not match");
          }
        } else {
          responses.notFound(resp, `Domain [${domainId}] not found`);
        }
      },
      error => responses.serverErr(resp, error)
    );
  }
});

// Delete domain {{{2
router.delete(model.domainsUrl + "/:domainId", passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const domainId = req.params.domainId;
  db.getDomainById(domainId).then(
    domain =>
      domain ?
        domain.creatorId === (req.user as UserProfile).id ?
          db.deleteDomain(domainId)
          .then(() => responses.ok(resp))
          .catch(err => responses.serverErr(resp, err))
        : responses.forbidden(resp, "Domain creator does not match")
      : responses.notFound(resp, `Domain [${domainId}] not found`),
    error => responses.serverErr(resp, error)
  );
});

// Query domain for ontologies
router.get(model.domainsUrl + "/:domainId" + "/ontologies", (req: Request, resp: Response) => {
  const domainId = req.params.domainId;
  db.getDomainById(domainId).then(
    domain =>
      domain ?
        ontDb.getOntologiesForDomain(domainId).then(
          ontologiesIds => responses.ok(resp, ontologiesIds),
          err => responses.serverErr(resp, err)
        )
      : responses.notFound(resp, `Domain [${domainId}] not found`),
    error => responses.serverErr(resp, error)
  );
});

//}}}1

console.log("Domains router initialised.");

export default router;