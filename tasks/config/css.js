function buildCss(config) {
    return {
        test: /\.css$/,
        use: [
            config.cacheLoader,
            {
                loader: 'style-loader'
            },
            {
                loader: 'css-loader'
            },
            {
                loader: 'postcss-loader'
            },
        ]
    };
}

module.exports = buildCss;
