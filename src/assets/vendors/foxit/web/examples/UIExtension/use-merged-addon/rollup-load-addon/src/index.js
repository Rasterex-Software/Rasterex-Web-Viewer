import '../../../../../lib/UIExtension.full';
import '../../../../../examples/license-key';
import {default as UIEAddons} from  '../dist/merged-addons';

var PDFViewCtrl = UIExtension.PDFViewCtrl;

PDFViewCtrl.Log.setLogLevel(PDFViewCtrl.Log.LEVELS.LEVEL_ERROR)

const pdfui = new UIExtension.PDFUI({
    viewerOptions: {
        libPath: '/lib',
        jr: {
            licenseKey, licenseSN, // exported as global variable from license-key.js
            enginePath: './jr-engine/gsdk',
            fontPath: '../external/brotli'
        }
    },
    renderTo: '#pdf-ui',
    addons: UIEAddons
});

pdfui.openPDFByHttpRangeRequest({
    range:{
        url:'/docs/FoxitPDFSDKforWeb_DemoGuide.pdf',
    }
},{fileName:'FoxitPDFSDKforWeb_DemoGuide.pdf'});
