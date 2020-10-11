#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/annotationsModel.ts"
OD="`pwd`/b2note-core/src/core/schemas/"

T="Annotation"
generateSchema
#if [ -f "$OF" ]; then # dummy/previous file exists
  #echo "Generating $S"
  #echo "export const annotationSchema = " > "$OF"
  #npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "Annotation" >> "$OF"
  #sed -i '2 a \ \ "$id": "annotation",' "$OF"
#else
  #echo "Generating dummy $S" # generate dummy file to make the compiler happy
  #echo "export const annotationSchema = {};" > "$OF"
#fi


# Schema with optional fields for patch validations
T="AnnotationPartial"
generateSchema
#if [ -f "$OF" ]; then # dummy/previous file exists
  #echo "Generating $S"
  #echo "export const annotationPartialSchema = " > "$OF"
  #npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "AnnotationPartial" >> "$OF"
  #sed -i '2 a \ \ "$id": "annotationPartial",' "$OF"
#else
  #echo "Generating dummy $S" # generate dummy file to make the compiler happy
  #echo "export const annotationPartialSchema = {};" > "$OF" 
#fi
