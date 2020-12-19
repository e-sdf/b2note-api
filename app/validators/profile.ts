import type { ErrorObject } from "ajv";
import Ajv from "ajv";
import { userProfilePartialSchema } from "../core/schemas/userProfilePartial.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(userProfilePartialSchema);

export function validateUserProfilePartial(query: Item): Array<ErrorObject> | null | undefined {
  ajv.validate("userProfilePartial#/definitions/UserProfilePartial", query);
  return ajv.errors;
}
