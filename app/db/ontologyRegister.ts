import _ from "lodash";
import update from "immutability-helper";
import * as dbClient from "./client";
import type { Ontology, OntologyTerm } from "../core/ontologyRegister";
import * as oi from "../ontologyImport";
import { addItem, deleteItem } from "./utils";
import { logError } from "../logging";

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
        ontology => getOntologyByTerms(ontology.terms).then(
          o => (o ? 
            reject("Ontology with these terms exists: " + o.uri)
          : addItem(ontCol, ontology2record(ontology)).then(
              newItem => resolve(newItem),
              err => reject(err)
            )
          ),
          err => reject(err)
        ),
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