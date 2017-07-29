const webpack = require('webpack');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const chalk = require('chalk');
const { resolve } = require('path');
const getRoot = require('app-root-dir').get;
const builder = require('../builder');
const defaultConfig = require('../config/config');
const { clean } = require('./clean');

function buildProd() {
	const config = builder(Object.assign({}, defaultConfig, {
		env    : 'production',
		target : 'prod',
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
                return reject('Failed to compile');
            }

            return resolve(true);			
		});
	});
}

function cleanProd() {
	const ROOT = getRoot();
	return clean(resolve(ROOT, 'build/prod'));
}

module.exports = {
	buildProd,
	cleanProd,
};
