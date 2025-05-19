
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

      // Only initialize birdseye when active

      if (this.state.isActionSelected['BIRDSEYE']) {
        this.setBirdseyeCanvas();
      }

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
    });

    // Listen for file activation events to update birdseye when files change
    this.rxCoreService.guiFileLoadComplete$.subscribe(() => {
      console.log('File loaded, updating birdseye if active');

      // When a new file is loaded, we need to temporarily disable and then re-enable
      // birdseye to force a complete refresh of the thumbnail
      if (this.state.isActionSelected['BIRDSEYE']) {
        console.log("Force resetting Bird's Eye View for new document");

        // Temporarily disable birdseye
        this.state.isActionSelected['BIRDSEYE'] = false;
        this.clearBirdseyeCanvases();
        RXCore.birdseyetool();

        // Re-enable after a short delay
        setTimeout(() => {
          this.state.isActionSelected['BIRDSEYE'] = true;
          this.forceRefreshBirdseye();
        }, 500);
      }
    });

    // Listen for the currently active file to change
    RXCore.onGuiActivateFile((fileIndex) => {
      console.log('Active file changed to index:', fileIndex);

      // Same approach for file activation events
      if (this.state.isActionSelected['BIRDSEYE']) {
        console.log("Force resetting Bird's Eye View for activated document");

        // Temporarily disable birdseye
        this.state.isActionSelected['BIRDSEYE'] = false;
        this.clearBirdseyeCanvases();
        RXCore.birdseyetool();

        // Re-enable after a short delay



        setTimeout(() => {
          this.state.isActionSelected['BIRDSEYE'] = true;
          this.forceRefreshBirdseye();
        }, 500);
      }
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
        if (this.state.isActionSelected[action]) {
          // Bird's Eye View is being activated
          console.log("Activating Bird's Eye View");
          this.forceRefreshBirdseye();
        } else {
          // Bird's Eye View is being deactivated
          console.log("Deactivating Bird's Eye View");
          // Clear the canvases when turning off
          this.clearBirdseyeCanvases();
          // Tell RXCore to handle Bird's Eye View state
          RXCore.birdseyetool();
        }

        //this.setBirdseyeCanvas();
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

  private resetAndRefreshBirdseye(): void {
    // Force a complete reset and refresh of the Bird's Eye View
    setTimeout(() => {
      // Get current active file info for logging
      const activeFileInfo = RXCore.getCurrentFileInfo();
      console.log("Resetting Bird's Eye View for document:", activeFileInfo);

      // Clear any existing Bird's Eye View data
      this.clearBirdseyeCanvases();

      // Temporarily disable birdseye if it's active
      const wasActive = this.state.isActionSelected['BIRDSEYE'];
      if (wasActive) {
        // Disable
        // Instead of passing parameter, we'll manage activation state differently
        RXCore.birdseyetool();

        // Re-enable after a short delay
        setTimeout(() => {
          // Initialize the Bird's Eye View with the active document
          RXCore.birdseyetool();

          // Set the canvas references
          RXCore.setBirdseyeCanvas(
            this.birdseyeImage.nativeElement,
            this.birdseyeIndicator.nativeElement,
            this.birdseyeMarkup.nativeElement
          );

          // Force a render
          RXCore.renderBirdseye();

          console.log("Bird's Eye View reset and refreshed");
        }, 150);
      } else {
        // Just initialize the Bird's Eye View with the active document
        RXCore.birdseyetool();
        RXCore.setBirdseyeCanvas(
          this.birdseyeImage.nativeElement,
          this.birdseyeIndicator.nativeElement,
          this.birdseyeMarkup.nativeElement
        );
        RXCore.renderBirdseye();

        console.log("Bird's Eye View reset and refreshed");
      }
    }, 100);
  }

  private clearBirdseyeCanvases(): void {
    if (this.birdseyeImage && this.birdseyeIndicator && this.birdseyeMarkup) {
      const imgCtx = this.birdseyeImage.nativeElement.getContext('2d');
      const indCtx = this.birdseyeIndicator.nativeElement.getContext('2d');
      const markupCtx = this.birdseyeMarkup.nativeElement.getContext('2d');

      if (imgCtx) imgCtx.clearRect(0, 0, this.beWidth, this.beHeight);
      if (indCtx) indCtx.clearRect(0, 0, this.beWidth, this.beHeight);
      if (markupCtx) markupCtx.clearRect(0, 0, this.beWidth, this.beHeight);
    }
  }


  private setBirdseyeCanvas(): void {



    if (this.state.isActionSelected['BIRDSEYE']) {
      // Force reset any existing thumbnail data
      this.clearBirdseyeCanvases();

      // Get the current active document
      const activeFileInfo = RXCore.getCurrentFileInfo();
      console.log('Setting up birdseye for active document:', activeFileInfo);


    // Initialize and render the Bird's Eye View
      RXCore.birdseyetool();

    
      RXCore.setBirdseyeCanvas(this.birdseyeImage.nativeElement, this.birdseyeIndicator.nativeElement, this.birdseyeMarkup.nativeElement);
      RXCore.renderBirdseye();
    }
  }

  private onBirdseyeThumbnailReceived(index, thumbnail): void {
    // Enhanced logging to debug thumbnail issues
    console.log('Birdseye thumbnail received:', {
      index,
      isActive: thumbnail?.DocRef?.bActive,
      hasData: !!thumbnail?.birdseyeobj?.birdseye,
    });

    // Only process thumbnails for the active document
    if (!thumbnail || !thumbnail.DocRef || !thumbnail.DocRef.bActive) {
      console.log('Ignoring inactive document thumbnail');
      return;
    }

    console.log('Received birdseye thumbnail for active document:', index);

    // Check if birdseye is still active
    if (!this.state.isActionSelected['BIRDSEYE']) {
      console.log("Bird's Eye View no longer active, skipping render");
      return;
    }

    // Force clear all canvases before rendering new content
    this.clearBirdseyeCanvases();

    // Get dimensions based on thumbnail type and rotation
    if (thumbnail.usefoxitthumb) {
      this.beWidth = thumbnail.birdseyeobj.birdseye.width;
      this.beHeight = thumbnail.birdseyeobj.birdseye.height;

    } else {
      if (
        thumbnail.birdseyeobj.rotation == 90 ||
        thumbnail.birdseyeobj.rotation == 270
      ) {
        this.beWidth = thumbnail.birdseyeobj.birdseye.height;
        this.beHeight = thumbnail.birdseyeobj.birdseye.width;
      } else {
        this.beWidth = thumbnail.birdseyeobj.birdseye.width;
        this.beHeight = thumbnail.birdseyeobj.birdseye.height;
      }

    }

    // Set canvas dimensions
    this.birdseyeImage.nativeElement.width = this.birdseyeIndicator.nativeElement.width = this.birdseyeMarkup.nativeElement.width = this.beWidth;
    this.birdseyeImage.nativeElement.height = this.birdseyeIndicator.nativeElement.height = this.birdseyeMarkup.nativeElement.height = this.beHeight;

    // Calculate offsets for rotated images
    let offsetx = 0;
    let offsety = 0;

    if (!thumbnail.usefoxitthumb) {
      if (thumbnail.birdseyeobj.rotation == 90) {
        offsety = -this.beWidth;
      } else if (thumbnail.birdseyeobj.rotation == 270) {
        offsetx = -this.beHeight;
        offsety = 0;
      } else if (thumbnail.birdseyeobj.rotation == 180) {
        offsetx = -this.beWidth;
        offsety = -this.beHeight;
      }
    }

    // Make sure we have a valid context before trying to draw
    if (thumbnail.birdseyeGUIimgctx == null) {
      console.log('Creating new image context for birdseye');
      const imgCtx = this.birdseyeImage.nativeElement.getContext('2d');
      if (imgCtx) {
        thumbnail.birdseyeGUIimgctx = imgCtx;
      } else {
        console.error('Failed to get 2D context for birdseye image canvas');
        return;
      }
    }

    // Ensure we have a valid birdseye image to render
    if (!thumbnail.birdseyeobj || !thumbnail.birdseyeobj.birdseye) {
      console.error('Missing birdseye image data in thumbnail');
      return;
    }

    // Draw the thumbnail image
    try {
      if (thumbnail.birdseyeobj.rotation == 0 || thumbnail.usefoxitthumb) {
        thumbnail.birdseyeGUIimgctx.drawImage(thumbnail.birdseyeobj.birdseye, 0, 0);
      } else {
        thumbnail.birdseyeGUIimgctx.save();
        thumbnail.birdseyeGUIimgctx.rotate(
          thumbnail.birdseyeobj.rotation * (Math.PI / 180)
        );
        thumbnail.birdseyeGUIimgctx.drawImage(thumbnail.birdseyeobj.birdseye, offsetx, offsety);
        thumbnail.birdseyeGUIimgctx.restore();
      }
      console.log('Successfully rendered birdseye thumbnail');
    } catch (error) {
      console.error('Error rendering birdseye thumbnail:', error);
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

  private forceRefreshBirdseye(): void {
    console.log("Performing forced Bird's Eye View refresh");

    // Get current active file info for logging
    const activeFileInfo = RXCore.getCurrentFileInfo();
    console.log('Active document for birdseye:', activeFileInfo);

    // Clear all existing canvas data
    this.clearBirdseyeCanvases();

    // Set dimensions to default values to ensure proper initialization
    this.beWidth = 350;
    this.beHeight = 269;

    // Set canvas dimensions to defaults
    this.birdseyeImage.nativeElement.width =
      this.birdseyeIndicator.nativeElement.width =
      this.birdseyeMarkup.nativeElement.width =
        this.beWidth;

    this.birdseyeImage.nativeElement.height =
      this.birdseyeIndicator.nativeElement.height =
      this.birdseyeMarkup.nativeElement.height =
        this.beHeight;

    // Completely reinitialize the birdseye tool
    RXCore.birdseyetool();

    // Recreate all canvas associations
    RXCore.setBirdseyeCanvas(
      this.birdseyeImage.nativeElement,
      this.birdseyeIndicator.nativeElement,
      this.birdseyeMarkup.nativeElement
    );

    // Force a render
    RXCore.renderBirdseye();

    console.log("Forced Bird's Eye View refresh completed");
  }

}
