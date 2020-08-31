import Ajv from "ajv";
import { nanopubSchema } from "../core/nanopub.schema";
import { nanopubPartialSchema } from "../core/nanopub.partial.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(nanopubSchema);
ajv.addSchema(nanopubPartialSchema);

export function validateGetNpQuery(npQuery: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("getNpQuery#/definitions/GetNpQuery", npQuery);
  return ajv.errors;
}

export function validateNanopub(nanopub: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("nanopub#/definitions/Nanopub", nanopub);
  return ajv.errors;
}

export function validateNanopubPartial(nanopub: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("nanopubPartial#/definitions/NanopubPartial", nanopub);
  return ajv.errors;
}
