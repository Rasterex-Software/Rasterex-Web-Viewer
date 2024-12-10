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
  uiversion : string = '12.0.0.8'
  numOpenFiles$ = this.rxCoreService.numOpenedFiles$;
  annotation: any;
  rectangle: any;
  isVisible: boolean = true;
  followLink: boolean = false;
  convertPDFAnnots : boolean | undefined = false;
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
    private titleService:Title) { }

  ngOnInit() {

    
    this.guiConfig$.subscribe(config => {
      this.guiConfig = config;
      this.convertPDFAnnots = this.guiConfig.convertPDFAnnots;

    });

    this.titleService.setTitle(this.title);
    this.fileGaleryService.getEventUploadFile().subscribe(event => this.eventUploadFile = event);
    this.fileGaleryService.modalOpened$.subscribe(opened => {
      if (!opened) {
        this.eventUploadFile = false;
      }
    });
    
  }
  

  ngAfterViewInit(): void {
    

    /*this.guiConfig$.subscribe(config => {

      RXCore.convertPDFAnnots(config.convertPDFAnnots);
      
    });*/

    RXCore.convertPDFAnnots(this.convertPDFAnnots);

    let JSNObj = [
      {
          Command: "GetConfig",
          UserName: "Demo",
          DisplayName : "Demo User"
          
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


    RXCore.initialize({ offsetWidth: 0, offsetHeight: 0});


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

    });
    
    RXCore.onGuiScaleListLoadComplete(() => {
      this.rxCoreService.guiScaleListLoadComplete.next();
    });

    RXCore.onGuiMarkup((annotation: any, operation: any) => {
      console.log('RxCore GUI_Markup:', annotation, operation);
      if (annotation !== -1 || this.rxCoreService.lastGuiMarkup.markup !== -1) {
        this.rxCoreService.setGuiMarkup(annotation, operation);
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

    RXCore.onGuiMarkupList(list => {
      
      this.rxCoreService.setGuiMarkupList(list);
      this.lists = list?.filter(markup => markup.type != MARKUP_TYPES.SIGNATURE.type && markup.subtype != MARKUP_TYPES.SIGNATURE.subType);
      this.lists?.forEach(list => {
        setTimeout(() => {
          list.rectangle = { x: list.x + list.w - 20, y: list.y - 20 };
        }, 100);
      });
    });

    /*RXCore.onGuiMarkupPaths((pathlist) => {

      for(var pi = 0;  pi < pathlist.length; pi++)[
        //get each markup url here.
      ]


    });*/

    RXCore.onGuiTextInput((rectangle: any, operation: any) => {
      this.rxCoreService.setGuiTextInput(rectangle, operation);
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
    });

    RXCore.onGuiPanUpdated((sx, sy, pagerect) => { 
      this.rxCoreService.guiOnPanUpdated.next({sx, sy, pagerect});
    });

    RXCore.onGuiZoomUpdate((zoomparams, type) => { 
      this.rxCoreService.guiOnZoomUpdate.next({zoomparams, type});
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
