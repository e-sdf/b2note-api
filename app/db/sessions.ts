import type { MongoClient, Collection } from "mongodb";
import { getClient } from "./client";

// DB Access {{{1

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("sessions");
}

export async function popB2AccessSession(state: string): Promise<any> { 
  const client = await getClient();
  const col = getCollection(client);
  const res = await col.findOneAndDelete({ session: { "$regex": RegExp(`.*${state}.*`)} });
  const record = res.value;
  if (!record) {
    throw new Error("B2ACCESS session for state " + state + " not found.");
  } else {
    const b2accessRecord = JSON.parse(record.session).b2access;
    if (!b2accessRecord) {
      throw new Error("b2access field not found in B2ACCESS session record with state " + state);
    } else {
      return b2accessRecord;
    }
  }
}

