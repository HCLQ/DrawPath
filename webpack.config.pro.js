const path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),//处理html模版
    CleanWebpackPlugin = require('clean-webpack-plugin'),//清理旧文件
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin');
const config = {
    entry: {
        DrawPath: path.join(__dirname, "./src/DrawPath.js")
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/'),
        chunkFilename: '[name]-[chunkhash].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(scss|css)$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader", 'sass-loader', "postcss-loader"]
                })
            },
            {
                test: /\.html$/,
                use: [
                    'raw-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),//清理旧文件
        new ExtractTextPlugin("[name]-[hash].css"),
        new CopyWebpackPlugin([
            { from: __dirname + '/test/test.js', to: __dirname + '/dist/' },
            { from: __dirname + '/test/index.html', to: __dirname + '/dist/' }
        ], {
                copyUnmodified: true
            })
    ],
    resolve: {
        alias: {
            ['$U']: path.resolve(__dirname, 'src/util')
        }
    }
};
module.exports = config;