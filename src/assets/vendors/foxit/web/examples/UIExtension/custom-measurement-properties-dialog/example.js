const { PDFViewCtrl: { storage: { StorageFeature }, ViewerEvents, constants: { STATE_HANDLER_NAMES } }, SeniorComponentFactory, modular } = UIExtension;

async function example() {

    class CustomMeasurementPropertiesDialog extends SeniorComponentFactory.createSuperClass({
        template: `
        <layer @draggable backdrop modal @var.layer="$component" class="center cus--measurement-format-dialog" @on.shown="layer.getComponentByName('edit-properties').setHost({}, 7)">
            <layer-header title="Measurement"></layer-header>
            <layer-view name="measurement-format-container" @stop-drag>
                <edit-properties:edit-properties name="edit-properties"></edit-properties:edit-properties>
                <div style="padding: 20px 0px 20px 20px;">
                    <checkbox @model="layer.applyToAll" @on.change="layer.updateStrategy()" text="Apply scale to all pages in this document"></checkbox>
                </div>
            </layer-view>
            <layer-footer class="footer">
                <xbutton class="fv__ui-dialog-ok-button" style="float: right;" @on.click="layer.hide()">OK</xbutton>
            </layer-footer>
        </layer>
        `
    }) {
        static getName() {
            return 'custom-measurement-dialog'
        }
        applyToAll = true;
        prelink() {
            super.prelink();
            this.applyToAll = storageDriver.getMeasurementStorageStrategy() === 'app';
            this.digest();
        }
        async updateStrategy() {
            const pdfViewer = await this.getPDFUI().getPDFViewer();
            
            const strategy = this.applyToAll ? 'app' : 'page';
            const context = {
                id: await this.getPDFUI().getInstanceId(),
                feature: StorageFeature.MEASUREMENT,
                pdfViewer: pdfViewer
            };
            storageDriver.updateMeasurementStorageStrategy(strategy, context);
            await updateMeasurementInfo(pdfViewer);
        }
        async getContext() {
            const pdfViewer = await this.getPDFUI().getPDFViewer();
            return {
                id: await this.getPDFUI().getInstanceId(),
                feature: PDFViewCtrl.storage.StorageFeature.MEASUREMENT,
                pdfViewer: pdfViewer
            };
        }
        async showAtPage(pageIndex) {
            const pdfViewer = await this.getPDFUI().getPDFViewer();
            storageDriver.setCurrentPageIndex(pageIndex);
            await updateMeasurementInfo(pdfViewer);
            this.show();
        }
    }
    modular.root().registerComponent(CustomMeasurementPropertiesDialog);

    class ShowMeasurementPropertiesContextMenu extends SeniorComponentFactory.createSuperClass({
        template: `
            <contextmenu-item @on.click="$component.showDialog()">Show Measurement Properties</contextmenu-item>
        `
    }) {
        static getName() {
            return 'show-measurement-properties-contextmenu-item';
        }
        async showDialog() {
            const rightClickPage = this.parent.getCurrentTarget();
            this.getRoot().querySelector('@custom-measurement-dialog').showAtPage(rightClickPage.getIndex());
        }
    }
    modular.root().registerComponent(ShowMeasurementPropertiesContextMenu);

    const root = await pdfui.getRootComponent();

    const showDialogMenu = root.querySelector('@page-contextmenu').append('<show-measurement-properties-contextmenu-item visible="false"></show-measurement-properties-contextmenu-item>')

    const measurementPropertiesDialog = root.append(`<custom-measurement-dialog></custom-measurement-dialog>`);

    const rightSidebarPanel = root.querySelector('@sidebar-right');
    
    pdfui.addViewerEventListener(ViewerEvents.switchStateHandler, CurrentStateHandler => {
        switch(CurrentStateHandler.getStateName()) {
            case STATE_HANDLER_NAMES.STATE_HANDLER_CREATE_DISTANCE:
            case STATE_HANDLER_NAMES.STATE_HANDLER_CREATE_PERIMETER:
            case STATE_HANDLER_NAMES.STATE_HANDLER_CREATE_AREA:
            case STATE_HANDLER_NAMES.STATE_HANDLER_CREATE_CIRCLE_AREA:
                rightSidebarPanel.addCSSClass('fv__ui-force-hide');
                pdfui.getPDFDocRender().then(docRender => {
                    if(!docRender) {
                        return;
                    }
                    measurementPropertiesDialog.showAtPage(docRender.getCurrentPageIndex());
                })
                showDialogMenu.show();
                break;
            case STATE_HANDLER_NAMES.STATE_HANDLER_HAND:
                rightSidebarPanel.addCSSClass('fv__ui-force-hide');
                measurementPropertiesDialog.hide();
                showDialogMenu.hide();
                break;
            default:
                rightSidebarPanel.removeCSSClass('fv__ui-force-hide');
                measurementPropertiesDialog.hide();
                showDialogMenu.hide();
                return;
        }
    })
    async function updateMeasurementInfo(pdfViewer) {
        const context = {
            id: pdfViewer.getInstanceId(),
            pdfViewer,
            feature: StorageFeature.MEASUREMENT
        }
        storageDriver.forceEmitChangeEvent(context, 'measurement-info');
    }
}

example();
