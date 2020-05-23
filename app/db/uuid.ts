import { v4 as uuidv4 } from "uuid";
import * as dbClient from "./client";

export type Uuid = string;

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("uuids", dbOp);
}

function findUuid(uuid: Uuid): Promise<boolean> {
  return withCollection(
    uuidCol => uuidCol.findOne({ uuid })
  );
}

function storeUuid(uuid: Uuid): Promise<any> {
  return withCollection(
    uuidCol => uuidCol.insertOne({ uuid })
  );
}

export async function mkUuid(): Promise<Uuid> {
  const uuid = uuidv4();
  const exists = await findUuid(uuid);
  if (exists) {
    return mkUuid();
  } else {
    await storeUuid(uuid);
    return uuid;
  }
}

export function deleteUuid(uuid: Uuid): Promise<any> {
  return withCollection(
    uuidCol => uuidCol.deleteOne({ uuid })
  );
}
