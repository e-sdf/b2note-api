import Ajv from "ajv";
import { getAnQuerySchema } from "../core/getAnQuery.schema";
import { annotationSchema } from "../core/annotation.schema";
import { annotationPartialSchema } from "../core/annotation.partial.schema";
import { anTargetsQuerySchema } from "../core/anTargetsQuery.schema";

type Item = Record<string, any>;

const ajv = new Ajv();
ajv.addSchema(getAnQuerySchema);
ajv.addSchema(annotationSchema);
ajv.addSchema(annotationPartialSchema);
ajv.addSchema(anTargetsQuerySchema);

export function validateGetAnQuery(anQuery: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("getAnQuery#/definitions/GetAnQuery", anQuery);
  return ajv.errors;
}

export function validateAnnotation(annotation: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("annotation#/definitions/Annotation", annotation);
  return ajv.errors;
}

export function validateAnnotationPartial(annotation: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("annotationPartial#/definitions/AnnotationPartial", annotation);
  return ajv.errors;
}

export function validateAnTargetsQuery(anQuery: Item): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("anTargetsQuery#/definitions/AnTargetsQuery", anQuery);
  return ajv.errors;
}
