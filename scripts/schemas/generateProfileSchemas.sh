#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/user.ts"
OD="`pwd`/app/schemas/"

T="UserProfilePartial"
generateSchema
