import Ajv from "ajv";
import { getAnQuerySchema } from "../core/getAnQuery.schema";
import { annotationSchema } from "../core/annotation.schema";
import { annotationOptSchema } from "../core/annotation.opt.schema";
import { anTargetsQuerySchema } from "../core/anTargetsQuery.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(getAnQuerySchema);
ajv.addSchema(annotationSchema);
ajv.addSchema(annotationOptSchema);
ajv.addSchema(anTargetsQuerySchema);

export function validateGetAnQuery(anQuery: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("getQuery#/definitions/GetAnQuery", anQuery);
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

export function validateAnTargetsQuery(anQuery: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("anTargetsQuery#/definitions/AnTargetsQuery", anQuery);
  return ajv.errors;
}
