const meow = require('meow');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const Promise = require('bluebird');
const getRoot = require('app-root-dir').get();
const { buildDev, cleanDev } = require('./commands/dev');
const { buildProd, cleanProd } = require('./commands/prod');
const { cleanAll } = require('./commands/clean');
const command = meow(`
    Usage:
        $ build <command>

    Options:
        --verbose, -v     Generates verbose output messages
        --quiet, -q       Reduce amount of output messages to warnings and errors

    Commands
        dev               Produces a development build for the application with logging
        prod              Produces a production ready build with minified code and sorted assets
        test              Bundles the test files so they have access to things like require.context
        clean             Removes the specified directory when passed -d(dev) or -p(prod) or both
                          When no flag is passed
`, {
    alias: {
        v: 'verbose',
        q: 'quiet'
    }
});

const selectedTasks = command.input;
const flags = command.flags;

const availableTasks = [
    {
        task: 'dev',
        commands: [cleanDev, buildDev]
    },
    {
        task: 'prod',
        commands: [cleanProd, buildProd]
    },
    {
        task: 'clean',
        commands: [cleanAll]
    }
];

if (!flags.verbose) {
    process.noDeprecation = true;
}

function executeCommands(listOfCommands) {
    return Promise.each(listOfCommands, item => item());
}

async function executeTasks() {
    for (const taskName of selectedTasks) {
        for (let taskConfig of availableTasks) {
            if (taskConfig.task === taskName) {
                if (taskName === 'clean') {
                    if (flags.includes('-d')) {
                        taskConfig.commands = [cleanDev];
                    }
                    if (flags.includes('-p')) {
                        taskConfig.commands = [cleanProd]
                    }
                }
                try {
                    await executeCommands(taskConfig.commands);
                } catch (error) {
                    console.error(chalk.bold.red(`Failed to execute task: ${taskName}`));
                    console.error(error);
                    process.exit(1);
                }
            }
        }
    }
}

process.nextTick(executeTasks)
