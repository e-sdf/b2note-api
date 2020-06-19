import Ajv from "ajv";
import { getQuerySchema } from "../core/getQuery.schema";
import { annotationSchema } from "../core/annotation.schema";
import { annotationOptSchema } from "../core/annotation.opt.schema";
import { targetsQuerySchema } from "../core/targetsQuery.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(getQuerySchema);
ajv.addSchema(annotationSchema);
ajv.addSchema(annotationOptSchema);
ajv.addSchema(targetsQuerySchema);

export function validateGetQuery(query: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("getQuery#/definitions/GetQuery", query);
  return ajv.errors;
}

export function validateAnnotation(annotation: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("annotation#/definitions/Annotation", annotation);
  return ajv.errors;
}

export function validateAnnotationOpt(annotation: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("annotationOpt#/definitions/Annotation", annotation);
  return ajv.errors;
}

export function validateTargetsQuery(query: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("targetsQuery#/definitions/TargetsQuery", query);
  return ajv.errors;
}
