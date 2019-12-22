#!/bin/bash

# Add b2note-core git subtree

echo "Adding b2note-core as a git subtree to app"
git remote add –f core git@github.com:roper79/b2note-core.git
git subtree add --prefix=app/core core master --squash