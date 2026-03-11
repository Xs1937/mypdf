const merge = require("webpack-merge");
const common = require("./webpack.base");
const path = require("path");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: "../dist", // 告诉服务器从哪个目录中提供内容
        port: "8003",
        hot: true
    },
    output: {
        filename: "js/[name].[hash].js", // 每次保存 hash都更改
        path: path.resolve(__dirname, "../dist"),
        publicPath: "/"
    },
    module: {}
});
