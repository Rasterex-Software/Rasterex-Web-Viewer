import { Component, ElementRef, HostListener, OnInit, AfterViewInit } from '@angular/core';
import { AnnotationToolsService } from '../annotation-tools.service';
import { RXCore } from 'src/rxcore';
import { IMarkup } from 'src/rxcore/models/IMarkup';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { UserService } from '../../user/user.service';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';

declare var LeaderLine: any;

@Component({
  selector: 'rx-note-panel',
  templateUrl: './note-panel.component.html',
  styleUrls: ['./note-panel.component.scss'],
  host: {
    '(window:resize)': 'onWindowResize($event)'
  }
})
export class NotePanelComponent implements OnInit, AfterViewInit {
  visible: boolean = false;

  list: { [key: string]: Array<IMarkup> };
  annotlist: Array<IMarkup>;
  search: string;
  panelwidth : number = 300;

  guiConfig$ = this.rxCoreService.guiConfig$;
  guiRotatePage$ = this.rxCoreService.guiRotatePage$;
  guiZoomUpdated$ = this.rxCoreService.guiZoomUpdated$;
  scrolled : boolean = false;


  guiConfig: IGuiConfig | undefined;

  markuptypes: any[] = [];
  panelTitle: string = 'Annotations and Measurements';

  /*added for comment list panel */
  note: any[] = [];
  connectorLine: any;
  lineConnectorNativElement: any = document.getElementById('lineConnector');
  activeMarkupNumber: number = -1;
  markupNoteList: number[] = [];
  noteIndex: number;
  pageNumber: number = -1;
  pageRotation : number = 0;
  isHideAnnotation: boolean = false;
  pageNumbers: any[] = [];
  //sortByField: 'created' | 'author' = 'created';
  //sortByField: 'created' | 'position' | 'author' = 'created';
  sortByField: 'created' | 'position' | 'author' | 'pagenumber' | 'annotation' = 'created';



  sortOptions = [

    { value: "created", label: "Created day", imgSrc: "calendar-ico.svg" },
    { value: "author", label: "Author", imgSrc: "author-icon.svg" },
    { value: "pagenumber", label: "Page", imgSrc: "file-ico.svg" },
    { value: "position", label: "Position", imgSrc: "next-ico.svg" },
    { value: 'annotation', label: 'Annotation Type', imgSrc: "bookmark-ico.svg" },
  ];

 /*added for comment list panel */


  sortOrder = (a, b): number => 0;
  filterVisible: boolean = false;
  createdByFilterOptions: Array<any> = [];
  createdByFilter: Set<string> = new Set<string>();
  dateFilter: {
    startDate: dayjs.Dayjs | undefined,
    endDate: dayjs.Dayjs | undefined
  } = { startDate: undefined, endDate: undefined};

  /*added for comment list panel */
  private guiOnPanUpdatedSubscription: Subscription;
  private userSubscription: Subscription;
  /*added for comment list panel */

  leaderLine: any = undefined;
  rectangle: any;

  visibleStatusMenuIndex: number | null = null;
  statusTypes = [
    { value: 'accepted', text: 'Accepted' },
    { value: 'rejected', text: 'Rejected' },
    { value: 'cancelled', text: 'Cancelled' },
    { value: 'completed', text: 'Completed' },
    { value: 'none', text: 'None' },
    { value: 'marked', text: 'Marked' },
    { value: 'unmarked', text: 'Unmarked' },
  ];
  objectType: string | null = null;

  showAnnotations: boolean | undefined = true;
  showMeasurements: boolean | undefined = true;
  showAll: boolean | undefined = true;
  showAnnotationsOnLoad : boolean | undefined = false;

  markupTypes : Array<any> = [];

  //getMarkupTypes


  authorFilter: Set<string> = new Set<string>();

  rxTypeFilter : Array<any> = [];

  rxTypeFilterLoaded : Array<any> = [];

  //const result = words.filter((word) => word.length > 6);


  typeFilter = {
    showText: true,
    showNote: true,
    showCallout: true,
    showRectangle: true,
    showRoundedRectangle: true,
    showEllipse: true,
    showPolygon: true,
    showCloud: true,
    showSingleEndArrow: true,
    showFilledSingleEndArrow: true,
    showBothEndsArrow: true,
    showFilledBothEndsArrow: true,
    showHighlighter: true,
    showFreehand: true,
    showPolyline: true,
    showMeasureLength: true,
    showMeasureArea: true,
    showMeasurePath: true,
    showMeasureRectangle: true,
    showMeasureAngle : true,
    showLink: true,
    showStamp: true,
  };

  constructor(
    private readonly rxCoreService: RxCoreService,
    private el: ElementRef,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly userService: UserService) {
      dayjs.extend(relativeTime);
      dayjs.extend(updateLocale);
      dayjs.extend(isSameOrAfter);
      dayjs.extend(isSameOrBefore);
      /* dayjs.updateLocale('en', {
        relativeTime: {
          past: "%s",
          s: 'A few seconds ago',
          m: "A minute ago",
          mm: function (number) {
            return number > 10 ? `${number} minutes ago` : "A few minutes ago";
          },
          h: "An hour ago",
          hh:"Today",
          d: "Yesterday",
          dd: function (number) {
            return number > 1 ? `${number} days ago` : "Yesterday";
          },
          M: "A month ago",
          MM: "%d months ago",
          y: "A year ago",
          yy: "%d years ago"
        }
      }); */
    }

  private _showLeaderLine(markup: IMarkup): void {
    this._hideLeaderLine();

    const start = document.getElementById(`note-panel-${markup.markupnumber}`);
    if (!start) return;

    const end = document.createElement('div');
    end.style.position = 'fixed';
    end.style.left = `${markup.xscaled + 92}px`;
    end.style.top = `${markup.yscaled + 58}px`;
    end.className = 'leader-line-end';
    document.body.appendChild(end);

    this.leaderLine = new LeaderLine({
      start,
      end,
      color: document.documentElement.style.getPropertyValue("--accent"),
      size: 2,
      path: 'grid',
      endPlug: 'arrow2',
      endPlugSize: 1.5
    });
  }

  private _hideLeaderLine(): void {
    if (this.leaderLine) {
      this.leaderLine.remove();
      this.leaderLine = undefined;
    }
    document.querySelectorAll(".leader-line-end,.leader-line").forEach(el => el.remove());
  }

  private _setmarkupTypeDisplayFilter(type, onoff) : void{

    for(let mi=0; mi < this.rxTypeFilter.length;mi++){

      if(this.rxTypeFilter[mi].typename === type.typename){
        this.rxTypeFilter[mi].show = onoff;
      }

    }



  }

  private _setmarkupTypeDisplay(markup, onoff) : void{

    let markuptype = RXCore.getMarkupType(markup.type, markup.subtype);

    let typename = markuptype.type;

    if(Array.isArray(markuptype.type)){
      typename = markuptype.type[1];

    }


    for(let mi=0; mi < this.rxTypeFilter.length;mi++){

      if(this.rxTypeFilter[mi].typename === typename){
        this.rxTypeFilter[mi].show = onoff;
      }

    }

    this.rxTypeFilterLoaded = this.rxTypeFilter.filter((rxtype) => rxtype.loaded);

  }


  private _getmarkupTypeDisplay(markup): boolean | undefined{

    let showtype : boolean = false;
    let returntype : boolean = false;


    let markuptype = RXCore.getMarkupType(markup.type, markup.subtype);

    let typename = markuptype.type;

    //labelType.label = "Freehand pen";
    //labelType.type = 'PEN';

    if(Array.isArray(markuptype.type)){

      typename = markuptype.type[1];

    }


    for(let mi=0; mi < this.rxTypeFilter.length;mi++){

      if(this.rxTypeFilter[mi].typename === typename){
        showtype = this.rxTypeFilter[mi].show;
        returntype = true;
        //this.rxTypeFilter.push({typename : this.markupTypes[mi].typename, show : true});

      }



    }


    if(returntype){
      return showtype;
    }else{
      return this.showAnnotations;
    }



  }


  private _updateRxFilter(){

    this.rxTypeFilter = [];

      this.markupTypes = RXCore.getMarkupTypes();

      for(let mi=0; mi < this.markupTypes.length;mi++){

        this.rxTypeFilter.push({
          typename : this.markupTypes[mi].typename,
          label: this.markupTypes[mi].label,
          type : this.markupTypes[mi].type,
          subtype : this.markupTypes[mi].subtype,
          loaded : false,
          show : true
        });

      }

      //rxTypeFilter : Array<any> = [];

      this.rxTypeFilterLoaded = this.rxTypeFilter.filter((rxtype) => rxtype.loaded);

  }

  private _setloadedtypeFilterOff(){

    for(let mi=0; mi < this.rxTypeFilter.length;mi++){

      this.rxTypeFilter[mi].loaded = false;


    }


  }

