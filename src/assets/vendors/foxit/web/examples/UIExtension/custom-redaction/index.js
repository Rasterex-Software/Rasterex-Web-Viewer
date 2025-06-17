var Hammer = UIExtension.vendors.Hammer;
var $ = UIExtension.vendors.jQuery;
var PDFUI = UIExtension.PDFUI;
var Events = UIExtension.PDFViewCtrl.Events;
var myModule = UIExtension.modular.module("customRedaction", []);
var DebouncePromiseQueue = PDFViewCtrl.shared.DebouncePromiseQueue;

function CustomCreateRedactionTextStateHandler(pdfViewer) {
    this.pdfViewer = pdfViewer;
    this.cursorStyle = "fv__cursor-highlight";
}

CustomCreateRedactionTextStateHandler.getStateName = function() {
    return "custom-create-redaction-text-state";
};

_inherits(CustomCreateRedactionTextStateHandler, UIExtension.TextMarkupStateHandler);

CustomCreateRedactionTextStateHandler.prototype.addAnnot = function(page, rectArray) {
    var that = this;
    $('[component-for]').remove();
    return page.markRedactAnnot(rectArray).catch(function (err) {
        if (err.error === -6) {
            that.pdfViewer.viewerUI.alert("dialog.error.noRedactionLicense");
            return Promise.reject(err);
        }
    });
};

CustomCreateRedactionTextStateHandler.prototype.afterAddAnnot = function(component) {
    this.pdfViewer.eventEmitter.emit("markRedactAnnotSuccess", component.annot);
    var deviceRectList = component.annot.getRects().map(function(rect) {
        return component.annot.getPage().getDeviceRect(rect, component.scale, component.rotate);
    });
    var $redact = _appendRedactionSelectMark(component.id, this.pageRender.$annotsContainer, deviceRectList);

    var pdfUI = this.pdfViewer.viewerUI;
    $(`.apply[component-for=${component.id}]`, $redact).on('click', function (e) {
        if ($(this).hasClass('disabled')) return;
        _apply(pdfUI, component, $redact);
    });

    $(`.delete[component-for=${component.id}]`, $redact).on('click', function (e) {
        _delete(component, $redact);
    });

    var that = this;

    _changeApplyStatus(this);

    this.pdfViewer.eventEmitter.on('open-file-success', function () {
        _changeApplyStatus(that);
    });
    this.pdfViewer.eventEmitter.on('permission-changed', function () {
        _changeApplyStatus(that);
    });

    this.pdfViewer.eventEmitter.on(Events.fitWidthResizeViewport, function () {
        _update(component, $redact);
    });

    this.pdfViewer.eventEmitter.on(Events.zoomToSuccess,function () {
        _update(component, $redact);
    });

    this.pdfViewer.eventEmitter.on(Events.annotationRemoved, function (annots) {
        _removeReactionSelectMark(annots);
    });
    component.addDestroyHook(
        function () {
            $(`.apply[component-for=${component.id}]`, $redact).off('click');
            $(`.delete[component-for=${component.id}]`, $redact).off('click');
            that.pdfViewer.eventEmitter.off(Events.fitWidthResizeViewport, function () {
                _update(component, $redact);
            });
            that.pdfViewer.eventEmitter.off(Events.zoomToSuccess, function () {
                _update(component, $redact);
            });
            that.pdfViewer.eventEmitter.off(Events.annotationRemoved, function (annots) {
                _removeReactionSelectMark(annots);
            });
        }
    );

    var computePosition = function (rect) {
        var $optionList = $('.fv__option-areaSquare', $redact);
        var $redaction = $('.fv__redaction-areaSquare', $redact);
        $optionList.each(function (index, option) {
            $(option).css({
                top: `${Math.round(rect.top - 30)}px`,
                left: `${Math.round(rect.left + rect.width - 60 / (index + 1))}px`
            });
        });
        $redaction.css({
            top: `${Math.round(rect.top)}px`,
            left: `${Math.round(rect.left)}px`,
            width: `${Math.round(rect.width)}px`,
            height: `${Math.round(rect.height)}px`
        });
    };

    _extendsMethod(component, 'onShapeUpdating',  computePosition);
    _extendsMethod(component, 'onShapeMoving',  computePosition);
};

var CustomRedactionTextController = PDFViewCtrl.shared.createClass({
    stateOut: function() {
        var classList = this.component.parent.element.classList;
        var that = this;
        this.getPDFUI().getStateHandlerManager().then(function(stateHandleManager) {
            if (stateHandleManager.getCurrentStates().getStateName() !== "custom-create-redaction-state") {
                classList.remove("selected");
                $(`[component-for]`).remove();
            }
        });
    },
    handle: function() {
        this.component.parent.element.classList.add("selected");
        this.getPDFUI().getStateHandlerManager().then(function(stateHandleManager) {
            stateHandleManager.switchTo("custom-create-redaction-text-state");
        });
    }
}, UIExtension.StatefulController.ext(CustomCreateRedactionTextStateHandler, "CustomRedactionTextController"));

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _removeReactionSelectMark(annots) {
    annots.forEach(annot => {
        if (annot.getType() === 'redact')
            $(`[component-for=${annot.id}]`).remove();
    });
}

