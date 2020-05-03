import type { MongoClient, Collection } from "mongodb";
import { getClient } from "./client";
import type { TokenSet, UserinfoResponse } from "openid-client";
import type { User, UserProfile, Experience } from "../core/user";

export interface UserRecord {
  userInfo: UserinfoResponse;
  // additional B2NOTE-specific items
  orcid: string;
  organisation: string;
  jobTitle: string;
  country: string;
  experience: Experience;
}

export function record2user(record: UserRecord): User|null {
  const email = record.userInfo.email;
  return email ? { email } : null;
}

export function record2profile(record: UserRecord): UserProfile {
  return {
    name: record.userInfo.name || "",
    email: record.userInfo.email || "",
    orcid: record.orcid, 
    organisation: record.organisation,
    jobTitle: record.jobTitle,
    country: record.country,
    experience: record.experience
  };
}

// DB Access {{{1

export { getClient } from "./client";

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("users");
}

// User queries {{{1

export async function upsertUserProfile(userInfo: UserinfoResponse): Promise<UserRecord> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const id = userInfo.sub;
  await anCol.updateOne(
    { id: userInfo.email },
    { "$set": { id, userInfo } },
    { upsert: true }
  );
  const userRecordPartial: any = await anCol.findOne({ id });
  const userRecord: UserRecord = {
    userInfo: userRecordPartial.userInfo,
    // additional B2NOTE-specific items may be missing if first-time 
    orcid: userRecordPartial.orcid || "",
    organisation: userRecordPartial.organisation || "",
    jobTitle: userRecordPartial.jobTitle || "",
    country: userRecordPartial.country || "",
    experience: userRecordPartial.experience || ""
  };
  await anCol.replaceOne({ id }, userRecord);
  await dbClient.close();
  return userRecord;
}

export async function getUserRecordByEmail(email: string): Promise<UserRecord|null> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const userRecord = await anCol.findOne({ "userInfo.email": email });
  await dbClient.close();
  return userRecord;
}

export async function getUserByEmail(email: string): Promise<User|null> {
  const userRecord = await getUserRecordByEmail(email);
  return userRecord ? record2user(userRecord) : null;
}

export async function getUserProfileByEmail(email: string): Promise<UserProfile|null> {
  const userRecord = await getUserRecordByEmail(email);
  return userRecord ? record2profile(userRecord) : null;
}

export async function updateUserProfile(email: string, userProfileChanges: Record<keyof UserProfile, string>): Promise<number> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const res = await anCol.updateOne({ email}, { "$set": userProfileChanges });
  await dbClient.close();
  return Promise.resolve(res.matchedCount);
}
