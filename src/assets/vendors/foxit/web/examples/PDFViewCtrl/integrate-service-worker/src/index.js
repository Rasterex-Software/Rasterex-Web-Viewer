import * as PDFViewCtrl from '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/PDFViewCtrl.full.js';
import * as license from '../../../license-key.js';

PDFViewCtrl.Log.setLogLevel(PDFViewCtrl.Log.LEVELS.LEVEL_ERROR)

/**
 * @type {import('@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/PDFViewCtrl').PDFViewer}
 */
const pdfViewer = new PDFViewCtrl.PDFViewer({
    libPath: '/lib',
    jr: {
        licenseKey: license.licenseKey,
        licenseSN: license.licenseSN,
        enginePath: './jr-engine/gsdk',
        fontPath: '../external/brotli'
    },
    messageSyncServiceWorker: {
        registration: navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        })
    },
    customs: {
        ScrollWrap: PDFViewCtrl.DivScrollWrap.create(document.getElementById('pdf-viewport'))
    }
});

pdfViewer.init(document.getElementById('pdf-viewer'))

fetch('/docs/FoxitPDFSDKforWeb_DemoGuide.pdf').then(response => {
    return response.blob();
}).then(file => {
    pdfViewer.openPDFByFile(file,{fileName:'FoxitPDFSDKforWeb_DemoGuide.pdf'});
})



document.getElementById('file').onchange = e => {
    const file = e.target.files[0];
    if(!file) {
        return;
    }
    pdfViewer.openPDFByFile(file, {
        fileName: file.name || 'Untitled.pdf'
    })
    e.target.value = '';
}