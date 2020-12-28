import type { ErrorObject } from "ajv";
import Ajv from "ajv";
import { ontologyGetQuerySchema } from "../schemas/ontologyGetQuery.schema";
import { ontologyPatchQuerySchema } from "../schemas/ontologyPatchQuery.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(ontologyGetQuerySchema);
ajv.addSchema(ontologyPatchQuerySchema);

export function validateGetOntologyQuery(query: Item): Array<ErrorObject> | null | undefined {
  ajv.validate("ontologyGetQuery#/definitions/OntologyGetQuery", query);
  return ajv.errors;
}

export function validatePatchOntologyQuery(query: Item): Array<ErrorObject> | null | undefined {
  ajv.validate("ontologyPatchQuery#/definitions/OntologyPatchQuery", query);
  return ajv.errors;
}