#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/nanopubModel.ts"

S="nanopub.schema.js"
F="$D/$S"
echo "Generating $S"
echo "export const nanopubSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "Nanopub" >> "$F"
sed -i '2 a \ \ "$id": "nanopub",' "$F"

# Schema with optional fields for patch validations
S="nanopub.partial.schema.js"
F="$D/$S"
echo "Generating $S"
echo "export const nanopubPartialSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "NanopubPartial" >> "$F"
sed -i '2 a \ \ "$id": "nanopubPartial",' "$F"
