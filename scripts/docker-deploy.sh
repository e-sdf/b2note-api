#!/bin/bash

./scripts/docker-build.sh && ./scripts/docker-tag.sh && ./scripts/docker-push.sh