  private _setloadedtypeFilter(annot){

    let markuptype = RXCore.getMarkupType(annot.type, annot.subtype);

    let typename = markuptype.type;

    //labelType.label = "Freehand pen";
    //labelType.type = 'PEN';

    if(Array.isArray(markuptype.type)){

      typename = markuptype.type[1];

    }

    for(let mi=0; mi < this.rxTypeFilter.length;mi++){


      if(this.rxTypeFilter[mi].typename === typename){
        //this.rxTypeFilter[mi].show = onoff;
        this.rxTypeFilter[mi].loaded = true;
        this.rxTypeFilter[mi].show = annot.display;
      }



      //this.rxTypeFilter[mi].loaded = false;

      /*if(this.rxTypeFilter[mi].type == annot.type && this.rxTypeFilter[mi].subtype == annot.subtype){

      }*/



    }




  }

  private scrollToAnnotItem(annotitem: any, showleader : boolean) {

    if(!this.visible){
      return;
    }
    // The scroolbar is in side-nav-menu, the div with class ".toggleable-panel-body",
    // we'll find it by parentElement
    let listContainer = this.el.nativeElement.querySelector(".list");

    this.scrolled = false;

    //[id]="'note-panel-' + item.markupnumber"

    //listContainer = listContainer?.parentElement?.parentElement;
    listContainer = listContainer?.parentElement;

    if (!listContainer) {
      console.warn("Failed to find scrool-able element!");
      return;
    }
    let itemselector = "#note-panel-" + annotitem.markupnumber;
    //const blockDom = listContainer.querySelector(`div[data-index='${annotitem.markupnumber}']`);
    const annotDom = listContainer.querySelector(itemselector);

    listContainer.addEventListener("scrollend", (event) => {

      this.scrolled = true;

      if(showleader){
        this.SetActiveCommentSelect(annotitem);
        showleader = false;
      }


    });

    /*listContainer.onscroll = (event) => {
      //output.textContent = "Element scroll event fired!";
      this.scrolled = true;

    };*/


    if (annotDom) {
      const topOffset = (annotDom as HTMLElement).offsetTop - listContainer.offsetTop;
      listContainer.scrollTo({
        left: 0,
        top: topOffset,
        behavior: "smooth"
      })
    }
  }

  /**
   * Helper method to safely recalculate position for active comment
   */
  private recalculateActiveCommentPosition(): void {
    if (this.activeMarkupNumber > 0) {
      this._hideLeaderLine();
      const allMarkups = [...(this.rxCoreService.getGuiMarkupList() || []), ...(this.rxCoreService.getGuiAnnotList() || [])];
      const activeMarkup = allMarkups.find(markup => markup.markupnumber === this.activeMarkupNumber);
      if (activeMarkup) {
        setTimeout(() => {
          this._setPosition(activeMarkup);
        }, 100);
      }
    }
  }

  private _processList(list: Array<IMarkup> = [], annotList: Array<IMarkup> = []): void {
    /*modified for comment list panel */

    const mergeList = [...list, ...annotList];
    const query = mergeList.filter((i: any) => {
      // Check if markup is a measurement type
      /*if(i.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
        (i.type === MARKUP_TYPES.MEASURE.AREA.type &&
          i.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
        (i.type === MARKUP_TYPES.MEASURE.PATH.type &&
          i.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
        (i.type === MARKUP_TYPES.MEASURE.RECTANGLE.type &&
          i.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType))
          return this.showMeasurements;*/


          return this._getmarkupTypeDisplay(i);

          //RXCore.getMarkupType()

          /*if(i.type === MARKUP_TYPES.TEXT.type) {
            return this.typeFilter.showText;
          }

          if(i.type === MARKUP_TYPES.NOTE.type) {
            return this.typeFilter.showNote;
          }

          if(i.type === MARKUP_TYPES.CALLOUT.type && i.subtype === MARKUP_TYPES.CALLOUT.subType) {
            return this.typeFilter.showCallout;
          }

          if(i.type === MARKUP_TYPES.SHAPE.RECTANGLE.type && i.subtype === MARKUP_TYPES.SHAPE.RECTANGLE.subType) {
            return this.typeFilter.showRectangle;
          }

          if(i.type === MARKUP_TYPES.PAINT.POLYLINE.type && i.subtype === MARKUP_TYPES.PAINT.POLYLINE.subType) {
            return this.typeFilter.showPolyline;
          }

          if(i.type === MARKUP_TYPES.SHAPE.POLYGON.type && i.subtype === MARKUP_TYPES.SHAPE.POLYGON.subType) {
            return this.typeFilter.showPolygon;
          }

          if(i.type === MARKUP_TYPES.SHAPE.CLOUD.type && i.subtype === MARKUP_TYPES.SHAPE.CLOUD.subtype) {
            return this.typeFilter.showCloud;
          }

          if(i.type === MARKUP_TYPES.SHAPE.ROUNDED_RECTANGLE.type && i.subtype === MARKUP_TYPES.SHAPE.ROUNDED_RECTANGLE.subType) {
            return this.typeFilter.showRoundedRectangle;
          }

          if(i.type === MARKUP_TYPES.ARROW.SINGLE_END.type && i.subtype === MARKUP_TYPES.ARROW.SINGLE_END.subtype) {
            return this.typeFilter.showSingleEndArrow;
          }

          if(i.type === MARKUP_TYPES.ARROW.FILLED_SINGLE_END.type && i.subtype === MARKUP_TYPES.ARROW.FILLED_SINGLE_END.subtype) {
            return this.typeFilter.showFilledSingleEndArrow;
          }

          if(i.type === MARKUP_TYPES.ARROW.BOTH_ENDS.type && i.subtype === MARKUP_TYPES.ARROW.BOTH_ENDS.subtype) {
            return this.typeFilter.showBothEndsArrow;
          }

          if(i.type === MARKUP_TYPES.PAINT.HIGHLIGHTER.type && i.subtype === MARKUP_TYPES.PAINT.HIGHLIGHTER.subType) {
            return this.typeFilter.showHighlighter;
          }

          if(i.type === MARKUP_TYPES.PAINT.FREEHAND.type && i.subtype === MARKUP_TYPES.PAINT.FREEHAND.subType) {
            return this.typeFilter.showFreehand;
          }

          if(i.type === MARKUP_TYPES.MEASURE.LENGTH.type) {
            return this.typeFilter.showMeasureLength;
          }

          if(i.type === MARKUP_TYPES.MEASURE.AREA.type && i.subtype === MARKUP_TYPES.MEASURE.AREA.subType) {
            return this.typeFilter.showMeasureArea;
          }

          if(i.type === MARKUP_TYPES.MEASURE.PATH.type && i.subtype === MARKUP_TYPES.MEASURE.PATH.subType) {
            return this.typeFilter.showMeasurePath;
          }

          if(i.type === MARKUP_TYPES.MEASURE.RECTANGLE.type && i.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType) {
            return this.typeFilter.showMeasureRectangle;
          }

          if(i.type === MARKUP_TYPES.SHAPE.ELLIPSE.type) {
            return this.typeFilter.showEllipse;
          }

          if(i.type === MARKUP_TYPES.LINK.type) {
            return this.typeFilter.showLink;
          }

          if(i.type === MARKUP_TYPES.STAMP.type && i.subtype === MARKUP_TYPES.STAMP.subType) {
            return this.typeFilter.showStamp;
          }


        return this.showAnnotations;*/
    })
    .filter((i: any) => {
    /*modified for comment list panel */

        if (this.pageNumber > 0) {
          return (
            (this.dateFilter.startDate
              ? dayjs(i.timestamp).isSameOrAfter(this.dateFilter.startDate)
              : true) &&
            (this.dateFilter.endDate
              ? dayjs(i.timestamp).isSameOrBefore(
                  this.dateFilter.endDate.endOf('day')
                )
              : true) &&
            !i.bisTextArrow &&
            i.pagenumber === this.pageNumber - 1
          );
        } else {
          return (
            (this.dateFilter.startDate
              ? dayjs(i.timestamp).isSameOrAfter(this.dateFilter.startDate)
              : true) &&
            (this.dateFilter.endDate
              ? dayjs(i.timestamp).isSameOrBefore(
                  this.dateFilter.endDate.endOf('day')
                )
              : true) &&
            !i.bisTextArrow
          );
        }
    })
    .filter((item: any) => {
      if(this.createdByFilter.size > 0) {
        return this.createdByFilter.has(item.signature);
      }
      return true; // Show all annotations when no author filter is applied
    })
    .map((item: any) => {
      //item.author = item.title !== '' ? item.title : RXCore.getDisplayName(item.signature);

      item.author = RXCore.getDisplayName(item.signature);

      //item.createdStr = dayjs(item.timestamp).format(`MMM D,${dayjs().year() != dayjs(item.timestamp).year() ? 'YYYY ': ''} h:mm A`);
      item.createdStr = dayjs(item.timestamp).format(this.guiConfig?.dateFormat?.dateTimeWithConditionalYear || 'MMM d, [yyyy] h:mm a');
      
      

      //item.IsExpanded = item?.IsExpanded;
      //item.IsExpanded = this.activeMarkupNumber > 0 ? item?.IsExpanded : false;
      item.IsExpanded = item?.IsExpanded;
      return item;
    })
    .sort((a, b) => {

      switch(this.sortByField) {

        case 'created':
          return b.timestamp - a.timestamp;
        case 'author':
          return a.author.localeCompare(b.author);
        case 'position':

          return a.pagenumber === b.pagenumber ? a.y === b.y ? a.x - b.x : a.y - b.y : a.pagenumber - b.pagenumber;

            //return a.y - b.y;
        case 'pagenumber':

        return a.pagenumber - b.pagenumber;

        case 'annotation':
            //return a.type - b.type + (a.subtype - b.subtype);
            return a.getMarkupType().label.localeCompare(b.getMarkupType().label);

      }
    });

    switch (this.sortByField) {
      case 'created':
        this.list = query.reduce((list, item) => {
          const date = dayjs(item.timestamp).fromNow();
          if (!list[date]) {
            list[date] = [item];
          } else {
            list[date].push(item);
          }
          return list;
        }, {});
        break;
      case 'author':
        this.list = query.reduce((list, item) => {
          if (!list[item.author]) {
            list[item.author] = [item];
          } else {
            list[item.author].push(item);
          }

          return list;
        }, {});
        break;
      case 'annotation':
        this.list = query.reduce((list, item) => {
          const annotationLabel = item.getMarkupType().label;
          if (!list[annotationLabel]) {
            list[annotationLabel] = [item];
          } else {
            list[annotationLabel].push(item);
          }
          return list;
        }, {});
        break;
      case 'pagenumber':
        this.list = query.reduce((list, item) => {
          if (!list[`Page ${item.pagenumber + 1}`]) {
            list[`Page ${item.pagenumber + 1}`] = [item];
          } else {
            list[`Page ${item.pagenumber + 1}`].push(item);
          }
          return list;
        }, {});
        break;

      case 'position':
        this.list = query.reduce((list, item) => {
          if (!list[`Page ${item.pagenumber + 1}`]) {
            list[`Page ${item.pagenumber + 1}`] = [item];
          } else {
            list[`Page ${item.pagenumber + 1}`].push(item);
          }

          return list;
        }, {});

        break;

      default:
        this.list = {'': query};
    }


    /*if (this.sortByField == 'created') {
      this.list = query.reduce((list, item) => {
        const date = dayjs(item.timestamp).fromNow();
        if (!list[date]) {
          list[date] = [item];
        } else {
          list[date].push(item);
        }

        return list;
      }, {});
    } else {
      this.list = {
        '': query,
      };
    }*/
  }

