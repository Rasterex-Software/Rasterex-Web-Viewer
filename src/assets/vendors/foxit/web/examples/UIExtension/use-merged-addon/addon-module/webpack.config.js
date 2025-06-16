const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const env = process.NODE_ENV;

const distPath = path.resolve(__dirname, 'dist');
const libPath = path.resolve(__dirname, '../../../../lib');
const addonsPath= path.resolve(libPath, 'uix-addons');

module.exports = {
    mode: env,
    entry: {
        index: './src/index.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: distPath,
        port: 9991,
        hot: true,
        inline: true,
        host: '127.0.0.1',
        disableHostCheck: true,
        clientLogLevel: 'error'
    },
    module: {
        rules: [{
            test: /\.(js|es)$/,
            loader: 'babel-loader',
            exclude: /node_modules|lib|dist/
        }, {
            test: /addon\.info\.json$/,
            include: [ addonsPath ],
            use: [{
                loader: 'babel-loader',
                options: {
                    "presets": ["@babel/env"]
                }
            }, '@foxitsoftware/addon-loader'],
            type: 'javascript/auto'
        }, {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader'],
            exclude: /node_modules/
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve('./src/index.html')
        }),
        new CopyWebpackPlugin([
            {
                from: libPath,
                to: path.resolve(distPath, 'lib'),
                ignore: ['{UIExtension,PDFViewCtrl}*.js'],
                force: true
            },
            {
                from: path.resolve(__dirname, '../../../../docs'),
                to: path.resolve(distPath, 'docs'),
                force: true,
                toType: 'dir'
            },
            {
                from: path.resolve(__dirname, '../../../../external'),
                to: path.resolve(distPath, 'external'),
                force: true
            }
        ]),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        alias: {
            "@lib": libPath,
            "@addons": addonsPath, 
            "UIExtension": path.resolve(libPath, 'UIExtension.full.js')
        }
    },
    externals: ['PDFViewCtrl'],
    output: {
        filename: '[name].js',
        path: distPath
    }
};