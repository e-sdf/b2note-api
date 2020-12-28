import type { ErrorObject } from "ajv";
import Ajv from "ajv";
import { domainPostQuerySchema } from "../schemas/domainPostQuery.schema";
import { domainPatchQuerySchema } from "../schemas/domainPatchQuery.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(domainPostQuerySchema);
ajv.addSchema(domainPatchQuerySchema);

export function validatePostDomainQuery(query: Item): Array<ErrorObject> | null | undefined {
  ajv.validate("domainPostQuery#/definitions/DomainPostQuery", query);
  return ajv.errors;
}

export function validatePatchDomainQuery(query: Item): Array<ErrorObject> | null | undefined {
  ajv.validate("domainPatchQuery#/definitions/DomainPatchQuery", query);
  return ajv.errors;
}