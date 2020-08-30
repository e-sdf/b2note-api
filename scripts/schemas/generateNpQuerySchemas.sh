#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/npQueryModel.ts"

S="getNpQuery.schema.js"
F="$D/$S"
echo "export const getNpQuerySchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "GetNpQuery" >> "$F"