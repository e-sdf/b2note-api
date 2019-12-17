import Ajv from "ajv";
import { getQuerySchema } from "./shared/getQuery.schema";
import { anRecordSchema } from "./shared/anRecord.schema";
import { anRecordOptSchema } from "./shared/anRecord.opt.schema";
import { targetsQuerySchema } from "./shared/targetsQuery.schema";

const ajv = new Ajv();
ajv.addSchema(getQuerySchema);
ajv.addSchema(anRecordSchema);
ajv.addSchema(anRecordOptSchema);
ajv.addSchema(targetsQuerySchema);

export function validateGetQuery(query: any): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("getQuery#/definitions/GetQuery", query);
  return ajv.errors;
}

export function validateAnRecord(anRecord: any): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("anRecord#/definitions/AnRecord", anRecord);
  return ajv.errors;
}

export function validateAnRecordOpt(anRecord: any): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("anRecordOpt#/definitions/AnRecord", anRecord);
  return ajv.errors;
}

export function validateTargetsQuery(query: any): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("targetsQuery#/definitions/TargetsQuery", query);
  return ajv.errors;
}
