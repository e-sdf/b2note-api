import { v5 as uuidv5 } from "uuid";
import config from "../config";
import * as dbClient from "./client";
import type { OIDUserinfo } from "../auth/auth";
import type { UserProfile } from "../core/user";
import { Experience } from "../core/user";

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("users", dbOp);
}

// Utils {{{1

function mkId(email: string): string {
  return uuidv5(email, config.uuidNs);
}

// User queries {{{1

export function getUserProfileByEmail(email: string): Promise<UserProfile|null> {
  return withCollection(
    usersCol => usersCol.findOne({ "email": email })
  );
}


export function upsertUserProfileFromUserinfo(userInfo: OIDUserinfo): Promise<UserProfile> {
  return withCollection(
    usersCol => new Promise((resolve, reject) => {
      getUserProfileByEmail(userInfo.email).then(
        userProfile => {
          if (!userProfile) {
            const newProfile: UserProfile = {
              id: mkId(userInfo.email),
              email: userInfo.email,
              personName: userInfo.name || ((userInfo.given_name || "") + " " + (userInfo.family_name || "")),
              givenName: userInfo.given_name || "",
              familyName: userInfo.family_name || "",
              orcid: "",
              organisation: "",
              jobTitle: "",
              country: "",
              experience: Experience.NULL
            };
            usersCol.insertOne(newProfile).then(
              () => resolve(newProfile),
              err => reject(err)
            );
          } else {
            const updatedProfile: UserProfile = {
              ...userProfile,
              personName: userProfile.personName === "" ? userInfo.name : userProfile.personName
            };
            usersCol.replaceOne({ email: userProfile.email }, updatedProfile).then(
              () => resolve(updatedProfile),
              err => reject(err)
            );
          }
        }
      );
    })
  );
}

export async function updateUserProfile(email: string, userProfileChanges: Partial<UserProfile>): Promise<number> {
  return withCollection(
    usersCol => new Promise((resolve, reject) => {
      usersCol.updateOne({ email }, { "$set": userProfileChanges }).then(
        res => resolve(res.matchedCount),
        err => reject(err)
      );
    })
  );
}
