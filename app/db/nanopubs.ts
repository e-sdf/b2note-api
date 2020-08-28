import _ from "lodash";
import type { Collection } from "mongodb";
import * as dbClient from "./client";
import * as npModel from "../core/nanopubModel";
import { genUuid } from "./uuid";
import { logError } from "../logging";

// Definitions {{{1

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("nanopubs", dbOp);
}

// Queries {{{1

export function getNanopubById(anCol: Collection, npId: string): Promise<npModel.Nanopub|null> {
  return new Promise((resolve, reject) => {
    const query = { id: npId };
    anCol.find(query).toArray().then(
      res => {
        if (res.length === 0) {
          resolve(null);
        } else if (res.length > 1) {
          logError("Duplicate nanopub id: " + npId);
          reject("Duplicate nanopub id: " + npId);
        } else {
          resolve(res[0]);
        }
      }
    );
  });
}

function findNanopubsByAssertion(anCol: Collection, assertion: npModel.Assertion): Promise<Array<npModel.Nanopub>> {
  return anCol.find({ assertion}).toArray();
}

// DB API {{{1

// Reading {{{2

export function getNanopub(npId: string): Promise<npModel.Nanopub|null> {
  return withCollection(
    anCol => getNanopubById(anCol, npId)
  );
}

export function getNanopubs(dbQuery = {}): Promise<Array<npModel.Nanopub>> {
  return withCollection(
    anCol => new Promise((resolve, reject) => {
      const nplPm = anCol.find(dbQuery).toArray();
      nplPm.then(
        (npl: Array<npModel.Nanopub>) => {
          resolve(npl);
        },
        err => reject(err)
      );
    })
  );
}

// Modifying {{{2

export function addNanopub(nanopub: npModel.Nanopub): Promise<npModel.Nanopub|null> {
  return withCollection(
    anCol => new Promise((resolve, reject) => {
      findNanopubsByAssertion(anCol, nanopub.assertion).then(
        nanopubs => {
          if (nanopubs.length > 0) {
            resolve(null);
          } else {
            anCol.insertOne(nanopub).then(
              res => {
                const newId = res.insertedId as string;
                genUuid().then(
                  uuid => {
                    anCol.findOneAndUpdate(
                      { _id: newId },
                      { "$set": { id: uuid } },
                      { returnOriginal: false }
                    ).then(
                      newNp => resolve(newNp.value),
                      err => reject(err)
                    );
                  }
                );
              }
            );
          }
        }
      );
    })
  );
}

export function updateNanopub(npId: string, changes: Partial<npModel.Nanopub>): Promise<number> {
  return withCollection(
    anCol => new Promise((resolve, reject) =>
       getNanopubById(anCol, npId).then(
         nanopub => {
           if (nanopub) {
             const updatedNp = {...nanopub, ...changes};
             findNanopubsByAssertion(anCol, updatedNp.assertion).then(
               sameNps => {
                 const existing = sameNps.find((np: npModel.Nanopub) => nanopub.id !== np.id);
                 if (existing) {
                   reject("Same nanopub would exist");
                 } else {
                   anCol.updateOne({ id: npId }, { "$set": changes }).then(
                     res => resolve(res.matchedCount),
                     err => reject(err)
                   );
                 }
               }
             );
           } else {
             reject(`Nanopub id=${npId} does not exist`);
           }
         },
         err => reject(err)
       )
     )
  );
}

export function deleteNanopub(npId: string): Promise<number> {
  return withCollection(
    anCol => new Promise((resolve) => {
      anCol.deleteOne({ id: npId }).then(
        res => resolve(res.result.n || 0),
        err => resolve(0)
      );
    })
  );
}