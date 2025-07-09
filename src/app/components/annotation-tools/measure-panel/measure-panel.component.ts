import { Component, OnInit, OnDestroy, EventEmitter, Output, Input, HostListener } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { AnnotationToolsService } from '../annotation-tools.service';
import { Subscription } from 'rxjs';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { MARKUP_TYPES, METRIC } from 'src/rxcore/constants';
import { RxCoreService } from 'src/app/services/rxcore.service';

import { ToastrService } from 'ngx-toastr';
import { MeasurePanelService } from './measure-panel.service';
import { CollabService } from 'src/app/services/collab.service';

@Component({
  selector: 'rx-measure-panel',
  templateUrl: './measure-panel.component.html',
  styleUrls: ['./measure-panel.component.scss'],
})
export class MeasurePanelComponent implements OnInit, OnDestroy {
  @Input() maxHeight: number = Number.MAX_SAFE_INTEGER;
  @Input() draggable: boolean = true;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  bounds: HTMLElement | null = document.getElementById("mainContent");

  private stateSubscription: Subscription;
  private guiMarkupSubscription: Subscription;
  private guifileloadSub : Subscription

  MARKUP_TYPES = MARKUP_TYPES;

  visible: boolean = false;
  created: boolean = true;
  type: number = MARKUP_TYPES.MEASURE.LENGTH.type;
  color: string;
  lengthMeasureType: number;
  strokeThickness: number;
  strokeLineStyle: number;
  snap: boolean;

  metricUnitTypes = METRIC.UNIT_TYPES;
  metricTitles = METRIC.UNIT_TITLES;
  metricUnits = METRIC.UNITS;
  scales = METRIC.UNITS.SCALES;

  metricTitlesOptions: any = [];
  metricUnitsOptions: any = [];
  scalesOptions: any = [];
  precisionOptions: any = [];
  selectedMetric: string;
  selectedMetricTitle: string;
  selectedMetricUnit: any;
  selectedScale: any;
  calibrateLength: string;
  measuredCalibrateLength: string;
  calibrateScale: string;
  isSelectedCalibrate: boolean;
  isCalibrateFinished: boolean;
  isPrecisionChanged: boolean;
  defaultScaleLabel: string;
  currentScale: string;
  selectedScalePrecision: any;
  isDoubleClicked: boolean;
  selectedMetricOptionObj: any;
  activeScale: string;
  isActivefile: boolean;
  setlabelonfileload : boolean = false;


  scaleOrCalibrate: number;
  customPageScaleValue: number;
  customDisplayScaleValue: number;
  metricUnitsOptionsForPage: any = [];
  metricUnitsOptionsForDisplay: any = [];
  selectedMetricUnitForPage: any;
  selectedMetricUnitForDisplay: any;
  isLoadedScales: boolean;
  currentPageMetricUnitCalibrate: string;
  //docObj: any;

