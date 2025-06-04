//The following example will guide you how to add and register a StateHandler class of the rectangular measurement tool, so to implement the logic for creating a rectangular measurement tool.

var PDFUI = UIExtension.PDFUI;
var PDFViewer = PDFViewCtrl.PDFViewer;
var IStateHandler = PDFViewCtrl.IStateHandler;
var Events = PDFViewCtrl.Events;
var $ = UIExtension.vendors.jQuery;
var shared = PDFViewCtrl.shared;
var getUnitByName = shared.getUnitByName,
    keyboardStatus = shared.keyboardStatus;
var ViewerEvents = PDFViewCtrl.ViewerEvents;
var addAnnotSuccess = ViewerEvents.addAnnotSuccess,
    distanceAnnotCreationStart = ViewerEvents.distanceAnnotCreationStart,
    updateDistanceAnnot = ViewerEvents.updateDistanceAnnot,
    distanceAnnotCreationEnd = ViewerEvents.distanceAnnotCreationEnd;

const FIELD_USER_SPACE_UNIT = 'userSpaceUnit';
const FIELD_USER_SPACE_SCALE = 'userSpaceScaleValue';
const FIELD_REAL_UNIT = 'realUnit';
const FIELD_REAL_SCALE = 'realScaleValue';
const Annot_Unit_Type = PDFViewCtrl.PDF.annots.constant.Annot_Unit_Type;
const CreateDistanceStart = 'createDistanceStart'
const UpdateDistance = 'updateDistance'
const CreateDistanceEnd = 'createDistanceEnd'
let pageMeasureRatio = null;
let isStartPointInVpRect = true;
// Choose whether to use custom pop
const isCustomMeasurementPopup = true

//Create a StateHandler of the rectangular measurement tool
var SquareMeasurementStateHandler = function (pdfViewer) {
    this.pdfViewer = pdfViewer
    this.cursorStyle = "fv__cursor-crosshair";
};
SquareMeasurementStateHandler.getStateName = function () {
    return 'create-square-measurement';
};
_inherits(SquareMeasurementStateHandler, IStateHandler);

SquareMeasurementStateHandler.prototype.createAnnotJson = function (json) {
    const measurementInfo = this.pdfViewer.store.getCurrentValue('measurementInfo');

    // Set the Intent property to 'customDimension'.
    json.intent = 'CustomDimension';
    json.enableCaption = true;
    json.measure = {
        unit: measurementInfo.realUnit.name,
        ratio: {
            userSpaceValue: measurementInfo[FIELD_USER_SPACE_SCALE],
            userSpaceUnit: measurementInfo[FIELD_USER_SPACE_UNIT].name,
            realValue: measurementInfo[FIELD_REAL_SCALE],
            realUnit: measurementInfo[FIELD_REAL_UNIT].name
        }
    };
    return json;
}

