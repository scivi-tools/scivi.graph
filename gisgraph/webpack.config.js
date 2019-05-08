const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

/** @type {webpackDevServer.Configuration} */
const devServerConfig = {
    contentBase: path.join(__dirname, '..', 'demo'),
    overlay: true,
    watchContentBase: true,
    writeToDisk: true
};

/**
 * @param {string} env 
 * @param {Object.<string, string>} args 
 * @returns {webpack.Configuration}
 */
function WebpackConfig(env, args) {
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
                    exclude: /node_modules(?![\\/]@scivi)/,
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
            extensions: ['.ts', '.js'],
            symlinks: false
        },
        stats: {
            excludeModules: false,
            maxModules: 100
        },
        devServer: devServerConfig
    }
}

module.exports = WebpackConfig;
