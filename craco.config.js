const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig, { paths }) => {
            webpackConfig.entry = path.resolve(__dirname, 'src/app/index.jsx');
            paths.appIndexJs = path.resolve(__dirname, 'src/app/index.jsx');
            webpackConfig.resolve.extensions = [
                ...webpackConfig.resolve.extensions,
                '.jsx',
                'js',
            ];

            return webpackConfig;
        },
        alias: {
            '@': path.resolve(__dirname, 'src/'),
            '@feature/*': path.resolve(__dirname, 'src/feature/*'),
            '@lib/*': path.resolve(__dirname, 'src/lib/*'),
            '@shared/*': path.resolve(__dirname, 'src/shared/*'),
            '@page/*': path.resolve(__dirname, 'src/page/*'),
            '@asset/*': path.resolve(__dirname, 'src/asset/*'),
        },
    },
};
