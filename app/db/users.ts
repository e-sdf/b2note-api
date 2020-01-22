import { MongoClient, Collection } from "mongodb";
import { getClient } from "./client";
import { TokenSet, UserinfoResponse } from "openid-client";
import { User } from "../core/profile";

export interface UserRecord {
  id: string;
  userInfo: UserinfoResponse;
  tokenSet: TokenSet;
}

export function record2user(record: UserRecord): User {
  return {
    id: record.id,
    name: record.userInfo.name || "",
    email: record.userInfo.email || "",
    accessToken: record.tokenSet.access_token || ""
  };
}

// DB Access {{{1

export { getClient } from "./client";

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("users");
}

// User queries {{{1

export async function upsertUserFromAuth(userInfo: UserinfoResponse, tokenSet: TokenSet): Promise<UserRecord> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const record: UserRecord = {
    id: userInfo.sub,
    userInfo,
    tokenSet,
  };
  await anCol.replaceOne(
    { id: userInfo.sub },
    record,
    { upsert: true }
  );
  return record;
}

export async function getUserById(userId: string): Promise<UserRecord|null> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  return anCol.findOne({ id: userId });
}

export async function getUserByToken(token: string): Promise<UserRecord|null> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  return anCol.findOne({ "tokenSet.access_token": token });
}