  ngOnInit(): void {
    // Subscribe to user state changes to clear authorFilter when user logs out
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (!user) {
        // User has logged out, clear the author filter to ensure all annotations are visible
        console.log('User logged out, clearing author filter');
        this.authorFilter.clear();
        this._processList(this.rxCoreService.getGuiMarkupList());
      }
    });

    //this.annotationToolsService.notePanelState$.subscribe(state => {
    this.annotationToolsService.notePanelState$.subscribe((state) => {
      /*added for comment list panel */
      this.activeMarkupNumber = state?.markupnumber;
      if (this.activeMarkupNumber) {
        this.markupNoteList.push(this.activeMarkupNumber);
        this.markupNoteList = [...new Set(this.markupNoteList)];


        let markupList = this.rxCoreService.getGuiMarkupList();

        if(markupList){
          /* for(const markupItem of markupList) {
            if(markupItem.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
              (markupItem.type === MARKUP_TYPES.MEASURE.AREA.type &&
                markupItem.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
              (markupItem.type === MARKUP_TYPES.MEASURE.PATH.type &&
                markupItem.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
              (markupItem.type === MARKUP_TYPES.MEASURE.RECTANGLE.type &&
                markupItem.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType))
                markupItem.setdisplay(this.objectType === "measure");
            else markupItem.setdisplay(this.objectType !== "measure");
          } */

          this._processList(markupList);
          if (Object.values(this.list).length > 0) {
            setTimeout(() => {
              markupList.filter((i: any) => {
                if (i.markupnumber === this.activeMarkupNumber) {
                  let page = i.pagenumber + 1;
                  this.pageNumbers = [];
                  this.pageNumbers.push({ value: -1, label: 'Select' });

                  for (let itm = 1; page >= itm; itm++) {
                    this.pageNumbers.push({ value: itm, label: itm });
                  }

                  this.onSelectAnnotation(i);
                  this._setPosition(i);
                }
              });
            }, 200);
          }
        }

      }
      /*added for comment list panel */


      this.visible = state?.visible;
      if(this.visible){

        //let xlayout = this.panelwidth  / window.devicePixelRatio;

        RXCore.setLayout(this.panelwidth, 0, false);
        RXCore.doResize(false,this.panelwidth, 0);/*added for comment list panel */
      }else{
        RXCore.setLayout(0, 0, false);
        RXCore.doResize(false,0, 0);/*added for comment list panel */
      }

      if (state?.objectType && state?.objectType !== this.objectType) {
        this.objectType = state?.objectType;

        //let markupList = this.rxCoreService.getGuiMarkupList();

        /*         if(this.annotlist){
          for(const markupItem of this.annotlist) {
            if(markupItem.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
              (markupItem.type === MARKUP_TYPES.MEASURE.AREA.type &&
                markupItem.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
              (markupItem.type === MARKUP_TYPES.MEASURE.PATH.type &&
                markupItem.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
              (markupItem.type === MARKUP_TYPES.MEASURE.RECTANGLE.type &&
                markupItem.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType))
                markupItem.setdisplay(this.objectType === "measure");
            else markupItem.setdisplay(this.objectType !== "measure");
          }
          this._processList(this.annotlist);
        }
       */
      }


      this._hideLeaderLine();



    });

    this.rxCoreService.guiOnResize$.subscribe(() => {

      RXCore.redrawCurrentPage();


    });



    this.annotationToolsService.selectedOption$.subscribe(option => {

      if(this.showAnnotationsOnLoad){
        //disable main filters.
      }else{
        switch(option.label) {
          case "View":
            //this.showAll = false;
            //this.onShowAll(false);
            this.onShowAnnotations(false);
            this.onShowMeasurements(false);


            break;
          case "Annotate":
            this.showAnnotations = true;
            this.showMeasurements = false;
            this.onShowAnnotations(true);
            this.onShowMeasurements(false);
            break;
          case "Measure":
            this.showAnnotations = false;
            this.showMeasurements = true;

            this.onShowMeasurements(true);
            this.onShowAnnotations(false);
            break;
        }

      }

    });


    /*this.guiConfig$.subscribe(config => {
      this.guiConfig = config;
      this.convertPDFAnnots = this.guiConfig.convertPDFAnnots;
      this.createPDFAnnotproxy = this.guiConfig.createPDFAnnotproxy;

    });*/


    this.guiConfig$.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe(config => {

      this.guiConfig = config;

      if (config?.dateFormat?.locale) {
        dayjs.updateLocale(config?.dateFormat?.locale, {
          relativeTime: {
            past: "%s",
            s: 'A few seconds ago',
            m: "A minute ago",
            mm: function (number) {
              return number > 10 ? `${number} minutes ago` : "A few minutes ago";
            },
            h: "An hour ago",
            hh:"Today",
            d: "Yesterday",
            dd: function (number) {
              return number > 1 ? `${number} days ago` : "Yesterday";
            },
            M: "A month ago",
            MM: "%d months ago",
            y: "A year ago",
            yy: "%d years ago"
          }
        });
      }




      //const result = words.filter((word) => word.length > 6);



      this.showAnnotationsOnLoad = this.guiConfig.showAnnotationsOnLoad;

      this.showAnnotations = this.showAnnotationsOnLoad;
      this.showMeasurements = this.showAnnotationsOnLoad;
      this.showAll = this.showAnnotationsOnLoad;





    });


    this.guiZoomUpdated$.subscribe(({params, zoomtype}) => {
      if(zoomtype == 0 || zoomtype == 1){
        this._hideLeaderLine();
        // Recalculate position for active comment after zoom change
        this.recalculateActiveCommentPosition();
      }

    });

    this.guiRotatePage$.subscribe(({degree, pageIndex}) => {

        //this.pageNumber = pageIndex;
        this.pageRotation = degree;

        // Recalculate position for active comment after rotation change
        this.recalculateActiveCommentPosition();

    });

    /*this.rxCoreService.guiRotatePage$.subscribe((degree,  pageIndex) => {
      //this.currentPage = state.currentpage;

      if (degree != 0){
        console.log(degree);
      }

      if (pageIndex == 0){

      }
      /*if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
        this._hideLeaderLine();
      }

    });*/



    this.rxCoreService.guiMarkupList$.subscribe((list = []) => {
      this.createdByFilter = new Set();

      /*if (list.length > 0){

      }*/
      this._updateRxFilter();
      this.annotlist = list;

      this.pageNumbers = [];
      this.pageNumbers.push({ value: -1, label: 'Select' });
      let controlarray : Array<number> = [];

      for(let li = 0; li < list.length; li++){

        let pageexist = false;
        let pagenum = list[li].pagenumber;


        for(let ci = 0; ci < controlarray.length; ci++){
          if(controlarray[ci] == pagenum){
            pageexist = true;
          }
        }
        if(!pageexist){
          controlarray.push(pagenum);
          this.pageNumbers.push({ value: pagenum + 1, label: pagenum + 1 });
        }





      }

      //this.onShowAll(this.showAll)

      this.authorFilter = new Set(this.getUniqueAuthorList());
      this._updateCreatedByFilterOptions(list);

      this._setloadedtypeFilterOff();


      for (let ai = 0;ai < this.annotlist.length; ai++){
        this._setloadedtypeFilter(this.annotlist[ai]);
      }


      this.rxTypeFilterLoaded = this.rxTypeFilter.filter((rxtype) => rxtype.loaded);


      //this.setloadedtypeFilter


      if (this.activeMarkupNumber > 0){
        //this.createdByFilterOptions = Object.values(list.filter(i => i.text.length > 0).reduce((options, item) => {
        this.createdByFilterOptions = Object.values(list.filter((i: any) => i.text.length > 0).reduce((options, item: any) => {
          if (!options[item.signature]) {
            options[item.signature] = {
              value: item.signature,
              label: RXCore.getDisplayName(item.signature),
              selected: true
            };
            this.createdByFilter.add(item.signature);
          }
          return options;
        }, {}));


        if (list.length > 0){

          //this._processList(list);
          setTimeout(() => {
            list.filter((itm: any) => {
              if (itm.markupnumber === this.activeMarkupNumber) {
                this.pageNumbers = [];
                this.pageNumbers.push({ value: -1, label: 'Select' });
                let page = itm.pagenumber + 1;
                for (let i = 1; page >= i; i++) {
                  this.pageNumbers.push({ value: i, label: i });
                }
              }
            });
          }, 400);


        }else{
          this._processList(list, this.rxCoreService.getGuiAnnotList());
        }

      }



      if (list.length > 0 && !this.isHideAnnotation){

        setTimeout(() => {
          if (list.find((itm) => itm.getselected()) === undefined)
            this.activeMarkupNumber = -1;
              //console.log(itm.selected);

          this._processList(list, this.rxCoreService.getGuiAnnotList());
        }, 250);
      }else{
        this._processList(list, this.rxCoreService.getGuiAnnotList());
      }

      if(this.showAnnotationsOnLoad){
        this.panelTitle = 'Annotations and Measurements' + " (" + this.calcAllCount() + ")";
      }


    });

    this.rxCoreService.guiAnnotList$.subscribe((list = []) => {
      this._processList(this.rxCoreService.getGuiMarkupList(), list);
    });


    this.rxCoreService.guiPage$.subscribe((state) => {
      //this.currentPage = state.currentpage;
      if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
        this._hideLeaderLine();
      }

      // Recalculate position for active comment after page change
      this.recalculateActiveCommentPosition();

    });



    this.rxCoreService.guiMarkupIndex$.subscribe(({markup, operation}) => {
      this._hideLeaderLine();

      if(operation.modified || operation.created){
        this.SetActiveCommentSelect(markup);
      }

      if(operation.created){

        this.addTextNote(markup);
      }


    });


    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
      this._hideLeaderLine();

      if(operation.modified || operation.created){
        this.scrollToAnnotItem(markup, true);

        if(!this.scrolled){
          this.SetActiveCommentSelect(markup);
        }

      }

      if(operation.created){

        this.addTextNote(markup);
      }


    });

    this.guiOnPanUpdatedSubscription = this.rxCoreService.guiOnPanUpdated$.subscribe(({ sx, sy, pagerect }) => {
      if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
        this._hideLeaderLine();
      }
      // Recalculate position after pan with a small delay
      setTimeout(() => {
        this.recalculateActiveCommentPosition();
      }, 100);
    });

    this.guiOnPanUpdatedSubscription = this.rxCoreService.resetLeaderLine$.subscribe((response: boolean) => {
      if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
        this._hideLeaderLine();
      }
      // Recalculate position after reset
      setTimeout(() => {
        this.recalculateActiveCommentPosition();
      }, 100);
    });


    this.rxCoreService.guiOnMarkupChanged.subscribe(({annotation, operation}) => {
      //this.visible = false;
      this._hideLeaderLine();
    });

    this.markuptypes = RXCore.getMarkupTypes();

  }

  get isEmpytyList(): boolean {
    return Object.keys(this.list || {}).length == 0 || this.list[""]?.length == 0;
  }

  get isFilterActive(): boolean {
    return this.filterVisible == true
    || this.createdByFilterOptions.length != this.createdByFilter.size
    || this.dateFilter.startDate != undefined
    || this.dateFilter.endDate != undefined;
  }

  onNoteClick(markup: IMarkup): void {
    //RXCore.unSelectAllMarkup();
    RXCore.selectMarkUpByIndex(markup.markupnumber);
    this.rxCoreService.setGuiMarkupIndex(markup, {});
    //this._showLeaderLine(markup);
  }