SquareMeasurementStateHandler.prototype.pageHandler = function (pageRender) {
    const eventEmitter = this.pdfViewer.eventEmitter


    var Hammer = UIExtension.vendors.Hammer;
    this.pageRender = pageRender;
    var $handler = pageRender.$handler;
    $handler.addClass(this.cursorStyle);
    let eHandler = $handler[0];
    let hammer = this.hammer = new Hammer.Manager(eHandler, {
        recognizers: [
            [Hammer.Pan, {
                direction: Hammer.DIRECTION_ALL
            }]
        ]
    });

    const annotation = {
        lastPoint: {
            x: 0,
            y: 0
        },
        annotationInfo: {
            type: 'square',
            vertexes: [],
        },
        pdfRect: {},
        isCustomType: true,
        getVertexes: function () {
            return this.annotationInfo.vertexes;
        },
        getLastPoint: function () {
            return this.lastPoint;
        },
    };

    let startPoint;
    let that = this
    let isCanceled = false;
    $(document).keyup(function (event) {
        switch (event.keyCode) {
            case 27:
                isCanceled = true
                removeSelectMark($handler)
                break
        }
    });

    hammer.on('panstart', function (e) {
        isCanceled = false
        let point = getDevicePagePoint(eHandler, e);
        startPoint = [point.x, point.y];
        isCanceled = false
        let defaultAnnotConfig = {
            borderInfo: {
                width: 2,
                style: PDFViewCtrl.PDF.constant.Border_Style.solid
            },
            color: 0xFF0000,
            opacity: 1,
            flags: 4,
            date: new Date()
        };

        // Gets the default annotation configuration defined externally
        const getDefaultAnnotConfig = that.pdfViewer.getDefaultAnnotConfig();
        if (typeof getDefaultAnnotConfig === 'function') {
            const _defaultAnnotConfig = getDefaultAnnotConfig(annotation.annotationInfo.type);
            if (_defaultAnnotConfig) {
                Object.assign(defaultAnnotConfig, _defaultAnnotConfig);
            }
        }
        annotation.annotationInfo = that.createAnnotJson(Object.assign(defaultAnnotConfig, annotation.annotationInfo));
        var rect = {
            left: startPoint[0],
            top: startPoint[1],
            right: startPoint[0] + 10,
            bottom: startPoint[1] + 10
        }
        return pageRender.getPDFPage().then(function (page) {
            annotation.page = page;
            var annotRect = annotation.pdfRect = annotation.annotationInfo.rect = page.reverseDeviceRect(rect, pageRender.scale, pageRender.rotate);
            annotation.annotationInfo.vertexes = getVertexes(annotRect, page, pageRender)
            removeSelectMark($handler);
            page.getMeasureScaleRatio().then(res=>{
                pageMeasureRatio = res
            });
            // Triggered when starting to create a measurement tool
            eventEmitter.emit(CreateDistanceStart, annotation);
            eventEmitter.emit(distanceAnnotCreationStart, annotation);
        })
    });
    hammer.on("panmove", function (e) {
        if (isCanceled) {
            return;
        }
        let endPoint = adjustPoint(e);
        let rect = getRect(startPoint, endPoint);
        return pageRender.getPDFPage().then(function (page) {
            annotation.page = page;
            var annotRect = annotation.pdfRect = annotation.annotationInfo.rect = page.reverseDeviceRect(rect, pageRender.scale, pageRender.rotate);
            annotation.annotationInfo.vertexes = getVertexes(annotRect, page, pageRender)
            appendSelectMark($handler, rect);
            // Trigger update when creating the measurement tool
            eventEmitter.emit(UpdateDistance, annotation);
            eventEmitter.emit(updateDistanceAnnot, annotation);
        })
    });
    hammer.on('panend', function (e) {
        if (isCanceled) {
            return;
        }
        let endPoint = adjustPoint(e);
        let rect = getRect(startPoint, endPoint);
        //Get the pdf page through pageRender
        return pageRender.getPDFPage().then(function (page) {
            annotation.page = page;
            var annotRect = annotation.pdfRect = annotation.annotationInfo.rect = page.reverseDeviceRect(rect, pageRender.scale, pageRender.rotate);
            eventEmitter.emit(CreateDistanceEnd, annotation);
            eventEmitter.emit(distanceAnnotCreationEnd, annotation);
            //Transform PDF page device rectangle to PDF page rectangle
            annotation.annotationInfo.vertexes = getVertexes(annotRect, page, pageRender)
            page.addAnnot(annotation.annotationInfo).then(function (annots) {
                const annot = annots[0];
                // Set the content property
                const measurementData = that.pdfViewer.getStore().getCurrentValue('measurementData');
                var area = measurementData.area,
                    displayUnit = measurementData.displayUnit;
                annot.setContent(parseFloat(area).toFixed(2) + ' sq ' + displayUnit.name)
                const component = pageRender.annotsRender.getAnnotRender(annot.getId()).component;
                removeSelectMark($handler);
                eventEmitter.emit(addAnnotSuccess, annot);
                that.pdfViewer.activateElement(component)
            })
        })
    });

    function adjustPoint(e) {
        let deltaX = e.deltaX,
            deltaY = e.deltaY
        if (keyboardStatus.isShift) {
            deltaX = Math.min(deltaX, deltaY)
            deltaY = Math.min(deltaX, deltaY)
        }
        return [startPoint[0] + deltaX, startPoint[1] + deltaY]
    }
}
SquareMeasurementStateHandler.prototype.destroyPageHandler = function () {
    this.pageRender.$handler.removeClass(this.cursorStyle);
    this.hammer && this.hammer.destroy();
    this.offCancelEvent && this.offCancelEvent()
}
SquareMeasurementStateHandler.prototype.out = function () {
    this.destroyPageHandler();
};


