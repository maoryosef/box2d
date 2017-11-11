'use strict';

const path = require('path');

const webpackConfig = {
	entry: {
		basic_demo: './src/basicDemo.js',
		domElemets_demo: './src/domElementsDemo.js'
	},
	output: {
		libraryTarget: 'umd',
		path: path.resolve('dist'),
		filename: '[name].bundle.js'
	},
	plugins: [
	],
	resolve: {
		extensions: ['.js', '.jsx']
	},
	devtool: 'source-map'
};

module.exports = webpackConfig;

