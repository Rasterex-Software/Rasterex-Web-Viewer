import { AfterViewInit, Component } from '@angular/core';
import { FileGaleryService } from './components/file-galery/file-galery.service';
import { RxCoreService } from './services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { NotificationService } from './components/notification/notification.service';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { AnnotationToolsService } from './components/annotation-tools/annotation-tools.service';
import { RecentFilesService } from './components/recent-files/recent-files.service';
import { UserService } from './components/user/user.service';
import { Title } from '@angular/platform-browser';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { CollabService } from './services/collab.service';
import { AnnotationStorageService } from './services/annotation-storage.service';





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  //@ViewChild('progressBar') progressBar: ElementRef;
  
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
  canCollaborate : boolean | undefined = false;
  eventUploadFile: boolean = false;
  lists: any[] = [];
  state: any;
  bfoxitreadycalled : boolean = false;
  bguireadycalled : boolean = false;
  binitfileopened : boolean = false;
  timeoutId: any;
  isUploadFile: boolean = false;
  pasteStyle: { [key: string]: string } = { display: 'none' };


  constructor(
    private readonly recentfilesService: RecentFilesService,
    private readonly rxCoreService: RxCoreService,
    private readonly fileGaleryService: FileGaleryService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly collabService: CollabService, 
    private readonly annotationStorageService: AnnotationStorageService, 
    private titleService:Title) { }

  ngOnInit() {

    
    this.guiConfig$.subscribe(config => {
      this.guiConfig = config;
      this.convertPDFAnnots = this.guiConfig.convertPDFAnnots;
      this.createPDFAnnotproxy = this.guiConfig.createPDFAnnotproxy;
      this.showAnnotationsOnLoad = this.guiConfig.showAnnotationsOnLoad;
      this.canCollaborate = this.guiConfig.canCollaborate;
      RXCore.markupDisplayOnload(this.showAnnotationsOnLoad);
    });

    this.titleService.setTitle(this.title);
    this.fileGaleryService.getEventUploadFile().subscribe(event => this.eventUploadFile = event);
    this.fileGaleryService.modalOpened$.subscribe(opened => {
      if (!opened) {
        this.eventUploadFile = false;
      }
    });

    // if we can find the roomName in the URL, we will create a collabService
    const parameters = new URLSearchParams(window.location.search);
    const roomName = parameters.get('roomName');
    if (this.canCollaborate && roomName) {
      const user = this.userService.getCurrentUser();
      const username = user?.username || '';
      this.collabService.connect(roomName, username);
      // We need to call openModal() here, so it can call handleFileSelect() in file-galery
      // TODO: there should be a better logic to open a file!
      this.fileGaleryService.openModal();
    }
    
    
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
    RXCore.useFixedScale(false);

    //this.markuptypes = RXCore.getMarkupTypes();



    RXCore.initialize({ offsetWidth: 0, offsetHeight: 0});


    RXCore.onGui2DBlock((blockobj : any) => {
      console.log(blockobj);
    });


    
    RXCore.onGui2DEntityInfo((vectorinfo : any, screenmouse :any, pathindex : any) => {

      if(pathindex.index){

        //partlistAll = {Index : partindex, Block : foundblock, Layername : foundlayer, Entity : entity} 


        let messagetext : string = 'Handle : ' + vectorinfo.Entity.handle + '\n' +
        'Type : ' +  vectorinfo.Entity.typename + '\n' +
        'Block : ' + vectorinfo.Block.name + '\n' +
        'Layer : ' + vectorinfo.Layername; 


        if(vectorinfo.Block.listed){
          messagetext = 'Handle : ' + vectorinfo.Entity.handle + '\n' +
          'Type : ' +  vectorinfo.Entity.typename + '\n' +
          'Block : ' + vectorinfo.Block.name + '\n' +
          'Layer : ' + vectorinfo.Layername; 
  
        }else{
          messagetext = 'Handle : ' + vectorinfo.Entity.handle + '\n' +
          'Type : ' +  vectorinfo.Entity.typename + '\n' +
          'Layer : ' + vectorinfo.Layername;
  
        }
        

        //listed
        
        this.notificationService.notification({message: messagetext, type: 'info', duration : 10000});


        
      }else{
        //console.log("nothing found");
      }

    });

    RXCore.onGui2DEntityInfoScreen((vectorinfo : any, screenmouse :any, pathindex : any) => {
      // to use with vector entity selection tool mouse over.

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
      console.log('RxCore GUI_State:', state);
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
      

      let FileInfo = RXCore.getCurrentFileInfo();

      //this.title = FileInfo.name;

      //this.titleService.setTitle(this.title);

      this.recentfilesService.addRecentFile(FileInfo);

            
      this.rxCoreService.guiFileLoadComplete.next();

      this.userService.currentUser$.subscribe((user) => {
        const username = user?.username || '';
        if (this.canCollaborate) {
          this.collabService.setUsername(username);
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


      // TODO: The settings are effective after the file is loaded completely.
      this.userService.canUpdateAnnotation$.subscribe((canUpdate) => {
        // By setting the markup lock, operations such as dragging the markup with the mouse are prohibited.
        RXCore.lockMarkup(!canUpdate);
      });

      this.userService.canViewAnnotation$.subscribe((canView) => {
        //RXCore.hideMarkUp();
      });
      
     
      console.log('RxCore onGuiFileLoadComplete:');
      const path = RXCore.getOriginalPath();
      if (this.guiConfig?.localStoreAnnotation === false && path) {
        this.annotationStorageService.getAnnotations(1, path).then((annotations)=>{
          annotations.forEach((annotation)=>{
            RXCore.setMarkupfromJSON(annotation.data);
            const markup = RXCore.getLastMarkup();
            if (markup) {
              (markup as any).dbUniqueID = annotation.id;
            }
          })   
        });
      }

    });
    
    RXCore.onGuiScaleListLoadComplete(() => {
      this.rxCoreService.guiScaleListLoadComplete.next();
    });

    RXCore.onGuiMarkup((annotation: any, operation: any) => {
      console.log('RxCore GUI_Markup:', annotation, operation);
      if (annotation !== -1 || this.rxCoreService.lastGuiMarkup.markup !== -1) {
        this.rxCoreService.setGuiMarkup(annotation, operation);

        // Handle addition, deletion, and modification
        const path = RXCore.getOriginalPath();
        if (this.guiConfig?.localStoreAnnotation === false && annotation !== -1 && path) {
          const user = this.userService.getCurrentUser();
          if (operation.created) {
            this.annotationStorageService.createAnnotation(1, path, annotation.getJSON(),user?.id).then((result)=>{
              // Retain the returned unique ID.
              annotation.dbUniqueID = result.id;
            });
          } else if (operation.modified && annotation.dbUniqueID != null) {
            this.annotationStorageService.updateAnnotation(annotation.dbUniqueID, annotation.getJSON());
          } else if (operation.deleted && annotation.dbUniqueID != null) {
            this.annotationStorageService.deleteAnnotation(annotation.dbUniqueID);
          }
        }

        
        // If collab feature is enabled, send the markup message to the server
        // Handle created/deleted here

        if (annotation !== -1 && this.canCollaborate && (operation.created || operation.deleted)) {

          let cs = this.collabService;
          annotation.getJSONUniqueID(operation).then(function(jsondata){

            //const data = JSON.parse(jsondata);
            //data.operation = operation;
            cs.sendMarkupMessage(jsondata, operation);

          });


          
        }

        /*if (annotation !== -1 || this.rxCoreService.lastGuiMarkup.markup !== -1) {
      if (annotation !== -1) {
        var ws = this.websocketService;

        annotation.getJSONUniqueID(operation).then(function(jsondata){

          const data = JSON.parse(jsondata);

          data.operation = operation;

          console.log(data.operation);

          ws.broadcastGuiMarkup({ annotation: JSON.stringify(data) });

        });

      }
      
    }*/

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


    

    RXCore.onGuiMarkupList(list => {

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
      console.log('RxCore onGuiTextInput:', rectangle, operation);
      this.rxCoreService.setGuiTextInput(rectangle, operation);

      if (operation.start) {
        const path = RXCore.getOriginalPath();
        if (this.guiConfig?.localStoreAnnotation === false && operation.markup && path) {
          const user = this.userService.getCurrentUser();
          const annotation = operation.markup;
          this.annotationStorageService.createAnnotation(1, path, annotation.getJSON(),user?.id).then((result)=>{
            // Retain the returned unique ID.
            annotation.dbUniqueID = result.id;
          });
        }

        if (operation.markup && this.canCollaborate) {

                    //&& (operation.created || operation.deleted)
                    let cs = this.collabService;
                    operation.markup.getJSONUniqueID({ created: true}).then(function(jsondata){
          
                      //const data = JSON.parse(jsondata);
                      //data.operation = operation;
                      cs.sendMarkupMessage(jsondata, { created: true});
          
                    });
          
        }


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
      this.rxCoreService.guiOnMarkupChanged.next({annotation, operation});

      if (annotation !== -1 && this.canCollaborate) {

        let cs = this.collabService;

        if(annotation.type == 8 && annotation.subtype == 2){

          if(annotation.parent){
            
            annotation.parent.getJSONUniqueID({ modified: true}).then(function(jsondata){
    
              //const data = JSON.parse(jsondata);
              //data.operation = { modified: true};
              //jsondata = JSON.stringify(data);
              cs.sendMarkupMessage(jsondata, { modified: true});
              //this.collabService.sendMarkupMessage(annotation.getJSON(), { modified: true});
    
            });
  
          }
  
          
        }else{
          
          annotation.getJSONUniqueID({ modified: true}).then(function(jsondata){

            //const data = JSON.parse(jsondata);
            //data.operation = { modified: true};
            //jsondata = JSON.stringify(data);
            cs.sendMarkupMessage(jsondata, { modified: true});
            //this.collabService.sendMarkupMessage(annotation.getJSON(), { modified: true});

          });
        }

        /*let cs = this.collabService;
        annotation.getJSONUniqueID({ modified: true}).then(function(jsondata){

          //const data = JSON.parse(jsondata);
          //data.operation = { modified: true};
          //jsondata = JSON.stringify(data);
          cs.sendMarkupMessage(jsondata, { modified: true});
          //this.collabService.sendMarkupMessage(annotation.getJSON(), { modified: true});

        });*/


        
      }

      /*if (annotation !== -1 || this.rxCoreService.lastGuiMarkup.markup !== -1) {
      if (annotation !== -1) {
        var ws = this.websocketService;

        annotation.getJSONUniqueID(operation).then(function(jsondata){

          const data = JSON.parse(jsondata);

          data.operation = operation;

          console.log(data.operation);

          ws.broadcastGuiMarkup({ annotation: JSON.stringify(data) });

        });

      }
      
    }*/



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
    const isPasteMarkUp = this.pasteStyle['display'] === 'flex';

    if (event.button === 2 || event.type === 'touchstart') {
      this.timeoutId = setTimeout(() => {
        this.pasteStyle = { left: event.clientX - 200 + 'px', top: event.clientY - 100 + 'px', display: 'flex' };
      }, 2000);
    } else if ((event.button === 0 && isPasteMarkUp) || (event.type === 'touchstart' && isPasteMarkUp)) {
      this.pasteStyle = { display: 'none' };
    }
  }

  onMouseUp(event): void {
    if (event.button === 2 || event.type === 'touchend') clearTimeout(this.timeoutId);
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
    RXCore.pasteMarkUp();
    this.pasteStyle = { display: 'none' };
  }

}