var customModule = UIExtension.modular.module('custom', [])

var SquareMeasurementController = PDFViewCtrl.shared.createClass({
    mounted: function () {
        this.rulerContainer = this.getComponentByName('pdf-viewer-container-with-ruler');
        this.popup = this.component.getRoot().querySelector(isCustomMeasurementPopup ? '@custom:measurement-popup' : '@distance:measurement-popup');
    },
    stateIn: function () {
        if (this.rulerContainer) {
            this.rulerContainer.active();
        }
        pdfui.getComponentByName('sidebar-right').then((rightPanel) => {
            rightPanel.show();
        })   
        pdfui.getComponentByName('sidebar-right-tabs').then((tabs) => {
            tabs.openTab('edit-properties-panel');
            tabs.setActivetab('edit-properties-panel');
            return pdfui.getComponentByName('edit-properties').then((component) => {
                return component.setHost({}, 7);
            })
        })
        var that = this
        setTimeout(function () {
            if (that.popup) {
                that.popup.resetUIFor(that.ExpectedStateHandlerClass);
                if (!isCustomMeasurementPopup) {
                    const $element = $(that.popup.element)
                    that.popup.getComponentByName('measurement.popup.title').setTitle('Area Measurement');
                    $element.removeClass(
                        'fv__ui-measurement-popup-distance',
                        'fv__ui-measurement-popup-perimeter'
                    ).addClass('fv__ui-measurement-popup-area');
                    that.digest()
                }
                that.popup.show();
            }
        })
        this.component.parent.select(this.component);
        this.component.parent.element.classList.add('selected');
    },
    stateOut: function () {
        if (this.rulerContainer) {
            this.rulerContainer.deactive();
        }
        if (this.popup) {
            this.popup.hide();
        }
        this.component.parent.element.classList.remove('selected');
    }
}, UIExtension.StatefulController.ext(SquareMeasurementStateHandler, 'SquareMeasurementController'));