  private _setDefaults(): void {
    this.created = false;
    this.type = MARKUP_TYPES.MEASURE.LENGTH.type;
    this.color = '#333C4E';
    this.strokeThickness = 1;
    this.strokeLineStyle = 0;
    this.lengthMeasureType = 0;
    this.snap = false;
    this.calibrateLength = "0";
    this.measuredCalibrateLength = "0";
    this.calibrateScale = '';
    this.isSelectedCalibrate = false;
    this.isCalibrateFinished = false;
    this.isPrecisionChanged = false;
    this.defaultScaleLabel = "1 Millimeter : 1 Millimeter";
    // this.currentScale = this.defaultScaleLabel;
    this.isDoubleClicked = false;
    this.scaleOrCalibrate = 0;
    this.customPageScaleValue = 1;
    this.customDisplayScaleValue = 1;
    this.isLoadedScales = false;
    //this.docObj = RXCore.printDoc();

    let allMetricUnits = {...this.metricUnits['0'], ...this.metricUnits[1]};
    Object.entries(allMetricUnits).forEach(([key, value]) => {
      let obj = { value: key, label: value };
      this.metricUnitsOptions.push(obj);
      this.metricUnitsOptionsForDisplay.push(obj);
      if(value === 'Millimeter' || value === 'Inch')
        this.metricUnitsOptionsForPage.push(obj);
    });
    this.selectedMetricUnit = this.metricUnitsOptions[0];
    this.selectedMetricUnitForPage = this.metricUnitsOptionsForPage[0];
    this.selectedMetricUnitForDisplay = this.metricUnitsOptionsForDisplay[0];
    this.currentPageMetricUnitCalibrate = 'Millimeter'; 

    Object.entries(this.metricTitles).forEach(([key, value]) => {
      let obj = { value: key, label: value };
      this.metricTitlesOptions.push(obj);
    }); 
    this.selectedMetric = '0';
    this.selectedMetricOptionObj = this.metricTitlesOptions[0];
    
    let precisionOptionsArr = [1, 0.1, 0.01, 0.001, 0.0001];
    precisionOptionsArr.forEach(item => {
      let obj = { value: item, label: item };
      this.precisionOptions.push(obj);
    });
    this.selectedScalePrecision = this.precisionOptions[2];
  }

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly colorHelper: ColorHelper,
    private readonly service: MeasurePanelService,
    private toastr: ToastrService,
    private readonly collabService: CollabService) {}

  ngOnInit(): void {
    this._setDefaults();


    this.guifileloadSub = this.rxCoreService.guiFileLoadComplete.subscribe((state) => {
    

      let scaleobject = {
        dimPrecision : 2,
        isSelected : true,
        label :  "1000 Millimeter : 1 Meter",
        metric : "0",
        metricUnit  : "Meter",
        value : "1000:1000",
      }

      //this.setlabelonfileload = true;

      let obj = { 
        value: scaleobject.value,
        label: scaleobject.label,
        metric: scaleobject.metric,
        metricUnit: scaleobject.metricUnit,
        dimPrecision: scaleobject.dimPrecision,
        isSelected: scaleobject.isSelected
      };
      
      //this.scalesOptions.push(obj);
      //this.selectedScale = obj;    

      //this.applyScale(scaleobject);
      
      
    });

    
    this.stateSubscription = this.annotationToolsService.measurePanelState$.subscribe(state => {
      this.visible = state.visible;
      // this.service.setMeasureScaleState({ visible: state.visible });
      this.service.setMeasureScaleState({ visible: true });

      // if(this.visible && !this.currentScale) {
      //   this.currentScale = this.defaultScaleLabel;
      // }

      if(this.visible) {
        this.setCurrentPageScale();
      } 

      //set page scale when calibrate cancelled
      if(!this.visible && this.isSelectedCalibrate) {
        this.cancelCalibrate();
        if(this.selectedScale) {
          this.applyScale(this.selectedScale);
        }
        this.measuredCalibrateLength = '0';
      }
      
    });

    this.collabService.chatMessageChange$.subscribe((message) => {
      if (!message) {
        return;
      }

      if (message.text === 'MeasurementScale') {
         if (!message.data) {
          return;
         }

        this.collabService.setTriggerMeasureScaleSync(false);

        const data = message.data;

        const scaleObj = this.scalesOptions.find(item => item.label === data.scaleLabel);
        if(scaleObj) {
          this.selectedScale = scaleObj;
          this.applyScale(this.selectedScale);
          this.collabService.setTriggerMeasureScaleSync(true);
          return;
        }

        const newScaleObj = {
          value: data.scaleValue, 
          label: data.scaleLabel,
          metric: data.Unitofmeasure,
          metricUnit: data.unitname,
          dimPrecision: data.ndimprecision,
          isSelected: true
         };
         this.scalesOptions.push(newScaleObj);
         this.selectedScale = newScaleObj;
         this.applyScale(this.selectedScale);
         
         this.currentScale = this.selectedScale.label;
         
         this.service.setMeasureScaleState({visible: true, value: this.currentScale});
         
         this.service.setScaleState({ created: true, scaleLabel: this.selectedScale.label });
         
         //set to default value
         this.customPageScaleValue = 1;
         this.customDisplayScaleValue = 1;
         this.selectedMetricUnitForPage = this.metricUnitsOptionsForPage[0];
         this.selectedMetricUnitForDisplay = this.metricUnitsOptionsForDisplay[0];
         this.selectedScalePrecision = this.precisionOptions[2];

         this.collabService.setTriggerMeasureScaleSync(true);
      }

    });

    this.rxCoreService.guiCalibrateFinished$.subscribe(state => {
      this.calibrateLength = parseFloat(state.data || "0").toFixed(this.countDecimals(this.selectedScalePrecision?.value));
      this.measuredCalibrateLength = this.calibrateLength;
      this.isCalibrateFinished = state.isFinished;
      if(state.isFinished) {
        this.calibrateScale = this.currentScale;
      }
    });   
    

    // this.guiMarkupSubscription = this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
    //   this._setDefaults();
    //   this.visible = false;

    //   if (markup == -1 || operation.deleted) {
    //     return;
    //   }

    //   this.type = markup.type;
    //   this.color = this.colorHelper.rgbToHex(markup.strokecolor);
    //   this.strokeThickness = markup.linewidth;
    //   this.strokeLineStyle = markup.linestyle;
    //   this.lengthMeasureType = markup.subtype;
    // });
    this.rxCoreService.guiConfig$.subscribe(config => {
      if(config.disableMarkupMeasureButton === true) {
        this.visible = false;
      }
    });

    this.rxCoreService.guiState$.subscribe(state => {
      if(state?.activefile) {
        this.isActivefile = true;
      }
    });

    this.rxCoreService.guiPage$.subscribe((state) => {   
      this.loadAndSetPageScale();
    }); 

    this.rxCoreService.guiScaleListLoadComplete$.subscribe(() => {
      this.loadAndSetPageScale();
    });

  }

  ngOnDestroy(): void {
    if (this.stateSubscription) this.stateSubscription.unsubscribe();
    if (this.guiMarkupSubscription) this.guiMarkupSubscription.unsubscribe();
  }

  onLengthMeasureTypeChange(type: number): void {
    this.lengthMeasureType = type;
    if (this.created) {
      RXCore.markUpDimension(true, type);
    } else {
      RXCore.markUpSubType(type);
    }
  }

  onColorSelect(color): void {
    this.color = color;
    RXCore.setGlobalStyle(true);
    RXCore.changeStrokeColor(color);
  }

  onStrokeThicknessChange(): void {
    RXCore.setLineWidth(this.strokeThickness);
  }

  onStrokeLineStyleSelect(lineStyle: number): void {
    this.strokeLineStyle = lineStyle;
    RXCore.setLineStyle(lineStyle);
  }

  onSnapChange(onoff: boolean): void {
    RXCore.changeSnapState(onoff);
  }

  loadAndSetPageScale () : void{
    //this.docObj = RXCore.printDoc();

    if(RXCore.getDocScales()){
      this.scalesOptions = [];
      this.loadScaleList();
      this.setCurrentPageScale();

    }

    /*if(this.docObj && this.docObj.scalesOptions) {
    }*/
  }

  setCurrentPageScale (): void{
    const scaleLabel = RXCore.getCurrentPageScaleLabel();
    if(!scaleLabel) {
      return;
    }
    if(this.scalesOptions.length) { 
      this.selectedScale = this.scalesOptions.find(item=>item.label === scaleLabel);
      if(this.selectedScale) {
        this.currentScale = this.selectedScale.label;
        this.service.setMeasureScaleState({visible: true, value: this.currentScale});
      } else {
        this.selectedScale = this.scalesOptions[0];
      }
    }
  }
  
  selectMetricUnit(event): void {
    let obj = this.metricUnitsOptions.find(item => item.value === event.value);
    this.selectedMetricUnit = obj;
  };  

  metricUnitsForMetric(metric): any {
      return this.metricUnits[metric];
  }

  onScalePrecisionChanged(event): void {
    this.selectedScalePrecision = this.precisionOptions.find(item=>item.value === event.value);
  }

  onCloseClick(): void {
    this.currentScale = this.activeScale; 
    this.visible = false;
    this.annotationToolsService.setMeasurePanelState({ visible: false });
    this.onClose.emit();    
  }

  calibrate(selected) {
    //select to default scale before calibrate starts
    this.applyScaleToDefault();

    RXCore.onGuiCalibratediag(onCalibrateFinished);
    let rxCoreSvc = this.rxCoreService;
    function onCalibrateFinished(data) {
        rxCoreSvc.setCalibrateFinished(true, data);        
    }

    RXCore.calibrate(selected);
    this.annotationToolsService.setSnapState(true);
  }

  onCalibrateCheckedChange() {
    this.measuredCalibrateLength = "0.00";
    if(this.isSelectedCalibrate) {
      this.calibrate(true);
    } else {
      this.cancelCalibrate();
    }
  }

  resetCalibrate() {
      this.isCalibrateFinished = false;
      this.calibrate(true);
  }
  
  countDecimals(value) {
    return value % 1?value.toString().split(".")[1].length:0;     
  };

  cancelCalibrate(): void {
    let snap = RXCore.getSnapState();
    RXCore.calibrate(false);
    
    this.isSelectedCalibrate = false;
    this.isCalibrateFinished = false;

    this.calibrateLength = "0";
    // this.currentScale = this.defaultScaleLabel;
    
    if(snap === false) {
      RXCore.changeSnapState(false);
    }

    this.setCurrentPageScale();
  }

  onScaleChanged(event): void {
    this.selectedScale = this.scalesOptions.find(item=>item.label === event.label);
    this.applyScale(this.selectedScale);
  }

  onScaleDeleted(event): void {
    this.deleteScaleNew(event);
  }

  updateMetric(selectedMetric: string): void {
    switch (selectedMetric){
      case '0' :
        RXCore.setUnit(1);
        break;
      case '1' :
        RXCore.setUnit(2);
        break;
    } 
  };

  onScaleOrCalibrateChange(type: number): void {
    this.scaleOrCalibrate = type;    
  }

  selectMetricUnitForPage(event): void {
    let obj = this.metricUnitsOptionsForPage.find(item => item.value === event.value);
    this.selectedMetricUnitForPage = obj;
  };

  selectMetricUnitForDisplay(event): void {
    let obj = this.metricUnitsOptionsForDisplay.find(item => item.value === event.value);
    this.selectedMetricUnitForDisplay = obj;
    
    if(this.metricUnits[0]?.[obj.value] !== undefined) {
      this.selectedMetric = '0';
    } else {
      this.selectedMetric = '1';
    }
  };

  updateMetricUnit(metric, metricUnit): void { 
    if (metric === METRIC.UNIT_TYPES.METRIC ) {          
        RXCore.metricUnit(metricUnit);          
    } else if (metric === METRIC.UNIT_TYPES.IMPERIAL ) {          
        RXCore.imperialUnit(metricUnit);
    }      
  };

  convertToMM(value: string): number {
    let unitScale = 1;

    if (value === 'Centimeter') {
      unitScale = 10;
    } 
    else if (value === 'Decimeter') {
        unitScale = 100;
    } 
    else if (value === 'Meter') {
        unitScale = 1000;
    } 
    else if (value === 'Kilometer') {
        unitScale = 1000000;
    } 
    else if (value === 'Nautical Miles') {
        unitScale = 185200000;
    } 
    else if (value === 'Inch') {
      unitScale = 25.4;
    }

    return unitScale;
  }

  convertToInch(value: string): number {
    let unitScale = 1;

    if (value === 'Feet') {
        unitScale = 12;
    } 
    else if (value === 'Yard') {
        unitScale = 36;
    } 
    else if (value === 'Mile') {
        unitScale = 63360;
    } 
    else if (value === 'Nautical Miles') {
        unitScale = 72913.3858;
    } 
    else if (value === 'Millimeter') {
      unitScale = 0.0393701;
    } 
    else if (value === 'Centimeter') {
      unitScale = 0.393701;
    } 

    return unitScale;
  }

  calculateScale() {
    let scale = '1:1';    
    let selectedMetricForPage = '1';
    if(this.metricUnits[0]?.[this.selectedMetricUnitForPage.value] !== undefined) {
      selectedMetricForPage = '0';
    }

    let unitScaleForPage;
    let unitScaleForDisplay;

    if(selectedMetricForPage === this.selectedMetric) {      
      if(this.selectedMetric === '0') {
        unitScaleForPage = 1;
        unitScaleForDisplay = this.convertToMM(this.selectedMetricUnitForDisplay.label);
      } else {
        unitScaleForPage = 1;
        unitScaleForDisplay = this.convertToInch(this.selectedMetricUnitForDisplay.label);
      }
    }
    else {
      unitScaleForPage = 1;
      unitScaleForDisplay = 1;
    }

    const scaleForPage = this.customPageScaleValue * unitScaleForPage;
    const scaleForDisplay = this.customDisplayScaleValue * unitScaleForDisplay;
     
    scale = `${scaleForPage}:${scaleForDisplay}`;
    return scale;
  }
  
  applyScale(selectedScaleObj: any) {  
    this.updateMetric(selectedScaleObj.metric);
    this.updateMetricUnit(selectedScaleObj.metric, selectedScaleObj.metricUnit);
    RXCore.setDimPrecisionForPage(this.countDecimals(this.selectedScalePrecision?.value));
    RXCore.scale(selectedScaleObj.value);
    RXCore.setScaleLabel(selectedScaleObj.label);

    this.scalesOptions = this.setPropertySelected(this.scalesOptions, 'isSelected', 'label', selectedScaleObj.label);

    RXCore.updateScaleList(this.scalesOptions);

    this.currentScale = selectedScaleObj.label;
    this.service.setMeasureScaleState({visible: true, value: this.currentScale});

    if(this.isSelectedCalibrate) {      
      this.isSelectedCalibrate = false;
      this.isCalibrateFinished = false;
    }

    if(this.setlabelonfileload ){
      this.setCurrentPageScale();
      this.setlabelonfileload = false;

    }

    

    //this.showSuccess();
    //this.onCloseClick();
  }

  addNewScale() {    
    let scaleLabel = `${this.customPageScaleValue} ${this.selectedMetricUnitForPage.label} : ${this.customDisplayScaleValue} ${this.selectedMetricUnitForDisplay.label}`
    const scaleObj = this.scalesOptions.find(item => item.label === scaleLabel);
    if(scaleObj) {
      this.selectedScale = scaleObj;
      this.applyScale(this.selectedScale);
      this.onCloseClick();
      return;
    }

    let scale = this.calculateScale();
    let obj = { 
      value: scale, 
      label: scaleLabel,
      metric: this.selectedMetric,
      metricUnit: this.selectedMetricUnitForDisplay.label,
      dimPrecision: this.countDecimals(this.selectedScalePrecision?.value),
      isSelected: true
    };
    this.scalesOptions.push(obj);
    this.selectedScale = obj;
    this.applyScale(this.selectedScale);
    
    this.currentScale = this.selectedScale.label;
    
    this.service.setMeasureScaleState({visible: true, value: this.currentScale});
    
    this.service.setScaleState({ created: true, scaleLabel: this.selectedScale.label });
    
    //set to default value
    this.customPageScaleValue = 1;
    this.customDisplayScaleValue = 1;
    this.selectedMetricUnitForPage = this.metricUnitsOptionsForPage[0];
    this.selectedMetricUnitForDisplay = this.metricUnitsOptionsForDisplay[0];
    this.selectedScalePrecision = this.precisionOptions[2];

    //this.showSuccess();
    this.onCloseClick();
  }

  applyScaleToDefault(rerenderMeasurePanel = false) {  
    this.updateMetric('0');
    this.updateMetricUnit('0', 'Millimeter');
    RXCore.setDimPrecisionForPage(3);
    RXCore.scale('1:1');
    
    this.currentScale = 'Unscaled';
    this.service.setMeasureScaleState({visible: true, value: this.currentScale});
    if(rerenderMeasurePanel) {
      let mrkUp:any = RXCore.getSelectedMarkup();
      if(!mrkUp.isempty) {
        RXCore.unSelectAllMarkup();
        RXCore.selectMarkUpByIndex(mrkUp.markupnumber);
      }
    }
  }

  deleteScaleNew(scaleObj): void {
    let tempObj;
    if(scaleObj.label === this.selectedScale.label) {
      tempObj = this.selectedScale;
    }

    this.scalesOptions = this.scalesOptions.filter(item=>item.label !== scaleObj.label);
    
    RXCore.updateScaleList(this.scalesOptions);
    
    if(tempObj && this.scalesOptions.length) {
      this.selectedScale = this.scalesOptions[0];
      this.applyScale(this.selectedScale);
      this.currentScale = this.selectedScale.label;
      this.service.setMeasureScaleState({visible: true, value: this.currentScale});
    }

    if(this.scalesOptions.length === 0) {
      this.applyScaleToDefault(true);
    }
    
    RXCore.resetToDefaultScaleValueForMarkup(scaleObj.label);
    this.service.setScaleState({ deleted: true });
  }

  selectMetricUnitForCalibrate(event): void {
    let obj = this.metricUnitsOptions.find(item => item.value === event.value);
    this.selectedMetricUnit = obj;
    
    if(this.metricUnits[0]?.[obj.value] !== undefined) {
      this.selectedMetric = '0';
    } else {
      this.selectedMetric = '1';
    }
  }

  applyCalibrate() {
    if(this.measuredCalibrateLength === this.calibrateLength &&
      this.currentPageMetricUnitCalibrate === this.selectedMetricUnit.label) {
      return;
    }
    
    if(this.metricUnits[0]?.[this.selectedMetricUnit.value] !== undefined) {
      this.selectedMetric = '0';
    } else {
      this.selectedMetric = '1';
    }

    this.updateMetric(this.selectedMetric);
    this.updateMetricUnit(this.selectedMetric, this.selectedMetricUnit.label);

    this.calibrateLength = this.calibrateLength.trim();
    var calibrateconn = RXCore.getCalibrateGUI();

    let converttedCalibrateLength;
    if(this.selectedMetric === '0') {
      converttedCalibrateLength = parseInt(this.calibrateLength) * this.convertToMM(this.selectedMetricUnit.label);
    } else {
      converttedCalibrateLength = parseInt(this.calibrateLength) * this.convertToInch(this.selectedMetricUnit.label);
    }

    calibrateconn.SetTempCal(converttedCalibrateLength);
    calibrateconn.setCalibrateScaleByLength();

    if(!Number.isFinite(calibrateconn.getMeasureScale())) {
      return;
    }

    calibrateconn.setCalibration(true);

    RXCore.setDimPrecisionForPage(this.countDecimals(this.selectedScalePrecision?.value));
    
    RXCore.scale('Calibration');

    let measureScale = calibrateconn.getMeasureScale().toFixed(2);
    measureScale = parseFloat(measureScale);
    // console.log("measureScale", measureScale);
    const scaleVaue = `1:${measureScale}`;

    let convertedMeasureScale;
    let pageScaleLebel = this.currentPageMetricUnitCalibrate;
    if(this.selectedMetric === '0') {
      convertedMeasureScale = (measureScale/this.convertToMM(this.selectedMetricUnit.label)).toFixed(2);
    } else {
      convertedMeasureScale = (measureScale/this.convertToInch(this.selectedMetricUnit.label)).toFixed(2);
      pageScaleLebel = 'Inch';
    }
    
    const scaleLabel = `1 ${pageScaleLebel} : ${convertedMeasureScale} ${this.selectedMetricUnit.label}`;
    RXCore.setScaleLabel(scaleLabel);    

    RXCore.calibrate(false);
    // this.cancelCalibrate();
    this.scaleOrCalibrate = 0;
    RXCore.scale(scaleVaue);
    //set measuredCalibrateLength to 0 once calibration complete
    this.measuredCalibrateLength = '0';
    let obj = { 
      value: scaleVaue,
      label: scaleLabel,
      metric: this.selectedMetric,
      metricUnit: this.selectedMetricUnit.label,
      dimPrecision: this.countDecimals(this.selectedScalePrecision?.value),
      isSelected: true
    };
    this.scalesOptions.push(obj);
    this.selectedScale = obj;    
    this.scalesOptions = this.setPropertySelected(this.scalesOptions, 'isSelected', 'label', this.selectedScale.label);

    RXCore.updateScaleList(this.scalesOptions);

    this.currentScale = this.selectedScale.label;
    
    this.service.setMeasureScaleState({visible: true, value: this.currentScale});
    this.service.setScaleState({ created: true, scaleLabel: this.selectedScale.label });

    //this.showSuccess();
    this.onCloseClick();
  }

  loadScaleList() {        
    //const scales: any = this.docObj.scalesOptions;

    const scales: any = RXCore.getDocScales();

    if(scales && scales.length) {
      this.scalesOptions = [];
      for (let i = 0; i < scales.length; i++) {        
        this.scalesOptions.push(scales[i]);        
      }
    } else {
        this.insertUnscaled();
      }    
  }

  insertUnscaled() {
    this.currentScale = 'Unscaled';
    this.service.setMeasureScaleState({visible: true, value: this.currentScale});
  }

  setPropertySelected(array, property, conditionKey, conditionValue) {
    array.forEach(obj => {
        if (obj[conditionKey] === conditionValue) {
            obj[property] = true;
        } else {
            obj[property] = false;
        }
    });

    return array;
  }

  showSuccess() {
    this.toastr.success('Start measuring by selecting one of the measurement tools.', 'Scale has been successfully set', {      
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
    });
  }
}
