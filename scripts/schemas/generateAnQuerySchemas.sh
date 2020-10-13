#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/apiModels/anQueryModel.ts"
OD="`pwd`/b2note-core/src/core/schemas/"

T="GetAnQuery"
generateSchema

T="AnTargetsQuery"
generateSchema