const CustomMeasurementPopupSuperclass = UIExtension.SeniorComponentFactory.createSuperClass({
    template: document.getElementById('custom-measurement-popup-template').innerHTML
});
// Create custom measurement panel component
var customMeasurementPopup = PDFViewCtrl.shared.createClass({
    postlink: function () {
        CustomMeasurementPopupSuperclass.prototype.postlink.call(this);
        const domArr = ['userSpaceUnit', 'realUnit', 'userSpaceScale', 'realScale', 'angleValue', 'distanceValue', 'deltaXValue', 'deltaYValue', 'scaleValue', 'perimeterValue', 'areaValue', 'embeddedRatio']
        for (let index = 0; index < domArr.length; index++) {
            const ele = domArr[index];
            this['$' + ele] = $(this.element).find('[name=' + ele + ']')
        }
        // Ratio units in user space only support "inch, pt, cm, mm, pica" types.
        const customUnitType = ['inch', 'pt', 'cm', 'mm', 'pica']
        var FROM_UNITS = [],
            DEST_UNITS = []
        for (let index = 0; index < customUnitType.length; index++) {
            const unit = customUnitType[index];
            FROM_UNITS.push(getUnitByName(unit))
        }
        const unitType = Object.values(Annot_Unit_Type)
        for (let index = 0; index < unitType.length; index++) {
            const unit = unitType[index];
            DEST_UNITS.push(getUnitByName(unit))
        }
        for (let index = 0; index < FROM_UNITS.length; index++) {
            const unit = FROM_UNITS[index];
            const eOption = $('<option value=' + unit.name + '>' + unit.name + '</option>');
            this.$userSpaceUnit.append(eOption);
        }
        for (let index = 0; index < DEST_UNITS.length; index++) {
            const unit = DEST_UNITS[index];
            const eOption = $('<option value=' + unit.name + '>' + unit.name + '</option>');
            this.$realUnit.append(eOption);
        }
    },
    mounted: function () {
        CustomMeasurementPopupSuperclass.prototype.mounted.call(this);
        let previousUserSpaceUnit;
        let that = this
        this.$userSpaceUnit.change(function () {
            previousUserSpaceUnit = that.getUserSpaceUnit();
        })
        this.$userSpaceUnit.change(function () {
            that.trigger('change', {
                field: FIELD_USER_SPACE_UNIT,
                previous: previousUserSpaceUnit,
                current: that.getUserSpaceUnit()
            });
        });
        this.$userSpaceScale.bind('input propertychange', function(){
            var val = that.$userSpaceScale.val();
            that.trigger('change', {
                field: FIELD_USER_SPACE_SCALE,
                previous: previousUserSpaceUnit,
                current: val
            });
        })
        this.$realScale.bind('input propertychange', function(){
            var val = that.$realScale.val();
            that.trigger('change', {
                field: FIELD_REAL_SCALE,
                current: val
            });
        })
        let previousRealUnit;
        this.$realUnit.focus(function () {
            previousRealUnit = that.getRealUnit();
        })
        this.$realUnit.change(function () {
            that.trigger('change', {
                field: FIELD_REAL_UNIT,
                previous: previousRealUnit,
                current: that.getRealUnit()
            });
        });
        this.$embeddedRatio.parent().hide();
    },
    // Switch different measurement tools and update UI
    resetUIFor: function (state) {
        this.element.classList.remove(
            'fv__ui-measurement-popup-distance',
            'fv__ui-measurement-popup-perimeter',
            'fv__ui-measurement-popup-area'
        );
        let title;
        switch (state.getStateName()) {
            case 'createPerimeter':
                this.element.classList.add('fv__ui-measurement-popup-perimeter');
                title = 'Perimeter Measurement';
                break;
            case 'createDistance':
                this.element.classList.add('fv__ui-measurement-popup-distance');
                title = 'Distance Measurement';
                break;
            case 'createCircleArea':
            case 'createArea':
            case 'create-square-measurement':
                this.element.classList.add('fv__ui-measurement-popup-area');
                title = 'Area Measurement';
                break;
        }
        let layerHeader = this.getComponentByName('measurement.popup.title');
        layerHeader.setTitle(title);
    },
    setUserSpaceScale: function (scale) {
        this._validateScale(scale);
        this.$userSpaceScale.val(scale);
    },
    getUserSpaceScale: function () {
        return this.$userSpaceScale.val();
    },
    getUserSpaceUnit: function () {
        return getUnitByName(this.$userSpaceUnit.val());
    },
    setUserSpaceUnit: function (unit) {
        if (unit.name) {
            unit = unit.name;
        }
        this.$userSpaceUnit.val(unit);
    },
    setRealScale: function (scale) {
        this._validateScale(scale);
        this.$realScale.val(scale);
    },
    getRealScale: function () {
        return this.$realScale.val();
    },
    getRealUnit: function () {
        return getUnitByName(this.$realUnit.val());
    },
    setRealUnit: function (unit) {
        if (unit.name) {
            unit = unit.name;
        }
        this.$realUnit.val(unit);
    },
    // Update measurement panel UI
    updateMeasurementInfo: function (measureInfo) {
        const displayUnitName = measureInfo.displayUnit.name;
        this.$distanceValue.html(calculateDisplayData(measureInfo.distance));
        this.$deltaXValue.html(calculateDisplayData(measureInfo.deltaX));
        this.$deltaYValue.html(calculateDisplayData(measureInfo.deltaY));
        this.$angleValue.html(measureInfo.angle + '°');
        this.$perimeterValue.html(measureInfo.perimeter ? calculateDisplayData(measureInfo.perimeter) : '');
        this.$areaValue.html(measureInfo.area ? calculateDisplayData(measureInfo.area, ' sq ') : '');
        
        if(measureInfo.scale){
            this.$scaleValue.html(measureInfo.scale);
            this.$scaleValue.parent().show();
            this.$embeddedRatio.parent().hide();
        }
        if(measureInfo.embeddedScale){
            this.$scaleValue.parent().hide();
            this.$embeddedRatio.html(pageMeasureRatio.ratio).parent().show();
        }

        function calculateDisplayData(number, str) {
            str = str || ' ';
            return Math.round(number * 100) / 100 + str + displayUnitName
        }
    },
    _validateScale: function (scale) {
        if (scale < 0 && typeof scale == 'number') {
            throw new Error('Illegal argument: scale value must be greater then 0');
        }
    }
}, CustomMeasurementPopupSuperclass, {
    // statics
    getName: function () {
        return 'measurement-popup';
    }
})

