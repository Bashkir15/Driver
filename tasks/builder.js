const fs = require('fs');
const chalk = require('chalk');
const getRoot = require('app-root-dir').get;
const webpack = require('webpack');
const { resolve } = require('path');
const { getHashDigest } = require('loader-utils');
const buildBabel = require('./config/babel');
const buildCss = require('./config/css');
const buildPlugins = require('./config/plugins');
const buildResolve = require('./config/resolve');

const CACHE_HASH_TYPE = 'sha256';
const CACHE_DIGEST_TYPE = 'base62';
const CACHE_DIGEST_LENGTH = 4;
const ROOT = getRoot();


const assetFiles = /\.(eot|woff|woff2|ttf|png|jpg|jpeg|webp)$/;
const compressableAssets = /\.(tff|otf|svg|html|js|css|json)$/;

function builder(config) {
    const devBuild = config.target === 'dev';
    const prodBuild = config.target === 'prod';
    const testBuild = config.target === 'test';
    const name = config.target;
    const devtool = config.enableSourceMaps ? 'source-map' : null;

    const BABEL_ENV = `${config.babelEnvPrefix}-${config.env}-${config.target}`;
    const PROJECT_CONFIG = require(resolve(ROOT, 'package.json'));
    const CACHE_HASH = getHashDigest(JSON.stringify(PROJECT_CONFIG), CACHE_HASH_TYPE, CACHE_DIGEST_TYPE, CACHE_DIGEST_LENGTH);
    const PREFIX = chalk.bold(config.target.toUpperCase());
    const CACHE_LOADER_DIRECTORY = resolve(ROOT, `.cache/loader-${CACHE_HASH}-${config.target}-${config.env}`);

    console.log(chalk.underline(`${PREFIX} Configuration:`));
    console.log(`→ Environment: ${config.env}`);
    console.log(`→ Build Target: ${name}`);
    console.log(`→ Babel Environment: ${BABEL_ENV}`);
    console.log(`→ Enable Source Maps: ${devtool}`);
    console.log(`→ Use Cache Loader: ${config.useCacheLoader} [Hash: ${CACHE_HASH}]`);

    config.cacheLoader = config.useCacheLoader ? {
         loader: 'cache-loader',
         options: {
             cacheDirectory: CACHE_LOADER_DIRECTORY
         }
     } : null;

     const cssLoaderOptions = {
         modules: true,
         localIdentName: '[local]-[hash:base62:8]',
         import: false,
         minimize: false,
         sourceMap: config.enableSourceMaps
     };

     const postCSSLoaderRules = {
         loader: 'postcss-loader',
         query: {
             sourceMap: config.enableSourceMaps
         }
     };

     const scripts = buildBabel(config);
     const css = buildCss(config);
     const plugins = buildPlugins(config);
     const webResolve = buildResolve(config);

     return {
         name,
         devtool,
         context: ROOT,
         entry: {
             vendor: ['react', 'react-dom', 'react-redux', 'react-router-dom', 'redux-form', 'redux-observable'],
             app: resolve(ROOT, 'client/Index.jsx'),
 
         },
         output: {
             filename: devBuild ? '[name].js' : '[name].[chunkhash].js',
             chunkFilename: devBuild ? '[name].js' : '[name].[chunkhash].js',
             path: resolve(ROOT, `build/${config.target}`),
             publicPath: '/',
             crossOriginLoading: 'anonymous'
         },
         module: {
             rules: [
                 scripts,
                 css,
             ]
         },
         resolve: webResolve,
         plugins,
     };
}

module.exports = builder;
