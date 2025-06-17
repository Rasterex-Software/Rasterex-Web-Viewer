//The following example will guide you how to rewrite the pop-up interaction workflow while Add digital signature

var PDFUI = UIExtension.PDFUI;
var PDFViewer = PDFViewCtrl.PDFViewer;
var Events = PDFViewCtrl.Events;
var $ = UIExtension.vendors.jQuery;

var pdfui = window.pdfui = new PDFUI({
    viewerOptions: {
        libPath: '../../../lib',
        jr: {
            readyWorker: readyWorker,
            licenseSN: licenseSN,
            licenseKey: licenseKey
        }
    },
    customs:{autoDownloadAfterSign:false},
    renderTo: '#pdf-ui',
    addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile ?
        '../../../lib/uix-addons/allInOne.mobile.js' : '../../../lib/uix-addons/allInOne.js'
});

pdfui.addUIEventListener('fullscreenchange', function (isFullscreen) {
    if (isFullscreen) {
        document.body.classList.add('fv__pdfui-fullscreen-mode');
    } else {
        document.body.classList.remove('fv__pdfui-fullscreen-mode');
    }
});

function openLoadingLayer() {
    return pdfui.loading();
}
var loadingComponentPromise = openLoadingLayer();

pdfui.addViewerEventListener(Events.beforeOpenFile, function () {
    if (loadingComponentPromise) {
        loadingComponentPromise = loadingComponentPromise
            .then(function (component) {
                component.close();
            })
            .then(openLoadingLayer);
    } else {
        loadingComponentPromise = openLoadingLayer();
    }
});
pdfui.addViewerEventListener(Events.openFileSuccess, function () {
    loadingComponentPromise.then(function (component) {
        component.close();
    });
});
pdfui.addViewerEventListener(Events.openFileFailed, function () {
    loadingComponentPromise.then(function (component) {
        component.close();
    });
});

pdfui.openPDFByHttpRangeRequest({
    range: {
        url: './Feature-example_digital-signature.pdf',
    }
}, {
    fileName: 'Feature-example_digital-signature.pdf'
})

window.onresize = function () {
    pdfui.redraw().catch(function () { });
}

pdfui.registerSignHandler({
    filter: 'Adobe.PPKLite',
    subfilter: 'adbe.pkcs7.sha1',
    flag: 0x100,
    distinguishName: 'e=foxit@foxitsoftware.cn',
    location: 'FZ',
    reason: 'Test',
    signer: 'web sdk',
    showTime: true,
    sign: (setting, plainContent) => {
        return requestData('post', location.origin+'/signature/digest_and_sign', 'arraybuffer', {
            plain: plainContent
        })
    }
});
pdfui.setVerifyHandler((signatureField, plainBuffer, signedData) => {
    return requestData('post', location.origin+'/signature/verify', 'text', {
        filter: signatureField.getFilter(),
        subfilter: signatureField.getSubfilter(),
        signer: signatureField.getSigner(),
        plainContent: new Blob([plainBuffer]),
        signedData: new Blob([signedData])
    });
});

var hasSelectedType = false;
//Add a handler for the renderFileSuccess event
function renderFileSuccessHandler(pdfDoc){
    pdfDoc.loadPDFForm().then(function (form) {
        var count = form.getFieldCount();
        let task = []
        for (var index = 0; index < count; index++) {
            var field = form.getFieldByIndex(index);
            if (field.getType() === UIExtension.PDFViewCtrl.PDF.form.constant.Field_Type.Sign && !field.isSigned()) {
                task.push(field.getControlByIndex(0).getWidgetAnnot());
            }
        }
        return Promise.all(task).then(widgets=>{
            widgets.forEach(widget=>{
                var field = widget.getField();
                addH5DomInSignField(field);
                if (field.getName() === 'Signature_Landlord') {
                    var rect = widget.getRect()
                    return pdfui.getPDFViewer().then(viewer => {
                        return viewer.goToPage(widget.getPage().getIndex(), rect.top, rect.left)
                        .then(_=>{
                            if(hasSelectedType){return}
                            var ret = prompt(`You can insert the signature name from a URL image, or create one by drawing, typing, or using your local image. You can also preset signing information using code and attach them to the signature name.
                            Try the following actions to insert a name and sign the document: 
                            1.  Insert signature name by URL
                            2.  Create signature name by typing, drawing, or uploading`);
                            if (ret) {
                                hasSelectedType = true
                                switch (Number(ret)) {
                                    case 1:
                                        usePresetPicture()
                                        break;
                                    case 2:
                                        useDrawImage()
                                        break;
                                    default:
                                        break;
                                }
                            }
                        })
                    })
                }
            })
        })
    })
}
pdfui.addViewerEventListener(Events.renderFileSuccess, renderFileSuccessHandler);

// Add H5 Dom 
var template = '<div class="sign-foreground">Sign here</div>'
function addH5DomInSignField(field) {
    var name = field.getName();
    var $signDom = $(document.querySelector('[fieldname="' + name + '"]'));
    $signDom.css({
        "mix-blend-mode": "normal"
    })
    $signDom.prepend(template);
}

// Custom signature process

//Way 1: Use preset picture
function usePresetPicture() {
    pdfui.registerSignatureFlowHandler((signField) => {
        return new Promise(function(resolve, reject) {
            var image = new Image();      
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.getContext('2d').drawImage(image, 0, 0);
                resolve({
                    filter: 'Adobe.PPKLite',
                    subfilter: 'adbe.pkcs7.sha1',
                    flag: 136,
                    image: canvas.toDataURL(),
                    showTime: true,
                    // distinguishName: 'e=foxit@foxitsoftware.cn',
                    // location: 'FZ',
                    // reason: 'Test',
                    // signer: 'web sdk',
                    sign: (signInfo, buffer) => {
                        return requestData('post', location.origin+'/signature/digest_and_sign', 'arraybuffer', { plain: new Blob([buffer]) })
                    }
                });
            }; 
            image.onerror = function() {
                reject(new Error('The input file could not be loaded as an supported image.'));
            };
            image.src = './test.png';
        })
    })
}
//Way 2: Draw Signature
function useDrawImage() {
    pdfui.registerSignatureFlowHandler((signField) => {
        var drawDeferred = createDeferred();
        pdfui.getComponentByName('create-signature').then(function (layerDialog) {
            layerDialog.open(document.body);
            $(layerDialog.element.querySelector(".fv__ui-sign-dialog-save")).hide();
            layerDialog.controller.setOKCallback(pictureBase64 => {
                if (pictureBase64) {
                    drawImgCallback(pictureBase64)
                    layerDialog.controller.setOKCallback();
                }
            });
            function drawImgCallback(image) {
                drawDeferred.resolve({
                    filter: 'Adobe.PPKLite',
                    subfilter: 'adbe.pkcs7.sha1',
                    flag: 136,
                    image,
                    showTime: true,
                    // distinguishName: 'e=foxit@foxitsoftware.cn',
                    // location: 'FZ',
                    // reason: 'Test',
                    // signer: 'web sdk',
                    sign: (signInfo, buffer) => {
                        return requestData('post', location.origin+'/signature/digest_and_sign', 'arraybuffer', { plain: new Blob([buffer]) })
                    }
                })
            }
        });
        return drawDeferred.promise
    })
}

var requestData = (type, url, responseType, body) => {
    return new Promise((res, rej) => {
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
        xmlHttp.onload = e => {
            var status = xmlHttp.status;
            if ((status >= 200 && status < 300) || status === 304) {
                res(xmlHttp.response);
            }
        };
        xmlHttp.send(body ? formData : null);
    });
};
function createDeferred() {
    var deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}