#!/bin/bash

R=`./scripts/utils/getRepo.sh`
N=`./scripts/utils/getName.sh`
V=`./scripts/utils/getVersion.sh`
B=`./scripts/utils/getBuild.sh`

docker tag "$R/$N" "$R/$N:$V-$B"
