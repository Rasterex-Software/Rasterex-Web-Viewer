var PDFUI = UIExtension.PDFUI;
var Events = UIExtension.PDFViewCtrl.Events;
var MEASUREMENT_STORAGE_STRATEGY_FEATURE_NAME = 'measurement-storage-strategy'


var storageDriver = new LocalStorageDriver();

var pdfui = new PDFUI({
    viewerOptions: {
        libPath: '../../../lib',
        jr: {
            readyWorker: readyWorker
        },
        customs: {
            storageDriver: storageDriver
        }
    },
    renderTo: '#pdf-ui',
    appearance: UIExtension.appearances.adaptive,
    fragments: [],
    addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile ?
    '../../../lib/uix-addons/allInOne.mobile.js':
    '../../../lib/uix-addons/allInOne.js'
});

pdfui.addUIEventListener('fullscreenchange', function (isFullscreen) {
    if (isFullscreen) {
        document.body.classList.add('fv__pdfui-fullscreen-mode');
    } else {
        document.body.classList.remove('fv__pdfui-fullscreen-mode');
    }
});

function openLoadingLayer() {
    // return pdfui.getRootComponent()
    // .then(function(root) {
    //     return root.getComponentByName('pdf-viewer')
    // }) .then(function(viewerComponent) {
    //     return pdfui.loading(viewerComponent.element);
    // });
    return pdfui.loading();
}
var loadingComponentPromise;
var openFileError = null
var passwordErrorCode = PDFViewCtrl.PDF.constant.Error_Code.password
function startLoading() {
    if(openFileError&&openFileError.error===passwordErrorCode)return
    if (loadingComponentPromise) {
        loadingComponentPromise = loadingComponentPromise
            .then(function (component) {
                component.close();
            })
            .then(openLoadingLayer);
    } else {
        loadingComponentPromise = openLoadingLayer();
    }
}
pdfui.addViewerEventListener(Events.beforeOpenFile, startLoading);
pdfui.addViewerEventListener(Events.openFileSuccess, function () {
    openFileError = null
    loadingComponentPromise.then(function (component) {
        component.close();
    });
});
pdfui.addViewerEventListener(Events.openFileFailed, function (data) {
    openFileError = data
    if(openFileError&&openFileError.error===passwordErrorCode)return
    loadingComponentPromise.then(function (component) {
        component.close();
    });
});

var queryParaPairs = location.search.slice(1).split('&');
var queryParameters = queryParaPairs.reduce(function(map, pair) {
    var kv = pair.split('=');
    map[kv[0]] = decodeURIComponent(kv[1] || '');
    return map;
}, {});

if(queryParameters.file) {
    var reg = /^.+?\/([^\/]+?)(#[^\?#]*)?(\?.*)*$/;
    var result = reg.exec(queryParameters.file);
    var fileName = result? result[1] : document.title + '.pdf';
    pdfui.openPDFByHttpRangeRequest({
        range: {
            url: queryParameters.file,
        }
    }, { fileName: fileName })
} else if (!('file' in queryParameters)) {
    pdfui.openPDFByHttpRangeRequest({
        range: {
            url: '../../../docs/FoxitPDFSDKforWeb_DemoGuide.pdf',
        }
    }, { fileName: 'FoxitPDFSDKforWeb_DemoGuide.pdf' })
}



//signature handlers
var requestData = function(type, url, responseType, body){
    return new Promise(function(res, rej){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open(type, url);

        xmlHttp.responseType = responseType || 'arraybuffer';
        var formData = new FormData();
        if (body) {
            for (var key in body) {
                if (body[key] instanceof Blob) {
                    formData.append(key, body[key], key);
                } else {
                    formData.append(key, body[key]);
                }
            }
        }
        xmlHttp.onloadend = function(e) {
            var status = xmlHttp.status;
            if ((status >= 200 && status < 300) || status === 304) {
                res(xmlHttp.response);
            }else{
                rej(new Error('Sign server is not available.'));
            }
        };
        
        xmlHttp.send(body ? formData : null);
    });
};

pdfui.setVerifyHandler(function (signatureField, plainBuffer, signedData){
    return requestData('post', location.origin+'/signature/verify', 'text', {
        filter: signatureField.getFilter(),
        subfilter: signatureField.getSubfilter(),
        signer: signatureField.getSigner(),
        plainContent: new Blob([plainBuffer]),
        signedData: new Blob([signedData])
    });
});
pdfui.registerSignHandler({
    filter: 'Adobe.PPKLite',
    subfilter: 'adbe.pkcs7.sha1',
    flag: 0x100,
    distinguishName: 'e=support@foxitsoftware.cn',
    location: 'FZ',
    reason: 'Test',
    signer: 'web sdk',
    showTime: true,
    sign: function(setting, plainContent) {
        return requestData('post', location.origin+'/signature/digest_and_sign', 'arraybuffer', {
            plain: plainContent
        })
    }
});
// Prevent iPhone from Auto Zoom in Input text fields.
window.onload = function () {
    if(!UIExtension.PDFViewCtrl.DeviceInfo.isIPHONE)return
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
    var now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
    }, false);
};