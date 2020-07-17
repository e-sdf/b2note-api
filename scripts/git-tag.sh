#!/bin/bash

V=`./scripts/utils/getVersion.sh`

git tag "v$V"
git push --tags
