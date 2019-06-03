#!/bin/bash

TSC="./node_modules/.bin/tsc"
BROWSERIFY="./node_modules/.bin/browserify"
UGLIFY="./node_modules/.bin/uglifyjs"

mkdir -p ./build
mkdir -p ../demo/cgraph/lib/

# build core
$TSC
echo "module.exports = SciViCGraph;" >> ./build/scivi-cgraph.js
if [ $1 == "debug" ]; then
    $BROWSERIFY ./src/wrapper/cgraph.js --standalone CGraph -o ../demo/cgraph/lib/scivi-cgraph.min.js
elif [ $1 == "embed" ]; then
    $BROWSERIFY ./src/wrapper/cgraph-es.js --standalone CGraph -o ../demo/cgraph/lib/scivi-cgraph.min.js
else
    $BROWSERIFY ./src/wrapper/cgraph.js --standalone CGraph -o ./build/scivi-cgraph-tmp.js
    $UGLIFY ./build/scivi-cgraph-tmp.js -o ../demo/cgraph/lib/scivi-cgraph.min.js
fi

# build filters
$BROWSERIFY ./filters/louvain/src/louvain.js --standalone Louvain -o ./build/louvain-tmp.js
$UGLIFY ./build/louvain-tmp.js -o ../demo/cgraph/lib/louvain.min.js

# build controls
$UGLIFY ./controls/treeview/hummingbird-treeview.js -o ../demo/cgraph/lib/hummingbird-treeview.min.js
