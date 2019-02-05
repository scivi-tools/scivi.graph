const path = require('path');

module.exports = (env, args) => {
    const is_rel_env = args.mode === "production";

    return {
        context: __dirname,
        devtool: is_rel_env ? "source-map" : "inline-source-map",
        entry: "./src/index.js",
        optimization: {
            splitChunks: {
                cacheGroups: {
                    common: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor",
                        chunks: "initial"
                    }
                },
            }
        },
        output: {
            path: __dirname + "/../demo/fsgraph/lib",
            filename: "SciViFSGraph.[name].js",
            library: ["SciViFSGraph", "[name]"]
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader'
                }
            ]
        },
        resolve: {
            extensions: [ '.js' ]
        },
        stats: {
            excludeModules: false,
            maxModules: 100
        }
    }
}