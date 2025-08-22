import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import {distinctUntilChanged, Subject, Subscription} from 'rxjs';
import { MetricUnitType } from 'src/app/domain/enums';

import { RxCoreService } from 'src/app/services/rxcore.service';

import { RXCore } from 'src/rxcore';
import { METRIC } from 'src/rxcore/constants';
import { GuiMode } from 'src/rxcore/enums/GuiMode';

import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { AnnotationToolsService } from '../annotation-tools/annotation-tools.service';
import { MeasurePanelService } from '../annotation-tools/measure-panel/measure-panel.service';
import { CompareService } from '../compare/compare.service';



import { FileGaleryService } from '../file-galery/file-galery.service';
import { PrintService } from '../print/print.service';
import { SideNavMenuService } from '../side-nav-menu/side-nav-menu.service';

import { TopNavMenuService } from './top-nav-menu.service';
import { ActionType } from './type';
import { CollabService } from 'src/app/services/collab.service';

import { UserScaleStorageService } from 'src/app/services/user-scale-storage.service';
import { UserService } from '../user/user.service';

import { ExportService } from 'src/app/services/export.service';


@Component({
  selector: 'top-nav-menu',
  templateUrl: './top-nav-menu.component.html',
  styleUrls: ['./top-nav-menu.component.scss'],
  host: {
    '(document:click)': 'handleClickOutside($event)',
    '(document:keydown)': 'handleKeyboardEvents($event)',
    '(window:keydown.control.p)': 'handlePrint($event)'
  }
})
export class TopNavMenuComponent implements OnInit {
  @ViewChild('sidebar') sidebar: ElementRef;
  @ViewChild('burger') burger: ElementRef;
  @ViewChild('more') more: ElementRef;
  @Input() state: any;

  //guiConfig$ = this.rxCoreService.guiConfig$;
  //guiState$ = this.rxCoreService.guiState$;
  //guiMode$ = this.rxCoreService.guiMode$;


  GuiMode = GuiMode;
  guiConfig: IGuiConfig = {};
  guiState: any;
  guiMode: any;
  moreOpened: boolean = false;
  burgerOpened: boolean = false;
  sidebarOpened: boolean = false;
  modalFileGaleryOpened$ = this.fileGaleryService.modalOpened$;
  isPrint: boolean = false;
  isPDF : boolean = false;
  fileInfo: any = {};
  selectedValue: any;
  options: Array<{ value: GuiMode, label: string, hidden?: boolean }> = [];
  canChangeSign: boolean = false;
  disableImages: boolean = false;
  containLayers: boolean = false;
  containBlocks: boolean = false;
  isActionSelected: boolean = false;
  actionType: ActionType = "None";
  private guiOnNoteSelected: Subscription;
  //currentScaleValue: string;
  fileLength: number = 0;
  collabPanelOpened: boolean = false;
  private sidebarPanelActive: boolean = false;
  private fontloaded: boolean = false;

  scalesOptions: any = [];
  private rxCoreReady: boolean = false;

  set selectedScale(value: any) {
    this._selectedScale = value;
  }
  get selectedScale(): any {
    return this._selectedScale;
  }
  private _selectedScale: any;
  
  constructor(
    private readonly fileGaleryService: FileGaleryService,
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly printService: PrintService,
    private readonly compareService: CompareService,
    private readonly service: TopNavMenuService,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly measurePanelService: MeasurePanelService,

    private readonly userService: UserService,
    private readonly collabService: CollabService,
    private readonly userScaleStorage: UserScaleStorageService,
    private readonly exportService: ExportService
    
    ) {
  }

  get isCompareDisabled(): boolean {
    return !this.state?.activefile || this.state?.is3D || this.guiConfig.disableBurgerMenuCompare;
  }


