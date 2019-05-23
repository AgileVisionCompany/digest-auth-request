const nodeExternals = require("webpack-node-externals");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const  CleanWebpackPlugin = require('clean-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack');
const path = require("path");
const env = require("yargs").argv.env; // use --env with webpack 2

const buildConfig = () => {
    const libraryName = "digest-auth-request-ts";
    const directory = __dirname;
    const outputFile = "index.min.js";
    let plugins = [new CleanWebpackPlugin()];
    if (env === "build") {
        plugins.push(new DtsBundleWebpack({
            name: libraryName,
            main: "./dist/index.d.ts",
            out: "./index.d.ts",
            removeSource: false,
            outputAsModuleFolder: true
        }));
    }

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