function _appendRedactionSelectMark(id, $target, rectArray) {
    var $fragment = $(document.createDocumentFragment());

    var rect = rectArray[0];
    var $iconElOK = $('<i class="fv__apply-tool-icon fv__icon-screenshot-ok">');
    var $optionElOK = $(`<div class="fv__option-areaSquare apply">`);
    $optionElOK.css({
        top: `${Math.round(rect.top-30)}px`,
        left: `${Math.round(rect.right-60)}px`,
        width: `30px`,
        height: `30px`,
        'z-index': '33'
    });
    $optionElOK.attr('component-for', id);
    $optionElOK.append($iconElOK);
    $fragment.append($optionElOK);

    var $iconElDel = $('<i class="fv__apply-tool-icon fv__icon-screenshot-cancel">');
    var $optionElDel = $(`<div class="fv__option-areaSquare delete">`);
    $optionElDel.css({
        top: `${Math.round(rect.top-30)}px`,
        left: `${Math.round(rect.right-30)}px`,
        width: `30px`,
        height: `30px`,
        'z-index': '33'
    });
    $optionElDel.attr('component-for', id);
    $optionElDel.append($iconElDel);
    $fragment.append($optionElDel);

    for (var i = 0; i < rectArray.length; i++) {
        rect = rectArray[i];
        var $redactionEl = $('<div class="fv__redaction-areaSquare">');
        $redactionEl.css({
            top: `${Math.round(rect.top)}px`,
            left: `${Math.round(rect.left)}px`,
            width: `${Math.round(rect.right - rect.left)}px`,
            height: `${Math.round(rect.bottom - rect.top)}px`,
        });
        $redactionEl.attr('component-for', id);
        $fragment.append($redactionEl);
    }
    $target.append($fragment);
    return $target;
}

function _extendsMethod (instance, methodName, method) {
    var origin = instance.constructor.prototype[methodName];
    var overrideMethod = function () {
        origin.call(instance, ...arguments);
        method(...arguments);
    };
    instance.constructor.prototype[methodName] = overrideMethod;
}

function _apply(pdfUI, component) {

    pdfUI.confirm('redaction:dialog.apply_alert').then(function () {
        component.annot.apply();
    }).catch(function () {
        _delete(component);
    });
}

function _delete(component) {
    component.removeAnnot();
}

function _changeApplyStatus(instance) {
    var permission = instance.pdfViewer.getPDFDocRender().getUserPermission().getValue();
    if (permission & 8) {
        $('.fv__option-areaSquare.apply').removeClass('disabled');
    } else {
        $('.fv__option-areaSquare.apply').addClass('disabled');
    }
}

function _update(component) {
    var $target = $(`[component-for=${component.id}]`);
    if (!component.annot) return;
    var rect = component.annot.getRect();
    var deviceRect = component.annot.getPage().getDeviceRect(rect, component.scale, component.rotate);
    $target.filter('.apply').css({
        top: `${deviceRect.top - 30}px`,
        left: `${deviceRect.right - 60}px`,
    });
    $target.filter('.delete').css({
        top: `${deviceRect.top - 30}px`,
        left: `${deviceRect.right - 30}px`,
    });
    $target.filter('.fv__redaction-areaSquare').css({
        top: `${deviceRect.top}px`,
        left: `${deviceRect.left}px`,
        width: `${deviceRect.right - deviceRect.left}px`,
        height: `${deviceRect.bottom - deviceRect.top}px`
    });
}

myModule.registerController(CustomRedactionTextController);

var fragments = [{
    target: 'create-page-redaction',
    action: 'after',
    template: '<dropdown-button class="fv__ui-redaction-item" name="create-text-redaction" @controller="customRedaction:CustomRedactionTextController" icon-class="fv__icon-toolbar-text-redaction" tabindex="0">Custom Mark Text</dropdown-button>'
}];

var pdfui = new PDFUI({
    viewerOptions: {
        libPath: "../../../lib",
        jr: {
            readyWorker: readyWorker
        }
    },
    renderTo: "#pdf-ui",
    appearance: UIExtension.appearances.adaptive,
    fragments,
    addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile ?
        "../../../lib/uix-addons/allInOne.mobile.js" :
        "../../../lib/uix-addons/allInOne.js"
});

pdfui.addUIEventListener("fullscreenchange", function(isFullscreen) {
    if (isFullscreen) {
        document.body.classList.add("fv__pdfui-fullscreen-mode");
    } else {
        document.body.classList.remove("fv__pdfui-fullscreen-mode");
    }
});

function openLoadingLayer() {
    return pdfui.loading();
}

var loadingComponentPromise = openLoadingLayer();

function startLoading() {
    if (loadingComponentPromise) {
        loadingComponentPromise = loadingComponentPromise
            .then(function(component) {
                component.close();
            })
            .then(openLoadingLayer);
    } else {
        loadingComponentPromise = openLoadingLayer();
    }
}

pdfui.addViewerEventListener(Events.beforeOpenFile, startLoading);
pdfui.addViewerEventListener(Events.openFileSuccess, function() {
    loadingComponentPromise.then(function(component) {
        component.close();
    });
});
pdfui.addViewerEventListener(Events.openFileFailed, function() {
    loadingComponentPromise.then(function(component) {
        component.close();
    });
});

pdfui.openPDFByHttpRangeRequest({
    range: {
        url: "../../../docs/FoxitPDFSDKforWeb_DemoGuide.pdf"
    }
}, {
    fileName: "FoxitPDFSDKforWeb_DemoGuide.pdf"
});

window.onresize = function() {
    pdfui.redraw().catch(function() {
    });
};