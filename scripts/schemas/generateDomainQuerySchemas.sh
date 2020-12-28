#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/apiModels/domainQueryModel.ts"
OD="`pwd`/app/schemas/"

T="DomainPostQuery"
generateSchema

T="DomainPatchQuery"
generateSchema