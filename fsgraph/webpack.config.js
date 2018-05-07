const path = require('path');
const webpack = require('webpack');

module.exports = (env, args) => {
    const is_rel_env = args.mode === "production";

    return {
        context: __dirname,
        devtool: is_rel_env ? "source-map" : "inline-source-map",
        entry: "./tmp/main.js",
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor",
                        chunks: "initial",
                        enforce: true
                    }
                }
            }
        },
        output: {
            path: __dirname + "/dist",
            filename: "SciViFSGraph.[name].js",
            library: ["SciViFSGraph", "[name]"],
            libraryTarget: "umd"
        },
        // resolve: {
        //     extensions: [ '.js' ]
        // },
        stats: {
            excludeModules: false,
            maxModules: 100
        }
    }
}