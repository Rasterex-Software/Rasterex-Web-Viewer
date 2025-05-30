const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob')
const NODE_ENV = process.env.NODE_ENV;

const distPath = path.resolve(__dirname, 'dist');
const libPath = path.resolve(__dirname, './node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/');

const engineDir = path.resolve(libPath, 'jr-engine');
const engineFiles = glob.sync(engineDir + '/**/*').map(it => it.replace(libPath, '/lib/').replace(/\\+/g, '/'));

module.exports = {
    mode: NODE_ENV,
    entry: {
        index: ['./src/index.js'],
        'service-worker': ['./src/service-worker.js']
    },
    devtool: NODE_ENV === 'development' ? 'inline-source-map' : 'none',
    devServer: {
        contentBase: distPath,
        port: 9899,
        hot: true,
        inline: true,
        host: '0.0.0.0',
        disableHostCheck: true,
        clientLogLevel: 'error'
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
        new webpack.DefinePlugin({
            'process.env': {
                ENGINE_FILES: JSON.stringify(
                    engineFiles
                )
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve('./index.html'),
            chunks: ['index'],
            hideTip: 'hide'
        }),
        new CopyWebpackPlugin([
            {
                from: libPath,
                to: path.resolve(distPath, 'lib'),
                force: true
            },
            {
                from: path.resolve(__dirname, '../../../docs/*.pdf'),
                to: path.resolve(distPath, 'docs'),
                force: true,
                toType: 'dir',
                flatten: true,
            },
            {
                from: path.resolve(__dirname, '../../../external'),
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
        path: distPath,
        globalObject: 'globalThis'
    }
};

if(NODE_ENV === 'production') {
    delete module.exports.devServer;
}
