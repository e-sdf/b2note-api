import { v5 as uuidv5 } from "uuid";
import type { MongoClient, Collection } from "mongodb";
import config from "../config";
import { getClient } from "./client";
import type { B2accessUserinfoResponse } from "../auth";
import type { UserProfile } from "../core/user";
import { Experience } from "../core/user";

// DB Access {{{1

export { getClient } from "./client";

export function getCollection(dbClient: MongoClient): Collection {
  return dbClient.db().collection("users");
}

// Utils {{{1

function mkId(email: string): string {
  return uuidv5(email, config.uuidNs);
}

// User queries {{{1

export async function getUserProfileByEmail(email: string): Promise<UserProfile|null> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const userRecord = await anCol.findOne({ "email": email });
  await dbClient.close();
  return userRecord;
}

export async function upsertUserProfileFromB2ACCESS(userInfo: B2accessUserinfoResponse): Promise<UserProfile> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const userProfile = await getUserProfileByEmail(userInfo.email);
  if (!userProfile) {
    const newProfile: UserProfile = {
      id: mkId(userInfo.email),
      email: userInfo.email,
      name: userInfo.name,
      orcid: "",
      organisation: "",
      jobTitle: "",
      country: "",
      experience: Experience.NULL
    };
    await anCol.insertOne(newProfile);
    return newProfile;
  } else {
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: userProfile.name === "" ? userInfo.name : userProfile.name
    };
    await anCol.replaceOne({ email: userProfile.email }, updatedProfile);
    return updatedProfile;
  }
}

export async function updateUserProfile(email: string, userProfileChanges: Partial<UserProfile>): Promise<number> {
  const dbClient = await getClient();
  const anCol = getCollection(dbClient);
  const res = await anCol.updateOne({ email }, { "$set": userProfileChanges });
  await dbClient.close();
  return res.matchedCount;
}
