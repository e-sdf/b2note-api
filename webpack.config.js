const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        "annotator-iframe.js": "./public/src/annotator-iframe.ts",
        "annotator-overrides.js": "./public/src/annotator-overrides.ts",
    },
    output: {
        path: path.resolve(__dirname, "public/dist"),
        filename: "[name]"
    },
    resolve: {
        extensions: [".ts"],
    },
    module: {
        rules: [
            {test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/},
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./public/src/main.css", to: ""}
            ]
        })
    ]
};
