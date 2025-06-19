const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const env = process.NODE_ENV;

const distPath = path.resolve(__dirname, 'dist');
const libPath = path.resolve(__dirname, '../../../../lib');

module.exports = {
    mode: env,
    entry: {
        index: ['./index.js']
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: distPath,
        port: 9999,
        hot: true,
        inline: true,
        host: '0.0.0.0',
        disableHostCheck: true,
        clientLogLevel: 'error',
        headers: {
            'Service-Worker-Allowed': '/'
        }
    },
    module: {
        rules: [{
            test: /\.(js|es)$/,
            loader: 'babel-loader',
            exclude: /node_modules|lib/
        }, {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader'],
            exclude: /node_modules/
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve('./index.html')
        }),
        new CopyWebpackPlugin([
            {
                from: libPath,
                to: path.resolve(distPath, 'lib'),
                force: true
            },
            {
                from: path.resolve(__dirname, '../../../../docs/*.pdf'),
                to: path.resolve(distPath, 'docs'),
                force: true,
                toType: 'dir',
                flatten: true,
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
            'UIExtension': path.resolve(libPath, 'UIExtension.full.js')
        }
    },
    output: {
        filename: '[name].js',
        path: distPath
    }
};

if(process.env.NODE_ENV === 'production') {
    delete module.exports.devServer;
}
