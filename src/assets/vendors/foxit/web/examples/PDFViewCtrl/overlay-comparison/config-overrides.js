const CopyWebpackPlugin = require('copy-webpack-plugin');

const {
    override,
    addWebpackPlugin,
    addWebpackExternals,
    removeModuleScopePlugin,
    overrideDevServer
} = require('customize-cra');
const path = require("path");
const fs = require('fs');
const os = require('os');

const libPath = path.resolve(__dirname, './node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib');
const fontPath = path.resolve(__dirname, '../../../external');

module.exports = {
    webpack: override(
        removeModuleScopePlugin(),
        process.env.NODE_ENV === 'development' ?
        addWebpackPlugin(
            new CopyWebpackPlugin({
                options: {
                    concurrency: os.cpus().length
                },
                patterns: [{
                    from: libPath,
                    to: 'foxit-lib',
                    filter: filepath => {
                        if(/UIExtension|uix-addons|PDFViewCtrl\.(vendor|polyfills|js)/.test(filepath)) {
                            return false;
                        }
                        return true;
                    },
                    force: true
                }].concat( fs.existsSync(fontPath) ? {
                    from: fontPath,
                    to: 'external',
                    force: true
                } : [])
            })
        ): null,
        addWebpackExternals(
            {
                PDFViewCtrl: 'PDFViewCtrl'
            }
        )
    ),
    devServer: overrideDevServer(config => {
        return {
            ...config,
            headers: {
                'Service-Worker-Allowed': '/'
            }
        };
    })
}
