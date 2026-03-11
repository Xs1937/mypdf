// 存放dev和prod的通用配置
const webpack = require("webpack");
const path = require("path");

const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HappyPack = require("happypack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/main.js",
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                    "less-loader"
                ],
            },
            {
                test: /\.(png|svg|gif|jpg)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 100000,
                            fallback: {
                                loader: "file-loader",
                                options: {
                                    publicPath: "/"
                                }
                            }
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                // use: [
                //     "happypack/loader?id=happyBabel", // 把对.js 的文件处理交给id为happyBabel 的HappyPack 的实例执行
                //     {
                //         loader: "babel-loader",
                //         options: {
                //             presets: ['@babel/preset-env'] // 根据目标浏览器自动转换为相应es5代码
                //         }
                //     }
                // ],
                loader: "happypack/loader?id=happyBabel", // //把对.js 的文件处理交给id为happyBabel 的HappyPack 的实例执行
                exclude: /node_modules/
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)\w*/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 100000
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.HashedModuleIdsPlugin(), // 解决vender后面的hash每次都改变的问题
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../index.html") // __dirname 当前文件夹的路径
        }),
        new HappyPack({
            id: "happyBabel",
            loaders: [{
                loader: "babel-loader?cacheDirectory=true"
            }]
        }),
        new CopyWebpackPlugin([  // 将不需要构建的资源文件拷贝到打包后dist目录
            {
                from: path.resolve(__dirname, "../src/assets/images"),
                to: path.resolve(__dirname, "../dist/assets/images")
            }
        ])
    ],
    resolve: {
        extensions: [".js", ".vue"], // 按顺序解析，能够使用户在引入模块时不带扩展
        alias: {
            "@": path.resolve(__dirname, "../src"),
            "@comp": path.resolve(__dirname, "../src/components"),
            "@common": path.resolve(__dirname, "../src/common")
        }
    }
};
