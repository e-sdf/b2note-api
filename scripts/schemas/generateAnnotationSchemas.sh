#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/annotationsModel.ts"

S="annotation.schema.js"
F="$D/$S"
echo "Generating $S"
echo "export const annotationSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "Annotation" >> "$F"
sed -i '2 a \ \ "$id": "annotation",' "$F"

# Schema with optional fields for patch validations
S="annotation.partial.schema.js"
F="$D/$S"
echo "Generating $S"
echo "export const annotationPartialSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "AnnotationPartial" >> "$F"
sed -i '2 a \ \ "$id": "annotationPartial",' "$F"
