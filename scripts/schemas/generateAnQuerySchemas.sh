#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/apiModels/anQueryModel.ts"
OD="`pwd`/b2note-core/src/core/schemas/"

T="GetAnQuery"
generateSchema
#if [ -f "$OF" ]; then # dummy/previous file exists
  #echo "Generating $S"
  #npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "GetAnQuery" > "$OF"
  #sed -i '1 i export const getAnQuerySchema = ' "${OF}_temp"
  #sed -i '2 a \ \ "$id": "getAnQuery",' "${OF}_temp"
#else
  #echo "Generating dummy $S" # generate dummy file to make the compiler happy
  #echo "export const getAnQuerySchema = {};" > "$OF"
  #rm "$OF"
  #mv "${OF}_temp" "$OF"
#fi

T="AnTargetsQuery"
generateSchema
#if [ -f "$OF" ]; then # dummy/previous file exists
  #echo "Generating $S"
  #echo "export const anTargetsQuerySchema = " > "$OF"
  #npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "AnTargetsQuery" >> "$OF"
  #sed -i '2 a \ \ "$id": "targetAnQuery",' "$OF"
#else
  #echo "Generating dummy $S" # generate dummy file to make the compiler happy
  #echo "export const anTargetsQuerySchema = {};" > "$OF"
#fi