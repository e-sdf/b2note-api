import Ajv from "ajv";
import { ontologyQuerySchema } from "../core/schemas/ontologyQuery.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(ontologyQuerySchema);

export function validateGetOntologyQuery(query: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("ontologyQuery#/definitions/OntologyQuery", query);
  return ajv.errors;
}