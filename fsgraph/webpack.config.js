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
            path: __dirname + "/../demo/fsgraph/lib",
            filename: "SciViFSGraph.[name].js",
            library: ["SciViFSGraph", "[name]"]
        },
        module: {
            rules: [
                {
                    test: /\.(ts|js)$/,
                    exclude: /node_modules(?![\\/]@scivi)/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                attrs: {
                                    'title': 'webpack-compiled'
                                },
                                singleton: true
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true
                            }
                        }
                    ],
                },
            ]
        },
        resolve: {
            extensions: [ '.js', '.ts' ],
            symlinks: false
        },
        stats: {
            excludeModules: false,
            maxModules: 100
        }
    }
}