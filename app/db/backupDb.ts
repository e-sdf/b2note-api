import fs from "fs";
import { mkTimestamp } from "../core/utils";
import * as usersDb from "./users";
import * as anDb from "./annotations";
import * as domainDb from "./domains";
import * as ontDb from "./ontologyRegister";

function mkFname(f: string): string {
  return `backup/${f}_${mkTimestamp()}.json`;
}

usersDb.getUsersRecords().then(
  res => fs.writeFile(mkFname("users"), JSON.stringify(res, null, 2), err => {
    if (err) {
      console.error(err);
    }
  })
);

anDb.getAnnotationsRecords().then(
  res => fs.writeFile(mkFname("annotations"), JSON.stringify(res, null, 2), err => {
    if (err) {
      console.error(err);
    }
  })
);

domainDb.getDomainsRecords().then(
  res => fs.writeFile(mkFname("domains"), JSON.stringify(res, null, 2), err => {
    if (err) {
      console.error(err);
    }
  })
);

ontDb.getOntologiesRecords().then(
  res => fs.writeFile(mkFname("ontologies"), JSON.stringify(res, null, 2), err => {
    if (err) {
      console.error(err);
    }
  })
);