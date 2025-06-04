import { Component, ElementRef, HostListener, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
  private _activeMarkupNumber: number = -1;
  
  get activeMarkupNumber(): number {
    return this._activeMarkupNumber;
  }
  
  set activeMarkupNumber(value: number) {
    if (this._activeMarkupNumber !== value) {
      console.log(`🎯 activeMarkupNumber changed from ${this._activeMarkupNumber} to ${value}`);
      console.trace('Stack trace for activeMarkupNumber change:');
    }
    this._activeMarkupNumber = value;
  }
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

  showAnnotations: boolean | undefined = false;
  showMeasurements: boolean | undefined = false;
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

  // Add new properties for improved positioning
  private scrollContainer: HTMLElement | null = null;
  private documentViewport: HTMLElement | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastScrollPosition = { x: 0, y: 0 };
  private activeEndPoint: HTMLElement | null = null;
  private scrollUpdateTimeout: any = null;
  // NEW: Additional properties for improved state management
  private leaderLineUpdateTimeout: any = null;
  private domWaitTimeout: any = null;
  private isUpdatingLeaderLine: boolean = false;
  private lastProcessedMarkupNumber: number = -1;
  private maxRetryAttempts: number = 5;
  private retryDelayBase: number = 100;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private el: ElementRef,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef) {
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
    // Prevent race conditions and infinite loops
    if (this.isUpdatingLeaderLine) {
      console.log(`🚫 _showLeaderLine: Already updating leader line, skipping for markup ${markup.markupnumber}`);
      return;
    }

    this.isUpdatingLeaderLine = true;
    
    try {
      this._hideLeaderLine();

      console.log(`🎯 _showLeaderLine: Attempting to show leader line for markup ${markup.markupnumber}`);

      const start = document.getElementById(`note-panel-${markup.markupnumber}`);
      if (!start) {
        console.warn(`❌ _showLeaderLine: Could not find DOM element note-panel-${markup.markupnumber}`);
        this._scheduleRetryOrFallback(markup);
        return;
      }

      console.log(`✅ _showLeaderLine: Found DOM element note-panel-${markup.markupnumber}`);

      // Ensure the markup is selected in RXCore to prevent reset
      console.log(`🎯 _showLeaderLine: Selecting markup ${markup.markupnumber} in RXCore`);
      RXCore.selectMarkUpByIndex(markup.markupnumber);

      // Get accurate viewport-aware coordinates
      const coords = this._getViewportAwareCoordinates(markup);
      if (!coords) {
        console.warn(`❌ _showLeaderLine: Could not get coordinates for markup ${markup.markupnumber}`);
        this.isUpdatingLeaderLine = false;
        return;
      }

      console.log(`✅ _showLeaderLine: Got coordinates (${coords.x}, ${coords.y}) for markup ${markup.markupnumber}`);

      const end = document.createElement('div');
      end.style.position = 'fixed';
      end.style.left = `${coords.x}px`;
      end.style.top = `${coords.y}px`;
      end.style.width = '1px';
      end.style.height = '1px';
      end.style.pointerEvents = 'none';
      end.style.zIndex = '9999';
      end.className = 'leader-line-end';
      end.setAttribute('data-markup-number', markup.markupnumber.toString());
      document.body.appendChild(end);
      
      // Store reference for updates
      this.activeEndPoint = end;
      this.lastProcessedMarkupNumber = markup.markupnumber;

      this.leaderLine = new LeaderLine({
        start,
        end,
        color: document.documentElement.style.getPropertyValue("--accent") || '#14ab0a',
        size: 2,
        path: 'grid',
        endPlug: 'arrow2',
        endPlugSize: 1.5
      });

      console.log(`✅ _showLeaderLine: Leader line created successfully for markup ${markup.markupnumber}`);
    } catch (error) {
      console.error('❌ Error in _showLeaderLine:', error);
    } finally {
      this.isUpdatingLeaderLine = false;
    }
  }

  private _hideLeaderLine(): void {
    // Clear any pending timeouts to prevent memory leaks
    this._clearAllTimeouts();
    
    if (this.leaderLine) {
      try {
        this.leaderLine.remove();
      } catch (error) {
        console.warn('Error removing leader line:', error);
      }
      this.leaderLine = undefined;
    }
    
    if (this.activeEndPoint) {
      try {
        this.activeEndPoint.remove();
      } catch (error) {
        console.warn('Error removing active end point:', error);
      }
      this.activeEndPoint = null;
    }
    
    // Clean up any orphaned leader line elements
    try {
      document.querySelectorAll(".leader-line-end,.leader-line").forEach(el => el.remove());
    } catch (error) {
      console.warn('Error cleaning up leader line elements:', error);
    }
    
    this.lastProcessedMarkupNumber = -1;
  }

  /**
   * Clear all pending timeouts to prevent memory leaks
   */
  private _clearAllTimeouts(): void {
    if (this.leaderLineUpdateTimeout) {
      clearTimeout(this.leaderLineUpdateTimeout);
      this.leaderLineUpdateTimeout = null;
    }
    
    if (this.domWaitTimeout) {
      clearTimeout(this.domWaitTimeout);
      this.domWaitTimeout = null;
    }
    
    if (this.scrollUpdateTimeout) {
      clearTimeout(this.scrollUpdateTimeout);
      this.scrollUpdateTimeout = null;
    }
  }

  /**
   * Schedule a retry or fallback when DOM element is not found
   */
  private _scheduleRetryOrFallback(markup: IMarkup): void {
    if (this.domWaitTimeout) {
      clearTimeout(this.domWaitTimeout);
    }
    
    // Try once more after a short delay, then give up
    this.domWaitTimeout = setTimeout(() => {
      const start = document.getElementById(`note-panel-${markup.markupnumber}`);
      if (start && markup.markupnumber === this.activeMarkupNumber) {
        console.log(`✅ Found DOM element on retry for markup ${markup.markupnumber}`);
        this.isUpdatingLeaderLine = false; // Reset flag before retry
        this._showLeaderLine(markup);
      } else {
        console.warn(`❌ Final attempt failed for markup ${markup.markupnumber}, giving up`);
        this.isUpdatingLeaderLine = false;
      }
    }, this.retryDelayBase);
  }

  /**
   * Get viewport-aware coordinates for annotations considering scroll position and page layout
   */
  private _getViewportAwareCoordinates(markup: any): { x: number, y: number } | null {
    try {
      // Handle text arrow connections
      if (markup.bisTextArrow && markup.textBoxConnected != null) {
        markup = markup.textBoxConnected;
      }

      // Get the document viewport container
      const viewport = this._getDocumentViewport();
      if (!viewport) {
        console.warn('❌ _getViewportAwareCoordinates: No viewport found');
        return null;
      }

      const viewportRect = viewport.getBoundingClientRect();
      
      // Get markup coordinates with proper scaling
      const scaledCoords = this._getScaledMarkupCoordinates(markup);
      if (!scaledCoords) {
        console.warn(`❌ _getViewportAwareCoordinates: Could not get scaled coordinates for markup ${markup.markupnumber}`);
        return null;
      }

      // Convert to viewport-relative coordinates
      const relativeX = scaledCoords.x - viewport.scrollLeft;
      const relativeY = scaledCoords.y - viewport.scrollTop;

      // Convert to screen coordinates
      const screenX = viewportRect.left + relativeX;
      const screenY = viewportRect.top + relativeY;

      // For multi-page documents, ensure the annotation's page is visible
      // If the point is not visible, it might be on a different page
      if (this._isPointInViewport(screenX, screenY)) {
        return { x: screenX, y: screenY };
      } else {
        // In multi-page documents, this might be expected if the page hasn't loaded yet
        // Return coordinates anyway, but log for debugging
        return { x: screenX, y: screenY };
      }

    } catch (error) {
      console.warn('❌ _getViewportAwareCoordinates: Error calculating viewport-aware coordinates:', error);
      return null;
    }
  }

  /**
   * Get scaled coordinates for markup with proper rotation handling
   */
  private _getScaledMarkupCoordinates(markup: any): { x: number, y: number } | null {
    try {
      const deviceRatio = window.devicePixelRatio || 1;
      
      // Get base coordinates
      const wscaled = (markup.wscaled || markup.w) / deviceRatio;
      const hscaled = (markup.hscaled || markup.h) / deviceRatio;
      const xscaled = (markup.xscaled || markup.x) / deviceRatio;
      const yscaled = (markup.yscaled || markup.y) / deviceRatio;

      let targetX = xscaled;
      let targetY = yscaled;

      // Calculate target point based on markup type
      switch (markup.type) {
        case MARKUP_TYPES.NOTE.type:
          targetX = xscaled + wscaled;
          targetY = yscaled + (hscaled * 0.5);
          break;
          
        case MARKUP_TYPES.ARROW.type:
        case MARKUP_TYPES.MEASURE.LENGTH.type:
          // Use the rightmost point for linear markups
          targetX = Math.max(xscaled, wscaled);
          targetY = (xscaled > wscaled) ? yscaled : hscaled;
          break;
          
        case MARKUP_TYPES.MEASURE.MEASUREARC.type:
        case MARKUP_TYPES.ERASE.type:
        case MARKUP_TYPES.SHAPE.POLYGON.type:
        case MARKUP_TYPES.PAINT.POLYLINE.type:
        case MARKUP_TYPES.MEASURE.PATH.type:
        case MARKUP_TYPES.MEASURE.AREA.type:
          // For complex shapes, use the topmost point
          if (markup.points && markup.points.length > 0) {
            let topPoint = markup.points[0];
            for (let point of markup.points) {
              if (point.y < topPoint.y) {
                topPoint = point;
              }
            }
            targetX = topPoint.x / deviceRatio;
            targetY = topPoint.y / deviceRatio;
          } else {
            targetX = xscaled + (wscaled * 0.5);
            targetY = yscaled;
          }
          break;
          
        default:
          // Default to center-right edge
          targetX = xscaled + wscaled;
          targetY = yscaled + (hscaled * 0.5);
          break;
      }

      // Apply rotation transformation if needed
      if (this.pageRotation !== 0 && markup.getrotatedPoint) {
        const rotatedPoint = markup.getrotatedPoint(
          targetX * deviceRatio, 
          targetY * deviceRatio
        );
        if (rotatedPoint) {
          targetX = rotatedPoint.x / deviceRatio;
          targetY = rotatedPoint.y / deviceRatio;
        }
      }

      return { x: targetX, y: targetY };
    } catch (error) {
      console.warn('Error calculating scaled markup coordinates:', error);
      return null;
    }
  }

  /**
   * Get the document viewport element
   */
  private _getDocumentViewport(): HTMLElement | null {
    if (this.documentViewport) return this.documentViewport;
    
    // Look for common viewport containers
    const selectors = [
      '#foxitframe',
      '.foxit-pdf-reader',
      '.pdf-viewer',
      '.document-container',
      '.rx-pdf-viewer'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        this.documentViewport = element;
        return element;
      }
    }
    
    // Fallback to document body
    this.documentViewport = document.body;
    return this.documentViewport;
  }

  /**
   * Check if a point is visible in the current viewport
   */
  private _isPointInViewport(x: number, y: number): boolean {
    return x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight;
  }

  /**
   * Update leader line position efficiently with DOM validation and race condition prevention
   */
  private _updateLeaderLinePosition(): void {
    // Prevent multiple simultaneous updates
    if (this.isUpdatingLeaderLine || this.activeMarkupNumber <= 0) {
      return;
    }

    // Debounce rapid updates
    if (this.leaderLineUpdateTimeout) {
      clearTimeout(this.leaderLineUpdateTimeout);
    }

    this.leaderLineUpdateTimeout = setTimeout(() => {
      this._performLeaderLineUpdate();
    }, 50); // Small debounce delay
  }

  /**
   * Perform the actual leader line update
   */
  private _performLeaderLineUpdate(): void {
    if (this.activeMarkupNumber <= 0 || this.isUpdatingLeaderLine) {
      return;
    }

    // Check if the start element still exists in DOM
    const startElement = document.getElementById(`note-panel-${this.activeMarkupNumber}`);
    if (!startElement) {
      // Start element doesn't exist, recreate the leader line
      this._recreateLeaderLineForActiveMarkup();
      return;
    }

    if (!this.leaderLine || !this.activeEndPoint) {
      // Leader line doesn't exist, recreate it
      this._recreateLeaderLineForActiveMarkup();
      return;
    }

    const allMarkups = [
      ...(this.rxCoreService.getGuiMarkupList() || []), 
      ...(this.rxCoreService.getGuiAnnotList() || [])
    ];
    
    const activeMarkup = allMarkups.find(markup => markup.markupnumber === this.activeMarkupNumber);
    if (!activeMarkup) {
      this._hideLeaderLine();
      return;
    }

    const coords = this._getViewportAwareCoordinates(activeMarkup);
    if (coords) {
      this.activeEndPoint.style.left = `${coords.x}px`;
      this.activeEndPoint.style.top = `${coords.y}px`;
      
      // Force LeaderLine to recalculate
      try {
        if (this.leaderLine.position) {
          this.leaderLine.position();
        }
      } catch (error) {
        console.warn('Error updating leader line position, recreating:', error);
        this._recreateLeaderLineForActiveMarkup();
      }
    } else {
      // Hide if not visible
      this._hideLeaderLine();
    }
  }

  /**
   * Recreate leader line for the currently active markup
   */
  private _recreateLeaderLineForActiveMarkup(): void {
    if (this.activeMarkupNumber <= 0) return;

    const allMarkups = [
      ...(this.rxCoreService.getGuiMarkupList() || []), 
      ...(this.rxCoreService.getGuiAnnotList() || [])
    ];
    
    const activeMarkup = allMarkups.find(markup => markup.markupnumber === this.activeMarkupNumber);
    if (activeMarkup) {
      this._showLeaderLine(activeMarkup);
    }
  }

  /**
   * Wait for DOM element to be available and then update leader line (improved with bounds checking)
   */
  private _waitForDOMAndUpdateLeaderLine(): void {
    if (this.activeMarkupNumber <= 0) {
      console.log('_waitForDOMAndUpdateLeaderLine: No active markup number');
      return;
    }

    // Clear any existing timeout to prevent overlapping attempts
    this._clearAllTimeouts();

    console.log(`_waitForDOMAndUpdateLeaderLine: Starting search for DOM element note-panel-${this.activeMarkupNumber}`);

    // Force change detection first
    this.cdr.detectChanges();

    const targetMarkupNumber = this.activeMarkupNumber; // Capture current value
    let attempts = 0;

    const checkAndUpdate = () => {
      // Prevent infinite loops if markup number has changed
      if (this.activeMarkupNumber !== targetMarkupNumber) {
        console.log(`🔄 Active markup changed from ${targetMarkupNumber} to ${this.activeMarkupNumber}, stopping search`);
        return;
      }

      attempts++;
      console.log(`_waitForDOMAndUpdateLeaderLine: Attempt ${attempts} looking for note-panel-${targetMarkupNumber}`);
      
      const startElement = document.getElementById(`note-panel-${targetMarkupNumber}`);
      
      if (startElement) {
        console.log(`✅ Leader line DOM element found after ${attempts} attempts for markup ${targetMarkupNumber}`);
        // Element is available, update the leader line
        this._updateLeaderLinePosition();
      } else {
        console.log(`❌ DOM element note-panel-${targetMarkupNumber} not found on attempt ${attempts}`);
        
        if (attempts < this.maxRetryAttempts) {
          // Element not yet available, try again after a delay
          const delay = Math.min(this.retryDelayBase * attempts, 500); // Progressive delay with cap
          this.domWaitTimeout = setTimeout(checkAndUpdate, delay);
        } else {
          console.warn(`⚠️ Could not find DOM element for markup ${targetMarkupNumber} after ${this.maxRetryAttempts} attempts - giving up`);
          
          // Final attempt to show leader line without DOM wait
          const allMarkups = [
            ...(this.rxCoreService.getGuiMarkupList() || []), 
            ...(this.rxCoreService.getGuiAnnotList() || [])
          ];
          const activeMarkup = allMarkups.find(markup => markup.markupnumber === targetMarkupNumber);
          
          if (activeMarkup && this.activeMarkupNumber === targetMarkupNumber) {
            console.log(`🔄 Making final attempt to show leader line for markup ${targetMarkupNumber}`);
            // Reset the updating flag and try once more
            this.isUpdatingLeaderLine = false;
            this._showLeaderLine(activeMarkup);
          }
        }
      }
    };

    // Start immediately
    this.domWaitTimeout = setTimeout(checkAndUpdate, 50);
  }

  /**
   * Ensure that the active markup is always visible by adding its author to filters
   */
  private _ensureActiveMarkupIsVisible(markup: any): void {
    if (!markup || !markup.signature) {
      console.warn('_ensureActiveMarkupIsVisible: Invalid markup or signature');
      return;
    }

    const authorDisplayName = RXCore.getDisplayName(markup.signature);
    console.log(`🔍 _ensureActiveMarkupIsVisible: Processing markup ${markup.markupnumber} by ${authorDisplayName} (signature: ${markup.signature})`);
    
    console.log('Current authorFilter:', Array.from(this.authorFilter));
    console.log('Current createdByFilter:', Array.from(this.createdByFilter));
    
    // Add author to authorFilter if not already present
    if (!this.authorFilter.has(authorDisplayName)) {
      this.authorFilter.add(authorDisplayName);
      console.log(`✅ Added ${authorDisplayName} to author filter to ensure active markup ${markup.markupnumber} is visible`);
    } else {
      console.log(`ℹ️ ${authorDisplayName} already in author filter`);
    }

    // Add signature to createdByFilter if not already present
    if (!this.createdByFilter.has(markup.signature)) {
      this.createdByFilter.add(markup.signature);
      console.log(`✅ Added signature ${markup.signature} to created by filter to ensure active markup ${markup.markupnumber} is visible`);
    } else {
      console.log(`ℹ️ Signature ${markup.signature} already in created by filter`);
    }

    console.log('Updated authorFilter:', Array.from(this.authorFilter));
    console.log('Updated createdByFilter:', Array.from(this.createdByFilter));

    // Update the created by filter options to reflect this change
    this._updateCreatedByFilterOptions(this.rxCoreService.getGuiMarkupList());
    
    console.log('Filter options updated, calling RXCore to show user markups');
    
    // Also ensure the user is visible in RXCore
    let users: Array<any> = RXCore.getUsers();
    let userIndex = users.findIndex(user => user.DisplayName === authorDisplayName);
    if (userIndex >= 0) {
      console.log(`🔄 Setting user ${authorDisplayName} (index ${userIndex}) markup display to true`);
      RXCore.SetUserMarkupdisplay(userIndex, true);
    } else {
      console.warn(`❌ User ${authorDisplayName} not found in RXCore users list`);
    }
  }

  /**
   * Setup intersection observer for viewport changes (optimized)
   */
  private _setupIntersectionObserver(): void {
    if (this.intersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        // Only update if there's an active markup and entries indicate meaningful change
        if (this.activeMarkupNumber > 0 && entries.some(entry => entry.isIntersecting)) {
          this._updateLeaderLinePosition();
        }
      },
      { 
        threshold: [0.1, 0.9], // Simplified thresholds
        rootMargin: '50px' // Add margin to reduce triggering
      }
    );

    // Observe the comments container
    const commentsContainer = this.el.nativeElement.querySelector('.main-section');
    if (commentsContainer) {
      this.intersectionObserver.observe(commentsContainer);
    }
  }

  /**
   * Setup resize observer for layout changes (optimized with debouncing)
   */
  private _setupResizeObserver(): void {
    if (!window.ResizeObserver || this.resizeObserver) return;

    let resizeTimeout: any = null;
    
    this.resizeObserver = new ResizeObserver(() => {
      // Clear previous timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // Debounce resize updates more aggressively
      resizeTimeout = setTimeout(() => {
        if (this.activeMarkupNumber > 0 && !this.isUpdatingLeaderLine) {
          this._updateLeaderLinePosition();
        }
      }, 200); // Increased debounce time
    });

    // Observe the main container
    const container = this.el.nativeElement;
    if (container) {
      this.resizeObserver.observe(container);
    }
  }

  /**
   * Initialize scroll container monitoring
   */
  private _initializeScrollMonitoring(): void {
    // Find scroll container
    this.scrollContainer = this.el.nativeElement.querySelector('.main-section');
    
    // Set up viewport monitoring
    this._setupIntersectionObserver();
    this._setupResizeObserver();
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
   * Helper method to safely recalculate position for active comment (improved with safety checks)
   */
  private recalculateActiveCommentPosition(): void {
    if (this.activeMarkupNumber > 0 && !this.isUpdatingLeaderLine) {
      console.log(`🔄 Recalculating position for active comment ${this.activeMarkupNumber}`);
      
      // Clear any pending operations first
      this._clearAllTimeouts();
      
      // Use the debounced update method to prevent race conditions
      this._updateLeaderLinePosition();
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
      // Always show the active markup regardless of filter
      if (this.activeMarkupNumber > 0 && item.markupnumber === this.activeMarkupNumber) {
        console.log(`✅ _processList: Keeping active markup ${item.markupnumber} by ${RXCore.getDisplayName(item.signature)}`);
        return true;
      }
      
      if(this.createdByFilter.size > 0) {
        const isIncluded = this.createdByFilter.has(item.signature);
        console.log(`📝 _processList: Markup ${item.markupnumber} by ${RXCore.getDisplayName(item.signature)} (${item.signature}) - ${isIncluded ? 'INCLUDED' : 'FILTERED OUT'}`);
        return isIncluded;
      }
      console.log(`📝 _processList: No filter applied, showing markup ${item.markupnumber} by ${RXCore.getDisplayName(item.signature)}`);
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

      // Set default states - both OFF by default when file is uploaded
      this.showAnnotations = false;
      this.showMeasurements = false;
      this.showAll = false;

      // Apply the default OFF state to hide all markups initially
      this.onShowAnnotations(false);
      this.onShowMeasurements(false);





    });


    this.guiZoomUpdated$.subscribe(({params, zoomtype}) => {
      if(zoomtype == 0 || zoomtype == 1){
        console.log(`🔍 Zoom updated: type ${zoomtype}, activeMarkupNumber: ${this.activeMarkupNumber}`);
        
        // Clear any pending operations
        this._clearAllTimeouts();
        
        // Reset viewport reference on zoom change
        this.documentViewport = null;
        
        // Update position for active comment after zoom change with debouncing
        if (this.activeMarkupNumber > 0) {
          this.leaderLineUpdateTimeout = setTimeout(() => {
            this._updateLeaderLinePosition();
          }, 200); // Increased delay for zoom to complete
        }
      }
    });

    this.guiRotatePage$.subscribe(({degree, pageIndex}) => {
      console.log(`🔄 Page rotated: ${degree} degrees, page ${pageIndex}, activeMarkupNumber: ${this.activeMarkupNumber}`);
      
      // Clear any pending operations
      this._clearAllTimeouts();
      
      this.pageRotation = degree;

      // Hide leader line during rotation to prevent visual artifacts
      this._hideLeaderLine();
      
      // Reset viewport reference
      this.documentViewport = null;

      // Recalculate position for active comment after rotation change with delay
      if (this.activeMarkupNumber > 0) {
        this.leaderLineUpdateTimeout = setTimeout(() => {
          const allMarkups = [
            ...(this.rxCoreService.getGuiMarkupList() || []), 
            ...(this.rxCoreService.getGuiAnnotList() || [])
          ];
          const activeMarkup = allMarkups.find(markup => markup.markupnumber === this.activeMarkupNumber);
          
          if (activeMarkup) {
            console.log(`🔄 Recreating leader line after rotation for markup ${this.activeMarkupNumber}`);
            this._showLeaderLine(activeMarkup);
          }
        }, 300); // Allow time for rotation to complete
      }
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
          // Only reset activeMarkupNumber if the currently active markup is not in the list
          // or if no markup is actually selected
          const selectedMarkup = list.find((itm) => itm.getselected());
          const activeMarkupExists = this.activeMarkupNumber > 0 && list.find((itm) => itm.markupnumber === this.activeMarkupNumber);
          
          if (!selectedMarkup && !activeMarkupExists) {
            console.log(`🎯 Resetting activeMarkupNumber because no selected markup found and active markup ${this.activeMarkupNumber} not in list`);
            this.activeMarkupNumber = -1;
          } else if (selectedMarkup && this.activeMarkupNumber !== selectedMarkup.markupnumber) {
            console.log(`🎯 Setting activeMarkupNumber to selected markup ${selectedMarkup.markupnumber}`);
            this.activeMarkupNumber = selectedMarkup.markupnumber;
          } else {
            console.log(`🎯 Keeping activeMarkupNumber ${this.activeMarkupNumber} (selectedMarkup: ${selectedMarkup?.markupnumber}, activeExists: ${!!activeMarkupExists})`);
          }

          this._processList(list, this.rxCoreService.getGuiAnnotList());
        }, 250);
      }else{
        this._processList(list, this.rxCoreService.getGuiAnnotList());
      }

      // Panel title will be dynamically generated by getPanelTitle() method


    });

    this.rxCoreService.guiAnnotList$.subscribe((list = []) => {
      this._processList(this.rxCoreService.getGuiMarkupList(), list);
    });


    this.rxCoreService.guiPage$.subscribe((state) => {
      console.log(`📄 Page changed to ${state.currentpage}, activeMarkupNumber: ${this.activeMarkupNumber}`);
      
      // Clear all pending operations first
      this._clearAllTimeouts();
      
      if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
      }

      // Reset viewport reference on page change - critical for multi-page support
      this.documentViewport = null;
      
      // Always hide leader line first when page changes to prevent visual artifacts
      this._hideLeaderLine();
      
      // If there's an active markup, check if it belongs to the current page
      if (this.activeMarkupNumber > 0) {
        const allMarkups = [
          ...(this.rxCoreService.getGuiMarkupList() || []), 
          ...(this.rxCoreService.getGuiAnnotList() || [])
        ];
        const activeMarkup = allMarkups.find(markup => markup.markupnumber === this.activeMarkupNumber);
        
        if (activeMarkup) {
          console.log(`📄 Active markup ${this.activeMarkupNumber} is on page ${activeMarkup.pagenumber}, current page is ${state.currentpage}`);
          
          if (activeMarkup.pagenumber === state.currentpage) {
            // The active markup is on the current page, show leader line after page loads
            console.log(`✅ Active markup is on current page, will show leader line after page loads`);
            // Wait for page to fully render before showing leader line
            this.leaderLineUpdateTimeout = setTimeout(() => {
              if (this.activeMarkupNumber === activeMarkup.markupnumber) {
                this._showLeaderLine(activeMarkup);
              }
            }, 250); // Increased delay for page rendering
          } else {
            // The active markup is on a different page, keep it hidden
            console.log(`🚫 Active markup is on different page (${activeMarkup.pagenumber}), keeping leader line hidden`);
          }
        } else {
          console.warn(`❌ Active markup ${this.activeMarkupNumber} not found in markup lists`);
        }
      }
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
      }
      // Update position immediately for pan operations
      this._updateLeaderLinePosition();
    });

    this.guiOnPanUpdatedSubscription = this.rxCoreService.resetLeaderLine$.subscribe((response: boolean) => {
      if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
      }
      // Hide leader line on reset
      this._hideLeaderLine();
    });


    this.rxCoreService.guiOnMarkupChanged.subscribe(({annotation, operation}) => {
      //this.visible = false;
      this._hideLeaderLine();
    });

    this.markuptypes = RXCore.getMarkupTypes();

    // Initialize scroll container monitoring
    this._initializeScrollMonitoring();
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
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
  }

  onCreatedByFilterChange(values): void {
    this.createdByFilter = new Set(values);
    this._processList(this.rxCoreService.getGuiMarkupList());
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
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
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
  }


  onFilterApply(): void {
    console.log(`🔧 onFilterApply: Starting with activeMarkupNumber=${this.activeMarkupNumber}`);
    console.log('Current filters - authorFilter:', Array.from(this.authorFilter));
    console.log('Current filters - createdByFilter:', Array.from(this.createdByFilter));
    
    this._processList(this.rxCoreService.getGuiMarkupList());
    this.filterVisible = false;
    
    console.log('🔧 onFilterApply: Filter applied, waiting for DOM update...');
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
  }

  toggleFilterVisibility(): void {
    console.log(`🔧 toggleFilterVisibility: Toggling from ${this.filterVisible} to ${!this.filterVisible} with activeMarkupNumber=${this.activeMarkupNumber}`);
    this.filterVisible = !this.filterVisible;
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
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
    if (!markup) {
      console.warn('SetActiveCommentSelect: Invalid markup provided');
      return;
    }

    if (markup.bisTextArrow && markup.textBoxConnected != null) {
      markup = markup.textBoxConnected;
    }

    let markupNo = markup.markupnumber;

    if (markupNo && markupNo > 0) {
      // Prevent unnecessary operations if already active and leader line exists
      if (this.activeMarkupNumber === markupNo && this.leaderLine && 
          this.lastProcessedMarkupNumber === markupNo) {
        console.log(`🔄 SetActiveCommentSelect: Markup ${markupNo} already active with leader line, skipping`);
        return;
      }
      
      console.log(`🎯 SetActiveCommentSelect: Setting active markup to ${markupNo}`);
      
      // Clear any pending operations before starting new ones
      this._clearAllTimeouts();
      
      // Immediately set active state for visual feedback
      this.activeMarkupNumber = markupNo;
      
      // Force immediate change detection for responsive UI
      this.cdr.detectChanges();
      
      // Ensure the markup's author is always visible
      this._ensureActiveMarkupIsVisible(markup);
      
      // Navigate to the correct page where the annotation exists
      console.log(`🚀 SetActiveCommentSelect: Navigating to page ${markup.pagenumber} for markup ${markupNo}`);
      RXCore.gotoPage(markup.pagenumber);
      
      // Reprocess the list to ensure the active markup is visible
      this._processList(this.rxCoreService.getGuiMarkupList(), this.rxCoreService.getGuiAnnotList());
      
      // Use improved leader line system
      this._showLeaderLine(markup);
    } else {
      console.warn(`SetActiveCommentSelect: Invalid markup number ${markupNo}`);
    }
  }

  ItemNoteClick(event, markupNo: number, markup: any): void {

    console.log(markupNo);

  }

  SetActiveCommentThread(event, markupNo: number, markup: any): void {
    if (markupNo && markupNo > 0 && markup) {
      console.log(`🎯 SetActiveCommentThread: Processing markup ${markupNo}`);
      
      // Clear any pending operations first
      this._clearAllTimeouts();
      
      // Immediately set active state for visual feedback
      this.activeMarkupNumber = markupNo;
      
      // Force immediate change detection for responsive UI
      this.cdr.detectChanges();
      
      // Ensure the markup's author is always visible by adding to filters if needed
      this._ensureActiveMarkupIsVisible(markup);
      
      this.onSelectAnnotation(markup);

      // Hide any existing leader lines first
      this._hideLeaderLine();

      // Navigate to the correct page where the annotation exists
      console.log(`🚀 SetActiveCommentThread: Navigating to page ${markup.pagenumber} for markup ${markupNo}`);
      RXCore.gotoPage(markup.pagenumber);

      // Reprocess the list to ensure the active markup is visible
      this._processList(this.rxCoreService.getGuiMarkupList(), this.rxCoreService.getGuiAnnotList());

      // Use improved leader line system
      console.log(`🎯 SetActiveCommentThread: Showing leader line for markup ${markupNo}`);
      this._showLeaderLine(markup);

      Object.values(this.list || {}).forEach((comments) => {
        comments.forEach((comment: any) => {
          if (comment.markupnumber === markupNo) {
            comment.IsExpanded = !comment.IsExpanded;
          }
        });
      });
    } else {
      console.warn(`SetActiveCommentThread: Invalid markup number ${markupNo} or markup object`);
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
    // Clear all timeouts first to prevent any race conditions
    this._clearAllTimeouts();
    
    // Set flags to prevent any ongoing operations
    this.isUpdatingLeaderLine = false;
    this.activeMarkupNumber = -1;
    
    // Unsubscribe from observables
    if (this.guiOnPanUpdatedSubscription) {
      this.guiOnPanUpdatedSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    
    // Clean up observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Clean up leader line
    this._hideLeaderLine();
    
    // Clear references
    this.scrollContainer = null;
    this.documentViewport = null;
    this.activeEndPoint = null;
    
    console.log('🧹 NotePanelComponent destroyed and cleaned up');
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
      }

      // Throttle scroll updates for better performance with bounds checking
      if (this.scrollUpdateTimeout) {
        clearTimeout(this.scrollUpdateTimeout);
      }
      
      // Only update if we have an active markup and we're not already updating
      if (this.activeMarkupNumber > 0 && !this.isUpdatingLeaderLine) {
        this.scrollUpdateTimeout = setTimeout(() => {
          this._updateLeaderLinePosition();
        }, 32); // Reduced frequency to ~30fps for better performance
      }
      
      event.stopPropagation();
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

  /**
   * Get dynamic panel title with count
   */
  getPanelTitle(): string {
    const annotationCount = this.calcAnnotationCount();
    const measurementsCount = this.calcMeasurementsCount();
    const totalCount = annotationCount + measurementsCount;
    return `Annotations and Measurements (${totalCount})`;
  }


  /**
   * Handle exclusive toggle for Annotations
   * When annotations are turned on, measurements are turned off
   */
  onToggleAnnotations(onoff: boolean) {
    if (onoff) {
      // Turn on annotations, turn off measurements
      this.showAnnotations = true;
      this.showMeasurements = false;
      this.onShowAnnotations(true);
      this.onShowMeasurements(false);
    } else {
      // Turn off annotations
      this.showAnnotations = false;
      this.onShowAnnotations(false);
    }
  }

  /**
   * Handle exclusive toggle for Measurements
   * When measurements are turned on, annotations are turned off
   */
  onToggleMeasurements(onoff: boolean) {
    if (onoff) {
      // Turn on measurements, turn off annotations
      this.showMeasurements = true;
      this.showAnnotations = false;
      this.onShowMeasurements(true);
      this.onShowAnnotations(false);
    } else {
      // Turn off measurements
      this.showMeasurements = false;
      this.onShowMeasurements(false);
    }
  }

  private _handleShowMarkupType(type :any, event: any, typeCheck: (markup: any) => boolean) {

    this._setmarkupTypeDisplayFilter(type,event.target.checked);

    this.rxTypeFilterLoaded = this.rxTypeFilter.filter((rxtype) => rxtype.loaded);

    this._updateMarkupDisplay(
      this.rxCoreService.getGuiMarkupList(),
      typeCheck,
      event.target.checked
    );
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
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

    // Check if the author being filtered is the author of the active markup
    const markupList = this.rxCoreService.getGuiMarkupList();
    const activeMarkup = markupList.find(markup => markup.markupnumber === this.activeMarkupNumber);
    const isActiveAuthor = activeMarkup && RXCore.getDisplayName(activeMarkup.signature) === author;

    if(this.authorFilter.has(author)) {
      // Don't remove active author from filter if their markup is currently selected
      if (!isActiveAuthor) {
        this.authorFilter.delete(author);
        //turn off display for this user
        RXCore.SetUserMarkupdisplay(userindx, false);
      } else {
        console.log(`Cannot hide author ${author} because their markup ${this.activeMarkupNumber} is currently active`);
      }

    } else {
      this.authorFilter.add(author);

      RXCore.SetUserMarkupdisplay(userindx, true);
      //turn on display for this user

    }

    this._processList(this.rxCoreService.getGuiMarkupList());
  }



}
