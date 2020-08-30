#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/handleModel.ts"

S="handleModel.schema.js"
F="$D/$S"
echo "export const handleModelSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "HandleResp" >> "$F"