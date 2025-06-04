var CreateSquigglyOnSelectedTextController = PDFViewCtrl.shared.createClass({
    handle: function() {
        var tooltipLayer = this.component.getClosestComponentByType('tooltip-layer');
        var textSelectionTool = tooltipLayer.getCurrentSelectionTool();
        var _this = this;
        textSelectionTool.getSelectionInfo().then(function(selectionInfo) {
            _this.createTextMarkupAnnot(textSelectionTool.pageRender, selectionInfo, 'squiggly').then(function() {
                tooltipLayer.hide(); // Hides the tooltip after the annotation has been created.
            });
        });
    },
    // Create textmarkup annotation instance according to these types: underline, strikeout, highlight, caret, squiggly
    createTextMarkupAnnot: function(pageRender, selectionInfo, type) {
        var _this = this;
        return pageRender.getPDFPage().then(function(page) {
            return page
                .addAnnot({
                    type: type,
                    rect: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    },
                    coords: selectionInfo.rectArray
                })
                .then(function(annots) {
                    const annot = annots[0];
                    return _this.getPDFUI().getPDFViewer().then(function(pdfViewer) {
                        pdfViewer.eventEmitter.emit(
                            PDFViewCtrl.ViewerEvents.addAnnotSuccess,
                            annot
                        );
                        pageRender.annotsRender.activeAnnot(annot.getId());
                    });
                });
        });
    }
}, UIExtension.Controller, {
    getName: function() {
        return 'CreateSquigglyOnSelectedTextController';
    }
});