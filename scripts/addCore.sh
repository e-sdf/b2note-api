#!/bin/bash

# Add b2note-core git subtree

echo "Adding b2note-core as a git subtree..."
git remote add core git@github.com:roper79/b2note-core.git
git subtree add --prefix=b2note-core core master --squash
git subtree split --prefix=b2note-core --annotate="(split) " --branch core
echo "Linking app to app/core..."
ln -s ../b2note-core/app app/core
echo "Generating schemas..."
cd b2note-core && scripts/generateSchemas.sh