// Create custom measurement panel Controller
var CustomMeasurementPopupController = PDFViewCtrl.shared.createClass({
    prelink: function () {
        let that = this
        this.getPDFUI().getStore().then(function (store) {
            that.store = store;
        })
        this.task = Promise.resolve();
    },
    mounted: function () {
        let measurementInfo = {
            'userSpaceScaleValue': 1,
            'realScaleValue': 1,
            'userSpaceUnit': getUnitByName('inch'),
            'realUnit': getUnitByName('inch')
        };
        let that = this
        const dispatchMeasurementInfo = function () {
            that.store.dispatch('measurementInfo', Object.assign({}, measurementInfo));
        };
        const updateDistanceMeasurementInfo = function (component) {
            let measurementInfo = that.store.getCurrentValue('measurementInfo')
            let userSpaceScale = measurementInfo[FIELD_USER_SPACE_SCALE];
            let userSpaceUnit = measurementInfo[FIELD_USER_SPACE_UNIT];
            let realScale = measurementInfo[FIELD_REAL_SCALE];
            let realUnit = measurementInfo[FIELD_REAL_UNIT];
            let scale = userSpaceScale + ' ' + userSpaceUnit.name + ' = ' + realScale + ' ' + realUnit.name;
            let displayUnit = realUnit;
            if(pageMeasureRatio && pageMeasureRatio.scale && isStartPointInVpRect){
                const {scale, ratioMap, unitName} = pageMeasureRatio
                if(scale && ratioMap.length){
                    measurementInfo = {
                        [FIELD_USER_SPACE_SCALE]: ratioMap[0].value,
                        [FIELD_REAL_SCALE]: ratioMap[1].value,
                        [FIELD_USER_SPACE_UNIT]: getUnitByName(ratioMap[0].unit),
                        [FIELD_REAL_UNIT]: getUnitByName(ratioMap[1].unit),
                    };
                    userSpaceUnit = getUnitByName(ratioMap[0].unit)
                    realUnit = getUnitByName(ratioMap[1].unit)
                }else{
                    measurementInfo = null
                }
                displayUnit = {name:unitName}
            }

            let startPoint, endPoint, perimeter, area, angle = 0;

            let pdfRect = component.pdfRect;
            let left = pdfRect.left,
                right = pdfRect.right,
                top = pdfRect.top,
                bottom = pdfRect.bottom;
            startPoint = {
                x: left,
                y: top
            };
            endPoint = {
                x: right,
                y: bottom
            };

            let distance = calculateDistance(startPoint, endPoint, measurementInfo);
            const offsetX = endPoint.x - startPoint.x;
            const offsetY = endPoint.y - startPoint.y;
            area = calculateSquareArea(component.pdfRect, measurementInfo);
            angle = Math.round(Math.abs(Math.atan2(offsetY, offsetX)) / Math.PI * 180 * 100) / 100;
            let deltaX = Math.abs(offsetX);
            let deltaY = Math.abs(offsetY);
            deltaX = convertPoint2RealUnit(deltaX, measurementInfo);
            deltaY = convertPoint2RealUnit(deltaY, measurementInfo);
            
            let embeddedScale
            if(pageMeasureRatio && pageMeasureRatio.scale && isStartPointInVpRect){
                let pageMeasureScale = pageMeasureRatio.scale;
                embeddedScale = pageMeasureRatio.ratio;
                distance *= pageMeasureScale;
                perimeter&&(perimeter *= pageMeasureScale);
                deltaX *= pageMeasureScale;
                deltaY *= pageMeasureScale;
                area&&(area *= Math.pow(pageMeasureScale,2));
                scale = undefined;
            }

            let measurementData = {
                distance,
                deltaX,
                deltaY,
                scale,
                angle,
                displayUnit,
                perimeter,
                area,
                userSpaceUnit,
                realUnit,
                embeddedScale
            };
            

            that.store.dispatch('measurementData', measurementData);
            that.component.updateMeasurementInfo(measurementData);
        };

        this.addDestroyHook(
            this.getPDFUI().addViewerEventListener(CreateDistanceStart, function (distanceAnnotComponent) {
                var page = distanceAnnotComponent.page;
                this.task = Promise.all([page.getMeasureScaleRatio(),page.getViewportRect()])
                this.task.then(result=>{
                    pageMeasureRatio = result[0];
                    pageVpRect = result[1];
                    let {left,top} = distanceAnnotComponent.pdfRect;
                    isStartPointInVpRect = isPointInVpRect({x:left,y:top},pageVpRect);
                    this.task = Promise.resolve();
                    return updateDistanceMeasurementInfo(distanceAnnotComponent);
                })
            }),
            this.getPDFUI().addViewerEventListener(UpdateDistance, function (distanceAnnotComponent) {
                this.task.then(()=>{
                    return updateDistanceMeasurementInfo(distanceAnnotComponent);
                })
            }),
            this.getPDFUI().addViewerEventListener(CreateDistanceEnd, function (distanceAnnotComponent) {
                this.task.then(()=>{
                    return updateDistanceMeasurementInfo(distanceAnnotComponent);
                })
            }),

            this.component.on('change', function(data) {
                measurementInfo[data.field] = data.current;
                dispatchMeasurementInfo(measurementInfo);
            })
        );
        this.getPDFUI().getStore().then( function(store){
            store.subscribe('measurementInfo', function(newMeasurementInfo){
                that.component.setUserSpaceScale(newMeasurementInfo[FIELD_USER_SPACE_SCALE]);
                that.component.setRealScale(newMeasurementInfo[FIELD_REAL_SCALE]);
                that.component.setUserSpaceUnit(newMeasurementInfo[FIELD_USER_SPACE_UNIT]);
                that.component.setRealUnit(newMeasurementInfo[FIELD_REAL_UNIT]);
                measurementInfo = newMeasurementInfo
            });
            dispatchMeasurementInfo(measurementInfo);
        });
    },
}, UIExtension.Controller, {
    // statics
    getName: function () {
        return 'CustomMeasurementPopupController';
    }
})

