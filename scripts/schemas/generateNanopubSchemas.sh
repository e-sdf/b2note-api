#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/nanopubModel.ts"

S="nanopubModel.schema.js"
F="$D/$S"
echo "export const nanopubModelSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "Nanopub" >> "$F"

# Schema with optional fields for patch validations
S="nanopub.opt.schema.js"
F="$D/$S"
echo "export const nanopubOptSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" --additional-properties true -p "$IF" -t "Nanopub" >> "$F"
