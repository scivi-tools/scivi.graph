var path = require('path');

module.exports = {
    context: __dirname,
    devtool: "source-map",
    entry: "./tmp/main.js",
    output: {
      path: __dirname + "/dist",
      filename: "bundle.js",
      library: 'SciViFSGraph'
    },
    resolve: {
        extensions: [ '.js' ]
    }
}