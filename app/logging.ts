const chalk = require('chalk');

export function logError(msg: string): void {
  console.error(new Error(chalk.bold.red(msg)));
}

