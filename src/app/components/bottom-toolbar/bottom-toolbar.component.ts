import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { BottomToolbarService, IBottomToolbarState } from './bottom-toolbar.service';
import { CompareService } from '../compare/compare.service';
import { TooltipService } from '../tooltip/tooltip.service';

@Component({
  selector: 'rx-bottom-toolbar',
  templateUrl: './bottom-toolbar.component.html',
  styleUrls: ['./bottom-toolbar.component.scss']
})
export class BottomToolbarComponent implements OnInit, AfterViewInit {
  @ViewChild('birdseyeImage', { static: false }) birdseyeImage : ElementRef;
  @ViewChild('birdseyeIndicator', { static: false }) birdseyeIndicator : ElementRef;
  @ViewChild('birdseyeMarkup', { static: false }) birdseyeMarkup : ElementRef;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Input() lists: Array<any> = [];

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly service: BottomToolbarService,
    private readonly tooltipService: TooltipService,
    private readonly compareService: CompareService) { }

  guiConfig$ = this.rxCoreService.guiConfig$;
  guiState$ = this.rxCoreService.guiState$;
  guiMode$ = this.rxCoreService.guiMode$;

  currentpage: number = 1;
  numpages: number = 1;
  distance3dValue: number = 0;
  transparent3dValue: number = 100;
  clippingXValue: number = 0;
  clippingYValue: number = 0;
  clippingZValue: number = 0;
  beWidth: number = 350;
  beHeight: number = 269;
  searchString: string | undefined  = undefined;
  searchNumMatches: number = 0;
  searchCaseSensitive: boolean = false;
  searchCurrentMatch: number = 0;
  isVisible: boolean = true;
  grayscaleValue: number = 3;

  state: IBottomToolbarState = { isActionSelected: {}};
  private _deselectAllActions(): void {
    Object.entries(this.state.isActionSelected).forEach(([key, value]) => {


      /* todo BIRDSEYE
        turn off all actions except BIRDSEYE
        if(action != 'BIRDSEYE'){
          
      }*/

      //these should be state on until turned off.

      let skipstate = (
      key == "BIRDSEYE" || 
      key == "HIDE_MARKUPS" || 
      key == "MONOCHROME" || 
      key == "MAGNIFY" || 
      key == "SEARCH_TEXT" || 
      key == "SELECT_TEXT" ||
      key == "VECTORINFO"
      )

      if(!skipstate){
        this.state.isActionSelected[key] = false;
      }

      
    });
  }

  ngOnInit(): void {
    this.service.state$.subscribe((state: IBottomToolbarState) => {
      this.state = state;
      this.setBirdseyeCanvas();
      Object.entries(this.state.isActionSelected).forEach(([key, value]) => {
        if (this.state.isActionSelected[key]) {
          this.state.isActionSelected[key] = false;
          this.onActionSelect(key);
        }
      });
    });

  }

  

  ngAfterViewInit(): void {
    this.rxCoreService.guiPage$.subscribe((state) => {
      this.currentpage = state.currentpage + 1;
      this.numpages = state.numpages;
      setTimeout(() => {
        this.setBirdseyeCanvas();
      }, 100);
    });

    RXCore.onGuiBirdseye((pagenumber, thumbnail) => {
      this.onBirdseyeThumbnailReceived(pagenumber, thumbnail);
    });

    RXCore.onGuiNumMathces((nummatches) => {
      this.searchNumMatches = nummatches;
      this.searchCurrentMatch = this.searchNumMatches > 0 ? 1 : 0;
    });

    RXCore.onGuiZoomUpdate((zoomparams, type) => {

      if(type == 2){
        this.state.isActionSelected["ZOOM_WINDOW"] = false;
        RXCore.restoreDefault();
      }

    });


  }

  onPreviousPage() {
    if (this.currentpage > 1) {
      this.currentpage--;
      RXCore.gotoPage(this.currentpage - 1);
    }
  }

  onNextPage() {
    if (this.currentpage < this.numpages) {
      this.currentpage++;
      RXCore.gotoPage(this.currentpage - 1);
    }
  }

  onCurrentPageChange(value) {
    const n = Number(value);
    if (n && n >= 1 && n <= this.numpages) {
      this.currentpage = n;
      RXCore.gotoPage(this.currentpage - 1);
    }
  }

  onActionSelect(action) {
    RXCore.hideTextInput();
    RXCore.unSelectAllMarkup();
    this.rxCoreService.setGuiMarkup(-1, -1);
    const selected = this.state.isActionSelected[action];

    this._deselectAllActions();

    this.rxCoreService.setSelectedVectorBlock(undefined);
    RXCore.getBlockInsert(false);
    RXCore.markUpRedraw();

    
    this.state.isActionSelected[action] = !selected;
    //this.service.setState(this.state);

    switch (action) {
      case 'MAGNIFY':
        this.state.isActionSelected["ZOOM_WINDOW"] = false;
        RXCore.magnifyGlass(this.state.isActionSelected[action]);
        break;
      case 'VECTORINFO':
          this.state.isActionSelected["ZOOM_WINDOW"] = false;
          this.state.isActionSelected["BLOCKINFO"] = false;
          RXCore.blockhoverevent(this.state.isActionSelected[action]);
          RXCore.getVectorEntity(this.state.isActionSelected[action]);
          break;
      case 'BLOCKINFO':
        this.state.isActionSelected["ZOOM_WINDOW"] = false;
        this.state.isActionSelected["VECTORINFO"] = false;
        RXCore.getBlockInsert(this.state.isActionSelected[action]);
        break;
  
      case 'ZOOM_IN':
        RXCore.zoomIn();
        break;
      case 'ZOOM_OUT':
        RXCore.zoomOut();
        break;
      case 'FIT_WIDTH':
        RXCore.zoomWidth();
        break;
      case 'FIT_HEIGHT':
        RXCore.zoomHeight();
        break;
      case 'ZOOM_WINDOW':
        this.state.isActionSelected["MAGNIFY"] = false;
        RXCore.zoomWindow(this.state.isActionSelected[action]);
        break;
      case 'FIT_TO_WINDOW':
        RXCore.zoomFit();
        break;
      case 'ROTATE':
        RXCore.rotate(true, '');
        break;
      case 'HIDE_MARKUPS':
        if (this.lists?.length > 0) {
          this.isVisible = !this.isVisible;
          this.isVisibleChange.emit(this.isVisible);
          RXCore.hideMarkUp();
        }
        break;
      case 'BACKGROUND':
        RXCore.toggleBackground();
        this.state.isActionSelected[action] = false;

        break;
      case 'MONOCHROME':
        RXCore.setMonoChrome(this.state.isActionSelected[action]);
        break;
      case '3D_SELECT':
        this.state.isActionSelected["3D_SELECT_MARKUP"] = false;
        RXCore.select3D(this.state.isActionSelected[action]);
        break;
      case '3D_SELECT_MARKUP':
        this.state.isActionSelected["3D_SELECT"] = false;
        RXCore.select3DMarkup(this.state.isActionSelected[action]);
        break;
      case 'WALKTHROUGH':
        RXCore.walkThrough3D(this.state.isActionSelected[action]);
        break;
      case 'HIDE_3D_PARTS':
        RXCore.toggle3DVisible(this.state.isActionSelected[action]);
        break;
      case 'RESET_3D_MODEL':
        RXCore.reset3DModel(this.state.isActionSelected[action]);
        break;
      case 'EXPLODE_3D_MODEL':
        this.state.isActionSelected["TRANSPARENT_3D_MODEL"] = false;
        RXCore.explode3D(this.state.isActionSelected[action]);
        break;
      case 'EXPLODE_3D_DISTANCE':
        RXCore.explode3DDistance(this.distance3dValue);
        this.state.isActionSelected["EXPLODE_3D_DISTANCE"] = true;
        this.state.isActionSelected["EXPLODE_3D_MODEL"] = true;
        break;
      case 'TRANSPARENT_3D_MODEL':
        this.state.isActionSelected["EXPLODE_3D_MODEL"] = false;
        break;
      case 'TRANSPARENT_3D_VALUE':
        RXCore.transparency3D(this.transparent3dValue / 100.0);
        this.state.isActionSelected["TRANSPARENT_3D_MODEL"] = true;
        break;
      case 'CLIPPING_3D_MODEL':
        RXCore.clipping3D(this.state.isActionSelected[action], -1, 0);
        break;
      case 'CLIPPINGX_3D_VALUE':
        RXCore.clipping3D(true, 0, 100 - this.clippingXValue);

        this.state.isActionSelected["CLIPPING_3D_MODEL"] = true;
        break;
      case 'CLIPPINGY_3D_VALUE':
          RXCore.clipping3D(true, 1, 100 - this.clippingYValue);
          this.state.isActionSelected["CLIPPING_3D_MODEL"] = true;
          break;
      case 'CLIPPINGZ_3D_VALUE':
          RXCore.clipping3D(true, 2, 100 - this.clippingZValue);
          this.state.isActionSelected["CLIPPING_3D_MODEL"] = true;
          break;
      case 'BIRDSEYE':
        this.setBirdseyeCanvas();
        break;
      case 'SEARCH_TEXT':
        if (!this.state.isActionSelected[action]){
          RXCore.endTextSearch();
          this.searchString = undefined;
          this.searchCaseSensitive = false;
          this.searchCurrentMatch = 0;
        }
        break;
      case 'SELECT_TEXT':
        RXCore.textSelect(this.state.isActionSelected[action]);
        break;
      case 'GRAYSCALE':
        break;
      default:
        break;
    }

    this.service.setState(this.state);
  }

  private setBirdseyeCanvas(): void {
    if (this.state.isActionSelected['BIRDSEYE']) {
      RXCore.birdseyetool();
      RXCore.setBirdseyeCanvas(this.birdseyeImage.nativeElement, this.birdseyeIndicator.nativeElement, this.birdseyeMarkup.nativeElement);
      RXCore.renderBirdseye();
    }
  }

  private onBirdseyeThumbnailReceived(index, thumbnail): void {
    if (!thumbnail.DocRef.bActive) {
      return;
    }

    if(thumbnail.usefoxitthumb){

      this.beWidth = thumbnail.birdseyeobj.birdseye.width;
      this.beHeight = thumbnail.birdseyeobj.birdseye.height;
      
    }else{

      if (thumbnail.birdseyeobj.rotation == 90 || thumbnail.birdseyeobj.rotation == 270) {
        this.beWidth = thumbnail.birdseyeobj.birdseye.height;
        this.beHeight = thumbnail.birdseyeobj.birdseye.width;
      } else {
        this.beWidth = thumbnail.birdseyeobj.birdseye.width;
        this.beHeight = thumbnail.birdseyeobj.birdseye.height;
      }

    }


    this.birdseyeImage.nativeElement.width = this.birdseyeIndicator.nativeElement.width = this.birdseyeMarkup.nativeElement.width = this.beWidth;
    this.birdseyeImage.nativeElement.height = this.birdseyeIndicator.nativeElement.height = this.birdseyeMarkup.nativeElement.height = this.beHeight;

    let offsetx = 0;
    let offsety = 0;

    if(!thumbnail.usefoxitthumb){
      if (thumbnail.birdseyeobj.rotation == 90){
        offsety = -this.beWidth;
      } else if (thumbnail.birdseyeobj.rotation == 270){
        offsetx = -this.beHeight;
        offsety = 0;
      } else if (thumbnail.birdseyeobj.rotation == 180){
        offsetx = -this.beWidth;
        offsety = -this.beHeight;
      }
    }
    

    if (thumbnail.birdseyeGUIimgctx != null) {
      if (thumbnail.birdseyeobj.rotation == 0 || thumbnail.usefoxitthumb) {
        thumbnail.birdseyeGUIimgctx.drawImage(thumbnail.birdseyeobj.birdseye, 0,0);
      } else {
        thumbnail.birdseyeGUIimgctx.save();
        thumbnail.birdseyeGUIimgctx.rotate(thumbnail.birdseyeobj.rotation * (Math.PI / 180));
        thumbnail.birdseyeGUIimgctx.drawImage(thumbnail.birdseyeobj.birdseye, offsetx, offsety);
        thumbnail.birdseyeGUIimgctx.restore();
      }
    }
  }

  onSearchChange(event): void {
    if (!this.searchString?.trim()) {
      RXCore.endTextSearch();
    }
  }

  onTextSearchClick(): void {
    RXCore.textSearch(this.searchString, true, this.searchCaseSensitive);
  }

  onCaseSensitiveChange(checked): void {
    this.searchCaseSensitive = checked;
  }

  onTextSearchNavigate(direction: boolean): void {
    if (direction) {
      if (this.searchCurrentMatch < this.searchNumMatches) {
        this.searchCurrentMatch++;
        RXCore.textSearch(this.searchString, direction, this.searchCaseSensitive);
      }
    } else {
      if (this.searchCurrentMatch > 1) {
        this.searchCurrentMatch--;
        RXCore.textSearch(this.searchString, direction, this.searchCaseSensitive);
      }
    }
  }

  onGrayscaleChange(): void {
    setTimeout(() => {
      this.compareService.changeGrayScale(this.grayscaleValue);
    }, 500);
  }

}
