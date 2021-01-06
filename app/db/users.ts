import { v5 as uuidv5 } from "uuid";
import config from "../config";
import * as dbClient from "./client";
import type { OIDUserinfo } from "../auth/auth";
import type { UserProfile } from "../core/user";
import { Experience } from "../core/user";
import type { Ontology } from  "../core/ontologyRegister";
import * as oDb from "./ontologyRegister";
import { extractId } from "../core/utils";

// DB Access {{{1

function withCollection<T>(dbOp: dbClient.DbOp): Promise<T> {
  return dbClient.withCollection("users", dbOp);
}

// Utils {{{1

function mkId(email: string): string {
  return uuidv5(email, config.uuidNs);
}

// User queries {{{1

export function getUserProfileById(id: string): Promise<UserProfile|null> {
  return withCollection(
    usersCol => usersCol.findOne({ id })
  );
}

export function getUserProfileByEmail(email: string): Promise<UserProfile|null> {
  return withCollection(
    usersCol => usersCol.findOne({ "email": email })
  );
}

export function upsertUserProfileFromUserinfo(userInfo: OIDUserinfo): Promise<UserProfile> {
  console.log("Got user info from OID:");
  console.log(userInfo);
  const email = userInfo.email;
  if (email) {
    return withCollection(
      usersCol => new Promise((resolve, reject) => {
        getUserProfileByEmail(email).then(
          userProfile => {
            if (!userProfile) {
              const newProfile: UserProfile = {
                id: mkId(email),
                email,
                personName: userInfo.name || ((userInfo.given_name || "") + " " + (userInfo.family_name || "")),
                givenName: userInfo.given_name || "",
                familyName: userInfo.family_name || "",
                orcid: userInfo.orcid ? extractId(userInfo.orcid) : "",
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
                personName: userProfile.personName === "" ? userInfo.name || "" : userProfile.personName || ""
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
  } else {
    return Promise.reject("email not present in OID response");
  }
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

// Custom ontologies management {{{1

export function getOntologiesOfUser(userId: string): Promise<Array<Ontology>> {
  return new Promise((resolve, reject) =>
    oDb.getOntologiesRecords().then(
      records => resolve(records.filter(rec => rec.userIds.includes(userId)).map(oDb.record2ontology)),
      err => reject(err)
    )
  );
}

export function addCustomOntology(userId: string, ontId: string): Promise<void> {
  return new Promise((resolve, reject) => 
    getUserProfileById(userId).then(
      () => oDb.addUserOfOntology(ontId, userId).then(
        () => resolve(),
        err => reject(err)
      ),
      err => reject(err)
    )
  );
}

export function deleteCustomOntology(userId: string, ontId: string): Promise<void> {
  return new Promise((resolve, reject) => 
    getUserProfileById(userId).then(
      () => oDb.removeUserOfOntology(ontId, userId).then(
        () => resolve(),
        err => reject(err)
      ),
      err => reject(err)
    )
  );
}

// Domains {{{1

export function getUsersOfDomain(domainId: string): Promise<Array<string>> {
  return withCollection(
    usersCol => usersCol.find({ domainsIds: domainId }, { projection: { id: 1 } }).toArray()
  );
}