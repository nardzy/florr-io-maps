import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

const is_dev = process.env.AAARG === "dev";

console.info("build", process.env.AAARG);

export default defineConfig({
	devtool: is_dev ? "source-map" : "hidden-nosources-cheap-module-source-map",
	entry: {
		main: "./src/main.ts"
	},
	output: {
		path: `${__dirname}/../static`,
		filename: "client.js",
		publicPath: is_dev ? "/" : "./"
	},
	resolve: {
		extensions: ["...", ".ts"]
	},
	devServer: {
		static: {
			directory: "../static"
		}
	},
	module: {
		rules: [
			{
				test: /\.vert$/,
				type: "asset/source"
			},
			{
				test: /\.frag$/,
				type: "asset/source"
			},
			{
				test: /\.svg$/,
				type: "asset/source"
			},
			{
				test: /\.png$/,
				type: "asset"
			},
			{
				test: /\.tmx$/,
				type: "asset/source"
			},
			{
				test: /\.tmj$/,
				type: "asset/source"
			},
			{
				test: /\.js$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "ecmascript"
								}
							},
							env: { targets }
						}
					}
				]
			},
			{
				test: /\.ts$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript"
								}
							},
							env: { targets }
						}
					}
				]
			}
		]
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			template: "./index.html",
			favicon: "./favicon.ico",
			hash: true
		})
	],
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets }
			})
		]
	},
	experiments: {
		//css: true
	}
});
