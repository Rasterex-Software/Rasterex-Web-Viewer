import * as UIExtension from 'UIExtension';
import "./style.css"
const {
    jQuery,
    i18next,
    i18nextChainedBackend,
    i18nextLocalStorageBackend,
    i18nextXHRBackend,
    dialogPolyfill,
    Hammer,
    EventEmitter,
} = UIExtension.vendors;


function getClientX(e) {
    if('clientX' in e) {
        return e.clientX;
    } else {
        switch(e.type) {
            case 'touchstart':
            case 'touchmove':
                return e.touches[0].clientX;
            case 'touchend':
            case 'touchcancel':
                return e.changedTouches[0].clientX;
        }
    }
}
function getClientY(e) {
    if('clientY' in e) {
        return e.clientY;
    } else {
        switch(e.type) {
            case 'touchstart':
            case 'touchmove':
                return e.touches[0].clientY;
            case 'touchend':
            case 'touchcancel':
                return e.changedTouches[0].clientY;
        }
    }
}

const getDevicePagePoint = (elem, event) => {
    let pageRect = elem.getBoundingClientRect();
    let srcEvent = event.srcEvent;
    const clientX = getClientX(srcEvent);
    const clientY = getClientY(srcEvent);
    return [
        clientX - pageRect.left - event.deltaX,
        clientY - pageRect.top - event.deltaY,
    ];
};

    //Gets device rectangle
    function getDeviceRect(startPoints, endPoints) {
        let left = startPoints[0];
        let top = startPoints[1];
        let right = endPoints[0];
        let bottom = endPoints[1];
        let temp;
        if (right < left) {
            temp = left;
            left = right;
            right = temp;
        }
        if (bottom < top) {
            temp = top;
            top = bottom;
            bottom = temp;
        }
        return {left: left, top: top, right: right, bottom: bottom};
    }

export default class AddTextFieldStateHandler extends UIExtension.PDFViewCtrl.stateHandler.IStateHandler{
    static getStateName () {
        return 'Add-text-field.';
    }
    /**
     * 
     * @param {UIExtension.PDFViewCtrl} pdfViewer 
     */
    constructor (pdfViewer) {
        super(pdfViewer);
        this.$handler = jQuery('<div class="addon-move-handler"><div>');
    }
    destroyPageHandler(){
        this.hammer && this.hammer.destroy ();
    }
    /**
     * 
     * @param {UIExtension.PDFViewCtrl.renderers.PDFPageRender} pageRender 
     */
    pageHandler(pageRender){
        let doc = pageRender.getPDFDoc();

        let handlerDom = pageRender.getHandlerDOM();

        let hammer = (this.hammer = new Hammer.Manager (handlerDom, {
            recognizers: [[Hammer.Pan, {direction: Hammer.DIRECTION_ALL}]],
          }));

          jQuery(handlerDom).append(this.$handler);
        let startPoint;
        hammer.on ('panstart', e=> {
            this.$handler.show();
            //  point in device coordinates.
            startPoint = getDevicePagePoint(handlerDom,e);
            this.$handler.css({
                left:startPoint[0],
                top:startPoint[1]
            })
        });

        hammer.on('panmove',e=>{
            let endPoint = [startPoint[0] + e.deltaX, startPoint[1] + e.deltaY];
            let rect = getDeviceRect(startPoint,endPoint)
            this.$handler.css({
                left:rect.left,
                top:rect.top,
                width:rect.right-rect.left,
                height:rect.bottom-rect.top
            })
        })
        hammer.on('panend',e=>{
            this.$handler.hide();
            let endPoint = [startPoint[0] + e.deltaX, startPoint[1] + e.deltaY];
            let deviceRect = getDeviceRect(startPoint,endPoint);
            if(deviceRect.right-deviceRect.left<5)return;
            if(deviceRect.bottom-deviceRect.top<5)return;
            pageRender.getPDFPage().then(page=>{
                //  point in pdf coordinates.
                let rect = page.reverseDeviceRect(deviceRect,pageRender.getScale());
                let form = doc.getPDFForm();
                  
                form.addControl(page.getIndex(),"newTextField",UIExtension.PDFViewCtrl.PDF.form.constant.Field_Type.Text,
                rect).then(success=>{
                    if(success){
                        //to do
                    }
                });
            });
        })
    }
}