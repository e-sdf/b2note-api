#!/bin/bash

source ./scripts/schemas/generateSchema.sh
ID="`pwd`/b2note-core/src/core"
IF="$D/handleModel.ts"
OD="$ID/schemas"

T="HandleResp"
generateSchema
#if [ -f "$OF" ]; then # dummy/previous file exists
  #echo "Generating $S"
  #npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "HandleResp" > "${OF}_temp"
  #sed -i '1 i export const handleRespSchema = ' "${OF}_temp"
  #sed -i '2 a \ \ "$id": "handleResp",' "${OF}_temp"
  #rm "$OF"
  #mv "${OF}_temp" "$OF"
#else
  #echo "Generating dummy $S" # generate dummy file to make the compiler happy
  #echo "export const handleRespSchema = {};" > "$OF"
#fi