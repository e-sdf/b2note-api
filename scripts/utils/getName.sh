#!/bin/bash

echo \
'var fs = require("fs");
var obj = JSON.parse(fs.readFileSync("package.json", "utf8"));
console.log(obj.name);'\
| node -
