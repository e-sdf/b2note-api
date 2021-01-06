import { v5 as uuidv5 } from "uuid";
import config from "../config";
import * as dbClient from "./client";
import type { Domain } from "../core/domainModel";
import { addItem, deleteItem } from "./utils";

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("domains", dbOp);
}

// Utils {{{1

function mkId(name: string): string {
  return uuidv5(name, config.uuidNs);
}

// Getting domains {{{1

export function getDomains(): Promise<Array<Domain>> {
  return withCollection(
    domainsCol => domainsCol.find().sort({ name: 1 }).toArray()
  );
}

export function getDomainById(id: string): Promise<Domain|null> {
  return withCollection(
    domainsCol => domainsCol.findOne({ id })
  );
}

export function getDomaineByName(name: string): Promise<Domain|null> {
  return withCollection(
    domainsCol => domainsCol.findOne({ name })
  );
}

// Adding new domain {{{1

export function addDomain(name: string, creatorId: string): Promise<Domain> {
  return new Promise((resolve, reject) =>
    getDomaineByName(name).then(
      mbDomain => {
        if (mbDomain) {
          reject("Domain already exists");
        } else {
          withCollection(domainsCol => 
            addItem(domainsCol, { id: mkId(name), name, creatorId } as Domain).then(
              newItem => resolve(newItem),
              err => reject(err)
            )
          );
        }
      }
    )
  );
}
export function updateDomain(id: string, domainChanges: Partial<Domain>): Promise<number> {
  return withCollection(
    domainsCol => new Promise((resolve, reject) => {
      domainsCol.updateOne({ id }, { "$set": domainChanges }).then(
        res => resolve(res.matchedCount),
        err => reject(err)
      );
    })
  );
}

export function deleteDomain(domainId: string): Promise<number> {
  return withCollection(
    domainCol => deleteItem(domainCol, domainId)
  );
}
