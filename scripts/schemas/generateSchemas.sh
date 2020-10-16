#!/bin/bash

echo "Cleaning schemas"
rm -rf ./b2note-core/src/core/schemas
mkdir ./b2note-core/src/core/schemas
# Dummy files run to make the compiler happy
./scripts/schemas/generateAnnotationSchemas.sh
./scripts/schemas/generateOntologyQuerySchemas.sh
./scripts/schemas/generateProfileSchemas.sh
./scripts/schemas/generateAnQuerySchemas.sh
#./scripts/schemas/generateHandleSchemas.sh
# Actual files run
./scripts/schemas/generateAnnotationSchemas.sh
./scripts/schemas/generateOntologyQuerySchemas.sh
./scripts/schemas/generateAnQuerySchemas.sh
./scripts/schemas/generateProfileSchemas.sh
#./scripts/schemas/generateHandleSchemas.sh