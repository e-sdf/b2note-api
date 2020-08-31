#!/bin/bash

D="`pwd`/b2note-core/src/core"
IF="$D/user.ts"

# Schema with optional fields for patch validations
S="userProfile.partial.schema.js"
F="$D/$S"
echo "Generating $S"
echo "export const userProfilePartialSchema = " > "$F"
npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "UserProfilePartial" >> "$F"
sed -i '2 a \ \ "$id": "userProfilePartial",' "$F"
