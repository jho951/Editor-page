const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig, { paths }) => {
            webpackConfig.entry = path.resolve(__dirname, 'src/app/index.jsx');
            paths.appIndexJs = path.resolve(__dirname, 'src/app/index.jsx');
            webpackConfig.resolve.extensions = [
                ...webpackConfig.resolve.extensions,
                '.jsx',
                '.js',
            ];

            return webpackConfig;
        },
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
    },
};
