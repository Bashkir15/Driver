const ora = require('ora');
const getRoot = require('app-root-dir').get;
const { relative } = require('path');

const ROOT = getRoot();

class VerboseProgress {
    constructor({ prefix }) {
        this.prefix = prefix;
    }

    apply(compiler) {
        let doneModules = 0;
        let spinner = null;
        let lastModule = null;
        const prefix = this.prefix ? this.prefix + " " : "";

        function display(message) {
            if (message !== '') {
                spinner.text = prefix + message;

                // We have to force this to render otherwise busy-body bundler
                // will ignore it
                spinner.render();
            } else {
                spinner.succeed(prefix + 'Done!');
            }
        }

        function moduleDone(module) {
            doneModules += 1;

            let readableIndex;
            let readableModuleId = lastModule;

            readableIndex = readableModuleId.lastIndexOf(' ');
            readableModuleId = readableIndex === -1 ? readableModuleId : readableModuleId.slice(readableIndex + 1, readableModuleId.length);

            readableIndex = readableModuleId.lastIndexOf('!');
            readableModuleId = readableIndex === -1 ? readableModuleId : readableModuleId.slice(readableIndex + 1, readableModuleId.length);

            readableIndex = readableModuleId.lastIndexOf('?');
            readableModuleId = readableIndex === -1 ? readableModuleId : readableModuleId.slice(0, readableIndex);

            readableModuleId = relative(ROOT, readableModuleId).replace(/^node_modules\//, "~/");

            if (readableModuleId.startsWith('"') && readableModuleId.endsWith('"')) {
                readableModuleId = readableModuleId.slice(1, -1);
            }

            // Ignore Context Logic Import
            if (readableModuleId.includes('|')) {
                return;
            }

            // Exclude difficult directly relative modules
            if (readableModuleId.startsWith('..')) {
                return;
            }

            if (/^[a-zA-z0-9\-_/~\.]{0,50}$/.test(readableModuleId)) {
                display(`Building Modules ${readableModuleId}...`);
            }
        }

        compiler.plugin('compilation', (compilation) => {
            if (compilation.compiler.isChild()) {
                return;
            }

            doneModules = 0;

            spinner = ora({ interval: 16 });
            spinner.start();

            display(0, 'compiling');

            compilation.plugin('build-module', (module) => {
                lastModule = module.identifier();
            });

            compilation.plugin('failed-module', moduleDone);
            compilation.plugin('succeed-module', moduleDone);

            const syncHooks = {
                'seal'                   : 'Sealing',
                'optimize'               : 'Optimizing',
                'optimize-modules-basic' : 'Optimizing modules',
                'optimize-chunks-basic'  : 'Optimizing chunks',
                'optimize-chunk-modules' : 'Optimizing chunk modules',
                'optimize-module-order'  : 'Optimizing module order',
                'optimize-module-ids'    : 'Optimizing module ids',
                'optimize-chunk-order'   : 'Optimizing chunk order',
                'optimize-chunk-ids'     : 'Optimizing chunk ids',
                'before-hash'            : 'Hashing',
                'before-module-assets'   : 'Processing module assets',
                'before-chunk-assets'    : 'Processing chunk assets',
                'record'                 : 'Recording'
            };

            Object.keys(syncHooks).forEach((name) => {
                let pass = 0;
                const message = syncHooks[name];
                compilation.plugin(name, () => {
                    if (pass++ > 0) {
                        display(message + ` [pass ${pass}]`);
                    } else {
                        display(message);
                    }
                });
            });

            compilation.plugin('optimize-tree', (chunks, modules, callback) => {
                display('Optimizing tree');
                callback();
            });

            compilation.plugin('additional-assets', (callback) => {
                display('Processing assets');
                callback();
            });

            compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
                display('Optimizing chunk assets');
                callback();
            });

            compilation.plugin('optimize-assets', (assets, callback) => {
                display('Optimizing assets');
                callback();
            });
        });

        compiler.plugin('emit', (compilation, callback) => {
            display('Emitting');
            callback();
        });

        compiler.plugin('done', () => {
            display('');
        });
    }
}

module.exports = VerboseProgress;
