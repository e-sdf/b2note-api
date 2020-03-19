#!/bin/bash

npx api-spec-converter --from=api_blueprint --to=swagger_2 apiary.apib > public/swagger2.json
npx api-spec-converter --from=swagger_2 --to=openapi_3 public/swagger2.json > public/openapi3.json