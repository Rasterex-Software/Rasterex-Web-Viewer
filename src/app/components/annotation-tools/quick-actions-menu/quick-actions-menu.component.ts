import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { AnnotationToolsService } from '../annotation-tools.service';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { NotificationService } from '../../notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'rx-quick-actions-menu',
  templateUrl: './quick-actions-menu.component.html',
  styleUrls: ['./quick-actions-menu.component.scss']
})
export class QuickActionsMenuComponent implements OnInit, OnDestroy {
  guiMode$ = this.rxCoreService.guiMode$;
  private guiMarkupSubscription: Subscription;
  private guiMarkupHoverSubscription: Subscription;
  private quickActionsMenuVisibleSubscription: Subscription;
  private guiOnResizeSubscription: Subscription;

  private x: number;
  private y: number;

  visible = false;
  annotation: any = -1;
  operation: any = undefined;
  rectangle: any;
  confirmDeleteOpened: boolean = false;
  menuwidth: number = 126;
  menucenter : number = 0;
  buttongap : number = 10;
  buttonsize : number = 28;
  numbuttons : number = 4;
  topgap : number = 16;
  addLink: boolean = false;
  followLink: boolean = false;
  message: string = 'Add link';
  snap: boolean = false;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly notificationService: NotificationService) {}

  private _setPosition(): void {
    const markup = this.annotation;
    const yoffset = 20;
    const rotoffset = -30;

    const wscaled = (markup.wscaled || markup.w) / window.devicePixelRatio;
    const hscaled = (markup.hscaled || markup.h) / window.devicePixelRatio;
    const xscaled = (markup.xscaled || markup.x) / window.devicePixelRatio;
    const yscaled = (markup.yscaled || markup.y) / window.devicePixelRatio;

    let _dx = window == top ? - 82 : 0;

    //let _dx = window == top ? 0 : 0;
    let _dy = window == top ? -0 : -48;

    let dx = 0 + _dx;
    let dy = -10 + _dy;

    switch (markup.type) {
      case MARKUP_TYPES.COUNT.type: {
        let p = this.operation.created ? markup.countshapes[markup.countshapes.length - 1] : { x: this.x, y: this.y };
        for (let point of markup.countshapes) {
          if (Math.abs(point.x- this.x) + Math.abs(point.y - this.y) <= 20) {
            p = point;
          }
        }
        this.rectangle = {
          x: (p.x / window.devicePixelRatio) - 5,
          y: (p.y / window.devicePixelRatio) - 20,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
      }
      case MARKUP_TYPES.SHAPE.POLYGON.type:
      case MARKUP_TYPES.PAINT.POLYLINE.type:
      case MARKUP_TYPES.MEASURE.PATH.type:
      case MARKUP_TYPES.MEASURE.AREA.type: {
        let p = markup.points[0];
        for (let point of markup.points) {
          if (point.y < p.y) {
            p = point;
          }
        }

        let topcenterx = xscaled + ((wscaled - xscaled) * 0.5);
        let topcentery = yscaled;
        
        this.numbuttons = (markup.subtype == MARKUP_TYPES.SHAPE.POLYGON.subType ? 4 : 3);
        this.menuwidth = (this.buttonsize * this.numbuttons) + (this.buttongap * (this.numbuttons + 1));
        this.menucenter = this.menuwidth * 0.5; 

        //buttongap : number = 10;
        //buttonsize : number = 28;

        this.rectangle = {
          //x: (p.x / window.devicePixelRatio) - (markup.subtype == MARKUP_TYPES.SHAPE.POLYGON.subType ? 26 : 4),
          x : topcenterx - this.menucenter,
          //y: (p.y / window.devicePixelRatio) - 16,
          y: topcentery - this.topgap,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
      }
      case MARKUP_TYPES.NOTE.type:

      this.numbuttons = 3;
      this.menuwidth = (this.buttonsize * this.numbuttons) + (this.buttongap * (this.numbuttons + 1));
      this.menucenter = this.menuwidth * 0.5; 

        //dx = (wscaled / 2) - 5 + _dx;

        dx = (wscaled / 2) - this.menucenter;

        dy = -10 + _dy;
        this.rectangle = {
          x: xscaled + dx,
          y: yscaled + dy,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
      case MARKUP_TYPES.ERASE.type:
        dx = ((wscaled - xscaled) / 2) - 5 + _dx;
        this.rectangle = {
          x: xscaled + dx,
          y: yscaled + dy,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
      case MARKUP_TYPES.ARROW.type:
        dx = -26 + _dx;
        this.rectangle = {
          x: xscaled + dx,
          y: yscaled + dy,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
      case MARKUP_TYPES.MEASURE.LENGTH.type:
        this.rectangle = {
          x: xscaled - 5,
          y: yscaled - 5,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
        case MARKUP_TYPES.LINK:
          this.numbuttons = 2;
          this.rectangle = {
            x: xscaled - 5,
            y: yscaled - 5,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - yoffset,
          };
          break;
      default:

      this.numbuttons = 4;
      this.menuwidth = (this.buttonsize * this.numbuttons) + (this.buttongap * (this.numbuttons + 1));
      this.menucenter = this.menuwidth * 0.5;


        //dx = (wscaled / 2) - 24 + _dx;
        dx = (wscaled / 2) - this.menucenter;
        
        this.rectangle = {
          x: xscaled + dx,
          y: (yscaled + dy) + rotoffset,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
    }

    if (this.rectangle.y < 0) {
      this.rectangle.y += hscaled + 72;
      this.rectangle.position = "bottom";
    } else {
      this.rectangle.position = "top";
    }

    if (this.rectangle.x < 0) {
      this.rectangle.x = 0;
    }

    if (this.rectangle.x > document.body.offsetWidth - 200) {
      this.rectangle.x = document.body.offsetWidth - 200;
    }
  }

  ngOnInit(): void {
    this.guiMarkupSubscription = this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
      this.visible = false;
      this.annotation = markup;
      this.operation = operation;
      this.snap = RXCore.getSnapState();

      if (operation.deleted) return;

      if (
        markup === -1
        || markup.type == MARKUP_TYPES.CALLOUT.type && markup.subtype == MARKUP_TYPES.CALLOUT.subType
        || markup.type == MARKUP_TYPES.SIGNATURE.type && markup.subtype == MARKUP_TYPES.SIGNATURE.subType
        || markup.GetAttribute("Signature")?.value
        ) return;

      this._setPosition();

      this.visible = true;
    });

    this.quickActionsMenuVisibleSubscription = this.annotationToolsService.quickActionsMenuVisible$.subscribe((visibility: boolean) => {
      this.visible = visibility;
      this._setPosition();
    });

    this.guiOnResizeSubscription = this.rxCoreService.guiOnResize$.subscribe(() => {
      if (this.visible) {
        this._setPosition();
      }
    });

    this.guiMarkupHoverSubscription = this.rxCoreService.guiMarkupHover$.subscribe(({markup, x, y}) => {
      if (markup?.type == MARKUP_TYPES.COUNT.type) {
        this.x = x;
        this.y = y;
      } else {
        this.x = this.y = 0;
      }
    });

    this.rxCoreService.guiOnMarkupChanged.subscribe(({annotation, operation}) => {
      this.visible = false;
    });
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (this.annotation !== -1) {
      //this._setPosition();
      //this.visible = true;
    }
  }

  ngOnDestroy(): void {
    if (this.guiMarkupSubscription) this.guiMarkupSubscription.unsubscribe();
    if (this.quickActionsMenuVisibleSubscription) this.quickActionsMenuVisibleSubscription.unsubscribe();
    if (this.guiOnResizeSubscription) this.guiOnResizeSubscription.unsubscribe();
    if (this.guiMarkupHoverSubscription) this.guiMarkupHoverSubscription.unsubscribe();
  }

  onEditClick(): void {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }

    switch(this.annotation.type) {
      case MARKUP_TYPES.NOTE.type:
        this.annotationToolsService.setNotePopoverState({ visible : true, markup: this.annotation });
        break;
      case MARKUP_TYPES.ERASE.type:
        if (this.annotation.subtype == MARKUP_TYPES.ERASE.subType) {
          this.annotationToolsService.setErasePanelState({ visible: true });
        } else {
          this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        }
        break;
      case MARKUP_TYPES.ARROW.type:
        if(this.annotation.subType != MARKUP_TYPES.CALLOUT.subType) {
          //this.annotationToolsService.setContextPopoverState({ visible : true });
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }
        break;
      case MARKUP_TYPES.MEASURE.LENGTH.type:
        this.annotationToolsService.setPropertiesPanelState({ visible : true });
        break;
      case MARKUP_TYPES.MEASURE.AREA.type:
        if (this.annotation.subtype == MARKUP_TYPES.MEASURE.AREA.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }
        break;
      case MARKUP_TYPES.MEASURE.PATH.type:
      case MARKUP_TYPES.PAINT.POLYLINE.type:
        if (this.annotation.subtype == MARKUP_TYPES.MEASURE.PATH.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }
        if (this.annotation.subtype == MARKUP_TYPES.PAINT.POLYLINE.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        }
        if (this.annotation.subtype == MARKUP_TYPES.SHAPE.POLYGON.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        }

        break;
      default:
        this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        break;
    }

    this.visible = false;
  }

  saveLink(): void {
    this.addLink = false;
    this.annotation.setLink(this.annotation.linkURL === '' ? ' ' : this.annotation.linkURL, this.annotation.linkURL !== '');
    RXCore.markUpSave();
  }

  onSnapClick(): void {
    this.snap = !this.snap;
    RXCore.changeSnapState(this.snap);
  }

  copyMarkUp(): void  {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.notificationService.notification({message: 'Markup successfully copied.', type: 'info'});
    RXCore.copyMarkUp();
  }

  onInfoClick(): void {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
    this.visible = false;
  }

  onNoteClick(): void {
    RXCore.markUpNote(true);
    //this.annotationToolsService.setNotePanelState({ visible: true, markupnumber: this.annotation.markupnumber });
    /*setTimeout(() => {
      RXCore.doResize(0, 0);
    }, 100);*/

    this.visible = false;
  }

  onDeleteClick(): void {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.confirmDeleteOpened = true;
    this.visible = false;
  }
  onInsertClick(): void {
    if(this.annotation.type === MARKUP_TYPES.SHAPE.RECTANGLE.type) {
      RXCore.markupRectToAreaSwitch(this.annotation);
    }    
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
 
    RXCore.insertPoint();
    this.visible = false;
  }

  onShowHideLabelClick(): void {    
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    if(!this.annotation.hidevaluelabel) {
      this.annotation.hidelabelmarkupobj();
    }
    else {
      this.annotation.showlabelmarkupobj();
    }
    RXCore.markUpRedraw();
    this.visible = false;
  }
 
  onHoleClick(): void { 
    if(this.annotation.type === MARKUP_TYPES.SHAPE.RECTANGLE.type) {
      RXCore.markupRectToAreaSwitch(this.annotation);
    }   
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.annotationToolsService.setMeasurePanelDetailState({ visible: true, type: MARKUP_TYPES.MEASURE.AREA.type, created: true });
    //RXCore.markUpArea(true, this.annotation.markupnumber);
    RXCore.markUpAreaHole(true);

    this.visible = false;
  }

  onRedirectClick(): void {
    if (this.annotation.linkURL !== '') {
      window.open(this.annotation.linkURL, '_blank');
    }
  }

}
