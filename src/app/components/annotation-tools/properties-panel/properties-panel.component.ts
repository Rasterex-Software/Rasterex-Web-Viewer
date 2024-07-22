import { Component, OnInit } from '@angular/core';
import { AnnotationToolsService } from '../annotation-tools.service';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { MARKUP_TYPES } from 'src/rxcore/constants';

@Component({
  selector: 'rx-properties-panel',
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent implements OnInit {
  markup: any = -1;
  currentType: number = 0;
  visible: boolean = false;
  title: string;
  mainTabActiveIndex: number = 0;
  propertyTabActiveIndex: number = 0;
  text: string;
  font: any = { style: {}};
  color: string;
  strokeColor: string;
  snap: boolean = false;
  locked : boolean = false;

  //strokeOpacity: number = 100;
  strokeThickness: number = 1;
  strokeLineStyle: number = 0;
  fillOpacity: number = 100;
  fillColor: string;
  displayName: string;
  infoData = {};
  lengthMeasureType: number = 0;
  arrowType: number = 0;

  isMainTabsVisible: boolean = true;
  isPropertyTextVisible: boolean = false;
  isPropertyTabsVisible: boolean = true;
  isPropertyArrowsVisible : boolean = false;
  isFillOpacityVisible: boolean = true;
  isInfoTabVisible: boolean = true;

  placeholder = ['Circle', 'Square', 'Triangle', 'Diamond'];

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly colorHelper: ColorHelper) {}

  _setTitle(): void {
    if (this.markup == -1) {
      this.title = '';
      return;
    }

    if (this.markup.type == MARKUP_TYPES.PAINT.HIGHLIGHTER.type && this.markup.subtype == MARKUP_TYPES.PAINT.HIGHLIGHTER.subType) {
      this.title = "Highlighter";
      return;
    }

    if (this.markup.type == MARKUP_TYPES.PAINT.FREEHAND.type && this.markup.subtype == MARKUP_TYPES.PAINT.FREEHAND.subType) {
      this.title = "Freehand";
      return;
    }

    if (this.markup.type == MARKUP_TYPES.ARROW.type && this.markup.subtype != MARKUP_TYPES.CALLOUT.subType) {
      this.title = "Arrow";
      return;
    }


    switch(this.markup.type) {
      case MARKUP_TYPES.TEXT.type:
        this.title = "Text";
        break;

      case MARKUP_TYPES.CALLOUT.type:
        this.title = "Callout";
        break;

      case MARKUP_TYPES.SHAPE.RECTANGLE.type:
        this.title = "Rectangle";
        break;
      case MARKUP_TYPES.SHAPE.ROUNDED_RECTANGLE.type:
        this.title = "Rouned Rectangle";
        break;

      case MARKUP_TYPES.SHAPE.ELLIPSE.type:
        this.title = "Ellipse";
        break;

      case MARKUP_TYPES.SHAPE.CLOUD.type:
        this.title = "Cloud";
        break;

      case MARKUP_TYPES.SHAPE.POLYGON.type:

        switch(this.markup.subtype) {
          case MARKUP_TYPES.MEASURE.PATH.subType:
            this.title = "Measure Path";
            break;
          default:
            this.title = "Polygon";
            break;
        }
        break;


        //this.title = "Polygon";
        //break;

      case MARKUP_TYPES.PAINT.POLYLINE.type:
        this.title = "Poly line";
        break;


      case MARKUP_TYPES.MEASURE.PATH.type:
        switch(this.markup.subtype) {
          case MARKUP_TYPES.MEASURE.PATH.subType:
            this.title = "Measure";
            break;
          default:
            this.title = "Shape";
            break;
        }
        break;

      case MARKUP_TYPES.MEASURE.AREA.type:
        this.title = "Area";
        break;
      case MARKUP_TYPES.ARROW.type:
          this.title = "Arrow";
          break;
      case MARKUP_TYPES.MEASURE.LENGTH.type:
        this.title = "Dimension";
        break;

      case MARKUP_TYPES.COUNT.type:
        this.title = "Count";
        break;

      case MARKUP_TYPES.STAMP.type:
        this.title = "Stamp info";
        break;

      default:
        this.title = '';
        break;
    }
  }

  _setVisibility(): void {
    this.mainTabActiveIndex = 0;
    this.isMainTabsVisible = true;
    this.isPropertyTextVisible = false;
    this.isPropertyTabsVisible = true;
    this.isFillOpacityVisible = true;
    this.isPropertyArrowsVisible = false;

    if (this.markup.type == MARKUP_TYPES.ARROW.type ) {
      //this.isFillOpacityVisible = false;
      this.isPropertyTextVisible = false;
      this.isPropertyTabsVisible = false;
      this.propertyTabActiveIndex = 1;
      this.isPropertyArrowsVisible = true;

    }else if
    (this.markup.type == MARKUP_TYPES.PAINT.HIGHLIGHTER.type && this.markup.subtype == MARKUP_TYPES.PAINT.HIGHLIGHTER.subType) {
      this.propertyTabActiveIndex = 2;
      this.isPropertyTabsVisible = false;
    } else if (this.markup.type == MARKUP_TYPES.PAINT.FREEHAND.type && this.markup.subtype == MARKUP_TYPES.PAINT.FREEHAND.subType) {
      this.propertyTabActiveIndex = 1;
      this.isPropertyTabsVisible = false;
    } else if (
      (this.markup.type == MARKUP_TYPES.PAINT.POLYLINE.type && this.markup.subtype == MARKUP_TYPES.PAINT.POLYLINE.subType)
      || (this.markup.type == MARKUP_TYPES.MEASURE.PATH.type && this.markup.subtype == MARKUP_TYPES.MEASURE.PATH.subType)
      || (this.markup.type == MARKUP_TYPES.MEASURE.LENGTH.type)) {
      this.propertyTabActiveIndex = 1;
      this.isPropertyTabsVisible = false;
    }  else if (this.markup.type == MARKUP_TYPES.COUNT.type) {
      this.propertyTabActiveIndex = 2;
      this.isPropertyTabsVisible = this.isFillOpacityVisible = false;
    } else if (this.markup.type == MARKUP_TYPES.STAMP.type) {
      this.mainTabActiveIndex = 1;
      this.isMainTabsVisible = false;
    } else {
      this.isPropertyTabsVisible = true;
      if (this.markup.type == MARKUP_TYPES.TEXT.type || this.markup.type == MARKUP_TYPES.CALLOUT.type) {
        this.isPropertyTextVisible = true;
        this.propertyTabActiveIndex = 0;
      } else {
        this.isPropertyTextVisible = false;
        this.propertyTabActiveIndex = 1;
      }
    }

    console.log(this.isFillOpacityVisible);
  }

  ngOnInit(): void {
    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
      this.markup = markup;

      if (
        markup === -1
        || operation.deleted
        //|| markup.type == MARKUP_TYPES.ARROW.type
        //|| markup.type == MARKUP_TYPES.MEASURE.LENGTH.type
        //|| markup.type == MARKUP_TYPES.MEASURE.PATH.type && markup.subtype == MARKUP_TYPES.MEASURE.PATH.subType
        ) {
        this.visible = false;
        return;
      }
      
      this.currentType = markup.type;
      this.locked = markup.locked;


      //|| markup.type == MARKUP_TYPES.MEASURE.AREA.type && markup.subtype == MARKUP_TYPES.MEASURE.AREA.subType

      this._setVisibility();
      //this._setTitle();

      this.title = this.markup.getMarkupType().label;

      this.snap = RXCore.getSnapState();

      this.text = markup.text;
      this.font = {
        style: {
            bold: markup.font.bold,
            italic: markup.font.italic
        },
        font: markup.font.fontName,
        size: markup.font.height
      };
      this.color = this.colorHelper.rgbToHex(markup.textcolor);
      this.strokeColor = this.colorHelper.rgbToHex(markup.strokecolor);
      this.strokeThickness = markup.linewidth;
      this.strokeLineStyle = markup.linestyle;
      this.fillColor = this.colorHelper.hexToRgba(this.colorHelper.rgbToHex(markup.fillcolor), 100);
      this.fillOpacity = markup.transparency;
      this.displayName = markup.GetAttributes()?.find(a => a.name == 'displayName')?.value;
      this.lengthMeasureType = markup.subtype;

      this.infoData = {
        'Type:': (markup as any).getMarkupType().label,
        'Author:': RXCore.getDisplayName(markup.signature),
        'Time:': (markup as any).GetDateTime(true),
        'Page:': Number(markup.pagenumber) + 1,
        'Layer:': markup.layer,
        'GUID' : markup.uniqueID
      };

      if (markup.type == MARKUP_TYPES.COUNT.type) {
        this.infoData['Count'] = (markup as any).getcount();
      }
    });

    

    this.annotationToolsService.propertiesPanelState$.subscribe(state => {
      this.visible = state?.visible;
      this.markup = state?.markup;

      if(this.markup){

        this.markup.subtype = this.markup.subType;
        this.currentType = this.markup.type;

        this._setVisibility();
        this.isMainTabsVisible = false;
        this._setTitle();
  
        this.snap = RXCore.getSnapState();

        this.color = RXCore.getLineColor();
        this.strokeColor = RXCore.getLineColor();

        
        this.fillColor = this.colorHelper.hexToRgba(this.colorHelper.rgbToHex(RXCore.getFillColor()), 100);
        this.fillOpacity = 100;
  
        
        this.strokeThickness = RXCore.getLineWidth();
        this.strokeLineStyle = 0;
        this.lengthMeasureType = 0;
        this.lengthMeasureType = this.markup.subtype;
    
      }
        
      


    });
  }

  onTextChange(event): void {
    this.text = event.target.value;
    RXCore.setText(String(this.text));
    RXCore.setFontFull(this.font);
  }

  onTextStyleSelect(font): void {
    this.font = font;
    RXCore.setFontFull(font);
  }

  onColorSelect(color: string): void {
    this.color = color;
    RXCore.changeTextColor(color);
  }

 /*  onStrokeOpacityChange(): void {
    console.log(this.strokeOpacity);
  } */

  onStrokeThicknessChange(): void {
    RXCore.setLineWidth(this.strokeThickness);
  }

  onStrokeLineStyleSelect(lineStyle: number): void {
    this.strokeLineStyle = lineStyle;
    RXCore.setLineStyle(lineStyle);
  }

  onStrokeColorSelect(color: string): void {
    this.strokeColor = color;
    RXCore.changeStrokeColor(color);
  }

  onFillOpacityChange(): void {
    RXCore.changeTransp(this.fillOpacity);
  }

  onFillColorSelect(color: string): void {
    this.fillColor = color;
    RXCore.changeFillColor(color);
    RXCore.markUpFilled();

    let selectedMarkup = RXCore.getSelectedMarkup();
 
    if((selectedMarkup.type === MARKUP_TYPES.SHAPE.RECTANGLE.type || 
      selectedMarkup.type === MARKUP_TYPES.MEASURE.AREA.type) && 
      (selectedMarkup as any).holes && 
      (selectedMarkup as any).holes.length) {
        this.fillOpacity = 35;
        RXCore.changeTransp(this.fillOpacity);
    }
  }

  onCountTypeChange(type: number): void {
    RXCore.markUpSubType(type);
  }

  onDisplayNameChange(value: string): void {
    this.markup.updateAttribute('displayName', value);
  }

  onLengthMeasureTypeChange(type: number): void {
    this.lengthMeasureType = type;
    RXCore.markUpSubType(type);
  }

  onArrowStyleSelect(type: number): void {
    this.arrowType = type;
    RXCore.markUpSubType(type);
  }


  onSnapChange(onoff: boolean): void {
    RXCore.changeSnapState(onoff);
  }

  onLockChange(onoff: boolean): void {
    //RXCore.changeSnapState(onoff);
    let mrkUp = RXCore.getSelectedMarkup();
    mrkUp.locked = onoff;
  }

  

  onClose(): void {
    this.visible = false;
    RXCore.selectMarkUp(false);
  }
}
