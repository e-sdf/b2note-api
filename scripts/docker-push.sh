#!/bin/bash

R=`./scripts/utils/getRepo.sh`
N=`./scripts/utils/getName.sh`

docker push "$R/$N"
