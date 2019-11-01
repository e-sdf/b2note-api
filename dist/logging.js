"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
function error(msg) {
    console.error(new Error(chalk.bold.red(msg)));
}
exports.error = error;