customModule.registerComponent(customMeasurementPopup);
customModule.registerController(SquareMeasurementController);
customModule.registerController(CustomMeasurementPopupController);

//Adds a marker to the selected range
function appendSelectMark($parent, rect) {
    removeSelectMark($parent);
    let $frag = $(document.createDocumentFragment());
    let style = ['top:' + rect.top + 'px', 'left:' + rect.left + 'px', 'width:' + (rect.right - rect.left) + 'px', 'height:' + (rect.bottom - rect.top) + 'px', 'border:2px solid rgb(255, 0, 0)', 'position:absolute'].join(';')
    $frag.append('<div class="mark-link-blank" style="' + style + '"></div>')
    $parent.append($frag);
}

//Removes the selection range marker
function removeSelectMark($parent) {
    $parent.find(".mark-link-blank").remove();
}

//Gets the device coordinate point relative to the page
function getDevicePagePoint(elem, event) {
    let pageRect = elem.getBoundingClientRect();
    let srcEvent = event.srcEvent;
    const clientX = getClientX(srcEvent);
    const clientY = getClientY(srcEvent);
    return {
        x: clientX - pageRect.left - event.deltaX,
        y: clientY - pageRect.top - event.deltaY,
    };
};

//Gets the X-axis coordinates of the client
function getClientX(e) {
    if ('clientX' in e) {
        return e.clientX;
    } else {
        switch (e.type) {
            case 'touchstart':
            case 'touchmove':
                return e.touches[0].clientX;
            case 'touchend':
            case 'touchcancel':
                return e.changedTouches[0].clientX;
        }
    }
}

