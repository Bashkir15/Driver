// Use a more modern approach of hashing than "webpack-md5-hash". Somehow
// the SHA256 ("webpack-sha-hash") does not work all the time.
// It will occassionally produce different hashes for the same content
// hurting our caching strategies. This is basically a replacement of md5 with
// the loader-utils implementation which also supports shorter, generated
// hashes based on base62 encoding instead of hex
const WebpackDigestHash = require('../plugins/ChunkHash');
const ChunkNames = require('../plugins/ChunkNames');

const StatsPlugin = require('stats-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const BabiliPlugin = require('babili-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer');
const WriteFilePlugin = require('write-file-webpack-plugin');
const CaseSensitivePathsPlugins = require('case-sensitive-paths-webpack-plugin');
const VerboseProgress = require('../plugins/VerboseProgress');
const webpack = require('webpack');

function buildPlugins(config) {
    const pluginOptions = config.plugins;
    const plugins = [];

    if (config.target !== 'test') {
        plugins.push(new CaseSensitivePathsPlugins());
        plugins.push(new VerboseProgress({
            prefix: config.prefix
        }));
        plugins.push(new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './client/index.html',
        }));
        plugins.push(new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js',
            minChunks: Infinity,
        }));
    }
    if (config.target === 'dev') {
        plugins.push(new WriteFilePlugin());
        plugins.push(new webpack.NamedModulesPlugin());
        plugins.push(new webpack.NoEmitOnErrorsPlugin());
    }

    if (config.target === 'prod') {
        // SRI is a security feature that enabled browsers to verify that the files
        // that they fetch are delivered without unexpected manipulation
        // https://www.npmjs.com/package/webpack-subresource-integrity
        plugins.push(new SriPlugin({
            hashFuncNames : ['sha256', 'sha512'],
            enabled       : true
        }));

        plugins.push(new BundleAnalyzerPlugin.BundleAnalyzerPlugin({
            analyzerMode   : 'static',
            defaultSize    : 'gzip',
            logLevel       : 'silent',
            openAnalyzer   : true,
            reportFilename : 'report.html'
        }));

        // We use this so that our generated chunkhashs are only different if
        // the content for our respective chunks have changed. This optimizes our
        // long term browser caching strategy for the client bundle, avoiding
        // cases where browsers end up having to download all the client chunks
        // event though only 1 or 2 may have changed
        plugins.push(new WebpackDigestHash());

        // Tracks client side assets, but will be invaluable if we ever
        // take the universal approach to allow our server-renderer to
        // be aware of these assets
        plugins.push(new StatsPlugin('stats.json'));
        plugins.push(new BabiliPlugin({}, {
            comments : false,
        }));

        // Generate IDs that can preserve over builds
        // https://github.com/webpack/webpack.js.org/issues/652#issuecomment-273324529
        plugins.push(new webpack.HashedModuleIdsPlugin());
        plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    }

    return plugins;
}

module.exports = buildPlugins;
