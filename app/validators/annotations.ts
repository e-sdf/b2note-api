import Ajv from "ajv";
import { getQuerySchema } from "../core/getQuery.schema";
import { anRecordSchema } from "../core/anRecord.schema";
import { anRecordOptSchema } from "../core/anRecord.opt.schema";
import { targetsQuerySchema } from "../core/targetsQuery.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(getQuerySchema);
ajv.addSchema(anRecordSchema);
ajv.addSchema(anRecordOptSchema);
ajv.addSchema(targetsQuerySchema);

export function validateGetQuery(query: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("getQuery#/definitions/GetQuery", query);
  return ajv.errors;
}

export function validateAnRecord(anRecord: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("anRecord#/definitions/AnRecord", anRecord);
  return ajv.errors;
}

export function validateAnRecordOpt(anRecord: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("anRecordOpt#/definitions/AnRecord", anRecord);
  return ajv.errors;
}

export function validateTargetsQuery(query: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("targetsQuery#/definitions/TargetsQuery", query);
  return ajv.errors;
}
