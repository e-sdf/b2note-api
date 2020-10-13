import _ from "lodash";
import update from "immutability-helper";
import { get } from "../core/http";
import config from "../config";
import * as dbClient from "./client";
import type { Ontology, OntologyTerm } from "../core/ontologyRegister";
import * as oi from "../ontologyImport";
import type { OntologySources } from "../core/apiModels/ontologyQueryModel";
import { addItem, deleteItem } from "./utils";
import { logError } from "../logging";
import { OTermsDict } from "../core/ontologyRegister";

// SOLR routines {{{1

// SOLR requires a non-standard encoding where just # and " are encoded
function encodeSolrQuery(uri: string): string {
  return uri.replace(/#/g, "%23").replace(/"/g, "%22");
}

function mkSolrTermQueryUrl(query: string): string {
  const q =
    (query.length <= 4 && _.words(query).length <= 1) ? `(labels:/${query}.*/)`
    : `(labels:"${query}"^100%20OR%20labels:${query}*^20%20OR%20text_auto:/${query}.*/^10%20OR%20labels:*${query}*)`;
  const notErrors = "%20AND%20NOT%20(labels:/Error[0-9].*/)";
  const sort = _.words(query).length <= 1 ? "&sort=norm(labels) desc" : "";
  const flags = "&wt=json&indent=true&rows=1000";
  const res = config.solrUrl + "?q=(" + q + notErrors + ")" + sort + flags;
  return res;
}

function mkSolrExactQueryUrl(tag: string): string {
  const q = `(labels:/${tag}/)`;
  const notErrors = "%20AND%20NOT%20(labels:/Error[0-9].*/)";
  const sort = "&sort=norm(labels) desc";
  const flags = "&wt=json&indent=true&rows=1000";
  const res = config.solrUrl + "?q=(" + q + notErrors + ")" + sort + flags;
  return res;
}

interface SolrTerm {
  labels: string;
  description: string;
  short_form: string
  ontology_name: string;
  ontology_acronym: string;
  synonyms: Array<string>;
  uris: string;
}

function solrTerm2ontologyTerm(solrTerm: SolrTerm): OntologyTerm {
  return {
    label: solrTerm.labels || "",
    description: solrTerm.description || "",
    shortForm: solrTerm.short_form || "",
    ontologyName: solrTerm.ontology_name || "",
    ontologyAcronym: solrTerm.ontology_acronym || "",
    synonyms: solrTerm.synonyms || [],
    uris: solrTerm.uris || ""
  };
}

function ontologyTerms2dict(oTerms: Array<OntologyTerm>): OTermsDict {
  const termsUniq = _.uniqBy(oTerms, "uris");
  const groups = _.groupBy(termsUniq, o => o.label.toLowerCase());
  return groups;
}

function solrResultToDict(solrTerms: Array<SolrTerm>): OTermsDict {
  const terms: Array<OntologyTerm> = solrTerms.map(solrTerm2ontologyTerm);
  return ontologyTerms2dict(terms);
}

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("ontologies", dbOp);
}

// OntologyRecord {{{1

interface OntologyRecord extends Ontology {
  userIds: Array<string>;
}

export function record2ontology(oRecord: OntologyRecord): Ontology {
  return update(oRecord, { $unset: ["userIds"] });
}

function ontology2record(o: Partial<Ontology>): Partial<OntologyRecord> {
  return { ...o, userIds: [] };
}

// Operations {{{1

// Ontology managmenet {{{2

export function getOntologiesRecords(): Promise<Array<OntologyRecord>> {
  return withCollection(
    anCol => anCol.find({}).toArray()
  );
}

export function getOntologies(): Promise<Array<Ontology>> {
  return new Promise((resolve) =>
    getOntologiesRecords().then(
      records => resolve(records.map(record2ontology))
    )
  );
}

export function getOntologyRecord(ontId: string): Promise<OntologyRecord|null> {
  return withCollection(
    ontCol => new Promise((resolve, reject) => {
      const query = { id: ontId };
      ontCol.find(query).toArray().then(
        res => {
          if (res.length === 0) {
            resolve(null);
          } else if (res.length > 1) {
            logError("Duplicate ontology id: " + ontId);
            reject("Duplicate ontology id: " + ontId);
          } else {
            resolve(res[0]);
          }
        }
      );
    })
  );
}

export function getOntology(ontId: string): Promise<Ontology|null> {
  return new Promise((resolve, reject) => 
    getOntologyRecord(ontId).then(
      record => record ? resolve(record2ontology(record)) : null,
      err => reject(err)
    )
  );
}

