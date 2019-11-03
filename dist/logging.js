"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
function logError(msg) {
    console.error(new Error(chalk.bold.red(msg)));
}
exports.logError = logError;
