/**
  *   OPTIONS && DEFAULTS   *

    babel = {
        comments    : false,
        compact     : true,
        debug       : false,
        looseMode   : true,
        minified    : false,
        sourceMaps  : ''
        specMode    : false,
        taget       : 'web',
        useBuiltIns : true
    }

    plugins = {},

    config = {
        babel            : ^^,
        babelEnvPrefix   : 'nd',
        enableSourceMaps : true,
        env              : process.env.NODE_ENV,
        plugins          : ^^,
        target           : 'web'
        cacheLoader      : ''
        useCacheLoader   : true,
    }
  *
**/

const babel = {
    comments    : false,
    compact     : true,
    debug       : false,
    looseMode   : true,
    minified    : false,
    specMood    : false,
    sourceMaps  : true,
    target      : 'web',
    useBuiltIns : true
};

const plugins = {};

const config = {
    babel,
    babelEnvPrefix   : 'nd',
    enableSourceMaps : true,
    env              : process.env.NODE_ENV,
    plugins,
    target           : 'web',
    testGlob         : 'test/app/unbuilt/**/*.js',
    useCacheLoader   : true,
};

module.exports = config;