//Gets the Y-axis coordinates of the client
function getClientY(e) {
    if ('clientY' in e) {
        return e.clientY;
    } else {
        switch (e.type) {
            case 'touchstart':
            case 'touchmove':
                return e.touches[0].clientY;
            case 'touchend':
            case 'touchcancel':
                return e.changedTouches[0].clientY;
        }
    }
}

//Gets device rectangle
function getRect(startPoints, endPoints) {
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
    return {
        left: left,
        top: top,
        right: right,
        bottom: bottom
    };
}

// Gets rectangle vertexes
function getVertexes(rect, page, pageRender) {
    let left=rect.left,
        top=rect.top,
        right=rect.right,
        bottom=rect.bottom;
    let vertexes = [{
            x: left,
            y: top
        },
        {
            x: right,
            y: top
        },
        {
            x: right,
            y: bottom
        },
        {
            x: left,
            y: bottom
        },
    ]
    var arr = []
    for (let index = 0; index < vertexes.length; index++) {
        const it = vertexes[index];
        const point = page.reverseDevicePoint([it.x, it.y], pageRender.scale, pageRender.rotate);
        let x = point[0],y = point[1];
        arr.push({x:x,y:y})
    }
    return arr
}

//  convert Point to real Unit
function convertPoint2RealUnit(length, measurementInfo) {
    if (!measurementInfo) return length;
    const userSpaceScale = measurementInfo[FIELD_USER_SPACE_SCALE];
    const userSpaceUnit = measurementInfo[FIELD_USER_SPACE_UNIT];
    const realScale = measurementInfo[FIELD_REAL_SCALE];

    const userDistance = getUnitByName('pt').convertTo(length, userSpaceUnit);
    return userDistance * (realScale / userSpaceScale);
}

// Calculate distance
function calculateDistance(pointA, pointB, measurementInfo) {
    const offsetX = pointB.x - pointA.x;
    const offsetY = pointB.y - pointA.y;
    let deltaX = Math.abs(offsetX);
    let deltaY = Math.abs(offsetY);

    let distance = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY
    );
    return convertPoint2RealUnit(distance, measurementInfo);
}

// Calculate square area
function calculateSquareArea(rect, measurementInfo) {
    let area = Math.abs(rect.right - rect.left) * Math.abs(rect.top - rect.bottom);
    if(!measurementInfo){
        return area
    }
    const userSpaceScale = measurementInfo[FIELD_USER_SPACE_SCALE];
    const userSpaceUnit = measurementInfo[FIELD_USER_SPACE_UNIT];
    const realScale = measurementInfo[FIELD_REAL_SCALE];

    let userArea = getUnitByName('pt').convertAreaTo(area, userSpaceUnit);
    return userArea * (Math.pow(realScale / userSpaceScale, 2));
}

function isPointInVpRect(point,vpRect){
    const {x,y} = point;
    const {left,right,top,bottom} = vpRect;
    return x >= left && x <= right && y >= bottom && y <= top;
}

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




var fragment = [{
    target: 'template-container',
    action: 'append',
    template: '<custom:measurement-popup>',
    config: {
        target: 'custom-measurement-popup',
        callback: CustomMeasurementPopupController
    }
},
{
    target: 'create-circle-area-btn',
    action: 'after',
    template: '<xbutton name="custom-areaSquare" @hide-on-sr @tooltip tooltip-title="toolbar.buttons.tooltip.area" name="create-area-btn" icon-class="fx-icon-sm fv__icon-toolbar-areaSquare" @controller="custom:SquareMeasurementController">Area Demo</xbutton>'
}
]

