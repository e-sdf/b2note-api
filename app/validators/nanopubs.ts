import Ajv from "ajv";
import { nanopubSchema } from "../core/nanopub.schema";
import { nanopubOptSchema } from "../core/nanopub.opt.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(nanopubSchema);
ajv.addSchema(nanopubOptSchema);

export function validateGetNpQuery(npQuery: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("getNpQuery#/definitions/GetNpQuery", npQuery);
  return ajv.errors;
}

export function validateNanopub(nanopub: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("nanopub#/definitions/Nanopub", nanopub);
  return ajv.errors;
}

export function validateNanopubOpt(nanopub: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("nanopubOpt#/definitions/Nanopub", nanopub);
  return ajv.errors;
}
