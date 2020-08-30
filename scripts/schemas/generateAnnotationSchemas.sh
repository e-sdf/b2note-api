#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/annotationsModel.ts"

S="annotation.schema.js"
F="$D/$S"
echo "export const annotationSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "Annotation" >> "$F"

# Schema with optional fields for patch validations
S="annotation.opt.schema.js"
F="$D/$S"
echo "export const annotationOptSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" --additional-properties true -p "$IF" -t "Annotation" >> "$F"
