const path = require("path");

module.exports = {
    entry: {
        'annotator-iframe': './public/src/annotator-iframe.ts',
        'annotator-overrides': './public/src/annotator-overrides.ts'
    },
    output: {
        path: path.resolve(__dirname, "public/dist"),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts"],
    },
    module: {
        rules: [
            {test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/},
        ]
    },
}
