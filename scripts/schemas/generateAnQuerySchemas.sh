#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/anQueryModel.ts"

S="getAnQuery.schema.js"
F="$D/$S"
echo "export const getAnQuerySchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "GetAnQuery" >> "$F"

S="anTargetsQuery.schema.js"
F="$D/$S"
echo "export const anTargetsQuerySchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "AnTargetsQuery" >> "$F"