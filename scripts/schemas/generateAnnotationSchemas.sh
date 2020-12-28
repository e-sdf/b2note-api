#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/annotationsModel.ts"
OD="`pwd`/app/schemas/"

T="Annotation"
generateSchema

# Schema with optional fields for patch validations
T="AnnotationPartial"
generateSchema
