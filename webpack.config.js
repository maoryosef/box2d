'use strict'
const path = require('path');

const webpackConfig = {
    entry: './src/index.js',
    output: {
        libraryTarget: 'umd',
        path: path.resolve('dist'),
        filename: 'bundle.js'
    },
    plugins: [
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devtool: 'source-map'
}

module.exports = webpackConfig

