const nodeExternals = require("webpack-node-externals");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const  CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require("path");

const buildConfig = () => {
    const libraryName = "digest-auth-request-ts";
    const directory = __dirname;
    const outputFile = "index.min.js";
    let plugins = [new CleanWebpackPlugin()];

    return {
        target: 'node',
        entry: directory + "/src/index.ts",
        devtool: "source-map",
        output: {
            path: directory + "/dist",
            filename: outputFile,
            library: libraryName,
            libraryTarget: "umd",
            umdNamedDefine: true
        },
        module: {
            rules: [
                {
                    test: /(\.tsx|\.ts)$/,
                    loader: "ts-loader"
                }
            ]
        },
        resolve: {
            modules: [path.resolve("./node_modules"), path.resolve("./src")],
            extensions: [".json", ".js", ".jsx", ".ts", ".tsx"]
        },
        optimization: {
            minimizer: [new UglifyJsPlugin()],
        },
        externals: [nodeExternals()],
        plugins: plugins
    };
}

module.exports = buildConfig();