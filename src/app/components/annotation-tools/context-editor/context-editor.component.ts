import { Component, OnInit } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { AnnotationToolsService } from '../annotation-tools.service';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { MARKUP_TYPES } from 'src/rxcore/constants';

@Component({
  selector: 'rx-context-editor',
  templateUrl: './context-editor.component.html',
  styleUrls: ['./context-editor.component.scss']
})
export class ContextEditorComponent implements OnInit {

  annotation: any = -1;
  rectangle: any /* = { x: 0, y: 0, w: 0, h: 0 } */;
  visible: boolean = false;
  text: string = '';
  font: any;
  color: string;
  fillOpacity: number = 100;
  strokeThickness: number = 1;
  snap: boolean = false;

  /* ui visibility */
  isTextAreaVisible: boolean = false;
  isFillOpacityVisible: boolean = true;
  isArrowsVisible: boolean = false;
  isThicknessVisible: boolean = false;
  isSnapVisible: boolean = false;
  isBottom: boolean = false;
  style: any;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly colorHelper: ColorHelper) { }

  private _setDefaults(): void {
    this.visible = false;
    this.isTextAreaVisible = false;
    this.isFillOpacityVisible = true;
    this.isArrowsVisible = false;
    this.isThicknessVisible = false;
    this.isSnapVisible = false;
    this.text = '';
    this.font = {
      style: {
          bold: false,
          italic: false
      },
      font: 'Arial',
      size: 18
    };
    this.color = "#000000FF";
    this.strokeThickness = 1;
    this.snap = RXCore.getSnapState();
  }

  private _setVisibility(): void {
    const markup = this.annotation;
    this.isTextAreaVisible = markup?.type == MARKUP_TYPES.TEXT.type || (markup?.type == MARKUP_TYPES.CALLOUT.type && markup?.subtype == MARKUP_TYPES.CALLOUT.subType);

    if (markup.type == MARKUP_TYPES.ARROW.type && markup.subtype < 4) {
      this.isFillOpacityVisible = false;
      this.isArrowsVisible = true;
      this.isThicknessVisible = true;
      this.isSnapVisible = true;
    }

    if (markup.type == MARKUP_TYPES.PAINT.FREEHAND.type && markup.subtype == MARKUP_TYPES.PAINT.FREEHAND.subType) {
      this.isFillOpacityVisible = false;
      this.isThicknessVisible = true;
    }

    if (markup.type == MARKUP_TYPES.PAINT.POLYLINE.type && markup.subtype == MARKUP_TYPES.PAINT.POLYLINE.subType) {
      this.isFillOpacityVisible = false;
      this.isThicknessVisible = true;
    }
  }

  private _setPosition(): void {
    const markup = this.annotation;

    if (markup.type == MARKUP_TYPES.TEXT.type || (markup.type == MARKUP_TYPES.CALLOUT.type && markup.subtype == MARKUP_TYPES.CALLOUT.subType))
      return;

    if (markup.type == MARKUP_TYPES.ARROW.type) {
      this.rectangle = {
        x: ((markup.xscaled + markup.wscaled) / 2) + 82,
        y: markup.yscaled + 48
      };
      return;
    }

    if (markup.type == MARKUP_TYPES.SHAPE.POLYGON.type || (markup.type == MARKUP_TYPES.PAINT.FREEHAND.type && markup.subtype == MARKUP_TYPES.PAINT.FREEHAND.subType)) {
      this.rectangle = {
        x: ((markup.xscaled + markup.wscaled) / 2) + 82,
        y: markup.hscaled + 48,
        h: markup.hscaled,
        w: markup.wscaled
      };
      return;
    }

    this.rectangle = {
      x: markup.xscaled + (markup.wscaled / 2) + 80,
      y: markup.yscaled + markup.hscaled + 60,
      h: markup.hscaled,
      w: markup.wscaled
    };
  }

  ngOnInit(): void {
    this._setDefaults();

    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {


      
      if (markup === -1 || operation.created || operation.deleted) return;
      if (markup.type == MARKUP_TYPES.ERASE.type && markup.subtype == MARKUP_TYPES.ERASE.subType) return;
      if (markup.type == MARKUP_TYPES.COUNT.type) return;
      if (markup.type == MARKUP_TYPES.STAMP.type && markup.subtype == MARKUP_TYPES.STAMP.subType) return;
      if (markup.type == MARKUP_TYPES.MEASURE.LENGTH.type) return;
      if (markup.type == MARKUP_TYPES.MEASURE.AREA.type && markup.subtype == MARKUP_TYPES.MEASURE.AREA.subType) return;
      if (markup.type == MARKUP_TYPES.MEASURE.PATH.type && markup.subtype == MARKUP_TYPES.MEASURE.PATH.subType) return;
      if (markup.type == MARKUP_TYPES.SHAPE.CLOUD.type && markup.subtype == MARKUP_TYPES.SHAPE.CLOUD.subtype) return;
      if (markup.type == MARKUP_TYPES.CALLOUT.type && markup.subtype == MARKUP_TYPES.CALLOUT.subType) return;
      if (markup.type == MARKUP_TYPES.LINK.type) return;

      this._setDefaults();
      this._setPosition();
      this._setVisibility();

      this.text = markup.text;
      this.color = this.colorHelper.rgbToHex(markup.textcolor);
      this.font = {
          style: {
            bold: markup.font.bold,
            italic: markup.font.italic
          },
          font: markup.font.fontName,
          size: markup.font.height
      };
      this.strokeThickness = markup.linewidth;
      this.fillOpacity = markup.transparency;

      const halfW = this.rectangle?.w/2;

      if (operation.created) {
        switch (markup.type) {
          case MARKUP_TYPES.CALLOUT.type:
          case MARKUP_TYPES.ARROW.type:
            if (markup.subtype == MARKUP_TYPES.CALLOUT.subType) {
              this.font.size = 18;
            } else {
              this.showContextEditor('0%', '-103%', '-30%', '-25%', true);
              RXCore.selectMarkUp(true);
            }
            break;

          /* case MARKUP_TYPES.SHAPE.RECTANGLE.type:
            this.showContextEditor(halfW + 'px', -halfW - 280 + 'px', -halfW + 'px', -halfW + 'px');
            RXCore.markUpShape(false, 0);
            RXCore.selectMarkUp(true);
            break;

          case MARKUP_TYPES.SHAPE.ROUNDED_RECTANGLE.type:
            RXCore.markUpShape(false, 0, 1);
            RXCore.selectMarkUp(true);
            break;

          case MARKUP_TYPES.SHAPE.ELLIPSE.type:
            this.showContextEditor(halfW + 'px', -halfW - 280 + 'px', -halfW + 'px', -halfW + 'px');
            RXCore.markUpShape(false, 1);
            RXCore.selectMarkUp(true);
            break;

          case MARKUP_TYPES.SHAPE.CLOUD.type:
            this.showContextEditor(halfW + 'px', -halfW - 280 + 'px', -halfW + 'px', -halfW + 'px');
            RXCore.markUpShape(false, 2);
            RXCore.selectMarkUp(true);
            break;

          case MARKUP_TYPES.SHAPE.POLYGON.type:
            RXCore.markUpShape(false, 3);
            RXCore.selectMarkUp(true);
            break; */
        }

        if (markup.type != MARKUP_TYPES.NOTE.type) {
          this.visible = true;
        }
      }
    });

    this.rxCoreService.guiMarkupUnselect$.subscribe(markup => {
      this.visible = false;
      
    });

    this.rxCoreService.guiTextInput$.subscribe(({rectangle, operation}) => {
      if (operation === -1) return;

      if (operation.start) {
        this._setDefaults();
      }
      

      this.rectangle = { ...rectangle };

      this.showContextEditor('0%', '-103%', '-30%', '-25%');

      if (operation.start) {
        this.rectangle.w = Math.max(rectangle.w, 110);
        this.rectangle.h = Math.max(rectangle.h, 16);
        this.rectangle.x -= this.rectangle.w / 2;
        this.rectangle.y -= this.rectangle.h / 2;
      }

      this.annotationToolsService.hideQuickActionsMenu();
      this.isTextAreaVisible = true;
      this.visible = true;
    });

    this.annotationToolsService.contextPopoverState$.subscribe(state => {
      this.visible = state.visible;
      this.snap = RXCore.getSnapState();
    });
  }

  showContextEditor(right, left, bottom, top, isArrow: boolean = false) {

    isArrow = false;

    const container = document.getElementById('rxcanvas')?.getBoundingClientRect();
    const menu = document.getElementsByClassName('bottom-toolbar-container')[0]?.getBoundingClientRect();
    const block = this.rectangle.y + this.rectangle.h + 360;

    if (container) {
      const containerVerify = container.width < 1300 && this.rectangle.x < menu.x;

      if (isArrow) {
        //this.style = this.rectangle.y + 400 > menu.y 
        this.style = this.rectangle.y - this.rectangle.h - 360 > 0 || block < menu.y 
          ? containerVerify ? { 'transform': `translateX(${bottom})`, 'bottom.px': 10 } : { 'bottom.px': 10 }
          : containerVerify ? { 'transform': `translateX(${top})`,'top.px': 7 } : { 'top.px': 7 };

        this.isBottom = this.style['bottom.px'] === 10;
      } else {
        this.style = this.rectangle.y - this.rectangle.h - 360 > 0 || block < menu.y 
          ? block > menu.y
              ? containerVerify ? { 'transform': `translateX(${bottom})`, 'bottom.px': this.rectangle?.h + 20 } : { 'bottom.px': this.rectangle?.h + 20 } 
              : containerVerify ? { 'transform': `translateX(${top})`,'top.px': 7 } : { 'top.px': 7 }
          : this.rectangle.x < menu.x + 200 
            ? { 'left': '100%', 'transform': `translateX(${right})`, 'top.px': -this.rectangle?.h - 20 }
            : { 'left': '0%', 'transform': `translateX(${left})`, 'top.px': -this.rectangle?.h - 20 }

        this.isBottom = this.style['bottom.px'] === this.rectangle?.h + 20;
      }

      //console.log(this.style);
      //console.log(this.rectangle);

    }
  }

  onTextStyleSelect(font): void {
    this.font = font;
    RXCore.setFontFull(font);
  }

  onColorSelect(color: string): void {
    this.color = color;
    if (this.annotation.type == MARKUP_TYPES.TEXT.type || (this.annotation.type == MARKUP_TYPES.CALLOUT.type && this.annotation.subtype == MARKUP_TYPES.CALLOUT.subType)) {
      RXCore.changeTextColor(color);
    } else if (this.annotation.type == MARKUP_TYPES.PAINT.HIGHLIGHTER.type) {
      RXCore.changeFillColor(color);
      RXCore.markUpFilled();
    } else {
      RXCore.changeStrokeColor(color);
    }
  }

  onFillOpacityChange(): void {
    RXCore.changeTransp(this.fillOpacity);
  }

  onArrowStyleSelect(subtype): void {
    RXCore.markUpSubType(subtype);
  }

  onStrokeThicknessChange(): void {
    RXCore.setLineWidth(this.strokeThickness);
  }

  onSnapChange(onoff: boolean): void {
    RXCore.changeSnapState(onoff);
  }

  onTextChange(): void {
    RXCore.setText(this.text);
  }

}
