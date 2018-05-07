var path = require('path');

module.exports = (env, args) => {
    var is_rel_env = args.mode === "production";

    return {
        context: __dirname,
        devtool: is_rel_env ? "source-map" : "inline-source-map",
        entry: "./tmp/main.js",
        output: {
            path: __dirname + "/dist",
            filename: "bundle.js",
            library: 'SciViFSGraph',

            libraryTarget: "amd"
        },
        // resolve: {
        //     extensions: [ '.js' ]
        // },
        externals: {
            jquery: 'jQuery',
            'jquery-ui/ui/core': {
                commonjs: 'jquery-ui/ui/core',
                root: "$"
            },
            'jquery-ui/ui/widgets/button': {
                commonjs: 'jquery-ui/ui/widgets/button',
                // root: "$"
            }
        },
        stats: {
            maxModules: 100
        }
    }
}