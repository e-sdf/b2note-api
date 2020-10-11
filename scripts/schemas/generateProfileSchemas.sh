#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/user.ts"
OD="`pwd`/b2note-core/src/core/schemas/"

T="UserProfilePartial"
generateSchema
#if [ -f "$OF" ]; then # dummy/previous file exists
  #echo "Generating $S"
  #npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "UserProfilePartial" > "${OF}_temp"
  #sed -i '1 i export const userProfilePartialSchema = ' "${OF}_temp"
  #sed -i '2 a \ \ "$id": "userProfilePartial",' "${OF}_temp"
  #rm "$OF"
  #mv "${OF}_temp" "$OF"
#else
  #echo "Generating dummy $S" # generate dummy file to make the compiler happy
  #echo "export const userProfilePartialSchema = {};" > "$OF"
#fi
