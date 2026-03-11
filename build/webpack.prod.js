const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.base");

const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // 解决每次重新打包，dist 文件夹文件未清除
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 分离CSS插件
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: "js/[name].[hash].js",
        path: path.resolve(__dirname, "../dist"),
        publicPath: "/"
    },
    module: {
        // rules: [
        //     {
        //         test: /\.less$/,
        //         use: [
        //             {
        //                 loader: MiniCssExtractPlugin.loader,
        //                 options: {
        //                     publicPath: "./css/"
        //                 }
        //             },
        //             "css-loader",
        //             "postcss-loader",
        //             "less-loader",
        //         ]
        //     }
        // ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/[name].[hash].css",
            chunkFilename: "css/[id].[hash].css"
        })
    ],
    optimization: {
        splitChunks: { // 分离不常变化的文件，如 node_modules 下引用的库
            chunks: "all",
            cacheGroups: {
                vendor: {
                    name: "vendor",
                    test: /[\\/]node_modules[\\/]/,
                    priority: 10,
                    chunks: "initial" // 只打包初始时依赖的第三方
                }
            }
        },
        minimizer: [ // 压缩 js
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        warnings: false, // 去除警告
                        drop_debugger: true, // 去除debugger
                        drop_console: true // 去除console.log
                    },
                },
                cache: true, // 开启缓存
                parallel: true, // 平行压缩(并发打包)
                sourceMap: false // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin() // 压缩css
        ]
    }
});
