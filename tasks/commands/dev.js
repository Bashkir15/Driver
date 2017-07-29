const webpack = require('webpack');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const chalk = require('chalk');
const { resolve } = require('path');
const getRoot = require('app-root-dir').get;
const builder = require('../builder');
const defaultConfig = require('../config/config');
const { clean } = require('./clean');

function buildDev() {
    const config = builder(Object.assign({}, defaultConfig, {
        env    : 'development',
        target : 'dev',
    }));

    return new Promise((resolve, reject) => {
        webpack(config, (fatalError, stats) => {
            if (fatalError) {
                const fatalMsg = `Fatal error during compiling client: ${fatalError}`;
                console.log(chalk.red(fatalMsg));
                return reject(fatalMsg);
            }

            const rawMessages = stats.toJson({});
            const messages = formatWebpackMessages(rawMessages);
            const isSuccessful = !messages.errors.length && !messages.warnings.length;

            if (isSuccessful) {
                console.log(chalk.green('Bundled successfully!'));
            }

            // if errors exists only show errors
            if (messages.errors.length) {
                console.log(chalk.red('Failed to compile!\n'));
                console.log(messages.errors.join('\n\n'));
                return ;
            }

            // Show warnings if no errors were found
            if (messages.warnings.length) {
                console.log(chalk.yellow('Compiled with warnings. \n'));
                console.log(messages.warnings.join('\n\n'));
                console.log(
                    `\nSearch for the ${ chalk.underline(chalk.yellow('keywords')) } to learn more about each warning.`
                );
                console.log(`If this is a useless warning, add ${ chalk.cyan('// eslint-disable-next-line')} to the line before. \n`);
            }

            return resolve(true);
        });
    });
}

function cleanDev() {
    const ROOT = getRoot();
	return clean(resolve(ROOT, 'build/dev'));
}

module.exports = {
	buildDev,
	cleanDev
};
