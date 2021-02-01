#!/bin/bash

cd dist;
echo "Making DB backup..."
mkdir backup
npm run backup-db
echo "Staring server..."
npm run start