/*   onSearch(event): void {
    this._processList(this.rxCoreService.getGuiMarkupList());
  }
 */


  onSortFieldChanged(event): void {
    this.sortByField = event.value;
    this._processList(this.rxCoreService.getGuiMarkupList());
  }

  onCreatedByFilterChange(values): void {
    this.createdByFilter = new Set(values);
    this._processList(this.rxCoreService.getGuiMarkupList());
  }

  ngAfterViewInit(): void {
    // Force proper positioning for multi-select dropdowns
    this._forceDropdownPositioning();
  }

  private _forceDropdownPositioning(): void {
    // Immediate fix
    this._applyDropdownFixes();
    
    // Wait for component initialization and apply again
    setTimeout(() => this._applyDropdownFixes(), 50);
    setTimeout(() => this._applyDropdownFixes(), 200);
    setTimeout(() => this._applyDropdownFixes(), 500);

    // Monitor for any changes and reapply fixes
    const observer = new MutationObserver(() => {
      this._applyDropdownFixes();
    });

    observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });
  }

  private _applyDropdownFixes(): void {
    const multiSelects = this.el.nativeElement.querySelectorAll('rx-multi-select');
    
    multiSelects.forEach((multiSelect: HTMLElement) => {
      // Force container positioning
      multiSelect.style.position = 'relative';
      multiSelect.style.width = '100%';
      
      const container = multiSelect.querySelector('.dropdown-container');
      if (container) {
        (container as HTMLElement).style.position = 'relative';
        (container as HTMLElement).style.width = '100%';
      }
      
      // Force options container positioning
      const optionsContainer = multiSelect.querySelector('.options-container');
      if (optionsContainer) {
        (optionsContainer as HTMLElement).style.position = 'absolute';
        (optionsContainer as HTMLElement).style.top = 'calc(100% + 1px)';
        (optionsContainer as HTMLElement).style.left = '0';
        (optionsContainer as HTMLElement).style.right = '0';
        (optionsContainer as HTMLElement).style.zIndex = '9999';
        (optionsContainer as HTMLElement).style.transform = 'none';
      }
      
      // Force options wrapper positioning
      const optionsWrapper = multiSelect.querySelector('.options-wrapper');
      if (optionsWrapper) {
        (optionsWrapper as HTMLElement).style.position = 'relative';
        (optionsWrapper as HTMLElement).style.top = '0';
        (optionsWrapper as HTMLElement).style.left = '0';
        (optionsWrapper as HTMLElement).style.right = '0';
        (optionsWrapper as HTMLElement).style.bottom = 'auto';
        (optionsWrapper as HTMLElement).style.width = '100%';
        (optionsWrapper as HTMLElement).style.transform = 'none';
        (optionsWrapper as HTMLElement).style.margin = '0';
      }
    });
  }

  private _updateCreatedByFilterOptions(list: Array<IMarkup>): void {
    // Create options for multi-select from all available authors
    const authorOptions = {};
    
    list.forEach((item: any) => {
      const authorDisplayName = RXCore.getDisplayName(item.signature);
      if (!authorOptions[item.signature]) {
        authorOptions[item.signature] = {
          value: item.signature,
          label: authorDisplayName,
          selected: this.authorFilter.has(authorDisplayName)
        };
      }
    });

    this.createdByFilterOptions = Object.values(authorOptions);
    
    // Convert authorFilter (display names) to createdByFilter (signatures)
    this.createdByFilter = new Set(
      list
        .filter((item: any) => this.authorFilter.has(RXCore.getDisplayName(item.signature)))
        .map((item: any) => item.signature)
    );
  }

  onDateSelect(dateRange: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }): void {
    this.dateFilter = dateRange;
  }

  onPageChange(event): void {
    this.pageNumber = event.value;
    this._processList(this.rxCoreService.getGuiMarkupList());
  }


  onFilterApply(): void {
    this._processList(this.rxCoreService.getGuiMarkupList());
    this.filterVisible = false;
  }

  onClose(): void {
    this.visible = false;
    this._hideLeaderLine();
    RXCore.setLayout(0, 0, false);
    RXCore.doResize(false, 0, 0);/*added for comment list panel */
    this.rxCoreService.setCommentSelected(false);
  }

  onWindowResize(event: any): void {
    // Recalculate position for active comment after window resize
    this.recalculateActiveCommentPosition();
  }

  addTextNote(markup : any) : void{
    if(markup.type == 9 || markup.type == 10){
      this.note[markup.markupnumber] = markup.text;
    }

  }

  onAddNote(markup: any): void {
    if (this.note[markup.markupnumber]) {

      const timestamp = new Date().toISOString();

      if (this.noteIndex >= 0) {
        markup.editComment(this.noteIndex, this.note[markup.markupnumber], timestamp);
        this.noteIndex = -1;
      }
      else {

        let sign = RXCore.getSignature();
        const timestamp = new Date().toISOString();




        //markup.AddComment(markup.comments.length, sign, this.note[markup.markupnumber]);
        markup.AddComment(markup.comments.length, sign, this.note[markup.markupnumber], timestamp);

        //id : id,
        //signature : signature,
        //value: szValue


        //markup.comments.push(commentsObj);
      }



      this.note[markup.markupnumber] = "";
    }
    else
      return;
  }


  GetCommentLength(): number {

    let noOfComments = 0;

    Object.values(this.list || {}).forEach((comment) => {
      noOfComments += comment.length;
    });
    return noOfComments;

    //return Object.keys(this.list || {}).length;
  }


  OnEditComment(event, markupNo: any, itemNote: any): void {
    event.stopPropagation();

    this.noteIndex = itemNote.id;
    this.note[markupNo] = itemNote.value;
  }


  OnRemoveComment(event, markup: any, id: number, index: number): void {
    event.stopPropagation();

    markup.deleteComment(id);
    if (markup.comments.length === 0) {
      if (this.connectorLine)
        this.connectorLine.hide();
      this.markupNoteList = this.markupNoteList.filter(item => { return item !== markup.markupnumber; });
      this._processList(this.rxCoreService.getGuiMarkupList());
    }
    if (index === 0) {
      markup.comments = [];
      //markup.selected = true;

      markup.deleteComment(id);
      //RXCore.deleteMarkUp();


    }
  }


  DrawConnectorLine(startElem, endElem) {
    if (startElem !== null && endElem !== null) {
      if (this.connectorLine)
        this.connectorLine.hide();
      this.connectorLine = new LeaderLine(
        startElem,
        endElem, {
        startPlug: 'square',
        endPlug: 'square',
        endPlugOutline: false,
        size: 2.5,
        color: '#14ab0a',
        path: 'grid',
        startSocketGravity: 0,
        animOptions: { duration: 300, timing: 'linear' }
      });
    }
  }

  SetActiveCommentSelect(markup: any){

    if (markup.bisTextArrow && markup.textBoxConnected != null) {
      markup = markup.textBoxConnected;
    }

    let markupNo = markup.markupnumber;

    if (markupNo) {
      this.activeMarkupNumber = markupNo;
      // Hide any existing leader lines first
      this._hideLeaderLine();
      //this.onSelectAnnotation(markup);
      this._setPosition(markup);
    }

  }

  ItemNoteClick(event, markupNo: number, markup: any): void {

    console.log(markupNo);

  }

  SetActiveCommentThread(event, markupNo: number, markup: any): void {



    if (markupNo) {
      this.activeMarkupNumber = markupNo;
      this.onSelectAnnotation(markup);



      // Hide any existing leader lines first
      this._hideLeaderLine();

      const frame: any = document.getElementById('foxitframe')


      /*if (frame && frame.contentWindow) {
        if (markup.yscaled && Number(markup.yscaled) < 0)
          frame.contentWindow?.scrollTo(0, markup.yscaled);
      }*/

      setTimeout(() => {




        // Ensure position is calculated with current rotation state
        this._setPosition(markup);
      }, 150); // Slightly increased timeout to ensure DOM updates

      Object.values(this.list || {}).forEach((comments) => {
        comments.forEach((comment: any) => {
          if (comment.markupnumber === markupNo) {
            //comment.IsExpanded = true;
            comment.IsExpanded = !comment.IsExpanded;
          }
        });
      });
    }
    event.preventDefault();
  }


  /* SetActiveCommentThread(event, markupNo: number, markup: any): void {
    if (markupNo) {
      this.activeMarkupNumber = markupNo;
      this.onSelectAnnotation(markup);
      this._setPosition(markup);
    }
    event.preventDefault();
  } */


  trackByFn(index, item) {
    return item.id;
  }


  ngOnDestroy(): void {
    this.guiOnPanUpdatedSubscription.unsubscribe();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onSelectAnnotation(markup: any): void {
    //RXCore.unSelectAllMarkup();
    //RXCore.selectMarkUp(true);
    RXCore.selectMarkUpByIndex(markup.markupnumber);
    //markup.selected = true;
    this.rxCoreService.setGuiMarkupIndex(markup, {});

  }


  private _setPosition(markup: any): void {
    //RXCore.unSelectAllMarkup();
    //this.rxCoreService.setGuiMarkup(markup, {});
    //this.lineConnectorNativElement.style.top = (markup.yscaled + (markup.hscaled / 2) - 10) + 'px';
    //this.lineConnectorNativElement.style.left = (markup.xscaled + markup.wscaled - 5) + 'px';
    //this.DrawConnectorLine(document.getElementById('note-panel-' + this.activeMarkupNumber), this.lineConnectorNativElement);



    if (markup.bisTextArrow && markup.textBoxConnected != null) {
      markup = markup.textBoxConnected;
    }

    if (markup.type !== MARKUP_TYPES.COUNT.type) {
      const wscaled = (markup.wscaled || markup.w) / window.devicePixelRatio;
      const hscaled = (markup.hscaled || markup.h) / window.devicePixelRatio;
      const xscaled = (markup.xscaled || markup.x) / window.devicePixelRatio;
      const yscaled = (markup.yscaled || markup.y) / window.devicePixelRatio;

      // Unscaled coordinates for getrotatedPoint calls
      const wscaledus = (markup.wscaled || markup.w);
      const hscaledus = (markup.hscaled || markup.h);
      const xscaledus = (markup.xscaled || markup.x);
      const yscaledus = (markup.yscaled || markup.y);


      let rely = yscaled + (hscaled  * 0.5);
      let absy = yscaled + ((hscaled - yscaled) * 0.5);
      let absx = xscaled + ((wscaled - xscaled) * 0.5);

      let sidepointabsright = {
        x : wscaled,
        y : absy
      }


      let sidepointrel = {
        x : xscaled + wscaled,
        y : rely
      }




      let _dx = window == top ? 0 : - 82;
      let _dy = window == top ? 0 : -48;

      let dx = 0 + _dx;
      let dy = -10 + _dy;

      let xright = xscaled;
      let yright = yscaled;

      let xval = xscaled + dx + (wscaled / 2) + 20;
      let yval = yscaled + dy + (hscaled / 2) + 10;



      switch (markup.type) {
        case MARKUP_TYPES.MEASURE.MEASUREARC.type:
        case MARKUP_TYPES.ERASE.type:
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


          //let absy = yscaled + ((hscaled - yscaled) * 0.5);
          //let absx = xscaled + ((wscaled - xscaled) * 0.5);

          /*let sidepointabsright = {
            x : wscaled,
            y : absy
          }*/


          xval = sidepointabsright.x;
          yval = sidepointabsright.y;


          if(this.pageRotation != 0){
            let rotpoint1 = markup.getrotatedPoint(xscaledus, yscaledus);
            let rotpoint2 = markup.getrotatedPoint(absx * window.devicePixelRatio, hscaledus);
            let rotpoint3 = markup.getrotatedPoint(absx * window.devicePixelRatio, yscaledus);
            let rotpoint4 = markup.getrotatedPoint(xscaledus, absy * window.devicePixelRatio);

            if (this.pageRotation == 90){
              xval = rotpoint3.x / window.devicePixelRatio;
              yval = rotpoint3.y / window.devicePixelRatio;
            }

            if (this.pageRotation == 180){
              xval = rotpoint4.x / window.devicePixelRatio;
              yval = rotpoint4.y / window.devicePixelRatio;
            }

            if (this.pageRotation == 270){
              xval = rotpoint2.x / window.devicePixelRatio;
              yval = rotpoint2.y / window.devicePixelRatio;
            }


          }


          this.rectangle = {
            //x: (p.x / window.devicePixelRatio) - (markup.subtype == MARKUP_TYPES.SHAPE.POLYGON.subType ? 26 : 4),
            //y: (p.y / window.devicePixelRatio) - 16,
            x : xval,
            y : yval,
            //x_1: xscaled + wscaled - 20,
            x_1: wscaled - 20,
            y_1: yscaled - 20,
          };




          break;
        }
        case MARKUP_TYPES.NOTE.type:
          dx = (wscaled / 2) - 5 + _dx;
          dy = -10 + _dy;

          //let rely = yscaled + (hscaled  * 0.5);
          /*let sidepointrel = {
            x : xscaled + wscaled,
            y : rely
          }*/




          xval = sidepointrel.x;
          yval = sidepointrel.y;


          if(this.pageRotation != 0){
            let rotpoint1 = markup.getrotatedPoint(xscaledus, yscaledus);
            let rotpoint2 = markup.getrotatedPoint(xscaledus + (wscaledus * 0.5), yscaledus + hscaledus);
            let rotpoint3 = markup.getrotatedPoint(xscaledus + (wscaledus * 0.5), yscaledus);
            let rotpoint4 = markup.getrotatedPoint(xscaledus, yscaledus + (hscaledus * 0.5));

            if (this.pageRotation == 90){
              xval = rotpoint3.x / window.devicePixelRatio;
              yval = rotpoint3.y / window.devicePixelRatio;
            }

            if (this.pageRotation == 180){
              xval = rotpoint4.x / window.devicePixelRatio;
              yval = rotpoint4.y / window.devicePixelRatio;
            }

            if (this.pageRotation == 270){
              xval = rotpoint2.x / window.devicePixelRatio;
              yval = rotpoint2.y / window.devicePixelRatio;
            }


          }

          this.rectangle = {
            //x: xscaled + dx,
            //y: yscaled + dy,
            x : xval,
            y:  yval,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;
        /*case MARKUP_TYPES.ERASE.type:
          dx = ((wscaled - xscaled) / 2) - 5 + _dx;
          this.rectangle = {
            x: xscaled + dx,
            y: yscaled + dy,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;*/
        case MARKUP_TYPES.ARROW.type:
          dx = -26 + _dx;

          if(xscaled > wscaled){
            xright = xscaled;
            yright = yscaled;
          }else{
            xright = wscaled;
            yright = hscaled;

          }

          if(this.pageRotation != 0){
            let rotpoint1 = markup.getrotatedPoint(xscaledus, yscaledus);
            let rotpoint2 = markup.getrotatedPoint(wscaledus, hscaledus);


            if (this.pageRotation == 90){
              if(rotpoint1.x > rotpoint2.x){
                xright = rotpoint1.x / window.devicePixelRatio;
                yright = rotpoint1.y / window.devicePixelRatio;
              }else{
                xright = rotpoint2.x / window.devicePixelRatio;
                yright = rotpoint2.y / window.devicePixelRatio;

              }
            }

            if (this.pageRotation == 180){

              if(rotpoint1.x > rotpoint2.x){
                xright = rotpoint1.x / window.devicePixelRatio;
                yright = rotpoint1.y / window.devicePixelRatio;
              }else{
                xright = rotpoint2.x / window.devicePixelRatio;
                yright = rotpoint2.y / window.devicePixelRatio;

              }


            }

            if (this.pageRotation == 270){
              if(rotpoint1.x > rotpoint2.x){
                xright = rotpoint1.x / window.devicePixelRatio;
                yright = rotpoint1.y / window.devicePixelRatio;
              }else{
                xright = rotpoint2.x / window.devicePixelRatio;
                yright = rotpoint2.y / window.devicePixelRatio;

              }
            }


          }

          this.rectangle = {
            x: xright,
            y: yright,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };


          break;
        case MARKUP_TYPES.MEASURE.LENGTH.type:

        if(xscaled > wscaled){
          xright = xscaled;
          yright = yscaled;
        }else{
          xright = wscaled;
          yright = hscaled;

        }


        if(this.pageRotation != 0){
          let rotpoint1 = markup.getrotatedPoint(xscaledus, yscaledus);
          let rotpoint2 = markup.getrotatedPoint(wscaledus, hscaledus);


          if (this.pageRotation == 90){
            if(rotpoint1.x > rotpoint2.x){
              xright = rotpoint1.x / window.devicePixelRatio;
              yright = rotpoint1.y / window.devicePixelRatio;
            }else{
              xright = rotpoint2.x / window.devicePixelRatio;
              yright = rotpoint2.y / window.devicePixelRatio;

            }
          }

          if (this.pageRotation == 180){

            if(rotpoint1.x > rotpoint2.x){
              xright = rotpoint1.x / window.devicePixelRatio;
              yright = rotpoint1.y / window.devicePixelRatio;
            }else{
              xright = rotpoint2.x / window.devicePixelRatio;
              yright = rotpoint2.y / window.devicePixelRatio;

            }


          }

          if (this.pageRotation == 270){
            if(rotpoint1.x > rotpoint2.x){
              xright = rotpoint1.x / window.devicePixelRatio;
              yright = rotpoint1.y / window.devicePixelRatio;
            }else{
              xright = rotpoint2.x / window.devicePixelRatio;
              yright = rotpoint2.y / window.devicePixelRatio;

            }
          }


        }


          this.rectangle = {
            x: xright,
            y: yright,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };



          break;
        default:



          dx = (wscaled / 2) - 24 + _dx;

          xval = xscaled + (wscaled);
          yval = yscaled + (hscaled / 2);


          if(this.pageRotation != 0){
            let rotpoint1 = markup.getrotatedPoint(xscaledus, yscaledus);
            let rotpoint2 = markup.getrotatedPoint(xscaledus + (wscaledus * 0.5), yscaledus + hscaledus);
            let rotpoint3 = markup.getrotatedPoint(xscaledus + (wscaledus * 0.5), yscaledus);
            let rotpoint4 = markup.getrotatedPoint(xscaledus, yscaledus + (hscaledus * 0.5));

            if (this.pageRotation == 90){
              xval = rotpoint3.x / window.devicePixelRatio;
              yval = rotpoint3.y / window.devicePixelRatio;
            }

            if (this.pageRotation == 180){
              xval = rotpoint4.x / window.devicePixelRatio;
              yval = rotpoint4.y / window.devicePixelRatio;
            }

            if (this.pageRotation == 270){
              xval = rotpoint2.x / window.devicePixelRatio;
              yval = rotpoint2.y / window.devicePixelRatio;
            }


          }



          this.rectangle = {

            /* bugfix 2 */
            x: xval,
            y: yval,
            //x: xscaled + dx,
            //y: yscaled + dy,
            /* bugfix 2 */
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
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
      /* bugfix 2 */
      //this.lineConnectorNativElement.style.top = this.rectangle.y + (hscaled / 2) + 10 + 'px';
      //this.lineConnectorNativElement.style.left = this.rectangle.x + (wscaled / 2) + 20 + 'px';



      this.lineConnectorNativElement.style.top = this.rectangle.y + 'px';
      this.lineConnectorNativElement.style.left = this.rectangle.x + 'px';
      /* bugfix 2 */

      this.lineConnectorNativElement.style.position = this.rectangle.position;

      /* bugfix 2 */
      //this.DrawConnectorLine(document.getElementById('note-panel-' + this.activeMarkupNumber), this.lineConnectorNativElement);

      const lineConnectorEnd = document.getElementById('note-panel-' + this.activeMarkupNumber);
      if (lineConnectorEnd && this.lineConnectorNativElement)
        this.DrawConnectorLine(document.getElementById('note-panel-' + this.activeMarkupNumber), this.lineConnectorNativElement);
      /* bugfix 2 */

    }else{
      //this.onSelectAnnotation(markup);
    }

  }

  onHideComment(event: any, markupNo: number): void {
    this.isHideAnnotation = true;
    event.preventDefault();
    Object.values(this.list || {}).forEach((comments) => {
      comments.forEach((comment: any) => {
        if (comment.markupnumber === markupNo) {
          comment.IsExpanded = false;
        }
      });
    });
    if (this.connectorLine) {
      RXCore.unSelectAllMarkup();
      this.annotationToolsService.hideQuickActionsMenu();
      this.connectorLine.hide();
      this._hideLeaderLine();
    }
    event.stopPropagation();
  }

  @HostListener('scroll', ['$event'])
  scrollHandler(event) {
    if(event.type == 'scroll'){
      event.preventDefault();
      if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
        this._hideLeaderLine();
        event.stopPropagation();
      }

      // Recalculate position after scroll with a small delay
      setTimeout(() => {
        this.recalculateActiveCommentPosition();
      }, 100);

    }
  }

  zoomTo(markup : any){

    let padding = {x : 30, y : 30, w : 150, h : 150};


    markup.zoomTo(padding);

  }

  toogleStatusMenu(index: number) {
    if (this.visibleStatusMenuIndex === index) {
      this.visibleStatusMenuIndex = null;
    } else {
      this.visibleStatusMenuIndex = index;
    }
    event?.stopPropagation();
  }

  closeStatusMenu() {
    this.visibleStatusMenuIndex = null;
  }
  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menus = document.querySelectorAll('.statusMenu');
    const buttons = document.querySelectorAll('.statusMenuButton');

    let isClickInsideMenu = Array.from(menus).some((menu) =>
      menu.contains(event.target as Node)
    );
    let isClickInsideButton = Array.from(buttons).some((button) =>
      button.contains(event.target as Node)
    );

    if (!isClickInsideMenu && !isClickInsideButton) {
      this.closeStatusMenu();
    }
  }
  onSetStatus(markup: any, statusValue: string) {
    markup.status = statusValue;
    this.closeStatusMenu();
    event?.stopPropagation();
  }

  private _updateMarkupDisplay(markupList: any[], filterFn: (markup: any) => boolean, onoff: boolean) {


    //markup.type === type.type && markup.subtype === type.subtype

    if (!markupList) return;
    for (const markup of markupList) {

      //console.log(markup.getMarkupType().label);


      if (filterFn(markup)) {

        //console.log("measurecheck");
        //console.log(markup.ismeasure);
        //console.log(markup.type, markup.subtype);

        markup.setdisplay(onoff);

        this._setmarkupTypeDisplay(markup, onoff);

      }
    }
    RXCore.markUpRedraw();
    this._processList(markupList);
  }


  /* onShowAnnotations(onoff: boolean) {
    const markupList = this.rxCoreService.getGuiMarkupList();
    this.showAnnotations = onoff;
    if(!markupList) return;
    for (const markupItem of markupList) {
      if (
        !(
          markupItem.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
          (markupItem.type === MARKUP_TYPES.MEASURE.AREA.type &&
            markupItem.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
          (markupItem.type === MARKUP_TYPES.MEASURE.PATH.type &&
            markupItem.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
          (markupItem.type === MARKUP_TYPES.MEASURE.RECTANGLE.type &&
            markupItem.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType) ||
          markupItem.type === MARKUP_TYPES.SIGNATURE.type
        )
      )
        markupItem.setdisplay(onoff);
    }
    this._processList(markupList);
  } */

  onShowAnnotations(onoff: boolean) {
    const markupList = this.rxCoreService.getGuiMarkupList();
    this.showAnnotations = onoff;


    /*this.typeFilter.showEllipse = onoff;
    this.typeFilter.showFreehand = onoff;
    this.typeFilter.showText = onoff;
    this.typeFilter.showPolyline = onoff;
    this.typeFilter.showRectangle = onoff;
    this.typeFilter.showStamp = onoff;
    this.typeFilter.showNote = onoff;
    this.typeFilter.showCallout = onoff;
    this.typeFilter.showLink = onoff;
    this.typeFilter.showHighlighter = onoff;

    this.typeFilter.showSingleEndArrow = onoff;
    this.typeFilter.showFilledSingleEndArrow = onoff;
    this.typeFilter.showBothEndsArrow = onoff;
    this.typeFilter.showFilledBothEndsArrow = onoff;
    this.typeFilter.showCloud = onoff;*/

    this._updateMarkupDisplay(markupList, (markup) => !markup.ismeasure, onoff);

    /*this._updateMarkupDisplay(
      markupList,
      (markup) => !(
        markup.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
        (markup.type === MARKUP_TYPES.MEASURE.AREA.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
        (markup.type === MARKUP_TYPES.MEASURE.PATH.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
        (markup.type === MARKUP_TYPES.MEASURE.RECTANGLE.type && markup.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType)
        //markup.type === MARKUP_TYPES.SIGNATURE.type
      ),
      onoff
    );*/
  }

  onShowMeasurements(onoff: boolean) {
    const markupList = this.rxCoreService.getGuiMarkupList();
    this.showMeasurements = onoff;
    //this.typeFilter.showMeasureLength = onoff;
    //this.typeFilter.showMeasureArea = onoff;
    //this.typeFilter.showMeasurePath = onoff;
    //this.typeFilter.showMeasureRectangle = onoff;
    //this.typeFilter.showMeasureAngle = onoff;


    this._updateMarkupDisplay(markupList, (markup) => markup.ismeasure, onoff);

      /*(markup) =>
        markup.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
        (markup.type === MARKUP_TYPES.MEASURE.AREA.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
        (markup.type === MARKUP_TYPES.MEASURE.PATH.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
        (markup.type === MARKUP_TYPES.MEASURE.RECTANGLE.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType),
      onoff
    );*/

  }

  onShowAll(onoff: boolean) {
    this.showAll = onoff;
    this.onShowAnnotations(onoff);
    this.onShowMeasurements(onoff);
  }

  private _handleShowMarkupType(type :any, event: any, typeCheck: (markup: any) => boolean) {

    this._setmarkupTypeDisplayFilter(type,event.target.checked);

    this.rxTypeFilterLoaded = this.rxTypeFilter.filter((rxtype) => rxtype.loaded);

    this._updateMarkupDisplay(
      this.rxCoreService.getGuiMarkupList(),
      typeCheck,
      event.target.checked
    );
  }

  private _handleShowMarkup(filterProp: string, event: any, typeCheck: (markup: any) => boolean) {

    this.typeFilter[filterProp] = event.target.checked;

    this._updateMarkupDisplay(
      this.rxCoreService.getGuiMarkupList(),
      typeCheck,
      event.target.checked
    );
  }

  showType(type: any){

    let showtype : boolean = false;

    for(let mi=0; mi < this.rxTypeFilter.length;mi++){

      if(this.rxTypeFilter[mi].typename === type.typename){
        showtype = this.rxTypeFilter[mi].show;

      }

    }

    return showtype;

  }

  onShowType($event: any, type : any) {

    // For button clicks, we need to toggle the current state
    const currentState = this.showType(type);
    const newState = !currentState;
    
    // Create a mock event object that mimics checkbox behavior for compatibility
    const mockEvent = {
      target: {
        checked: newState
      }
    };

    this._handleShowMarkupType(type, mockEvent, markup => markup.getMarkupType().label === type.label);

  }

  onShowEllipse($event: any) {
    this._handleShowMarkup('showEllipse', $event,
      markup => markup.type === MARKUP_TYPES.SHAPE.ELLIPSE.type);
  }

  onShowFreehand($event: any) {
    this._handleShowMarkup('showFreehand', $event,
      markup => markup.type === MARKUP_TYPES.PAINT.FREEHAND.type &&
                markup.subtype === MARKUP_TYPES.PAINT.FREEHAND.subType);
  }

  onShowText($event: any) {
    this._handleShowMarkup('showText', $event,
      markup => markup.type === MARKUP_TYPES.TEXT.type);
  }

  onShowPolyline($event: any) {
    this._handleShowMarkup('showPolyline', $event,
      markup => markup.type === MARKUP_TYPES.PAINT.POLYLINE.type &&
                markup.subtype === MARKUP_TYPES.PAINT.POLYLINE.subType);
  }

  onShowRectangle($event: any) {
    this._handleShowMarkup('showRectangle', $event,
      markup => markup.type === MARKUP_TYPES.SHAPE.RECTANGLE.type &&
                markup.subtype === MARKUP_TYPES.SHAPE.RECTANGLE.subType);
  }

  onShowStamp($event: any) {
    this._handleShowMarkup('showStamp', $event,
      markup => markup.type === MARKUP_TYPES.STAMP.type &&
                markup.subtype === MARKUP_TYPES.STAMP.subType);
  }

  onShowNote($event: any) {
    this._handleShowMarkup('showNote', $event,
      markup => markup.type === MARKUP_TYPES.NOTE.type);
  }

  onShowCallout($event: any) {
    this._handleShowMarkup('showCallout', $event,
      markup => markup.type === MARKUP_TYPES.CALLOUT.type);
  }

  onShowLink($event: any) {
    this._handleShowMarkup('showLink', $event,
      markup => markup.type === MARKUP_TYPES.LINK.type);
  }

  onShowHighlighter($event: any) {
    this._handleShowMarkup('showHighlighter', $event,
      markup => markup.type === MARKUP_TYPES.PAINT.HIGHLIGHTER.type);
  }

  onShowMeasureLength($event: any) {
    this._handleShowMarkup('showMeasureLength', $event,
      markup => markup.type === MARKUP_TYPES.MEASURE.LENGTH.type);
  }

  onShowMeasureArea($event: any) {
    this._handleShowMarkup('showMeasureArea', $event,
      markup => markup.type === MARKUP_TYPES.MEASURE.AREA.type);
  }

  onShowMeasurePath($event: any) {
    this._handleShowMarkup('showMeasurePath', $event,
      markup => markup.type === MARKUP_TYPES.MEASURE.PATH.type);
  }

  onShowMeasureRectangle($event: any) {
    this._handleShowMarkup('showMeasureRectangle', $event,
      markup => markup.type === MARKUP_TYPES.MEASURE.RECTANGLE.type);
  }

  onShowRoundedRectangle($event: any) {
    this._handleShowMarkup('showRoundedRectangle', $event,
      markup => markup.type === MARKUP_TYPES.SHAPE.ROUNDED_RECTANGLE.type);
  }

  onShowPolygon($event: any) {
    this._handleShowMarkup('showPolygon', $event,
      markup => markup.type === MARKUP_TYPES.SHAPE.POLYGON.type);
  }

  onShowCloud($event: any) {
    this._handleShowMarkup('showCloud', $event,
      markup => markup.type === MARKUP_TYPES.SHAPE.CLOUD.type);
  }

  onShowSingleEndArrow($event: any) {
    this._handleShowMarkup('showSingleEndArrow', $event,
      markup => markup.type === MARKUP_TYPES.ARROW.SINGLE_END.type && markup.subtype === MARKUP_TYPES.ARROW.SINGLE_END.subtype);
  }

  onShowFilledSingleEndArrow($event: any) {
    this._handleShowMarkup('showFilledSingleEndArrow', $event,
      markup => markup.type === MARKUP_TYPES.ARROW.FILLED_SINGLE_END.type && markup.subtype === MARKUP_TYPES.ARROW.FILLED_SINGLE_END.subtype);
  }

  onShowBothEndsArrow($event: any) {
    this._handleShowMarkup('showBothEndsArrow', $event,
      markup => markup.type === MARKUP_TYPES.ARROW.BOTH_ENDS.type && markup.subtype === MARKUP_TYPES.ARROW.BOTH_ENDS.subtype);
  }

  onShowFilledBothEndsArrow($event: any) {
    this._handleShowMarkup('showFilledBothEndsArrow', $event,
      markup => markup.type === MARKUP_TYPES.ARROW.FILLED_BOTH_ENDS.type && markup.subtype === MARKUP_TYPES.ARROW.FILLED_BOTH_ENDS.subtype);
  }

  onShowFreeHand($event: any) {
    this._handleShowMarkup('showFreehand', $event,
      markup => markup.type === MARKUP_TYPES.PAINT.FREEHAND.type && markup.subtype === MARKUP_TYPES.PAINT.FREEHAND.subType);
  }

  private _calcCount(typeCheck: (markup: any) => boolean): number {
    const markupList = this.rxCoreService.getGuiMarkupList();
    return markupList.filter(typeCheck).length;
  }

  private _calcCountType(typeCheck: (markup: any) => boolean): number {
    const markupList = this.rxCoreService.getGuiMarkupList();
    return markupList.filter(typeCheck).length;
  }
  

  calcAnnotationCount() {

    
    return this._calcCount(markup => !(markup.ismeasure));
      
        /*markup.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
        (markup.type === MARKUP_TYPES.MEASURE.AREA.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
        (markup.type === MARKUP_TYPES.MEASURE.PATH.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
        (markup.type === MARKUP_TYPES.MEASURE.RECTANGLE.type &&
          markup.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType) ||
        markup.type === MARKUP_TYPES.SIGNATURE.type
      )
    );*/
    
  }

  calcMeasurementsCount() {

    return this._calcCount(markup => (markup.ismeasure));

      /*markup.type === MARKUP_TYPES.MEASURE.LENGTH.type ||
      (markup.type === MARKUP_TYPES.MEASURE.AREA.type &&
        markup.subtype === MARKUP_TYPES.MEASURE.AREA.subType) ||
      (markup.type === MARKUP_TYPES.MEASURE.PATH.type &&
        markup.subtype === MARKUP_TYPES.MEASURE.PATH.subType) ||
      (markup.type === MARKUP_TYPES.MEASURE.RECTANGLE.type &&
        markup.subtype === MARKUP_TYPES.MEASURE.RECTANGLE.subType)
    );*/

  }

  calcTypeCount(type : any){

    return this._calcCount(markup => markup.type === type.typename);

  }


  calcTextCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.TEXT.type);
  }

  calcCalloutCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.CALLOUT.type && markup.subtype === MARKUP_TYPES.CALLOUT.subType);
  }

  calcNoteCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.NOTE.type && markup.subtype === MARKUP_TYPES.NOTE.subType);
  }

  calcRectangleCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.SHAPE.RECTANGLE.type && markup.subtype === MARKUP_TYPES.SHAPE.RECTANGLE.subType);
  }

  calcRoundedRectangleCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.SHAPE.ROUNDED_RECTANGLE.type && markup.subtype === MARKUP_TYPES.SHAPE.ROUNDED_RECTANGLE.subType);
  }

  calcEllipseCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.SHAPE.ELLIPSE.type);
  }

  calcPolygonCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.SHAPE.POLYGON.type && markup.subtype === MARKUP_TYPES.SHAPE.POLYGON.subType);
  }

  calcCloudCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.SHAPE.CLOUD.type && markup.subtype === MARKUP_TYPES.SHAPE.CLOUD.subtype);
  }

  calcSingleEndArrowCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.ARROW.SINGLE_END.type && markup.subtype === MARKUP_TYPES.ARROW.SINGLE_END.subtype);
  }

  calcFilledSingleEndArrowCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.ARROW.FILLED_SINGLE_END.type && markup.subtype === MARKUP_TYPES.ARROW.FILLED_SINGLE_END.subtype);
  }

  calcBothEndsArrowCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.ARROW.BOTH_ENDS.type && markup.subtype === MARKUP_TYPES.ARROW.BOTH_ENDS.subtype);
  }

  calcFilledBothEndsArrowCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.ARROW.FILLED_BOTH_ENDS.type && markup.subtype === MARKUP_TYPES.ARROW.FILLED_BOTH_ENDS.subtype);
  }

  calcHighlighterCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.PAINT.HIGHLIGHTER.type && markup.subType === MARKUP_TYPES.PAINT.HIGHLIGHTER.subType);
  }

  calcFreehandCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.PAINT.FREEHAND.type && markup.subType === MARKUP_TYPES.PAINT.FREEHAND.subType);
  }

  calcPolylineCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.PAINT.POLYLINE.type && markup.subType === MARKUP_TYPES.PAINT.POLYLINE.subType);
  }

  calcStampCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.STAMP.type && markup.subType === MARKUP_TYPES.STAMP.subType);
  }

  calcMeasureLengthCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.MEASURE.LENGTH.type);
  }

  calcMeasureAreaCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.MEASURE.AREA.type && markup.subtype === MARKUP_TYPES.MEASURE.AREA.subType);
  }

  calcMeasurePathCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.MEASURE.PATH.type && markup.subType === MARKUP_TYPES.MEASURE.PATH.subType);
  }

  calcMeasureRectangleCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.MEASURE.RECTANGLE.type && markup.subType === MARKUP_TYPES.MEASURE.RECTANGLE.subType);
  }

  calcLinkCount() {
    return this._calcCount(markup => markup.type === MARKUP_TYPES.LINK.type);
  }


  calcAllCount() {
    
    
    
    return this.calcAnnotationCount() + this.calcMeasurementsCount();



  }

  getUniqueAuthorList() {
    const markupList = this.rxCoreService.getGuiMarkupList();
    return [...new Set(markupList.map(markup => RXCore.getDisplayName(markup.signature)))];
  }

  onAuthorFilterChange(author: string) {

    let users :Array<any> = RXCore.getUsers();
    let userindx = 0;

    for(let ui = 0; ui < users.length; ui++){
      if(users[ui].DisplayName === author){
        userindx = ui;
      } 

    }

    if(this.authorFilter.has(author)) {
      this.authorFilter.delete(author);

      //turn off display for this user
      RXCore.SetUserMarkupdisplay(userindx, false);

    } else {
      this.authorFilter.add(author);

      RXCore.SetUserMarkupdisplay(userindx, true);
      //turn on display for this user

    }




    this._processList(this.rxCoreService.getGuiMarkupList());
  }



}
