import * as UIExtension from 'UIExtension';
import license from'../../../license-key.js';

import predefinedAddon from './addons';
import addonSample from './addonExample/addon.info.json'
predefinedAddon.push(addonSample);

PDFViewCtrl.Log.setLogLevel(PDFViewCtrl.Log.LEVELS.LEVEL_ERROR);

var pdfui = window.pdfui = new UIExtension.PDFUI({
    viewerOptions: {
        libPath: '/lib',
        jr: {
            licenseKey: license.licenseKey,
            licenseSN: license.licenseSN,
            enginePath: './jr-engine/gsdk',
            fontPath: '../external/brotli'
        }
    },
    renderTo: '#pdf-ui',
    addons:predefinedAddon
});
pdfui.openPDFByHttpRangeRequest({ 
    range:{
        url:'/docs/FoxitPDFSDKforWeb_DemoGuide.pdf',
    }
},{fileName:'FoxitPDFSDKforWeb_DemoGuide.pdf'});
