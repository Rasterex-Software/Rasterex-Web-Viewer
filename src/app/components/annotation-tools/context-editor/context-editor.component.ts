import { Component, OnInit } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { AnnotationToolsService } from '../annotation-tools.service';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { ElementRef, ViewChild } from '@angular/core';

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

  textTransform: any = {};
  

  /* ui visibility */
  isTextAreaVisible: boolean = false;
  isFillOpacityVisible: boolean = true;
  isArrowsVisible: boolean = false;
  isThicknessVisible: boolean = false;
  isSnapVisible: boolean = false;
  isBottom: boolean = false;
  style: any;

  @ViewChild('textinput', { static: false }) textSpan!: ElementRef<HTMLSpanElement>;
  @ViewChild('wrapper',   { static: false }) wrapper!: ElementRef<HTMLDivElement>;

  
  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly colorHelper: ColorHelper
    ) { }

  private _setDefaults(): void {
    this.visible = false;
    this.isTextAreaVisible = false;
    this.isFillOpacityVisible = true;
    this.isArrowsVisible = false;
    this.isThicknessVisible = false;
    this.isSnapVisible = false;
    this.text = '';

    this.font = this.getNormalizedFont(this.annotation);


    this.color = "#000000FF";
    this.strokeThickness = 1;
    this.snap = RXCore.getSnapState();
  }

  private startWidthPx = 0; // lock initial width for wrapping

  
  private getNormalizedFont(raw: any): any {
    if (!raw) return {
      font: 'Arial',
      size: 18,
      scale: 1,
      scalepx: 1,
      style: { bold: false, italic: false }
    };
  
    const pixelRatio = window.devicePixelRatio || 1;
    const baseScale = raw.scale ?? 1;
    const scalepx = baseScale / pixelRatio;
  
    return {
      font: raw.font || raw.fontName || 'Arial',
      size: raw.size || raw.height || 18,
      scale: baseScale,
      scalepx,
      style: {
        bold: !!raw.style?.bold || !!raw.bold,
        italic: !!raw.style?.italic || !!raw.italic
      }
    };
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


  private applyTransform(rect: any): void {
    if (!rect) return;
    this.textTransform = {
      transform: 'none',
      'transform-origin': 'top left'
    };
  }

  private adjustTextBoxSize(): void {
    const span = this.textSpan?.nativeElement;
    const wrap = this.wrapper?.nativeElement;
    if (!span || !wrap) return;
  
    span.style.width = '100%';
    span.style.height = 'auto';
    const contentHeight = Math.ceil(span.scrollHeight);
  
    const currentHeight = this.rectangle.h || 0;
    const newHeight = Math.max(contentHeight, currentHeight); // never shrink
  
    // Only grow the box if content exceeds current height
    if (newHeight > currentHeight) {
      wrap.style.height = `${newHeight}px`;
      this.rectangle.h = newHeight;
  
      const pr = window.devicePixelRatio || 1;
      const wForCore = Math.round((this.rectangle.w || this.startWidthPx) * pr);
      const hForCore = Math.round(newHeight * pr);
  
      if (typeof (RXCore as any).setTextboxSize === 'function') {
        (RXCore as any).setTextboxSize(wForCore, hForCore);
        (RXCore as any).markUpRedraw?.();
      } else {
        const annotation = (RXCore as any).getTextMarkup?.();
        if (annotation?.setTextboxSize) {
          annotation.setTextboxSize(wForCore, hForCore);
          (RXCore as any).markUpRedraw?.();
        }
      }
    }
  }

  private placeCaretAtEnd(el: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  private sizeRaf: number | null = null;

  private scheduleAdjust() {
    if (this.sizeRaf) cancelAnimationFrame(this.sizeRaf);
    this.sizeRaf = requestAnimationFrame(() => {
      this.sizeRaf = null;
      this.adjustTextBoxSize();
    });
  }

  ngOnInit(): void {
    this._setDefaults();

    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {


      
      if (markup === -1 || operation.deleted || operation.created) return;
      if (markup.type == MARKUP_TYPES.ERASE.type && markup.subtype == MARKUP_TYPES.ERASE.subType) return;
      if (markup.type == MARKUP_TYPES.COUNT.type) return;
      if (markup.type == MARKUP_TYPES.STAMP.type && markup.subtype == MARKUP_TYPES.STAMP.subType) return;
      if (markup.type == MARKUP_TYPES.MEASURE.LENGTH.type) return;
      if (markup.type == MARKUP_TYPES.MEASURE.AREA.type && markup.subtype == MARKUP_TYPES.MEASURE.AREA.subType) return;
      if (markup.type == MARKUP_TYPES.MEASURE.PATH.type && markup.subtype == MARKUP_TYPES.MEASURE.PATH.subType) return;
      if (markup.type == MARKUP_TYPES.SHAPE.CLOUD.type && markup.subtype == MARKUP_TYPES.SHAPE.CLOUD.subtype) return;
      if (markup.type == MARKUP_TYPES.CALLOUT.type && markup.subtype == MARKUP_TYPES.CALLOUT.subType) return;
      if (markup.type == MARKUP_TYPES.LINK.type) return;


      this.annotation = markup; // <-- make sure this is set

      this._setDefaults();
      this._setPosition();
      this._setVisibility();

      this.text = markup.text;


      try {
        this.color = this.colorHelper.rgbToHex(markup.textcolor);
      } catch (error) {
        this.color = "#FF0000";
      } 
        
      

      
      this.font = this.getNormalizedFont(markup.font);

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

      this.startWidthPx = Math.max(this.rectangle?.w || 150, 110);

      // ensure initial DOM exists, then sync sizes once
      this.scheduleAdjust();

      this.applyTransform(rectangle);

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


      // ensure DOM is painted, then seed content, size, and focus
      requestAnimationFrame(() => {
        const el = this.textSpan?.nativeElement;
        if (!el) return;
        el.innerText = this.text || '';
        this.adjustTextBoxSize();   // sync initial height
        el.focus();
        this.placeCaretAtEnd(el);   // optional, keeps caret at end
      });

    });

    this.annotationToolsService.contextPopoverState$.subscribe(state => {
      this.visible = state.visible;
      this.snap = RXCore.getSnapState();
    });
  }

  /*adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    var ratio = (this.rectangle.h / this.rectangle.w).toFixed(6);
    RXCore.adjustTextAnnotationHeight(textarea.offsetWidth, textarea.scrollHeight, ratio);


  }*/

  

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
    // Rebuild full font object using normalization logic
    this.font = this.getNormalizedFont(font);

    // Inform RXCore of the updated font
    RXCore.setFontFull(this.font);

    // Reschedule layout adjustment for new font size
    this.scheduleAdjust();  
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


  getTextStyle() {
    const fs = this.font; // your active font object (from RxCore or markup)
    const fixedScale = (RXCore as any).getFixedScale?.() || 1;
  
    // --- replicate old AngularJS scaling logic ---
    // No pixel ratio division here, because CSS 'pt' is already device-independent
    let textSizePt: number;
  
    if (fixedScale === 1) {
      // Fixed scale applied only when scale == 1
      textSizePt = Math.round(fs.size * fs.scalepx * fixedScale);
    } else {
      textSizePt = Math.round(fs.size * fs.scalepx);
    }
  
    // --- return a style object equivalent to the old textRectStyle ---
    return {
      // Use 'pt' to match legacy visual size (RXCore renders in points)
      'font-size.pt': textSizePt,
      'line-height.pt': textSizePt,
  
      // Font family and style
      'font-family': fs.font || 'Arial',
      'font-weight': fs.style?.bold ? 'bold' : 'normal',
      'font-style': fs.style?.italic ? 'italic' : 'normal',
  
      // Color from current annotation / markup
      'color': this.color || '#A52A2A',
  
      // Layout and behavior
      display: 'block',
      width: '100%',
      height: 'auto',
      'white-space': 'pre-wrap',
      'word-break': 'break-word',
      'background-color': 'transparent',
      'box-sizing': 'border-box',
      'overflow': 'hidden', // clip overflowed text (no scroll)
      outline: 'none',
      cursor: 'text',
    };
  }

  

  

  onSpanInput(event: Event) {
    const span = event.target as HTMLSpanElement;
    this.text = span.innerText;
    RXCore.setText(this.text);
    this.scheduleAdjust();  // instead of calling adjust directly
  }  

/*onSpanInput(event: Event) {
    const span = event.target as HTMLSpanElement;
    this.text = span.innerText;
  
    // Sync text back to model
    RXCore.setText(this.text);
  
    // Get current annotation
    const annotation = RXCore.getTextMarkup?.();
    if (!annotation) return;
  
    // Measure actual rendered size of the contenteditable span
    const pixelRatio = window.devicePixelRatio || 1;
    const scrollHeight = span.scrollHeight * pixelRatio;
    const scrollWidth = span.scrollWidth * pixelRatio;
  
    // Update annotation rectangle in RXCore
    annotation.setTextboxSize(scrollWidth, scrollHeight);
  
    // Request redraw
    RXCore.markUpRedraw?.();
  } */ 
  
  
  onSpanBlur(event: Event) {
    // Finalize text update when user leaves edit mode
    RXCore.setText(this.text);
  }

  

  getCombinedStyle() {
    const width = this.rectangle?.w || 100;
    const height = this.rectangle?.h || 20;
  
    return {
      position: 'absolute',
      top: '0px',
      left: '0px',
  
      // Fixed dimensions for editing
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      maxWidth: `${width}px`,
      minHeight: `${height}px`,
  
      // Clip any overflowing text (no scroll)
      overflow: 'hidden',
      background: '#fff',
      boxSizing: 'content-box',
    };
  }  

}
