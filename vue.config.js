const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");

module.exports = defineConfig({
	transpileDependencies: true,
	configureWebpack: {
		devServer: {
			headers: { "Access-Control-Allow-Origin": "*" },
			// https: true,
		},

		resolve: {
			fallback: {
				crypto: require.resolve("crypto-browserify"),
				stream: require.resolve("stream-browserify"),
				buffer: require.resolve("buffer"),
			},
		},
		plugins: [
			new webpack.ProvidePlugin({
				Buffer: ["buffer", "Buffer"],
			}),
		],
	},
});
