import Ajv from "ajv";
import { userProfileOptSchema } from "../core/userProfileOpt.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(userProfileOptSchema);

export function validateUserProfileOpt(query: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("userProfileOpt#/definitions/UserProfile", query);
  return ajv.errors;
}
