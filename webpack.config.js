const path = require("path");
const fs = require("fs");
const HTMLPlugin = require("html-webpack-plugin");
const MiniCSSPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const SVGSpritemapPlugin = require("svg-spritemap-webpack-plugin");

let mode = "development";

if (process.env.NODE_ENV === "production") {
	mode = "production";
}

const PAGES_DIR = path.join(__dirname, "./src") + "/pug/_pages/";
const PAGES = fs
	.readdirSync(PAGES_DIR)
	.filter((fileName) => fileName.endsWith(".pug"));

module.exports = {
	mode,
	entry: "./index.js",

	module: {
		rules: [
			{
				test: /\.js?$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env"],
						},
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.(sa|c|sc)ss$/,
				use: [
					MiniCSSPlugin.loader,
					"css-loader",
					{ loader: "postcss-loader" },
					"sass-loader",
				],
				exclude: /node_modules/,
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				generator: {
					filename: "images/[name][ext]",
				},
				type: "asset/resource",
			},
			{
				test: /\.(eot|ttf|otf|woff|woff2)$/i,
				generator: {
					filename: "assets/fonts/[name][ext]",
				},
				type: "asset/resource",
			},
			{
				test: /\.pug$/,
				use: "pug-loader?pretty=true",
			},
		],
	},
	context: path.resolve("src"),
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{ from: "./images/", to: "images" }],
		}),
		new SVGSpritemapPlugin("./src/svg/**/*.svg", {
			output: {
				svg: {
					sizes: false,
				},
				svg4everybody: true,
				filename: "sprite.svg",
			},
			sprite: {
				generate: {
					use: true,
					view: "-fragment",
					symbol: true,
				},
			},
			styles: {
				// Specifiy that we want to use URLs with fragment identifiers in a styles file as well
				format: "fragment",
			},
		}),

		...PAGES.map(
			(page) =>
				new HTMLPlugin({
					template: `${PAGES_DIR}/${page}`,
					minify: false,
					inject: "head",
					scriptLoading: "blocking", // 'blocking'|'defer'|'module'
					filename: `./${page.replace(/\.pug/, ".html")}`,
				})
		),

		new MiniCSSPlugin({
			filename: "css/[name]_[contenthash].css",
		}),
	],
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	optimization: {
		minimize: false,
	},
	output: {
		filename: "js/[name]_[contenthash].js",
		path: path.resolve(__dirname, "dist"),
		// assetModuleFilename: "assets/[name]_[hash][ext][query]",
		assetModuleFilename: "[name][ext]",
		clean: true,
	},
	devtool: mode === "development" ? "source-map" : false,
	devServer: {
		static: path.join(__dirname, "dist"),
		compress: true,
		watchFiles: ["./src/**/*"],
		port: 4000,
	},
};
