#!/bin/bash

D="app/shared"
O="--topRef --noExtraProps"

S="anRecord.schema.js"
F="$D/$S"
echo "export const anRecordSchema = " > $F
typescript-json-schema --id "anRecord" $O --required app/shared/annotationsModel.ts AnRecord >> $F

# Schema with optional fields for patch validations
S="anRecord.opt.schema.js"
F="$D/$S"
echo "export const anRecordOptSchema = " > $F
typescript-json-schema --id "anRecordOpt" $O app/shared/annotationsModel.ts AnRecord >> $F

S="getQuery.schema.js"
F=$D/$S
echo "export const getQuerySchema = " > $F
typescript-json-schema --id "getQuery" $O --required app/shared/annotationsModel.ts GetQuery >> $F

S="targetsQuery.schema.js"
F=$D/$S
echo "export const targetsQuerySchema = " > $F
typescript-json-schema --id "targetsQuery" $O --required app/shared/annotationsModel.ts TargetsQuery >> $F