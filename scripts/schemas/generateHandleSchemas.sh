#!/bin/bash

source ./scripts/schemas/generateSchema.sh
ID="`pwd`/b2note-core/src/core"
IF="$D/handleModel.ts"
OD="$ID/schemas"

T="HandleResp"
generateSchema