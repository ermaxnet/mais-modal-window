var path = require("path");

module.exports = {
    entry: {
        example: "./assets/src/example.js",
        window: "./assets/src/window.js"
    },
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "/assets/build"),
        publicPath: "/assets/build"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["syntax-async-generators"]
                    }
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [ "style-loader", "css-loader" ]
            },
            {
                test: /\.tmp$/,
                loader: "html-es6-template-loader"
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "./"),
        compress: true,
        port: 9000,
        inline: true
    }
};