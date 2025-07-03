import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { FileGaleryService } from './components/file-galery/file-galery.service';
import { RxCoreService } from './services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { NotificationService } from './components/notification/notification.service';
import { MARKUP_TYPES, METRIC } from 'src/rxcore/constants';
import { AnnotationToolsService } from './components/annotation-tools/annotation-tools.service';
import { RecentFilesService } from './components/recent-files/recent-files.service';
import { UserService } from './components/user/user.service';
import { Title } from '@angular/platform-browser';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { IVectorBlock } from 'src/rxcore/models/IVectorBlock';
import { CollabService } from './services/collab.service';
import { AnnotationStorageService } from './services/annotation-storage.service';
import { TooltipService } from './components/tooltip/tooltip.service';
import { LoginService } from './services/login.service';
import { MeasurePanelService } from './components/annotation-tools/measure-panel/measure-panel.service';
import { RouterModule } from '@angular/router';





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  //@ViewChild('progressBar') progressBar: ElementRef;
  enableLandingPage = false;
  guiConfig$ = this.rxCoreService.guiConfig$;
  guiConfig: IGuiConfig | undefined;
  title: string = 'rasterex-viewer';

  uiversion : string = '12.1.0.5'
  numOpenFiles$ = this.rxCoreService.numOpenedFiles$;
  annotation: any;
  rectangle: any;
  //markuptypes: any[] = [];
  isVisible: boolean = true;
  followLink: boolean = false;
  convertPDFAnnots : boolean | undefined = false;
  createPDFAnnotproxy : boolean | undefined = false;
  showAnnotationsOnLoad : boolean | undefined = false;
  canCollaborate : boolean = false;
  eventUploadFile: boolean = false;
  lists: any[] = [];
  state: any;
  bfoxitreadycalled : boolean = false;
  bguireadycalled : boolean = false;
  binitfileopened : boolean = false;
  timeoutId: any;
  isUploadFile: boolean = false;
  pasteStyle: { [key: string]: string } = { display: 'none' };

  infoData: Array<any> = [];
  infoPanelVisible: boolean = false;


  constructor(  public loginService: LoginService,
    private readonly recentfilesService: RecentFilesService,
    private readonly rxCoreService: RxCoreService,
    private readonly fileGaleryService: FileGaleryService,
    private readonly notificationService: NotificationService,
    private readonly tooltipService: TooltipService,
    private readonly userService: UserService,
    private readonly collabService: CollabService,  
    private readonly annotationStorageService: AnnotationStorageService,
    private readonly measurePanelService: MeasurePanelService,
    private titleService:Title,
    private el: ElementRef) { }
    
  ngOnInit() {

    this.loginService.enableLandingPage$.subscribe(enable => {
      this.enableLandingPage = enable;
    });
    
    this.guiConfig$.subscribe(config => {
      this.guiConfig = config;
      if (this.rxCoreService.IsCollaboration()) {
        this.guiConfig.canFileOpen = !!this.userService.getCurrentUser();
      }
      this.convertPDFAnnots = this.guiConfig.convertPDFAnnots;
      this.createPDFAnnotproxy = this.guiConfig.createPDFAnnotproxy;
      this.showAnnotationsOnLoad = this.guiConfig.showAnnotationsOnLoad;
      RXCore.markupDisplayOnload(this.showAnnotationsOnLoad);

    });

    if(this.guiConfig?.forceLogin){
      this.loginService.showLoginModal(this.guiConfig?.forceLogin);
   }else{
     this.enableLandingPage = true;
   }


    this.titleService.setTitle(this.title);
    this.fileGaleryService.getEventUploadFile().subscribe(event => this.eventUploadFile = event);
    this.fileGaleryService.modalOpened$.subscribe(opened => {
      if (!opened) {
        this.eventUploadFile = false;
      }
    });

    this.canCollaborate = this.rxCoreService.IsCollaboration();
    // if we can find the roomId in the URL, we will create a collabService
    const parameters = new URLSearchParams(window.location.search);
    const roomId = parameters.get('roomId') || '';
    if (this.canCollaborate && roomId) {
      const user = this.userService.getCurrentUser();
      const username = user?.username || '';
      const displayName = user?.displayName || '';
      this.collabService.setUsername(username, displayName);
      this.collabService.joinRoom(roomId);
      // We need to call openModal() here, so it can call handleFileSelect() in file-galery
      // TODO: there should be a better logic to open a file!
      this.fileGaleryService.openModal();
    }
    
    this.rxCoreService.guiSelectedVectorBlock$.subscribe((block)=>{
      setTimeout(() => {
        this.showBlockInfo(block);
      });
    });

    
  }
  

  ngAfterViewInit(): void {
    

    /*this.guiConfig$.subscribe(config => {

      RXCore.convertPDFAnnots(config.convertPDFAnnots);
      
    });*/

    RXCore.convertPDFAnnots(this.convertPDFAnnots);
    RXCore.usePDFAnnotProxy(this.createPDFAnnotproxy);

    const user = this.userService.getCurrentUser();

    let JSNObj = [
      {
          Command: "GetConfig",
          UserName: user?.username || "Demo",
          DisplayName : user?.displayName || "Demo User"
      }
    ];




    
    
    RXCore.setJSONConfiguration(JSNObj);
    RXCore.limitZoomOut(false);
    RXCore.usePanToMarkup(true);
    RXCore.disablewelcome(true);
    RXCore.forceUniqueMarkup(true);
    RXCore.scaleOnResize(false);
    RXCore.restrictPan(false);
    RXCore.overrideLinewidth(true, 1.0);


    //guiConfig


    //RXCore.setThumbnailSize(240,334);

    RXCore.setGlobalStyle(true);
    RXCore.setLineWidth(4);
    RXCore.setGlobalStyle(false);

    RXCore.useNoScale(false);
    //RXCore.useFixedScale(false);

    //this.markuptypes = RXCore.getMarkupTypes();

    if (this.guiConfig?.localStoreAnnotation === false){
      RXCore.usedbmarkup(true);
    }else{
      RXCore.usedbmarkup(false);
    }


    RXCore.initialize({ offsetWidth: 0, offsetHeight: 0});

    RXCore.onGui2DBlock((block: IVectorBlock) => {

      console.log('onGui2DBlock');
      RXCore.unselectAllBlocks();
      let lastBlock = this.rxCoreService.getSelectedVectorBlock();
      if (lastBlock) {
          // if select the same block, then unselect it
          if (block && block.index === lastBlock.index) {
            // @ts-ignore
            lastBlock.selected = false;
            RXCore.markUpRedraw();
            this.rxCoreService.setSelectedVectorBlock(undefined);
            return;
          }
          // @ts-ignore
          lastBlock.selected = false;
      }

      if (block) {
        // @ts-ignore
        block.selected = true;     
        //RXCore.selectVectorBlock(block.index);
      }
      RXCore.markUpRedraw();
      this.rxCoreService.setSelectedVectorBlock(block);


      
    });

    RXCore.onGui2DBlockHoverEvent((result, mouse) => {

      
      if (result) {
        const insert = result.insert;

        const isLeft = mouse.x < window.innerWidth / 2;
        const isTop = mouse.y < window.innerHeight / 2;
        let offsetX = 0;
        let offsetY = 0;
        if (isLeft) {
          offsetX = 30;
        } else {
          offsetX = -160;
        }
        if (isTop) {
          offsetY = 30;
        } else {
          offsetY = -80;


        } 

        const attributes = RXCore.getBlockAttributes(result.index);
        //const tag = attributes.length == 0 ? ' (No Attribute)' : '';
        const tag = attributes.length > 0 ? '<br>Attribute: Yes' : '';


        this.tooltipService.tooltip({
          title: 'Block Information',
          message: `Name: ${result.name}${tag}`,

          duration: 3000,
          position: [mouse.x / window.devicePixelRatio + offsetX, mouse.y / window.devicePixelRatio + offsetY],
        });

      } else {
        this.tooltipService.closeTooltip();

      }
    })

    
    RXCore.onGui2DEntityInfo((vectorinfo : any, screenmouse :any, pathindex : any) => {

      if(vectorinfo.Block != undefined){

        if(vectorinfo.Block.listed){


          //this.infoPanelVisible = true;
          this.showBlockInfo(vectorinfo.Block);
          //this.infoData = getBlockAttributes(vectorinfo.Block);
  
        }else{
  
          this.infoPanelVisible = false;
  
        }

      }



    });

    RXCore.onGui2DEntityInfoScreen((vectorinfo : any, screenmouse :any, pathindex : any) => {
      // to use with vector entity selection tool mouse over.
      

      if(pathindex.index){

        let messagetext : string = 'Type: ' +  vectorinfo.Entity.typename + '<br>' +
        //'Block: ' + vectorinfo.Block.name + '<br>' +

        'Layer: ' + vectorinfo.Layername;


        if(vectorinfo.Block != undefined){

          if(vectorinfo.Block.listed){


            const attributes = RXCore.getBlockAttributes(vectorinfo.Block.index);
            
            const tag = attributes.length > 0 ? '<br>Attribute: Yes' : '';

            //const tag = attributes.length == 0 ? ' (No Attribute)' : '';
  
            messagetext = 'Type: ' +  vectorinfo.Entity.typename + '<br>' +

            'Block: ' + vectorinfo.Block.name + tag + '<br>' +
            'Layer: ' + vectorinfo.Layername;
  
          }else{
            messagetext = 'Type: ' +  vectorinfo.Entity.typename + '<br>' +
  
            'Layer: ' + vectorinfo.Layername;
  
            this.infoPanelVisible = false;
  
          }
  

        }
        //entity = {type : vectorobj.entityType.type, handle : vectorobj.entityType.handleLow, typename : getvectorType(vectorobj.entityType.type), startp : startpoint, endp : endpoint, length : length};
        if(vectorinfo.Entity.length != undefined && !isNaN(vectorinfo.Entity.length)){

          messagetext = messagetext + '<br> Length: ' + vectorinfo.Entity.length.toFixed(2);

        

        }
        if(vectorinfo.Entity.area != undefined && !isNaN(vectorinfo.Entity.area)){

          messagetext = messagetext + '<br> Area: ' + vectorinfo.Entity.area.toFixed(2);

        

        }

        if(vectorinfo.Entity.sweep != undefined && !isNaN(vectorinfo.Entity.sweep)){

          //entity = {type : vectorobj.entityType.type, handle : vectorobj.entityType.handleLow, typename : getvectorType(vectorobj.entityType.type), length : length, sweep : sweep, radius : radius};
          messagetext = messagetext + '<br> Sweep Angle: ' + vectorinfo.Entity.sweep.toFixed(2);

        

        }


        if(vectorinfo.Entity.radius != undefined && !isNaN(vectorinfo.Entity.radius)){

          //entity = {type : vectorobj.entityType.type, handle : vectorobj.entityType.handleLow, typename : getvectorType(vectorobj.entityType.type), length : length, sweep : sweep, radius : radius};
          messagetext = messagetext + '<br> Radius: ' + vectorinfo.Entity.radius.toFixed(2);

        

        }



        //entity = {type : vectorobj.entityType.type, handle : vectorobj.entityType.handleLow, typename : getvectorType(vectorobj.entityType.type), startp : startpoint, endp : endpoint, length : length};
        /*if(vectorinfo.Entity.length != undefined && !isNaN(vectorinfo.Entity.length)){

          messagetext = messagetext + '\n Length: ' + vectorinfo.Entity.length.toFixed(2);
                    
          
        }*/

        const isLeft = screenmouse.x < window.innerWidth / 2;
        const isTop = screenmouse.y < window.innerHeight / 2;
        let offsetX = 0;
        let offsetY = 0;
        if (isLeft) {
          offsetX = 30;
        } else {
          offsetX = -160;
        }
        if (isTop) {
          offsetY = 30;
        } else {
          offsetY = -120;


        } 
        


        this.tooltipService.tooltip({
          title: 'Entity Information',
          message: messagetext,
          duration: 3000,
          position: [screenmouse.x / window.devicePixelRatio + offsetX, screenmouse.y / window.devicePixelRatio + offsetY],
        });


        
      }else{
        //console.log("nothing found");
        this.tooltipService.closeTooltip();
        
      }      

    });

    RXCore.onGuiReady((initialDoc: any) => {

      this.bguireadycalled = true;
      //this.bfoxitreadycalled = true;

      console.log('RxCore GUI_Ready.');
      console.log(`Read Only Mode - ${RXCore.getReadOnly()}.`);
      console.log('UI version',this.uiversion);

      RXCore.setLayout(0, 0, false);
      RXCore.doResize(false,0, 0);/*added to set correct canvas size on startup */


      RXCore.setdisplayBackground(document.documentElement.style.getPropertyValue("--background") || '#D6DADC');
      RXCore.setrxprintdiv(document.getElementById('printdiv'));

      this.openInitFile(initialDoc);  
      

      /*if(this.bguireadycalled){
        return;
      }*/

            

    });


    RXCore.onGuiFoxitReady((initialDoc: any) => {


      this.bfoxitreadycalled = true;

      
      if(this.bguireadycalled){
        this.openInitFile(initialDoc);
      }



      this.rxCoreService.guiFoxitReady.next();



    });

    RXCore.onGuiState((state: any) => {
      //console.log('RxCore GUI_State:', state);
      //console.log('RxCore GUI_State:', state.source);

      this.state = state;
      this.rxCoreService.setNumOpenFiles(state?.numOpenFiles);
      this.rxCoreService.setGuiState(state);

      if (this.eventUploadFile) this.fileGaleryService.sendStatusActiveDocument('awaitingSetActiveDocument');
      if ((state.source === 'forcepagesState' && state.isPDF) || (state.source === 'setActiveDocument' && !state.isPDF)) {
        
        this.fileGaleryService.sendStatusActiveDocument(state.source);
        this.eventUploadFile = false;
      }

      if(state.isPDF && state.numpages > 1){
        RXCore.usePanToMarkup(true);
      }else{
        RXCore.usePanToMarkup(false);
      }

      //

    });

    RXCore.onGuiPage((state) => {
     this.rxCoreService.guiPage.next(state);
    });

    RXCore.onGuiFileLoadComplete(() => {
      console.log('RxCore onGuiFileLoadComplete:');

      let FileInfo = RXCore.getCurrentFileInfo();

      //this.title = FileInfo.name;

      //this.titleService.setTitle(this.title);

      this.recentfilesService.addRecentFile(FileInfo);

            
      this.rxCoreService.guiFileLoadComplete.next();


      // TODO: The settings are effective after the file is loaded completely.
      this.userService.canUpdateAnnotation$.subscribe((canUpdate) => {
        // By setting the markup lock, operations such as dragging the markup with the mouse are prohibited.
        RXCore.lockMarkup(!canUpdate);
      });

      this.userService.canViewAnnotation$.subscribe((canView) => {
        //RXCore.hideMarkUp();
      });

      if(this.guiConfig?.watermarkdemo){

        RXCore.addWatermarkToAllPages('Rasterex', {
          position: 'Center',
          offsetX: 0,
          offsetY: 0,
          scale: 0.5,
          opacity: 50,
          font: 4,
          rotation: 45,
          flags : 2
        });
    

      }

      
      

    });

    this.userService.currentUser$.subscribe((user) => {
        if (this.canCollaborate && this.guiConfig) {
        this.guiConfig.canFileOpen = !!user;
      }
        const username = user?.username || '';
        const displayName = user?.displayName || '';
        if (this.canCollaborate) {
          this.collabService.setUsername(username, displayName);
        }

        let JSNObj = [
          {
              Command: "GetConfig",
              UserName: user?.username || "Demo",
              DisplayName : user?.displayName || "Demo User"
          }
        ];
        RXCore.setJSONConfiguration(JSNObj);
      });
    
    RXCore.onGuiScaleListLoadComplete(() => {
      this.rxCoreService.guiScaleListLoadComplete.next();
    });

    
    RXCore.onGuiMarkup((annotation: any, operation: any) => {
      console.log('RxCore GUI_Markup:', annotation, operation);
      if (annotation !== -1 || this.rxCoreService.lastGuiMarkup.markup !== -1) {
        
        if (annotation !== -1 && (this.isCollaborate() || this.isStorageAnnotation())) {
          if (operation.created) {
            this.addMarkup(annotation);
          }
          else if (operation.deleted) {
            this.deleteMarkup(annotation);
            this.rxCoreService.setGuiMarkup(annotation, operation);
          }
          else {
            this.rxCoreService.setGuiMarkup(annotation, operation);
          }
        }
        else {
          this.rxCoreService.setGuiMarkup(annotation, operation);
        }
        
      }

    });    

    RXCore.onGuiMarkupJSON((list: String) => {
      

      console.log('RxCore GUI_MarkupJSON:', list);


    });


    RXCore.onGuiMarkupIndex((annotation: any, operation: any) => {
      console.log('RxCore GUI_Markup index:', annotation, operation);
      if (annotation !== -1 || this.rxCoreService.lastGuiMarkup.markup !== -1) {
        this.rxCoreService.setGuiMarkupIndex(annotation, operation);
        //this.rxCoreService.setGuiMarkupMeasureRealTimeData(annotation);
      }
    });

    RXCore.onGuiMarkupMeasureRealTimeData((annotation: any) => {
      //console.log('RxCore GUI_MarkupMeasureRealTimeData:', annotation);
      if (annotation !== -1) {
        this.rxCoreService.setGuiMarkupMeasureRealTimeData(annotation);
      }
    });


    RXCore.onGuiMarkupHover((markup, x, y) => {
      this.rxCoreService.setGuiMarkupHover(markup, x, y);
    });

    RXCore.onGuiMarkupUnselect((markup) => {
      this.rxCoreService.setGuiMarkupUnselect(markup);
    });

    RXCore.onRotatePage((degree: number, pageIndex: number) => {
      this.rxCoreService.setGuiRotatePage(degree, pageIndex);

    });

    RXCore.onRotateDocument((degree: number) => {
      this.rxCoreService.setGuiRotateDocument(degree);

    });

    RXCore.onZoomUpdated((zoomparams:any, type : number) => {
      this.rxCoreService.setGuiZoomUpdated(zoomparams, type);
    });


    

    RXCore.onGuiMarkupList(list => {
      console.log('RxCore onGuiMarkupList:', list);
      if (list){
        this.rxCoreService.setGuiMarkupList(list);
        this.lists = list?.filter(markup => markup.type != MARKUP_TYPES.SIGNATURE.type && markup.subtype != MARKUP_TYPES.SIGNATURE.subType);
        this.lists?.forEach(list => {
          setTimeout(() => {
            list.rectangle = { x: list.x + list.w - 20, y: list.y - 20 };


          }, 100);
        });
      }
      
    });

    /*RXCore.onGuiMarkupPaths((pathlist) => {

      for(var pi = 0;  pi < pathlist.length; pi++)[
        //get each markup url here.
      ]


    });*/

    RXCore.onGuiTextInput((rectangle: any, operation: any) => {
      this.rxCoreService.setGuiTextInput(rectangle, operation);
      console.log('onGuiTextInput:', rectangle, operation);
      if(operation.start && operation.markup){
        this.addTextMarkup(operation.markup);
        

        /*if (operation.markup && roomId && this.canCollaborate) {

            //&& (operation.created || operation.deleted)
            let cs = this.collabService;
            operation.markup.getJSONUniqueID({ created: true}).then(function(jsondata){
  
              //const data = JSON.parse(jsondata);
              //data.operation = operation;
              cs.sendMarkupMessage(roomId, jsondata, { created: true});
  
            });
          
        }*/

      }

    });

    RXCore.onGuiVectorLayers((layers) => {
      this.rxCoreService.setGuiVectorLayers(layers);
    });

    RXCore.onGuiVectorBlocks((blocks) => {
      this.rxCoreService.setGuiVectorBlocks(blocks);
    });

    RXCore.onGui3DParts((parts) => {
      this.rxCoreService.setGui3DParts(parts);
    });

    RXCore.onGui3DPartInfo(info => {
      this.rxCoreService.setGui3DPartInfo(info);
    });

    RXCore.onGuiPagethumbs((thumbnails) => {
      this.rxCoreService.setGuiPageThumbs(thumbnails);
    });

    RXCore.onGuiPagethumb((pageindex, thumbnail) => {
      this.rxCoreService.setGuiPageThumb(thumbnail);
    });

    RXCore.onGuiPDFBookmarks((bookmarks) => {
      this.rxCoreService.setGuiPdfBookmarks(bookmarks);
    });

    RXCore.onGuiMarkupSave(() => {
      this.notificationService.notification({message: 'Markups have been successfully saved.', type: 'success'});
    });

    RXCore.onGuiResize(() => {
      this.rxCoreService.guiOnResize.next();
    });

    RXCore.onGuiExportComplete((fileUrl) => {
      this.rxCoreService.guiOnExportComplete.next(fileUrl);
    });

    RXCore.onGuiCompareMeasure((distance, angle, offset, pagewidth, scaleinfo) => {
      this.rxCoreService.guiOnCompareMeasure.next({distance, angle, offset, pagewidth, scaleinfo});
    });

    RXCore.onGuiMarkupChanged((annotation, operation) => {
      console.log('RxCore onGuiMarkupChanged:', annotation, operation);
      this.rxCoreService.guiOnMarkupChanged.next({annotation, operation});
      //if (operation.modified) {
      this.updateMarkup(annotation);
      //}
    });    

    RXCore.onGuiPanUpdated((sx, sy, pagerect) => { 
      this.rxCoreService.guiOnPanUpdated.next({sx, sy, pagerect});
    });

    RXCore.onGuiZoomUpdate((zoomparams, type) => { 
      this.rxCoreService.guiOnZoomUpdate.next({zoomparams, type});
    });

    RXCore.onGui3DCameraSave((camera, fileActive) => {

      if(fileActive){
        RXCore.restoreCameraByName(camera.name);

      }

    });

    let timeoutId: any = null;

    RXCore.onGuiPageScale((fileindex, pagenumber, scaleobject) => {
      console.log('RxCore onGuiPageScale:', fileindex, pagenumber, scaleobject);
      if (!this.isCollaborate() || !this.collabService.needMeasureScaleSync()) {
        return;
      }
      // Avoid triggering frequently.
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.collabService.sendChatMessage(this.getRoomId(), {
          text: 'MeasurementScale',
          data: scaleobject,
        });
      }, 1000);
     
    });

    /*RXCore.onGuiUpload((upload :any) =>{
      
      this.isUploadFile = true;

      if(upload < 100){
        
        if(this.progressBar){
          this.progressBar.nativeElement.value = upload;
        }  
        
      }else{
        this.isUploadFile = false;
      }

    });*/
  }

  ngOnDestroy() {
    this.tooltipService.closeTooltip();
    this.infoPanelVisible = false;
  }

  private isCollaborate() {
    //const roomId = this.getRoomId();
    //const collaboration = roomId && this.canCollaborate;
    const collaboration = this.canCollaborate;
    return collaboration;
  }

  private isStorageAnnotation() {
    //const path = RXCore.getOriginalPath();
   //const storageAnnotation = this.guiConfig?.localStoreAnnotation === false && path != '';
    const storageAnnotation = this.guiConfig?.localStoreAnnotation === false;
    // When "collaborate" is turned on, database storage must be enabled.
    return storageAnnotation || this.isCollaborate();
  }

  private addMarkup(annotation: any) {
    if (!annotation || annotation == -1 ) {
      return;
    }
    if (!this.collabService.needSync()) {
      return;
    }
    
    const docId = this.collabService.getDocId();
    const storageAnnotation = this.isStorageAnnotation();
    const operation = { created: true };
    // If collab feature is enabled, send the markup message to the server
    const roomId = this.getRoomId();
    const collaboration = this.isCollaborate();
    // Text with an arrow. Handles it in the onGuiTextInput callback.
    if ((storageAnnotation || collaboration) && !(((annotation.type == MARKUP_TYPES.TEXT.type && annotation.bhasArrow) || (annotation.type == MARKUP_TYPES.CALLOUT.type && annotation.bisTextArrow)))) {
      
      annotation.getJSONUniqueID(operation).then((jsonData)=>{

        if (storageAnnotation) {
          const user = this.userService.getCurrentUser();
          if (annotation.dbUniqueID == null) {
              this.annotationStorageService.createAnnotation(1, docId, jsonData, roomId, user?.id).then((result)=>{
                // Retain the returned unique ID.
                annotation.dbUniqueID = result.id;
              });
          }
        }

        if (collaboration && roomId) {
            let cs = this.collabService;
            cs.sendMarkupMessage(roomId, jsonData, operation);
        }

        this.rxCoreService.setGuiMarkup(annotation, operation);
      });
    }
  }

  private addTextMarkup(annotation: any) {
    if (!annotation || annotation == -1 ) {
      return;
    }
    if (!this.collabService.needSync()) {
      return;
    }

    const docId = this.collabService.getDocId();
    const storageAnnotation = this.isStorageAnnotation();

    const roomId = this.getRoomId();
    const collaboration = this.isCollaborate();
    const operation = { created: true };
    if (storageAnnotation || collaboration) {
      annotation.getJSONUniqueID(operation).then((jsonData)=>{

        if (storageAnnotation) {
          const user = this.userService.getCurrentUser();
          this.annotationStorageService.createAnnotation(1, docId, jsonData, roomId, user?.id).then((result)=>{
            // Retain the returned unique ID.
            annotation.dbUniqueID = result.id;
            if (annotation.bhasArrow && annotation.markupArrowConnected) {
              annotation.markupArrowConnected.dbUniqueID = annotation.dbUniqueID;
            } else if (annotation.bisTextArrow && annotation.textBoxConnected) {
              annotation.textBoxConnected.dbUniqueID = annotation.dbUniqueID;
            }
          });
        }

        if (collaboration && roomId) {
          const cs = this.collabService;
          cs.sendMarkupMessage(roomId, jsonData, operation);
        }

      });
    }
  }

  private deleteMarkup(annotation: any) {
    if (!annotation || annotation == -1) {
      return;
    }

    if (!this.collabService.needSync()) {
      return;
    }

    const storageAnnotation = this.isStorageAnnotation();
    const operation = { deleted: true };
    // If collab feature is enabled, send the markup message to the server
    const roomId = this.getRoomId();
    const collaboration = this.isCollaborate();

    if (storageAnnotation || collaboration) {
      annotation.getJSONUniqueID(operation).then((jsonData) => {
        if (annotation.dbUniqueID != null) {
          this.annotationStorageService.deleteAnnotation(annotation.dbUniqueID);
        }
        if (collaboration && roomId) {
          let cs = this.collabService;
          cs.sendMarkupMessage(roomId, jsonData, operation);
        }
      });
    }
  }

  private updateMarkup(annotation: any) {
    if (!annotation || annotation == -1) {
      return;
    }
    if (!this.collabService.needSync()) {
      return;
    }
    
    const storageAnnotation = this.isStorageAnnotation();

    const roomId = this.getRoomId();
    const collaboration = this.isCollaborate();
    const operation = { modified: true };

    if (storageAnnotation || collaboration) {

      const updateAnnotation = (jsonData)=>{
        if (storageAnnotation) {
          if (annotation.dbUniqueID != null) {
            //console.log('RxCore onGuiMarkupChanged:', annotation, operation);
            this.annotationStorageService.updateAnnotation(annotation.dbUniqueID, jsonData);
          }
        }
        
        if (collaboration && roomId) {
          this.collabService.sendMarkupMessage(roomId, jsonData, operation);
        }
      };
      
      if(annotation.type == 8 && annotation.subtype == 2){

        if(annotation.parent){
          
          annotation.parent.getJSONUniqueID(operation).then((jsonData) => {

            updateAnnotation(jsonData);
            
          });

        }

      } else {
        
        annotation.getJSONUniqueID(operation).then((jsonData) =>{

          updateAnnotation(jsonData);

        });
      }
    }
  }

  private getBlockAttributes(block: IVectorBlock): Array<any> {
    const arr: Array<any> = [];

    const attributes = RXCore.getBlockAttributes(block.index);
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      arr.push({name: attribute.name, value: attribute.value});
    }
    // @ts-ignore
    /* const insert = block.insert;
    if (insert) {
      arr.push({ name: "Handle", value: insert.blockhandleHigh > 0 ? insert.blockhandleHigh.toString(16).toUpperCase() : '' + insert.blockhandleLow.toString(16).toUpperCase() });
      arr.push({ name: "Insert", value: `(${insert.insertX}, ${insert.insertY}, ${insert.insertZ})` });
      arr.push({ name: "Scale", value: `(${insert.insertscaleX}, ${insert.insertscaleY}, ${insert.insertscaleZ})` });
      arr.push({ name: "Rotation", value: insert.insertRot });
    } */

    return arr;
  }

  showBlockInfo(block: IVectorBlock | undefined) {
    if (!block) {
       this.infoPanelVisible = false;
    } else {
      this.infoPanelVisible = true;
      this.infoData = this.getBlockAttributes(block);
    }
  }

  getRoomId() {
    if (!this.isCollaborate()) {
      return "";
    }
    return this.collabService.getRoomId();
  }


  openInitFile(initialDoc){

    if (this.bguireadycalled && this.bfoxitreadycalled){

      if(initialDoc.open && !this.binitfileopened){


        if(initialDoc.openfileobj != null){
            this.binitfileopened = true;
          RXCore.openFile(initialDoc.openfileobj);
          }
      }
    }
  }

  handleChoiceFileClick() {
    this.fileGaleryService.openModal();
  }

  handleLoginClick(){
    console.log("log in pressed");
  }

  onMouseDown(event): void {
    /* const isPasteMarkUp = this.pasteStyle['display'] === 'flex';

    if (event.button === 2 || event.type === 'touchstart') {
      this.timeoutId = setTimeout(() => {
        this.pasteStyle = { left: event.clientX - 200 + 'px', top: event.clientY - 100 + 'px', display: 'flex' };
      }, 2000);
    } else if ((event.button === 0 && isPasteMarkUp) || (event.type === 'touchstart' && isPasteMarkUp)) {
      this.pasteStyle = { display: 'none' };
    } */
  }

  onMouseUp(event): void {
    // if (event.button === 2 || event.type === 'touchend') clearTimeout(this.timeoutId);
  }

  onKeydown(event):void{

    if (event.key == "z" ) {
      event.preventDefault();
      RXCore.pageLock(true);
      console.log( event.key, "kay pressed");
    }
   
  }

  onKeyup(event):void{

    if (event.key == "z" ) {
      event.preventDefault();
      RXCore.pageLock(false);
      console.log( event.key, "kay released");
    }
   
  }


  pasteMarkUp(): void {
/*     RXCore.pasteMarkUp();
    this.pasteStyle = { display: 'none' };
 */  
}

}
