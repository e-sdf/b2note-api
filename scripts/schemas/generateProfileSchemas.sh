#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/user.ts"

# Schema with optional fields for patch validations
S="userProfile.opt.schema.js"
F="$D/$S"
echo "export const userProfileOptSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" --additional-properties true -p "$IF" -t "UserProfile" >> "$F"
