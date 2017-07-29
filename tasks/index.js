const gulp = require('gulp');
const notifier = require('node-notifier');
const chalk = require('chalk');
const { buildDev, cleanClient } = require('./commands/build');
const buildProd = require('./commands/prod');

function createNotification(options) {
    const title = `${options.title}`;

    if (options.notify) {
        notifier.notify({
            title,
            message: options.message,
        });
    }

    const level = options.level || 'info';
    const message = `${chalk.bold(title)}: ${options.message}`;

    switch (level) {
        case 'warn':
            console.log(chalk.yellow(messsage));
            break;
        case 'error':
            console.log(chalk.bgRed.white(message));
            break;
        case 'info':
        default:
            console.log(message);
    }
}

module.exports = {
    cleanClient,
    buildDev,
    createNotification,
};
