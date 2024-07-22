import { Component, OnInit, OnDestroy, EventEmitter, Input, Output } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { AnnotationToolsService } from '../annotation-tools.service';
import { Subscription } from 'rxjs';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { MARKUP_TYPES, METRIC } from 'src/rxcore/constants';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { MeasurePanelService } from '../measure-panel/measure-panel.service';

@Component({
  selector: 'rx-measure-detail-panel',
  templateUrl: './measure-detail-panel.component.html',
  styleUrls: ['./measure-detail-panel.component.scss'],
})
export class MeasureDetailPanelComponent implements OnInit, OnDestroy {
  @Input() maxHeight: number = Number.MAX_SAFE_INTEGER;
  @Input() draggable: boolean = true;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  private stateSubscription: Subscription;
  private guiMarkupSubscription: Subscription;
  private guiMarkupMeasureRealTimeDataSubscription: Subscription;

  MARKUP_TYPES = MARKUP_TYPES;

  panelHeading: string = '';
  measurementText: string = 'Distance'
  visible: boolean = false;
  measureData: any = {};
  markup: any;
  scalesOptions: any = [];
  selectedScale: any;
  showScaleDropdownOnStartDrawing: boolean = false;
  docObj: any;

  private _setDefaults(): void { 
    this.docObj = RXCore.printDoc();   
    this.updateScaleList();
    if(this.scalesOptions.length)
      this.selectedScale = this.scalesOptions[0];
  }

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly colorHelper: ColorHelper,
    private readonly measurePanelService: MeasurePanelService) {}

  ngOnInit(): void {
    this._setDefaults();

    this.stateSubscription = this.annotationToolsService.measurePanelDetailState$.subscribe(state => {
      this.visible = state.visible;
      if(!this.visible){
        //this.measureData.dimtext = "0.0";
        this.measureData = {
          dimtext : "0.0"
        };

      }

      switch(state.type){
        case MARKUP_TYPES.MEASURE.LENGTH.type :
          this.panelHeading = "Distance Measurement";
          this.measurementText = "Distance";
          
        break;
        case MARKUP_TYPES.SHAPE.RECTANGLE.type :
        case MARKUP_TYPES.MEASURE.AREA.type :
          this.panelHeading = "Area Measurement";  
          this.measurementText = "Area";
        break;
        case MARKUP_TYPES.MEASURE.PATH.type :
          this.panelHeading = "Perimeter Measurement";
          this.measurementText = "Distance";
        break;


      }

      if(state.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
        state.type === MARKUP_TYPES.SHAPE.RECTANGLE.type ||
        state.type === MARKUP_TYPES.MEASURE.AREA.type ||
        state.type === MARKUP_TYPES.MEASURE.PATH.type
      ) {
        this.showScaleDropdownOnStartDrawing = true;
      }      

      // this.created = Boolean(state.created);
      // if (this.created) {
      //   this.type = state.type;
      // }
    });

    this.rxCoreService.guiPage$.subscribe((state) => {   
      this.docObj = RXCore.printDoc();
      this.scalesOptions = [];
      this.selectedScale = null;
      this.updateScaleList();
      this.selectCurrentScale();
    }); 

    this.rxCoreService.guiScaleListLoadComplete$.subscribe(() => {
      this.docObj = RXCore.printDoc();
      this.scalesOptions = [];
      this.selectedScale = null;
      this.updateScaleList();
      this.selectCurrentScale();
    });

    this.guiMarkupMeasureRealTimeDataSubscription = this.rxCoreService.guiMarkupMeasureRealTimeData$.subscribe(({markup}) => {
      this.manageRealTimeBox(markup);
    });

    this.annotationToolsService.propertiesPanelState$.subscribe(state => {
      this.markup = state?.markup;

      if(this.markup?.type === MARKUP_TYPES.MEASURE.LENGTH.type) {
        this.panelHeading = "Distance Measurement";
        this.measurementText = "Distance";
      } else if(this.markup?.type === MARKUP_TYPES.MEASURE.PATH.type) {
        this.panelHeading = "Perimeter Measurement";
        this.measurementText = "Distance";
      } else if(this.markup?.type === MARKUP_TYPES.MEASURE.AREA.type) {
        this.panelHeading = "Area Measurement";
        this.measurementText = "Area";
      }
      
    });

    this.rxCoreService.guiMarkupIndex$.subscribe(({markup, operation}) => {
      this.manageRealTimeBox(markup);
    });

    this.rxCoreService.guiMarkup$.subscribe(({markup, operation} : any) => {
      //Hide real time box when one of measure tool deleted
      if(operation.deleted || markup === -1) {
        this.visible = false;
      }

      //save page scale to markup scale once created
      if(operation.created &&
        (markup.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
        markup.type === MARKUP_TYPES.SHAPE.RECTANGLE.type ||
        markup.type === MARKUP_TYPES.MEASURE.AREA.type ||
        markup.type === MARKUP_TYPES.MEASURE.PATH.type)) {        
          RXCore.unSelectAllMarkup();
          RXCore.selectMarkUpByIndex((markup as any).markupnumber);
          if(this.selectedScale)
            this.applyScale(this.selectedScale); 
      }

      if(operation.modified) {
        this.manageRealTimeBox(markup);
      }
    });

    this.rxCoreService.guiConfig$.subscribe(config => {
      if(config.disableMarkupMeasureButton === true) {
        this.visible = false;
      }
    });

    this.rxCoreService.guiOnMarkupChanged$.subscribe(({annotation, operation}) => {

      switch(annotation.type) {
        case MARKUP_TYPES.MEASURE.LENGTH.type :
          this.setMeasurementOnLength(annotation);          
          break;
        case MARKUP_TYPES.SHAPE.RECTANGLE.type :
        case MARKUP_TYPES.MEASURE.AREA.type :
          this.calculateArea(annotation);
          break;
      }

    });  
    
    this.measurePanelService.scaleState$.subscribe(state => {

      if(state.created) {
        this.updateScaleList();

        if(this.measureData.dimtext === "0.0") {
          this.selectedScale = this.scalesOptions.find(item=>item.label === state.scaleLabel);
        } else {
          if(this.measureData.hasScale === false)
            this.selectedScale = this.scalesOptions.find(item=>item.label === state.scaleLabel);
        }

      }
      
      if(state.deleted) {
        this.updateScaleList();
        if(!this.scalesOptions.length) {
          this.selectedScale = null;
          return;
        }

        let mrkUp:any = RXCore.getSelectedMarkup();
        if(!mrkUp.isempty) {
          RXCore.unSelectAllMarkup();
          RXCore.selectMarkUpByIndex(mrkUp.markupnumber);
        }
      } 
    });

  }

  manageRealTimeBox(markup) {
    this.measureData = markup;
      
      if(markup !== -1) {

        if(markup.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
          markup.type === MARKUP_TYPES.SHAPE.RECTANGLE.type ||
          markup.type === MARKUP_TYPES.MEASURE.AREA.type ||
          markup.type === MARKUP_TYPES.MEASURE.PATH.type
        ) {
          this.updateScaleList();
          this.selectCurrentScale(markup);
        }

        switch(markup.type){
          case MARKUP_TYPES.MEASURE.LENGTH.type :
            this.panelHeading = "Distance Measurement";
            this.measurementText = "Distance";
            this.visible = true;            
            this.setMeasurementOnLength(markup);
          break;
          case MARKUP_TYPES.SHAPE.RECTANGLE.type :
            if(markup.subtype !== MARKUP_TYPES.MEASURE.RECTANGLE.subType) {
              this.visible = false;
              break;
            }
            this.panelHeading = "Area Measurement";  
            this.measurementText = "Area";
            this.visible = true;
            this.calculateArea(markup);
            break;
          case MARKUP_TYPES.MEASURE.AREA.type :
            this.panelHeading = "Area Measurement";  
            this.measurementText = "Area";
            this.visible = true;
            this.calculateArea(markup);
          break;
          case MARKUP_TYPES.MEASURE.PATH.type :
            if(markup.subtype !== MARKUP_TYPES.MEASURE.PATH.subType) {
              this.visible = false;
              break;
            }
            this.panelHeading = "Perimeter Measurement";
            this.measurementText = "Distance";
            this.visible = true;
          break;

          case 13 :
            this.measurementText = "Count";
            this.panelHeading = "Count";
            this.visible = true;
            this.showScaleDropdownOnStartDrawing = false;
            break;
          default :
            this.visible = false;
            break;
  
  
        }
        
      }
  }

  /*calculateArea(markup: any) {
    this.measureData = markup;
    this.setDistanceOnArea(this.measureData); 
  }*/

  updateScaleList() {
    if(this.docObj && this.docObj.scalesOptions && this.docObj.scalesOptions.length)
      this.scalesOptions = this.docObj.scalesOptions;   
  }

  selectCurrentScale(markup?) {
    if(!this.scalesOptions.length)
      return;
    //element scale
    if(markup && markup.hasScale) {
      this.selectedScale = this.scalesOptions.find(item=>item.label === markup.scaleObject.getScaleLabel());
    } 
    else {
      //page scale
      const scaleLabel = RXCore.getCurrentPageScaleLabel();
      this.selectedScale = this.scalesOptions.find(item=>item.label === scaleLabel);      
    }
  }

  calculateArea(markup: any) {
    this.measureData = markup;
    this.setDistanceOnArea(this.measureData); 

    let szmtxt =  this.measureData.dimtext.split(" ")[1];

    let dimValue = this.measureData.dimarea;


    for(let idx = 0; idx < this.measureData.holes.length; idx++) {

      //let markupObj = RXCore.getmarkupbyNumber();

      dimValue = this.measureData.holes[idx].dimarea;

      dimValue = dimValue + this.measureData.dimarea;


    }
 
    //this.measureData.dimtextWithHole = dimValue;//.toFixed(2) + " " + this.measureData.dimtext.split(" ")[1];

    if(this.measureData.dimarea < dimValue) {
      this.measureData.dimtextWithHole = dimValue.toFixed(2) + " " + szmtxt;
    } else {
      this.measureData.dimtextWithHole = 0;
    }
  }

  setDistanceOnArea(markup: any) {
    if(markup.type === MARKUP_TYPES.MEASURE.AREA.type) {
      this.measureData.perimeterLengthOnArea = markup?.setdimvalueperimeter() || 0;
    } 

    if(markup.type === MARKUP_TYPES.SHAPE.RECTANGLE.type) {
      markup.removepoints();
      
      let rotatedrect = markup.rotatedrect;
      let points = [{x: rotatedrect.x, y: rotatedrect.y},
          {x: rotatedrect.x + rotatedrect.w, y: rotatedrect.y},
          {x: rotatedrect.x + rotatedrect.w, y: rotatedrect.y + rotatedrect.h},
          {x: rotatedrect.x, y: rotatedrect.y + rotatedrect.h}];

      for(let idx = 0; idx < points.length; idx++) {
        markup.addrectpoint(points[idx].x, points[idx].y);
      }
      
      this.measureData.perimeterLengthOnArea = markup?.setdimvalueperimeter() || 0;
    }
  }

  setMeasurementOnLength(markup: any) {
    this.measureData = markup;
    this.measureData.angleRadians = this.measureData?.getangleofline(this.measureData.x, this.measureData.y, this.measureData.w, this.measureData.h, false);
    
    if(this.measureData.angleRadians) {
        let angle = (this.measureData.angleRadians.angle * (180/Math.PI));
        let formattedAngle = angle;

        if(angle >= -90 && angle < 0) {
          formattedAngle = Math.abs(angle);
        } else if(angle < -90) {
          formattedAngle = 180 + angle;        
        } else if(angle > 90) {
          formattedAngle = 180 - angle;
        } 

        this.measureData.angleLine = formattedAngle.toFixed(2);
    }

    //let xData = this.measureData.dimtextx.split(" ");
    //this.measureData.xLength = Math.abs(xData[0]) + " " + xData[1];
    
    this.measureData.xLength = this.measureData.dimtextx;

    //let yData = this.measureData.dimtexty.split(" ");
    //this.measureData.yLength = Math.abs(yData[0]) + " " + yData[1];

    this.measureData.yLength = this.measureData.dimtexty;
  }

  onScaleChanged(event): void {
    this.selectedScale = this.scalesOptions.find(item=>item.label === event.label);
    if(this.measureData.dimtext === "0.0") {
      this.applyScaleToPage(this.selectedScale);  
    } else {
      this.applyScale(this.selectedScale);    
    }
  }

  updateMetric(metric: string): void {
    switch (metric){
      case '0' :
        RXCore.setElementUnit(1);
        break;
      case '1' :
        RXCore.setElementUnit(2);
        break;
    } 
  };

  updateMetricUnit(metric, metricUnit): void {    
    if (metric === METRIC.UNIT_TYPES.METRIC ) {          
        RXCore.elementMetricUnit(metricUnit); 

    } else if (metric === METRIC.UNIT_TYPES.IMPERIAL ) {          
        RXCore.elementImperialUnit(metricUnit);
    }      
  };

  countDecimals(value) {
    return value % 1?value.toString().split(".")[1].length:0;     
  };

  applyScale(selectedScaleObj: any) {    
    this.updateMetric(selectedScaleObj.metric);
    this.updateMetricUnit(selectedScaleObj.metric, selectedScaleObj.metricUnit);
    RXCore.setElementDimPrecision(selectedScaleObj.dimPrecision);
    RXCore.elementScale(selectedScaleObj.value);
    RXCore.setElementScaleLabel(selectedScaleObj.label);

    RXCore.markUpRedraw();
    this.manageRealTimeBox(this.measureData);
  }

  updateMetricToPage(selectedMetric: string): void {
    switch (selectedMetric){
      case '0' :
        RXCore.setUnit(1);
        break;
      case '1' :
        RXCore.setUnit(2);
        break;
    } 
  };

  updateMetricUnitToPage(metric, metricUnit): void { 
    if (metric === METRIC.UNIT_TYPES.METRIC ) {          
        RXCore.metricUnit(metricUnit);          
    } else if (metric === METRIC.UNIT_TYPES.IMPERIAL ) {          
        RXCore.imperialUnit(metricUnit);
    }      
  };

  applyScaleToPage(selectedScaleObj: any) {  
    this.updateMetricToPage(selectedScaleObj.metric);
    this.updateMetricUnitToPage(selectedScaleObj.metric, selectedScaleObj.metricUnit);
    RXCore.setDimPrecisionForPage(selectedScaleObj.dimPrecision);
    RXCore.scale(selectedScaleObj.value);
    RXCore.setScaleLabel(selectedScaleObj.label);
    this.measurePanelService.setMeasureScaleState({visible: true, value: selectedScaleObj.label});
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) this.stateSubscription.unsubscribe();
    if (this.guiMarkupSubscription) this.guiMarkupSubscription.unsubscribe();
    if (this.guiMarkupMeasureRealTimeDataSubscription) this.guiMarkupMeasureRealTimeDataSubscription.unsubscribe();
  }
   

}
