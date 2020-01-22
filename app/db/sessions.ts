import { MongoClient, Collection } from "mongodb";
import { getClient, DBQuery } from "./client";

// DB Access {{{1

export { getClient } from "./client";

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("sessions");
}