function getOntologyByTerms(terms: Array<OntologyTerm>): Promise<Ontology|null> {
  return withCollection(
    ontCol => new Promise(resolve =>
      ontCol.find().toArray().then(
        (ontologies: Array<Ontology>) => {
          const existing = ontologies.find(o1 => _.isEqual(o1.terms, terms));
          resolve(existing || null);
        }
      )
    )
  );
}

export function addOntology(ontUrl: string, format: oi.OntologyFormat, creatorId: string, checkUnique = true): Promise<oi.Ontology> {
  return withCollection(
    ontCol => new Promise((resolve, reject) => 
      oi.mkOntologyPm(ontUrl, format, creatorId).then(
        ontology => {
          if (checkUnique) {
            getOntologyByTerms(ontology.terms).then(
              o => (o ? 
                reject("Ontology with these terms exists: " + o.uri)
              : addItem(ontCol, ontology2record(ontology)).then(
                  newItem => resolve(newItem),
                  err => reject(err)
                )
              ),
              err => reject(err)
            );
          } else {
            addItem(ontCol, ontology2record(ontology)).then(
              newItem => resolve(newItem),
              err => reject(err)
            );
          }
        },
        err => reject(err)
      )
    )
  );
}

export function deleteOntology(ontId: string): Promise<number> {
  return withCollection(
    ontCol => deleteItem(ontCol, ontId)
  );
}

export function addUserOfOntology(ontId: string, userId: string): Promise<void> {
  return new Promise((resolve, reject) =>
    getOntologyRecord(ontId).then(
      record => {
        if (record?.userIds.includes(userId)) {
          resolve(); 
        } else {
          withCollection(
            ontCol => ontCol.updateOne({ id: ontId }, { "$push": { userIds: userId } }).then(
              res => res.matchedCount === 1 ? resolve() : reject("ontology with id " + ontId + " not found"),
              err => { console.error(err); reject(err); }
            )
          );
        }
      },
      err => reject(err)
    )
  );
}

export function removeUserOfOntology(ontId: string, userId: string): Promise<void> {
  return new Promise((resolve, reject) =>
    withCollection(
      ontCol => ontCol.updateOne({ id: ontId }, { "$pull": { userIds: userId } }).then(
        res => res.matchedCount === 1 ? resolve() : reject("ontology with id " + ontId + " not found"),
        err => { console.error(err); reject(err); }
      )
    )
  );
}

// Queries into ontologies {{{2

function querySolrForTerms(query: string): Promise<Array<OntologyTerm>> {
  return new Promise((resolve, reject) => {
    const queryUrl = mkSolrTermQueryUrl(query);
    get(queryUrl).then(
      (res: any) => resolve(res?.response?.docs.map(solrTerm2ontologyTerm) || []),
      err => reject(err)
    );
  });
}

function queryCustomOntologyForTerms(query: string, ontologyId: string): Promise<Array<OntologyTerm>> {
  return new Promise((resolve, reject) => {
    getOntologyRecord(ontologyId).then(
      o => o ? 
        resolve(o.terms.filter(t => t.label.toLocaleLowerCase().includes(query.toLowerCase())))
        : resolve([]),
      err => reject(err)
    );
  });
}

export function findOTermsStarting(query: string, sources: OntologySources): Promise<OTermsDict> {
  return new Promise((resolve, reject) => {
    Promise.all([
      sources.solr ? querySolrForTerms(query) : Promise.resolve([]),
      ...sources.custom.map(o => queryCustomOntologyForTerms(query, o.id))
    ]).then(
      termsCols => resolve(ontologyTerms2dict(_.flatten(termsCols))),
      err => reject(err)
    );
  });
}

export function getOTerm(term: string): Promise<OTermsDict> {
  return new Promise((resolve, reject) => {
    const queryUrl = mkSolrExactQueryUrl(term);
    get(queryUrl).then(
      (res: any) => resolve(solrResultToDict(res.response.docs || [])),
      err => reject(err)
    );
  });
}

export function getOTermByUri(ontologyUri: string): Promise<OntologyTerm> {
  return new Promise((resolve, reject) => {
    const queryUrl = encodeSolrQuery(config.solrUrl + '?q=uris:("' + ontologyUri + '")&rows=100&wt=json');
    get(queryUrl).then(
      (res: any) => {
        const docs = res.response?.docs;
        if (docs && docs.length > 0) {
          const info = solrResultToDict(docs);
          const key = Object.keys(info)[0];
          resolve(info[key][0]);
        } else {
          reject("SOLR query returned 0 results for " + queryUrl);
        }
      },
      error => reject(error)
    );
  });
}
