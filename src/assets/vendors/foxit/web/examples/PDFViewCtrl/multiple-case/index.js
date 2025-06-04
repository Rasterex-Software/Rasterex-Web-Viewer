var PDFViewer = PDFViewCtrl.PDFViewer;
function createPDFViewer(containerId, open, openOptions) {
    var pdfViewer = new PDFViewer({
        libPath: '../../../lib',
        jr: {
            licenseSN: licenseSN,
            licenseKey: licenseKey,
        },
        customs: {
            ScrollWrap: PDFViewCtrl.CustomScrollWrap
        }
    });
    (new PDFViewCtrl_EditGraphicsAddonModule.EditGraphicsAddon(pdfViewer)).init();
    (new PDFViewCtrl_CreateAnnotAddonModule.CreateAnnotAddon(pdfViewer)).init();

    var eContainer = document.getElementById(containerId);
    var eSelectPDFFile = eContainer.querySelector('[name=select-pdf-file]');
    var eFileName = eContainer.querySelector('.fv__viewer-file-name');
    var eRenderTo = eContainer.querySelector('.pdf-viewer');

    pdfViewer.init(eRenderTo);

    eSelectPDFFile.onchange = function(e) {
        if (!this.value) {
            return;
        }
        var pdf,fdf;
        for (var i = e.target.files.length; i--;) {
            var file = e.target.files[i];
            var filename = file.name;
            if (/\.pdf$/i.test(filename)) {
                pdf = file
                eFileName.textContent = filename;
            } else if (/\.(x)?fdf$/i.test(filename)) {
                fdf = file
            }
        }
        pdfViewer.openPDFByFile(pdf, {password: '', fdf: {file: fdf}});
        this.value = '';
    }


    pdfViewer.openPDFByHttpRangeRequest(open, openOptions);
    return pdfViewer;
}

createPDFViewer('pdf-app-0', {
        range: {
            url: "../../assets/1-feature-example_default-setup.pdf",
        },
    },
    { fileName: "1-feature-example_default-setup.pdf" }
)
createPDFViewer('pdf-app-1', {
        range: {
            url: "../../assets/PDFViewer_Multiple_Instances.pdf",
        },
    },
    { fileName: "PDFViewer_Multiple_Instances.pdf" }
)