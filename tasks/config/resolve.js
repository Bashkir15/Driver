const getRoot = require('app-root-dir').get;

function buildResolve(config) {
    const ROOT = getRoot();
    let alias = {};

    if (config.target === 'prod') {
        alias = Object.assign({}, alias, {
            'react'              : 'preact-compat',
            'react-dom'          : 'preact-compat',
            'react-create-class' : 'preact-compat/lib/react-create-class'
        });
    }

    alias = Object.assign({}, alias, {
        actions    : `${ROOT}/client/redux/actions`,
        components : `${ROOT}/client/components`,
        helpers    : `${ROOT}/client/helpers`,
    });

    return {
        extensions : ['.js', '.jsx', '.css', '.svg'],
        alias,
    };
}

module.exports = buildResolve;
