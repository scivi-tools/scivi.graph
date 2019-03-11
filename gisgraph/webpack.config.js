const path = require('path');

module.exports = (env, args) => {
    const is_rel_env = args.mode === "production";

    return {
        context: __dirname,
        devtool: is_rel_env ? undefined : "inline-source-map",
        entry: "./src/index.ts",
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
            path: __dirname + "/../demo/gisgraph/lib",
            filename: "SciViGISGraph.[name].js",
            library: ["SciViGISGraph", "[name]"]
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpg)$/,
                    loader: 'url-loader'
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        stats: {
            excludeModules: false,
            maxModules: 100
        }
    }
}