var pdfui = window.pdfui = new PDFUI({
    viewerOptions: {
        libPath: '../../../lib',
        jr: {
            readyWorker: readyWorker,
            licenseSN: licenseSN,
            licenseKey: licenseKey
        }
    },
    renderTo: '#pdf-ui',
    appearance: UIExtension.appearances.adaptive.extend({
        getDefaultFragments: function () {
            return UIExtension.PDFViewCtrl.DeviceInfo.isMobile?[]:fragment;
        }
    }),
    fragments: [],
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
        url: '../../../docs/FoxitPDFSDKforWeb_DemoGuide.pdf',
    }
}, {
    fileName: 'FoxitPDFSDKforWeb_DemoGuide.pdf'
})

window.onresize = function () {
    pdfui.redraw().catch(function () {});
}

// Updates the content property when the measurement annotation was changed
pdfui.addViewerEventListener(Events.annotationAdd, function(annots) {
    setContentByAnnotCom(annots[0])
});
pdfui.addViewerEventListener(Events.annotationUpdated, function(annots, page, type) {
    if (type !== PDFViewCtrl.PDF.constant.AnnotUpdatedType.rectUpdated) {
        return;
    }
    setContentByAnnotCom(annots[0])
});
// Sets to disable modification of the content properties of the measurement tool
pdfui.addViewerEventListener(UIExtension.UIEvents.appendCommentListComment, function(commentCardComponent, annot) {
    if (annot.getIntent() === 'CustomDimension') {
        commentCardComponent.disableEdit();
        commentCardComponent.controller.supportsEditContent = false;
        commentCardComponent.toggleEditContent(true);
    }
});

function setContentByAnnotCom(annot) {
    if (annot.getIntent() == "CustomDimension") {
        pdfui.getPDFViewer().then(function(pdfViewer) {
            if(!annot.getMeasureRatio())return
            let ratio = annot.getMeasureRatio().split(" ")
            let displayUnitName = ratio[1]
            let measurementInfo = {
                'userSpaceScaleValue': ratio[0],
                'realScaleValue': ratio[3],
                'userSpaceUnit': getUnitByName(ratio[1]),
                'realUnit': getUnitByName(ratio[4])
            }
            let area = calculateSquareArea(annot.info.rect, measurementInfo)
            annot.setContent(Math.round(area * 100) / 100+' sq '+ displayUnitName)
        })
    }
}

pdfui.addViewerEventListener(Events.pageMeasureScaleRatioChanged, (page) => {
    page.getAnnots().then(annots=>{
        annots.forEach(annot=>{
            if (annot.getIntent() == "CustomDimension") {
                page.getMeasureScaleRatio().then(({ scale, ratioMap, unitName }) => {
                    page.getViewportRect().then(vpRect=>{
                        pdfui.getStore().then(store=>{
                            let {left,top} = annot.getRect();
                            let isStartPointInVpRect = isPointInVpRect({x:left,y:top},vpRect);
                            let measurementInfo = store.getCurrentValue('measurementInfo');
                            let userSpaceScaleValue,userSpaceUnit,realScaleValue,realUnit
                            if(scale && isStartPointInVpRect){
                                if(ratioMap.length){
                                    userSpaceScaleValue = ratioMap[0].value;
                                    userSpaceUnit = getUnitByName(ratioMap[0].unit);
                                    realScaleValue = ratioMap[1].value;
                                    realUnit = getUnitByName(ratioMap[1].unit);
                                    measurementInfo = {userSpaceScaleValue,userSpaceUnit,realScaleValue,realUnit}
                                }else{
                                    measurementInfo = null
                                }
                            }else{
                                if(!measurementInfo){
                                    scale = 1;
                                    userSpaceScaleValue = measurementInfo.userSpaceScaleValue
                                    userSpaceUnit = measurementInfo.userSpaceUnit
                                    realScaleValue = measurementInfo.realScaleValue
                                    realUnit = measurementInfo.realUnit
                                }else{
                                    return
                                }
                            }

                            let content = annot.getContent();
                            let index = content.indexOf('\n');
                            if (index >= 0) index += 1;
                            const label = content.substr(0, index);
                            let area = calculateSquareArea(annot.getRect(), measurementInfo);
                            annot.setContent(`${label}${parseFloat(area * Math.pow(scale,2)).toFixed(2)} sq ${unitName}`);
                        })
                    })
                })
            }
        })
    })
})