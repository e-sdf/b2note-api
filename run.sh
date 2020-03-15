#!/bin/bash

# Create the config.js to provide client run-time config variables
C=dist/public/widget/js/config.js
SERVER_URL=`[ -z "$SERVER_URL" ] && echo "http://localhost:3060" || echo "$SERVER_URL"` # for webpack server
echo -n "window.b2note = { serverUrl: '"$SERVER_URL"' };" > $C

cd dist; npm run run
