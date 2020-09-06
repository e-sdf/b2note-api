import * as dbClient from "./client";
import * as oi from "../ontologyImport";

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("ontologies", dbOp);
}

export async function addOntology(ontUrl: string, format: oi.OntologyFormat): Promise<oi.Ontology> {
  return withCollection(
    ontologiesCol => new Promise((resolve, reject) => {
      oi.mkOntologyPm(ontUrl, format).then(
        ontology =>
          ontologiesCol.insertOne(ontology).then(
            () => resolve(ontology),
            err => reject(err)
          ),
        err => reject(err)
      );
    })
  );
}
