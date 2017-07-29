const envPreset = require('babel-preset-env');
const babiliPreset = require('babel-preset-babili');
const dynamicImportPlugin = require('babel-plugin-syntax-dynamic-import');
const fastAsyncPlugin = require('babel-plugin-fast-async');
const objectSpreadPlugin = require('babel-plugin-transform-object-rest-spread');
const runtimePlugin = require('babel-plugin-transform-runtime');
const transformJsxPlugin = require('babel-plugin-transform-react-jsx');
const classPropertiesPlugin = require('babel-plugin-transform-class-properties');
const jsxSyntaxPlugin = require('babel-plugin-syntax-jsx');
const jsxSourcePlugin = require('babel-plugin-transform-react-jsx-source');
const jsxSelfPlugin = require('babel-plugin-transform-react-jsx-self');
const inlineElementPlugin = require('babel-plugin-transform-react-inline-elements');
const constantElementsPlugin = require('babel-plugin-transform-react-constant-elements');
const removePropTypesPlugin = require('babel-plugin-transform-react-remove-prop-types');
const lodashPlugin = require('babel-plugin-lodash');

function buildBabel(config) {
    const presets = [];
    const plugins = [];
    const options = config.babel;

    console.log(options);
    // common presets
    presets.push([
        envPreset, {
            modules    : false,
            // Prefer builtins which also prefers global pollyfills which is generally the
            // right thing to do for most scenarios, like the ones involvings SPAs and
            // NodeJS environments
            useBuiltIns : true,
        }
    ]);

    // common plugins
    plugins.push(dynamicImportPlugin);

    // Alternative to Babel Regenerator that implements the ES7 keywords async and await
    // using syntax transformation at compile time rather than relying ongenerators
    // Ref: https://www.npmjs.com/package/fast-async
    plugins.push([
        fastAsyncPlugin, {
            useRuntimeModule : true,
        }
    ]);
    plugins.push([
        objectSpreadPlugin, {
            useBuiltIns : true,
        }
    ]);

    plugins.push({
        lodashPlugin, {
            id : 'lodash'
        },
    });

    // Use helpers, but not polyfills in a way that omits duplication
    // For polyfills using polyfill.io or another more sophisticated solution is
    // generally a better idea
    plugins.push([
        runtimePlugin, {
            helpers      : true,
            regenerator  : false,
            polyfill     : false,
            useBuiltIns  : true,
            useESModules : true,
        }
    ]);
    plugins.push([
        transformJsxPlugin, {
            useBuiltIns : true,
            pragma      : 'React.createElement',
        }
    ]);
    plugins.push(classPropertiesPlugin);
    plugins.push(jsxSyntaxPlugin);

    if (config.target === 'dev') {
        // These plugins are invaluable for making React warnings display more valuable
        // and understandable information. These are included because they are not enabled
        // in babel-preset-react
        // https://github.com/babel/babel/issues/4702
        // https://github.com/facebookincubator/create-react-app/issues/989
        plugins.push(jsxSourcePlugin);
        plugins.push(jsxSelfPlugin);
    }

    if (config.target === 'prod') {
        presets.push(babiliPreset);

        // Replaces the React.createElement function with something that is more
        // optimized for a production environment
        // https://babeljs.io/docs/plugins/transform-react-inline-elements/
        plugins.push(inlineElementPlugin);

        // Hoists elements creation to the top level for subtrees that are full static,
        // which reduces calls to React.createElement and resulting allocations.
        // More importantly, it tells React that the subtree hasn't changed so React
        // can completely ignore it when reconciling
        // https://babeljs.io/docs/plugins/transform-react-constant-elements/
        plugins.push(constantElementsPlugin);
        plugins.push([
            removePropTypesPlugin, {
                mode         : 'remove',
                removeImport : 'true'
            }
        ]);
    }

    return {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: [
            config.cacheLoader,
            {
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    presets,
                    plugins
                },
            }
        ]
    }
}

module.exports = buildBabel;
