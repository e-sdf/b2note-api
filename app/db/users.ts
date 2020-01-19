import { MongoClient, Collection } from "mongodb";
import { getClient, DBQuery } from "./client";
import { TokenSet, UserinfoResponse } from "openid-client";

export interface User {
  id: string;
  userInfo: UserinfoResponse;
  tokenSet: TokenSet;
}

// DB Access {{{1

export { getClient } from "./client";

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("users");
}

// User queries {{{1

export async function upsertUserFromAuth(userInfo: UserinfoResponse, tokenSet: TokenSet): Promise<any> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  return anCol.replaceOne(
    { id: userInfo.sub },
    {
      id: userInfo.sub,
      userInfo,
      tokenSet,
    },
    { upsert: true }
  );
}

export async function getAccessToken(userId: string): Promise<string|undefined> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const res: User | null = await anCol.findOne({ id: userId });
  return res?.tokenSet.access_token;
}