  private _setOptions(option: any = undefined): void {
    const is3D = this.guiState?.is3D;
    this.options = [
      { value: GuiMode.View, label: "View" },
      { value: GuiMode.Annotate, label: "Annotate", hidden: is3D ||  !this.guiConfig.canAnnotate },
      { value: GuiMode.Measure, label: "Measure", hidden: is3D ||  !this.guiConfig.canAnnotate },
      { value: GuiMode.Signature, label: "Signature", hidden: !(this.guiConfig.canSignature && this.canChangeSign) },
      { value: GuiMode.Compare, label: "Revision", hidden: !this.guiConfig.canCompare || !this.compareService.isComparisonActive }
    ];

    this.selectedValue = option ? option : this.options[0];
    this.annotationToolsService.setSelectedOption(this.selectedValue);
  }

  get visibleOptionsCount(): number {
    return this.options.filter(option => !option.hidden).length;
  }  

  ngOnInit(): void {
    this.handleIconRotation();
    this._setOptions();
    //this.addFont();

    // Subscribe to user changes and reload user-specific scales
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        const userScales = this.userScaleStorage.getScales(user.id);
        if (userScales && userScales.length > 0) {
          this.scalesOptions = this.ensureImperialScaleProperties(userScales);
          // Select the first scale and mark it as selected
          this.selectedScale = this.scalesOptions[0];
          // Mark the first scale as selected to prevent it from being reset to undefined
          this.scalesOptions = this.setPropertySelected(
            this.scalesOptions,
            'isSelected',
            'label',
            this.selectedScale.label
          );
          // Don't apply the scale yet - we'll do it when RXCore is ready
        } else {
          this.scalesOptions = [];
        }
      } else {
        // User logged out, clear scales
        this.scalesOptions = [];
      }
    });

    this.rxCoreService.guiState$.subscribe((state) => {
      this.guiState = state;
      this.canChangeSign = state.numpages && state.isPDF && RXCore.getCanChangeSign();
      this._setOptions();

      this.isPDF = state.isPDF;

      if (this.compareService.isComparisonActive) {
        const value = this.options.find(option => option.value == "compare");
        if (value) {
          this.onModeChange(value, false);
        }
      }else{
          //Hide compare toolbar if comparison window is closed Or not active
          this.onModeChange(false, false);

          //Disable tools which enabled for comparison
          this.rxCoreService.setGuiConfig({
              enableGrayscaleButton: this.compareService.isComparisonActive
          });
      }
    });


    // Also try to apply scale when file is loaded
    this.rxCoreService.guiFileLoadComplete$.subscribe(() => {
      if (this.selectedScale && this.rxCoreReady) {
        this.onScaleChanged(this.selectedScale);
      }
    });
    

    this.rxCoreService.guiMode$.subscribe(mode => {
      this.guiMode = mode;
      const value = this.options.find(option => option.value == mode);
      if (value) {
        this.onModeChange(value, false);
        if (this.rxCoreService.IsCollaboration() && this.collabService.needSync()) {
          this.collabService.sendGuiModeChange(this.collabService.getRoomId() , { guiMode: mode });
        }
      }
    });

    this.rxCoreService.guiConfig$.subscribe(config => {
      this.guiConfig = config;
      this._setOptions(this.selectedValue);
    });

    this.service.openModalPrint$.subscribe(() => {
      this.isPrint = true;
    });

    this.rxCoreService.guiVectorLayers$.subscribe((layers) => {
      this.containLayers = layers.length > 0;
    });

    this.rxCoreService.guiVectorBlocks$.subscribe((blocks) => {
      this.containBlocks = blocks.length > 0;
    });

    this.service.activeFile$.subscribe(file => {
    })

    this.guiOnNoteSelected = this.rxCoreService.guiOnCommentSelect$.subscribe((value: boolean) => {

      if (value !== undefined){
        this.isActionSelected = value;
      }
     
    });

    this.annotationToolsService.notePanelState$.subscribe(state => {
      if(state?.markupnumber !== undefined)
      this.isActionSelected = state?.markupnumber;
    });

    /*this.measurePanelService.measureScaleState$.subscribe((state) => {
      if(state.visible && state.value) {
        this.currentScaleValue = state.value;
      }
      
      if(state.visible === false) {
        this.currentScaleValue = '';
      }
    });*/

    this.measurePanelService.measureScaleState$.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe((state) => {
      // Only update scales from RXCore if we don't have user scales loaded
      if (!this.scalesOptions || this.scalesOptions.length === 0) {
        const rxCoreScales = RXCore.getDocScales();
        this.scalesOptions = this.ensureImperialScaleProperties(rxCoreScales);
      }

      if(state.visible && this.scalesOptions?.length > 0) {
        const foundScale = this.scalesOptions.find(scale => scale.isSelected);
        if (foundScale) {
          this.selectedScale = foundScale;
        }
      }
    });

    // Listen for scale updates from measure panel
    this.measurePanelService.scaleState$.subscribe((scaleState) => {
      if (scaleState.scalesOptions && scaleState.created) {
        // Update the scales options with the new scales from measure panel
        this.scalesOptions = this.ensureImperialScaleProperties(scaleState.scalesOptions);
        // Update selected scale if it was created
        if (scaleState.scaleLabel) {
          this.selectedScale = this.scalesOptions.find(scale => scale.label === scaleState.scaleLabel);
        }
      }
    });
    
    this.rxCoreService.guiPage$.subscribe(() => {
      // Only update scales from RXCore if we don't have user scales loaded
      if (!this.scalesOptions || this.scalesOptions.length === 0) {
        this.scalesOptions = this.ensureImperialScaleProperties(RXCore.getDocScales());
      }
      this.updateSelectedScaleFromCurrentPage();
    });

    this.rxCoreService.guiScaleListLoadComplete$.subscribe(() => {
      // Only update scales from RXCore if we don't have user scales loaded
      if (!this.scalesOptions || this.scalesOptions.length === 0) {
        this.scalesOptions = this.ensureImperialScaleProperties(RXCore.getDocScales());
      }
      this.updateSelectedScaleFromCurrentPage();
    });

    this.service.fileLength$.subscribe(length => {
      this.fileLength = length;
    });

    // Add subscription to track sidebar panel state
    this.sideNavMenuService.sidebarChanged$.subscribe((index) => {
      // If panel is closed via its close button, update our active state
      if (index === -1) {
        this.sidebarPanelActive = false;
      }
    });

    // Wait for RXCore to be ready before applying scales
    this.rxCoreService.guiFoxitReady$.subscribe(() => {
      this.rxCoreReady = true;
      if (this.selectedScale) {
        this.onScaleChanged(this.selectedScale);
      }
    });

    // Fallback: if RXCore ready doesn't fire within 5 seconds, try to apply scale anyway
    setTimeout(() => {
      if (this.selectedScale && !this.rxCoreReady) {
        this.rxCoreReady = true;
        this.onScaleChanged(this.selectedScale);
      }
    }, 5000);

  }

  

  /* Listeners */
  handleClickOutside(event: any) {
    if (this.moreOpened && !this.more.nativeElement.contains(event.target)) {
      this.moreOpened = false;
    }

    if (this.burgerOpened && !this.burger.nativeElement.contains(event.target)) {
      this.burgerOpened = false;
    }

    if (this.sidebarOpened && !this.sidebar.nativeElement.contains(event.target)) {
      this.sidebarOpened = false;
    }
  }

  handleKeyboardEvents($event: KeyboardEvent) {
    if (this.moreOpened || this.burgerOpened || this.sidebarOpened) {
      $event.preventDefault();
    } else {
      return;
    }

    if ($event.code === 'Escape') {
      this.moreOpened = this.burgerOpened = this.sidebarOpened = false;
    }
  }

  handleIconRotation(): void {
    this.service.closeSideNav$.subscribe((value) => {
      this.sidebarPanelActive = value;
    })
  }

  addFont():void{

    if (this.fontloaded){
      return;
    }

    let newFont = new FontFace('Noto Sans', 'url(./assets/fonts/NotoSans-VariableFont.ttf)', 
      {
          style: 'normal',
          weight: 'normal',
          unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116' 
      }
    );

    
    newFont.load().then((font) => this.setFontLoaded(font)).catch((err) => {
      console.error('Font load failed:', err);
    });
    

  }

  setFontLoaded(font: FontFace): void {
    
    (document.fonts as any).add(font);
    this.fontloaded = true;

    /*if ('add' in document.fonts) {
      //(document.fonts as FontFaceSet).add(font);
    } else {
      console.warn('FontFaceSet.add is not supported in this environment.');
    }*/
  }

  

  handlePrint(event: KeyboardEvent) {
    event.preventDefault();
    this.openModalPrint();
  }
  /* End listeners */

  handleOpenFile() {
    this.fileGaleryService.openModal();
    this.burgerOpened = false;
  }

  handleCloseModalFileGalery() {
    this.fileGaleryService.closeModal();
  }

  handleFileSelect(item: any) {
    RXCore.openFile(`${RXCore.Config.sampleFileURL}${item.file}`);
  }

  handleOnFileUpload() {
    RXCore.fileSelected();
  }

  // User is able to toggle the collaboration panel when
  // - the user is logged in
  // - the user is on https://<site>/collaboration/ page
  // - the user is not on https://<site>/document-collaboration.html page
  
  
  shouldShowToggleCollabPanelButton(): boolean {
    // If user is on https://<site>/document-collaboration.html, it includes two iFrames,
    // iFrame will get src in format of https://<site>/collaboration?roomId=document_collaboration_room_wB4Oe4Qv
    //const parameters = new URLSearchParams(window.location.search);
    //const isOnDocumentCollaborationPage = parameters.get('roomId');

    return this.rxCoreService.IsCollaboration() && !!this.userService.getCurrentUser() && !this.rxCoreService.IsDocumentCollaboration();

    
  }


  onModeChange(option: any, broadcast: boolean = true) {
    this.selectedValue = option;
    this.annotationToolsService.setSelectedOption(option);

    if (option.value === 'annotate' || option.value === 'compare' || option.value === 'measure') {
      if (option.value === 'compare') {
        this.rxCoreService.setGuiConfig({
          canSignature: false,
          canAnnotate: true,
          canSaveFile: false,
          canExport: false,
          canPrint: false,
          canGetFileInfo: false,
          disableBurgerMenuCompare: true,
          disableBirdEyeButton: true,
          disableRotateButton: true,
          disableSelectTextButton: true,
          disableSearchTextButton: true,
          disableSearchAttributesButton: true,
          disableMarkupTextButton: true,
          disableMarkupCalloutButton: true,
          disableMarkupStampButton: true,
          disableMarkupPaintButton: true,
          disableMarkupArrowButton: true,
          disableMarkupMeasureButton: true,
          disableMarkupCountButton: true,
          disableMarkupEraseButton: true,
          disableMarkupNoteButton: true,
          disableMarkupLockButton: true,
          disableMarkupShapeRectangleButton: true,
          disableMarkupShapeEllipseButton: true,
          disableMarkupShapeRoundedRectangleButton: true,
          disableMarkupShapePolygonButton: true,
          enableGrayscaleButton: this.compareService.isComparisonActive,
          disableImages: true,
          disableSignature: true,
          disableLinks: true,
          disableSymbol: true,

        });
      } else {


        if (this.compareService.isComparisonActive) {
          this.rxCoreService.setGuiConfig({
            canCompare: true,
            canSignature: false,
            canAnnotate: true,
            canSaveFile: false,
            canExport: false,
            canPrint: false,
            canGetFileInfo: false,
            disableBurgerMenuCompare: true,
            disableBirdEyeButton: false,
            disableRotateButton: false,
            disableSelectTextButton: false,
            disableSearchTextButton: false,
            disableSearchAttributesButton: false,
            disableMarkupTextButton: false,
            disableMarkupCalloutButton: false,
            disableMarkupStampButton: false,
            disableMarkupPaintButton: false,
            disableMarkupArrowButton: false,
            disableMarkupMeasureButton: false,
            disableMarkupCountButton: false,
            disableMarkupEraseButton: false,
            disableMarkupNoteButton: false,
            disableMarkupLockButton: false,
            disableMarkupShapeRectangleButton: false,
            disableMarkupShapeEllipseButton: false,
            disableMarkupShapeRoundedRectangleButton: false,
            disableMarkupShapePolygonButton: false,
            enableGrayscaleButton: this.compareService.isComparisonActive,
            disableImages: true,
            disableSignature: true,
            disableLinks: true,
            disableSymbol: true,

          });
        } else {

          if (option.value === 'measure') {
            this.rxCoreService.setGuiConfig({
              disableMarkupTextButton: true,
              disableMarkupCalloutButton: true,
              disableMarkupEraseButton: true,
              disableMarkupNoteButton: true,
              //disableMarkupShapeRectangleButton: true,
              //disableMarkupShapeEllipseButton: true,
              //disableMarkupShapeRoundedRectangleButton: true,
              //disableMarkupShapePolygonButton: true,
              disableMarkupShapeButton : true,
              disableMarkupStampButton: true,
              disableMarkupPaintButton: true,
              disableMarkupArrowButton: true,
              disableMarkupCountButton: false,
              disableMarkupMeasureButton: false,
              disableImages: true,
              disableSignature: true,
              disableLinks: true,
              disableSymbol: true,

            });
            //const docObj = RXCore.printDoc();

            /*if(RXCore.getDocScales() != undefined && RXCore.getDocScales().length === 0 ){
              //this.scalesOptions = RXCore.getDocScales();
              this.annotationToolsService.setMeasurePanelState({ visible: true }); 
            }*/
        

            /*if(docObj && docObj.scalesOptions && docObj.scalesOptions.length === 0) 
              this.annotationToolsService.setMeasurePanelState({ visible: true }); */
            
  
          } else if(option.value === 'annotate'){
            this.rxCoreService.setGuiConfig({
              disableMarkupTextButton: false,
              disableMarkupCalloutButton: false,
              disableMarkupEraseButton: false,
              disableMarkupNoteButton: false,
              //disableMarkupShapeRectangleButton: false,
              //disableMarkupShapeEllipseButton: false,
              //disableMarkupShapeRoundedRectangleButton: false,
              //disableMarkupShapePolygonButton: false,
              disableMarkupShapeButton : false,
              disableMarkupStampButton: false,
              disableMarkupPaintButton: false,
              disableMarkupArrowButton: false,
              disableMarkupCountButton: true,
              disableMarkupMeasureButton: true,
              disableImages: false, 
              disableLinks: false,
              disableSymbol: false,

            });

          }else{
            this.rxCoreService.resetGuiConfig();
          }
  

          
        }
      }

      this.annotationToolsService.show();
    } else {
      this.annotationToolsService.hide();
    }

    this.annotationToolsService.setNotePanelState({
      visible: this.isActionSelected && this.actionType === 'Comment',
      objectType: this.selectedValue.value,
    });


    if (broadcast) {
      this.rxCoreService.setGuiMode(option.value);
    }
  }

  openModalPrint() {
    this.state?.activefile ? (this.isPrint = true, this.burgerOpened = false) : this.isPrint = false;

    if(this.isPrint){
      document.documentElement.style.setProperty("--body-overflow", "visible");
    }

    //

  }

  

  fileInfoDialog(): void {
    this.burgerOpened = false;
    this.printService.data(false);
    RXCore.fileInfoDialog();
  }

  handleSaveFile(): void {
    RXCore.markUpSave();
    this.burgerOpened = false;
  }

  /* handleGetJSONMarkup():void{
    RXCore.markupGetJSON(false);
    this.burgerOpened = false;
  } */

  openModalCompare(): void {
    if (!this.state?.activefile || this.state?.is3D || this.guiConfig.disableBurgerMenuCompare) return;

    this.compareService.showCreateCompareModal();
    this.burgerOpened = false;
  }

  onExportClick(): void {

    this.burgerOpened = false;
    let fileType = 'unknown';
    if (this.state.isPDF) fileType = 'pdf';
    else if (this.state.is3D) fileType = '3d';
    else if (this.state.is2D) fileType = '2d';
    this.exportService.openExportDialog(fileType);
  }
  

  /*onExportClick(): void {
    if (this.state?.activefile) {
      this.burgerOpened = false;
      RXCore.exportPDF();
    }
  }*/

  //uploadPDF

  onPDFUploadClick(): void {
    if (this.state?.activefile) {
      this.burgerOpened = false;
      //RXCore.exportPDF();
      RXCore.setDefultExportparams();
      RXCore.uploadPDF();
      //var szURL = "http://myserver.somedomain.com/mypdfhandlingapp?documentid";
      //RXCore.uploadPDFCustom(szURL);

    }
  }



  onPDFDownloadClick():void{
    if (this.state?.activefile) {
      this.burgerOpened = false;
      
      RXCore.downloadPDF();

      //RXCore.exportPDF();
    }

  }


  onSearchPanelSelect (): void {
    this.onActionSelect("Search")
  }

  onCommentPanelSelect (): void {
    this.onActionSelect("Comment")
  }

  onCollabPanelSelect (): void {
    this.collabPanelOpened = !this.collabPanelOpened;
  }


  onActionSelect(actionType: ActionType): void {
    
    if(this.actionType.includes(actionType)) {
      this.isActionSelected = !this.isActionSelected
    } else {
      this.actionType = actionType;
      this.isActionSelected = true
    }

    console.log(actionType, this.isActionSelected)

    if(actionType === "Comment"){
      this.annotationToolsService.setSearchPanelState({ visible: false });
      this.annotationToolsService.setNotePanelState({ visible: this.isActionSelected && actionType === "Comment" });
    }

    if(actionType === "Search"){
      this.annotationToolsService.setNotePanelState({ visible: false });
      this.annotationToolsService.setSearchPanelState({ visible: this.isActionSelected && actionType === "Search" });
    }

    
    

    setTimeout(() => {
      //RXCore.doResize(false, 0, 0);      
    }, 100);
    
  }


  /* onActionSelect(): void {

    if (this.isActionSelected) {
      this.isActionSelected = false;
      this.annotationToolsService.setNotePanelState({ visible: false });

    }else{
      this.isActionSelected = true;
      this.rxCoreService.setCommentSelected(this.isActionSelected);
      this.annotationToolsService.setNotePanelState({ visible: this.isActionSelected });

    }

    //this.isActionSelected = true;
    //this.rxCoreService.setCommentSelected(this.isActionSelected);
    //this.annotationToolsService.setNotePanelState({ visible: this.isActionSelected });


    setTimeout(() => {
      //RXCore.doResize(false, 0, 0);      
    }, 100);
    
  } */


  handleOpenSidebarMenu() {

    // This method is now only for opening the dropdown when multiple options are available
    this.sidebarOpened = !this.sidebarOpened;


    /*const visibleItems = [
      { index: 0, visible: !(this.guiConfig?.disableViewPages) },
      { index: 5, visible: (this.guiConfig?.canSignature) && this.canChangeSign && this.guiMode == GuiMode.Signature },
      { index: 3, visible: !(this.guiConfig?.disableViewVectorLayers) && (this.guiState?.is2D || this.guiState?.isPDF) && this.containLayers },
      { index: 6, visible: !(this.guiConfig?.disableViewVectorLayers) && this.guiState?.is2D && this.containBlocks },
      { index: 4, visible: !(this.guiConfig?.disableView3DParts) && this.guiState?.is3D }
    ];*/

    //const visibleCount = visibleItems.filter(option => option.visible).length;

    /*if (visibleCount > 1) {
      this.sidebarOpened = !this.sidebarOpened;
    } else if (visibleCount === 1) {
      const indexToOpen = visibleItems.find(item => item.visible);
      this.handleSidebarOpen(indexToOpen?.index || 0);
    }*/
  }

  handleDirectSidebarOpen() {
    // This method directly opens the sidebar panel when only one option is available
    const visibleItem = this.getVisibleSidebarItem();
    if (visibleItem) {
      this.sidebarPanelActive = !this.sidebarPanelActive;
      this.sideNavMenuService.toggleSidebar(visibleItem.index);
    }
  }

  isSidebarActive(): boolean {
    return this.sidebarPanelActive;
  }

  getVisibleSidebarItemsCount(): number {
    const visibleItems = this.getVisibleSidebarItems();
    return visibleItems.length;
  }

  getVisibleSidebarItem() {
    const visibleItems = this.getVisibleSidebarItems();
    return visibleItems.length === 1 ? visibleItems[0] : null;
  }

  private getVisibleSidebarItems() {
    const visibleItems = [
      { index: 0, visible: !this.guiConfig?.disableViewPages },
      {
        index: 5,
        visible:
          this.guiConfig?.canSignature &&
          this.canChangeSign &&
          this.guiMode == GuiMode.Signature,
      },
      {
        index: 3,
        visible:
          !this.guiConfig?.disableViewVectorLayers &&
          (this.guiState?.is2D || this.guiState?.isPDF) &&
          this.containLayers,
      },
      {
        index: 6,
        visible:
          !this.guiConfig?.disableViewVectorLayers &&
          this.guiState?.is2D &&
          this.containBlocks,
      },
      {
        index: 4,
        visible: !this.guiConfig?.disableView3DParts && this.guiState?.is3D,
      },
    ];

    return visibleItems.filter((item) => item.visible);
  }

  handleSidebarOpen(index: number): void {
    this.sideNavMenuService.toggleSidebar(index);
    this.sidebarOpened = false;
    this.sidebarPanelActive = false;
  }

  //КОНФИДЕНЦИАЛЬНО

  onWatermarkClick(): void {

    
    /*RXCore.addWatermarkRender('КОНФИДЕНЦИАЛЬНО', {
      position: 'Center',
      offsetX: 0,
      offsetY: 0,
      scale: 0.5,
      opacity: 50,
      font: 'OpenSans',
      fontSize: 48,
      rotation: 45,
      flags : 2
    });*/        

    RXCore.addWatermarkToAllPages('Rasterex', {
      position: 'Center',
      offsetX: 0,
      offsetY: 0,
      scale: 0.25,
      opacity: 50,
      font: 'OpenSans',
      rotation: 45,
      flags : 2
    });

    setTimeout(() => {
      RXCore.refreshThumbnails();
    }, 1000);


  }

  onRemoveWatermarkClick(): void {
    RXCore.removeWatermarkFromAllPages();

    setTimeout(() => {
      RXCore.refreshThumbnails();
    }, 1000);


  }

  
  ngOnDestroy(): void {
    this.guiOnNoteSelected.unsubscribe();
  }

  onScaleDeleted(scaleToDelete: any): void {
    this.scalesOptions = this.scalesOptions.filter(
      (item) => item.label !== scaleToDelete.label
    );
    
    RXCore.updateScaleList(this.scalesOptions);
    // Save to localStorage for the current user
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userScaleStorage.saveScales(user.id, this.scalesOptions);
    }

    if (this.scalesOptions.length) {
      this.selectedScale = this.scalesOptions[0];
      RXCore.scale(this.selectedScale.value);
      RXCore.setScaleLabel(this.selectedScale.label);
    }

    if (this.scalesOptions.length === 0) {
      this.updateMetric(MetricUnitType.METRIC);
      this.updateMetricUnit(MetricUnitType.METRIC, 'Millimeter');
      RXCore.setDimPrecisionForPage(3);
      RXCore.scale('1:1');

      let mrkUp: any = RXCore.getSelectedMarkup();
      
      if (!mrkUp.isempty) {
        RXCore.unSelectAllMarkup();
        RXCore.selectMarkUpByIndex(mrkUp.markupnumber);
      }
    }

    RXCore.resetToDefaultScaleValueForMarkup(scaleToDelete.label);
    this.measurePanelService.setScaleState({ deleted: true });
  }

  onScaleChanged(selectedScale: any): void {
    if(selectedScale === null){
      this.annotationToolsService.setMeasurePanelState({ visible: true });
      return
    }
    try {
      this.updateMetric(selectedScale.metric as MetricUnitType);
      this.updateMetricUnit(selectedScale.metric as MetricUnitType, selectedScale.metricUnit);
      
      try {
        RXCore.setDimPrecisionForPage(selectedScale.dimPrecision);
      } catch (error) {
        console.error('Error setting dimension precision:', error);
      }
      
      try {
        RXCore.scale(selectedScale.value);
      } catch (error) {
        console.error('Error setting scale:', error);
      }
      
      try {
        RXCore.setScaleLabel(selectedScale.label);
      } catch (error) {
        console.error('Error setting scale label:', error);
      }

      this.scalesOptions = [...this.setPropertySelected(
        this.scalesOptions,
        'isSelected',
        'label',
        selectedScale.label
      )];

      RXCore.updateScaleList(this.scalesOptions);
      // Save to localStorage for the current user
      const user = this.userService.getCurrentUser();
      
      if (user) {
        this.userScaleStorage.saveScales(user.id, this.scalesOptions);
      }
    } catch (error) {
      console.error('Error applying scale:', error);
    }
  }

  private setPropertySelected(array: any[], property: string, conditionKey: string, conditionValue: any): any[] {
    array.forEach(obj => obj[property] = false);
    array.forEach(obj => {
      if (obj[conditionKey] === conditionValue) {
        obj[property] = true;
      }
    });
    return array;
  }


  updateMetric(selectedMetricType: MetricUnitType): void {
    try {
      switch (selectedMetricType) {
        case MetricUnitType.METRIC:
          RXCore.setUnit(1);
          break;
        case MetricUnitType.IMPERIAL:
          RXCore.setUnit(2);
          break;
        default:
          console.log('Unknown metric type:', selectedMetricType);
      }
    } catch (error) {
      console.error('Error updating metric:', error);
    }
  }

  updateMetricUnit(metric: MetricUnitType, metricUnit: string): void {
    try {
      if (metric === METRIC.UNIT_TYPES.METRIC) {
        RXCore.metricUnit(metricUnit);
      } else if (metric === METRIC.UNIT_TYPES.IMPERIAL) {
        RXCore.imperialUnit(metricUnit);
      } else {
        console.log('Unknown metric type for unit update:', metric);
      }
    } catch (error) {
      console.error('Error updating metric unit:', error);
    }
  }

  private updateSelectedScaleFromCurrentPage(): void {
    if (this.scalesOptions?.length > 0) {
      const currentPageScaleLabel = RXCore.getCurrentPageScaleLabel();
      if (currentPageScaleLabel) {
        const foundScale = this.scalesOptions.find(scale => scale.label === currentPageScaleLabel);
        if (foundScale) {
          this.selectedScale = foundScale;
        }
      } else {
        const foundScale = this.scalesOptions.find(scale => scale.isSelected);
        if (foundScale) {
          this.selectedScale = foundScale;
        }
      }
    }
  }

  private ensureImperialScaleProperties(scales: any[]): any[] {
    if (!scales || !Array.isArray(scales)) {
      return [];
    }
    return scales.map(scale => {
      if (scale.metric === MetricUnitType.IMPERIAL) {
        return {
          ...scale,
          imperialNumerator: scale.imperialNumerator || 1,
          imperialDenominator: scale.imperialDenominator || 1
        };
      }
      return scale;
    });
  }  

}
