import { Component, ElementRef, HostListener, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { GuiMode } from 'src/rxcore/enums/GuiMode';

declare var LeaderLine: any;

@Component({
  selector: 'rx-note-panel',
  templateUrl: './note-panel.component.html',
  styleUrls: ['./note-panel.component.scss'],
  host: {
    '(window:resize)': 'onWindowResize($event)',
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class NotePanelComponent implements OnInit, AfterViewInit {
  visible: boolean = false;

  list: { [key: string]: Array<IMarkup> };
  annotlist: Array<IMarkup>;
  search: string;
  panelwidth : number = 300;

  guiConfig$ = this.rxCoreService.guiConfig$;
  guiMode$ = this.rxCoreService.guiMode$;
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
    this._activeMarkupNumber = value;
  }

  // NEW: Support for multiple active markups and leader lines
  private activeMarkupNumbers: Set<number> = new Set<number>();
  private leaderLines: Map<number, any> = new Map<number, any>();
  private activeEndPoints: Map<number, HTMLElement> = new Map<number, HTMLElement>();

  markupNoteList: number[] = [];
  noteIndex: number;
  pageNumber: number = -1;
  pageRotation : number = 0;
  isHideAnnotation: boolean = false;
  pageNumbers: any[] = [];
  //sortByField: 'created' | 'author' = 'created';
  //sortByField: 'created' | 'position' | 'author' = 'created';
  sortByField: 'created' | 'author' | 'pagenumber' | 'annotation' = 'created';



  sortOptions = [
    { value: "created", label: "Created day", imgSrc: "calendar-ico.svg" },
    { value: "author", label: "Author", imgSrc: "author-icon.svg" },
    { value: "pagenumber", label: "Page", imgSrc: "file-ico.svg" },
    { value: 'annotation', label: 'Annotation Type', imgSrc: "bookmark-ico.svg" },
  ];

  // Dynamic sort filter properties
  selectedSortOption: any = this.sortOptions[0];
  sortFilterOptions: Array<any> = [];
  selectedSortFilterValues: Array<any> = [];
  sortFilterLabel: string = '';
  
  // Sort filter date range for 'created' sort option
  sortFilterDateRange: {
    startDate: dayjs.Dayjs | undefined,
    endDate: dayjs.Dayjs | undefined
  } = { startDate: undefined, endDate: undefined};
  


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
  private guiModeSubscription: Subscription;
  
    // Mode-based control properties
    currentMode: string = 'View';
    isAnnotationSwitchDisabled: boolean = false;
    isMeasurementSwitchDisabled: boolean = false;

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
  showAll: boolean | undefined = false;
  showAnnotationsOnLoad : boolean | undefined = false;

  markupTypes : Array<any> = [];

  // Removed comment card functionality

  //getMarkupTypes


  authorFilter: Set<string> = new Set<string>();

  // Active filter count for dynamic display
  activeFilterCount: number = 0;

  // Individual annotation visibility tracking
  private hiddenAnnotations: Set<number> = new Set<number>();
  private hiddenGroups: Set<string> = new Set<string>();
  private groupHiddenAnnotations: Set<number> = new Set<number>(); // Track annotations hidden by group toggle

  /**
   * Get the number of hidden annotations for display in the reset button
   */
  get hiddenAnnotationsCount(): number {
    return this.hiddenAnnotations.size;
  }

  get hiddenGroupsCount(): number {
    return this.hiddenGroups.size;
  }

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

  // Add debouncing for _processList to prevent blinking
  private processListTimeout: any = null;
  private isProcessingList: boolean = false;

  // Removed CommentsListFiltersComponent ViewChild

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
    this._showLeaderLineForMarkup(markup.markupnumber, markup);
  }

  private _showLeaderLineForMarkup(markupNumber: number, markup: IMarkup): void {
    // Prevent race conditions and infinite loops
    if (this.isUpdatingLeaderLine) {
      return;
    }

    this.isUpdatingLeaderLine = true;

    try {
      // Remove existing leader line for this markup if it exists
      this._hideLeaderLineForMarkup(markupNumber);

      
      const start = document.getElementById(`note-panel-${markupNumber}`);
      if (!start) {
        console.warn(`❌ _showLeaderLineForMarkup: Could not find DOM element note-panel-${markupNumber}`);
        this._scheduleRetryOrFallback(markup);
        return;
      }

      RXCore.selectMarkUpByIndex(markupNumber);

      // Get accurate viewport-aware coordinates
      const coords = this._getViewportAwareCoordinates(markup);
      if (!coords) {
        console.warn(`❌ _showLeaderLineForMarkup: Could not get coordinates for markup ${markupNumber}`);
        this.isUpdatingLeaderLine = false;
        return;
      }

      
      const end = document.createElement('div');
      end.style.position = 'fixed';
      end.style.left = `${coords.x}px`;
      end.style.top = `${coords.y}px`;
      end.style.width = '1px';
      end.style.height = '1px';
      end.style.pointerEvents = 'none';
      end.style.zIndex = '9999';
      end.className = 'leader-line-end';
      end.setAttribute('data-markup-number', markupNumber.toString());
      document.body.appendChild(end);

      // Store reference for updates
      this.activeEndPoints.set(markupNumber, end);

      const leaderLine = new LeaderLine({
        start,
        end,
        color: document.documentElement.style.getPropertyValue("--accent") || '#14ab0a',
        size: 2,
        path: 'grid',
        endPlug: 'arrow2',
        endPlugSize: 1.5
      });

      // Store the leader line
      this.leaderLines.set(markupNumber, leaderLine);
      this.activeMarkupNumbers.add(markupNumber);

    } catch (error) {
      console.error('❌ Error in _showLeaderLineForMarkup:', error);
    } finally {
      this.isUpdatingLeaderLine = false;
    }
  }

  private _hideLeaderLine(): void {
    // Hide all leader lines
    this._hideAllLeaderLines();
  }

  private _hideLeaderLineForMarkup(markupNumber: number): void {
    // Clear any pending timeouts to prevent memory leaks
    this._clearAllTimeouts();

    const leaderLine = this.leaderLines.get(markupNumber);
    if (leaderLine) {
      try {
        leaderLine.remove();
      } catch (error) {
        console.warn(`Error removing leader line for markup ${markupNumber}:`, error);
      }
      this.leaderLines.delete(markupNumber);
    }

    const activeEndPoint = this.activeEndPoints.get(markupNumber);
    if (activeEndPoint) {
      try {
        activeEndPoint.remove();
      } catch (error) {
        console.warn(`Error removing active end point for markup ${markupNumber}:`, error);
      }
      this.activeEndPoints.delete(markupNumber);
    }

    this.activeMarkupNumbers.delete(markupNumber);

    // Clean up any orphaned leader line elements for this markup
    try {
      document.querySelectorAll(`[data-markup-number="${markupNumber}"]`).forEach(el => el.remove());
    } catch (error) {
      console.warn(`Error cleaning up leader line elements for markup ${markupNumber}:`, error);
    }
  }

  private _hideAllLeaderLines(): void {
    // Clear any pending timeouts to prevent memory leaks
    this._clearAllTimeouts();

    // Hide all leader lines
    for (const markupNumber of this.activeMarkupNumbers) {
      const leaderLine = this.leaderLines.get(markupNumber);
      if (leaderLine) {
        try {
          leaderLine.remove();
        } catch (error) {
          console.warn(`Error removing leader line for markup ${markupNumber}:`, error);
        }
      }

      const activeEndPoint = this.activeEndPoints.get(markupNumber);
      if (activeEndPoint) {
        try {
          activeEndPoint.remove();
        } catch (error) {
          console.warn(`Error removing active end point for markup ${markupNumber}:`, error);
        }
      }
    }

    // Clear all collections
    this.leaderLines.clear();
    this.activeEndPoints.clear();
    this.activeMarkupNumbers.clear();

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

    if (this.processListTimeout) {
      clearTimeout(this.processListTimeout);
      this.processListTimeout = null;
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

      // Get the document viewport container - refresh viewport reference each time for scroll tracking
      this.documentViewport = null; // Force refresh
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

      // Get current scroll position from viewport
      const scrollLeft = viewport.scrollLeft || 0;
      const scrollTop = viewport.scrollTop || 0;

      // Convert to viewport-relative coordinates considering current scroll position
      const relativeX = scaledCoords.x - scrollLeft;
      const relativeY = scaledCoords.y - scrollTop;

      // Convert to screen coordinates
      const screenX = viewportRect.left + relativeX;
      const screenY = viewportRect.top + relativeY;

      // Return coordinates regardless of visibility to maintain leader lines during scroll
      return { x: screenX, y: screenY };

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

      case MARKUP_TYPES.PAINT.POLYLINE.type:
        // For polyline, use the center of the bounding box for reliable positioning
        targetX = xscaled + (wscaled - xscaled) * 0.5;
        targetY = yscaled + (hscaled - yscaled) * 0.5;
        break;

      case MARKUP_TYPES.PAINT.FREEHAND.type:
        // For freehand, use the center of the bounding box for reliable positioning
        targetX = xscaled + (wscaled - xscaled) * 0.5;
        targetY = yscaled + (hscaled - yscaled) * 0.5;
        break;
        case MARKUP_TYPES.MEASURE.MEASUREARC.type:
        case MARKUP_TYPES.ERASE.type:
        case MARKUP_TYPES.SHAPE.POLYGON.type:
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
    // Always refresh viewport for scroll tracking - don't cache during scroll operations

    // Look for common viewport containers
    const selectors = [
      '#foxitframe',
      '.foxit-pdf-reader',
      '.pdf-viewer',
      '.document-container',
      '.rx-pdf-viewer',
      '.pdf-container',
      '#pdf-container',
      '.viewer-container'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        this.documentViewport = element;
        return element;
      }
    }

    // Additional fallback - look for any scrollable element that might contain the PDF
    const scrollableElements = document.querySelectorAll('[style*="overflow"], [style*="scroll"]');
    for (let i = 0; i < scrollableElements.length; i++) {
      const element = scrollableElements[i] as HTMLElement;
      if (element.scrollHeight > element.clientHeight) {
        this.documentViewport = element;
        return this.documentViewport;
      }
    }

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
    if (this.isUpdatingLeaderLine || this.activeMarkupNumbers.size === 0) {
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
    if (this.activeMarkupNumbers.size === 0 || this.isUpdatingLeaderLine) {
      return;
    }

    const allMarkups = [
      ...(this.rxCoreService.getGuiMarkupList() || []),
      ...(this.rxCoreService.getGuiAnnotList() || [])
    ];

    // Update each active leader line
    for (const markupNumber of this.activeMarkupNumbers) {
      // Check if the start element still exists in DOM
      const startElement = document.getElementById(`note-panel-${markupNumber}`);
      if (!startElement) {
        // Start element doesn't exist, recreate the leader line
        this._recreateLeaderLineForMarkup(markupNumber);
        continue;
      }

      const leaderLine = this.leaderLines.get(markupNumber);
      const activeEndPoint = this.activeEndPoints.get(markupNumber);

      if (!leaderLine || !activeEndPoint) {
        // Leader line doesn't exist, recreate it
        this._recreateLeaderLineForMarkup(markupNumber);
        continue;
      }

      const activeMarkup = allMarkups.find(markup => markup.markupnumber === markupNumber);
      if (!activeMarkup) {
        this._hideLeaderLineForMarkup(markupNumber);
        continue;
      }

      const coords = this._getViewportAwareCoordinates(activeMarkup);
      if (coords) {
        // Update the end point position
        activeEndPoint.style.left = `${coords.x}px`;
        activeEndPoint.style.top = `${coords.y}px`;

        // Force LeaderLine to recalculate its position
        try {
          if (leaderLine.position) {
            leaderLine.position();
          }
          // Additional force update for scroll scenarios
          if (leaderLine.show) {
            leaderLine.show();
          }
        } catch (error) {
          console.warn(`Error updating leader line position for markup ${markupNumber}, recreating:`, error);
          this._recreateLeaderLineForMarkup(markupNumber);
        }
      }
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
   * Recreate leader line for a specific markup
   */
  private _recreateLeaderLineForMarkup(markupNumber: number): void {
    if (markupNumber <= 0) return;

    const allMarkups = [
      ...(this.rxCoreService.getGuiMarkupList() || []),
      ...(this.rxCoreService.getGuiAnnotList() || [])
    ];

    const markup = allMarkups.find(markup => markup.markupnumber === markupNumber);
    if (markup) {
      this._showLeaderLineForMarkup(markupNumber, markup);
    }
  }

  /**
   * Wait for DOM element to be available and then update leader line (improved with bounds checking)
   */
  private _waitForDOMAndUpdateLeaderLine(): void {
    if (this.activeMarkupNumbers.size === 0) {
      return;
    }

    // Clear any existing timeout to prevent overlapping attempts
    this._clearAllTimeouts();


    // Force change detection first
    this.cdr.detectChanges();

    // Update all active leader lines
    this._updateLeaderLinePosition();
  }

  /**
   * Ensure that the active markup is always visible by adding its author to filters
   */
  private _ensureActiveMarkupIsVisible(markup: any): void {
    if (!markup || !markup.signature) {
      return;
    }

    const authorDisplayName = RXCore.getDisplayName(markup.signature);

    // Add author to authorFilter if not already present
    if (!this.authorFilter.has(authorDisplayName)) {
      this.authorFilter.add(authorDisplayName);
    }

    // Add signature to createdByFilter if not already present
    if (!this.createdByFilter.has(markup.signature)) {
      this.createdByFilter.add(markup.signature);
    }

    // Note: We don't call _updateCreatedByFilterOptions here to prevent
    // triggering unwanted comment list reprocessing that could remove hidden annotations
    // The authorFilter and createdByFilter additions above are sufficient to ensure 
    // the markup appears in the comment list without bypassing the canvas toggle controls

    // Only ensure the user is visible in RXCore if we don't bypass toggle controls
    // The issue was that RXCore.SetUserMarkupdisplay(userIndex, true) makes ALL markups from that user visible
    // including measurements when only annotations should be shown, so we remove this to respect toggle states
    // 
    // Note: The authorFilter and createdByFilter additions above are sufficient to ensure 
    // the markup appears in the comment list without bypassing the canvas toggle controls
  }

  /**
   * Setup intersection observer for viewport changes (optimized)
   */
  private _setupIntersectionObserver(): void {
    if (this.intersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        // Only update if there are active markups and entries indicate meaningful change
        if (this.activeMarkupNumbers.size > 0 && entries.some(entry => entry.isIntersecting)) {
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
        if (this.activeMarkupNumbers.size > 0 && !this.isUpdatingLeaderLine) {
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

    // Additional monitoring for the document viewport
    const documentViewport = this._getDocumentViewport();
    if (documentViewport && documentViewport !== this.scrollContainer) {

      // Listen for scroll events on the document viewport as well
      documentViewport.addEventListener('scroll', (event) => {
        if (this.activeMarkupNumbers.size > 0 && !this.isUpdatingLeaderLine) {
          // Throttle viewport scroll updates
          if (this.scrollUpdateTimeout) {
            clearTimeout(this.scrollUpdateTimeout);
          }
          this.scrollUpdateTimeout = setTimeout(() => {
            this._updateLeaderLinePosition();
          }, 16);
        }
      }, { passive: true });
    }
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
      // When no specific type filter is found, check if it's an annotation or measurement 
      // and return the appropriate switch state
      const isMeasurement = (markup as any).ismeasure === true;
      if (isMeasurement) {
        return this.showMeasurements;
      } else {
        return this.showAnnotations;
      }
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
   * Helper method to safely recalculate position for active comments (improved with safety checks)
   */
  private recalculateActiveCommentPosition(): void {
    if (this.activeMarkupNumbers.size > 0 && !this.isUpdatingLeaderLine) {

      // Clear any pending operations first
      this._clearAllTimeouts();

      // Use the debounced update method to prevent race conditions
      this._updateLeaderLinePosition();
    }
  }

  private _processList(list: Array<IMarkup> = [], annotList: Array<IMarkup> = []): void {
    // Debounce to prevent excessive processing and blinking
    if (this.processListTimeout) {
      clearTimeout(this.processListTimeout);
    }

    this.processListTimeout = setTimeout(() => {
      this._processListWithHiddenPreservation(list, annotList);
    }, 50); // Debounce delay
  }

  /**
   * Safe wrapper for _performProcessList that ensures hidden annotations are always preserved
   */
  private _processListWithHiddenPreservation(list: Array<IMarkup> = [], annotList: Array<IMarkup> = []): void {
    // Always ensure hidden annotations are included in the processing
    const allHiddenNumbers = new Set([...this.hiddenAnnotations, ...this.groupHiddenAnnotations]);
    
    if (allHiddenNumbers.size > 0) {
      const completeMarkupList = this.rxCoreService.getGuiMarkupList() || [];
      const hiddenMarkups = completeMarkupList.filter(markup => 
        allHiddenNumbers.has(markup.markupnumber)
      );
      
      // Ensure hidden annotations are included in the list being processed
      const enhancedList = [...list];
      hiddenMarkups.forEach(hiddenMarkup => {
        if (!enhancedList.find(existing => existing.markupnumber === hiddenMarkup.markupnumber)) {
          enhancedList.push(hiddenMarkup);
        }
      });
      
      this._performProcessList(enhancedList, annotList);
    } else {
      this._performProcessList(list, annotList);
    }
  }

  private _performProcessList(list: Array<IMarkup> = [], annotList: Array<IMarkup> = []): void {
    // Prevent multiple simultaneous processing
    if (this.isProcessingList) {
      return;
    }

    this.isProcessingList = true;

    try {
      // Initialize sort filter options if they haven't been initialized yet and we have data
      if (list.length > 0 && this.sortFilterOptions.length === 0) {
        this._updateSortFilterOptions();
      }

      const mergeList = [...list, ...annotList];
      const query = mergeList.filter((i: any) => {
        // Apply annotation/measurement filtering based on switches first
        if (this.showAnnotations && !this.showMeasurements) {
          // Show only annotations (non-measurements)
          const isAnnotation = !i.ismeasure;
          if (!isAnnotation) {
            return false;
          }
        } else if (this.showMeasurements && !this.showAnnotations) {
          // Show only measurements
          const isMeasurement = i.ismeasure;
          if (!isMeasurement) {
            return false;
          }
        } else if (!this.showAnnotations && !this.showMeasurements) {
          // Show nothing when both switches are off
          return false;
        }

        // Always include hidden annotations in the list
        if (this.hiddenAnnotations.has(i.markupnumber) || this.groupHiddenAnnotations.has(i.markupnumber)) {
          return true;
        }
        
        // Check if the markup should be shown based on all filters
        // This includes author filters, sort filters (pages), etc.
        const shouldShow = this._shouldShowMarkupInCommentList(i);
        
        return shouldShow;
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
        // Check individual annotation visibility (eye icon) - only for comment list display
        // Comment cards should remain in list even when annotation is hidden on canvas
        return true; // Always show comment cards in list
      })
      .filter((item: any) => {
        // Always show the active markup regardless of any filter
        if (this.activeMarkupNumber > 0 && item.markupnumber === this.activeMarkupNumber) {
          return true;
        }
        
        // For all other items, the filtering is already handled in _shouldShowMarkupInCommentList
        return true;
      })
      .map((item: any) => {
        item.author = RXCore.getDisplayName(item.signature);
        item.createdStr = dayjs(item.timestamp).format(this.guiConfig?.dateFormat?.dateTimeWithConditionalYear || 'MMM d, [yyyy] h:mm a');
        item.IsExpanded = item?.IsExpanded;
        return item;
      })
      .sort((a, b) => {
        switch(this.sortByField) {
          case 'created':
            return b.timestamp - a.timestamp;
          case 'author':
            return a.author.localeCompare(b.author);
          case 'pagenumber':
            return a.pagenumber - b.pagenumber;
          case 'annotation':
            return this.getAnnotationTitle(a.type, a.subtype).localeCompare(this.getAnnotationTitle(b.type, b.subtype));
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
            const annotationLabel = this.getAnnotationTitle(item.type, item.subtype);
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
        default:
          this.list = {'': query};
      }
    } finally {
      this.isProcessingList = false;
    }
  }

  /**
   * Enhanced method to determine if a markup should be shown in the comment list
   * This method checks switches, author filters, sort filters, and page filters
   */
  private _shouldShowMarkupInCommentList(markup: any): boolean {
    // Check annotation/measurement switch states first
    const isMeasurement = (markup as any).ismeasure === true;
    const showAnnotationsState = this.showAnnotations === true;
    const showMeasurementsState = this.showMeasurements === true;
    
    let switchAllowsDisplay = false;
    if (isMeasurement) {
      // This is a measurement - only show if measurements switch is on
      switchAllowsDisplay = showMeasurementsState;
    } else {
      // This is an annotation - only show if annotations switch is on
      switchAllowsDisplay = showAnnotationsState;
    }
    
    if (!switchAllowsDisplay) {
      return false;
    }
    
    // Check author filter state
    const authorFilterResult = this._shouldShowMarkupForAuthor(markup);
    if (!authorFilterResult) {
      return false;
    }
    
    // Check sort filter values - this includes page filtering when sortByField is 'pagenumber'
    const sortFilterResult = this._shouldShowMarkupForSortFilter(markup);
    if (!sortFilterResult) {
      return false;
    }
    
    // Check if this annotation type is enabled in type filters
    let typeAllowed = true;
    const markuptype = RXCore.getMarkupType(markup.type, markup.subtype);
    let typename = markuptype.type;
    
    if (Array.isArray(markuptype.type)) {
      typename = markuptype.type[1];
    }
    
    // Check type filter state
    for (let mi = 0; mi < this.rxTypeFilter.length; mi++) {
      if (this.rxTypeFilter[mi].typename === typename) {
        typeAllowed = this.rxTypeFilter[mi].show;
        break;
      }
    }
    
    // If no specific type filter is found, default to showing the annotation
    if (typeAllowed === undefined) {
      typeAllowed = true;
    }
    
    // Always check page filter regardless of current sort field
    // This ensures annotations are filtered by page even when sorting by other fields
    if (this.selectedSortFilterValues.length > 0 && this.sortByField === 'pagenumber') {
      const pageNumber = markup.pagenumber + 1;
      if (!this.selectedSortFilterValues.includes(pageNumber)) {
        return false;
      }
    }
    
    // If no pages are selected in page filter, show nothing
    if (this.sortByField === 'pagenumber' && this.selectedSortFilterValues.length === 0) {
      return false;
    }
    
    // Add debug logging for annotation type filtering
    if (this.sortByField === 'annotation') {
      const annotationType = this.getAnnotationTitle(markup.type, markup.subtype);
      console.log(`📋 Comment list check for ${isMeasurement ? 'measurement' : 'annotation'}:`, {
        markupNumber: markup.markupnumber,
        annotationType,
        switchAllowsDisplay,
        authorFilterResult,
        sortFilterResult,
        typeAllowed,
        finalResult: typeAllowed
      });
    }
    
    return typeAllowed;
  }

  /**
   * Check if a markup should be shown based on author filtering
   */
  private _shouldShowMarkupForAuthor(markup: any): boolean {
    // When using group-by filter in author mode, use the selectedSortFilterValues
    if (this.sortByField === 'author') {
      // If no authors are selected, show nothing
      if (this.selectedSortFilterValues.length === 0) {
        return false;
      }
      
      const authorName = RXCore.getDisplayName(markup.signature);
      const isAuthorSelected = this.selectedSortFilterValues.includes(authorName);
      
      // If this is a hidden annotation and its author is not selected, don't show it
      if (this.hiddenAnnotations.has(markup.markupnumber) || this.groupHiddenAnnotations.has(markup.markupnumber)) {
        return isAuthorSelected;
      }
      
      return isAuthorSelected;
    }
    
    // When not in author mode but have sort filter options, don't apply author filtering
    if (this.sortFilterOptions.length > 0) {
      return true;
    }
    
    // Fall back to legacy createdByFilter for backward compatibility
    if (this.createdByFilter.size === 0) {
      return true;
    }
    
    // Check if the markup's author is in the selected filter
    const isAuthorInFilter = this.createdByFilter.has(markup.signature);
    
    // If this is a hidden annotation and its author is not in the filter, don't show it
    if (this.hiddenAnnotations.has(markup.markupnumber) || this.groupHiddenAnnotations.has(markup.markupnumber)) {
      return isAuthorInFilter;
    }
    
    return isAuthorInFilter;
  }

  /**
   * Check if markup should be shown based on sort filter selection
   */
  private _shouldShowMarkupForSortFilter(markup: any): boolean {
    // For date-based filtering, handle separately
    if (this.sortByField === 'created') {
      // Skip the general logic and go directly to date case
    } else {
      // If no sort filter options are available yet, show all (initial state)
      if (this.sortFilterOptions.length === 0) {
        return true;
      }
      
      // If sort filter options exist but none are selected, show nothing
      if (this.selectedSortFilterValues.length === 0) {
        return false; // If no filter values selected, show nothing
      }
    }

    switch (this.sortByField) {
      case 'author':
        const authorName = RXCore.getDisplayName(markup.signature);
        return this.selectedSortFilterValues.includes(authorName);

      case 'pagenumber':
        // If no pages are selected, show nothing
        if (this.selectedSortFilterValues.length === 0) {
          return false;
        }
        const pageNumber = markup.pagenumber + 1;
        // When filtering by page, strictly enforce page selection
        return this.selectedSortFilterValues.includes(pageNumber);

      case 'annotation':
        const annotationType = this.getAnnotationTitle(markup.type, markup.subtype);
        const isSelected = this.selectedSortFilterValues.includes(annotationType);
        
        console.log(`🔍 Annotation type filter check:`, {
          markupType: annotationType,
          isSelected,
          selectedValues: this.selectedSortFilterValues,
          markupNumber: markup.markupnumber,
          isMeasurement: (markup as any).ismeasure
        });
        
        return isSelected;

      case 'created':
        // If no date range is set, show all items (initial state for date filter)
        if (!this.sortFilterDateRange.startDate && !this.sortFilterDateRange.endDate) {
          return true;
        }
        
        if (!markup.timestamp) {
          return false; // No timestamp, exclude from filtered results
        }
        
        const markupDate = dayjs(markup.timestamp);
        if (!markupDate.isValid()) {
          console.warn('Invalid markup timestamp:', markup.timestamp);
          return false;
        }
        
        let result = true;
        
        // Check if there's a start date filter
        if (this.sortFilterDateRange.startDate) {
          const startDate = dayjs(this.sortFilterDateRange.startDate);
          result = result && markupDate.isSameOrAfter(startDate, 'day');
        }
        
        // Check if there's an end date filter
        if (this.sortFilterDateRange.endDate) {
          const endDate = dayjs(this.sortFilterDateRange.endDate);
          result = result && markupDate.isSameOrBefore(endDate, 'day');
        }
        
        return result;

      default:
        return true;
    }
  }

  ngOnInit(): void {
    // Subscribe to user state changes to clear authorFilter when user logs out
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (!user) {
        this.authorFilter.clear();
        this._processList(this.rxCoreService.getGuiMarkupList());
      }
    });

    // Subscribe to markup list changes from the service
    this.rxCoreService.guiMarkupList$.subscribe(markupList => {
      if (markupList && markupList.length > 0) {
        this._processList(markupList);
        
        // Ensure proper markup type filter initialization
        this.markupTypes = RXCore.getMarkupTypes();
        this._updateRxFilter();
        
        // Force change detection to update UI
        this.cdr.detectChanges();
      }
    });

    // Subscribe to annotation tools service state
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
      // Update current mode and control switch states
      this.currentMode = option?.label || 'View';
      this._updateSwitchStates();

      if(this.showAnnotationsOnLoad){
        //disable main filters.
      }else{
        switch(option.label) {
          case "View":
            // In View mode, start with both switches OFF by default
            // Users can manually turn them on as needed
            this.showAnnotations = false;
            this.showMeasurements = false;
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

      // Force check for existing markups and refresh display
      const existingMarkups = this.rxCoreService.getGuiMarkupList();
      if (existingMarkups && existingMarkups.length > 0) {
        this._processList(existingMarkups);
        
        // If showAnnotationsOnLoad is true, show annotations by default
        if (this.showAnnotationsOnLoad) {
          setTimeout(() => {
            this.showAnnotations = true;
            this.showMeasurements = true;
            this.onShowAnnotations(true);
            this.onShowMeasurements(true);
          }, 500);
        }
      }





    });


    this.guiZoomUpdated$.subscribe(({params, zoomtype}) => {
      if(zoomtype == 0 || zoomtype == 1){

        // Clear any pending operations
        this._clearAllTimeouts();

        // Reset viewport reference on zoom change
        this.documentViewport = null;

        // Update position for active comments after zoom change with debouncing
        if (this.activeMarkupNumbers.size > 0) {
          this.leaderLineUpdateTimeout = setTimeout(() => {
            this._updateLeaderLinePosition();
          }, 200); // Increased delay for zoom to complete
        }
      }
    });

    this.guiRotatePage$.subscribe(({degree, pageIndex}) => {

      // Clear any pending operations
      this._clearAllTimeouts();

      this.pageRotation = degree;

      // Hide all leader lines during rotation to prevent visual artifacts
      this._hideAllLeaderLines();

      // Reset viewport reference
      this.documentViewport = null;

      // Recalculate position for active comments after rotation change with delay
      if (this.activeMarkupNumbers.size > 0) {
        this.leaderLineUpdateTimeout = setTimeout(() => {
          const allMarkups = [
            ...(this.rxCoreService.getGuiMarkupList() || []),
            ...(this.rxCoreService.getGuiAnnotList() || [])
          ];

          // Recreate leader lines for all expanded comments
          for (const markupNumber of this.activeMarkupNumbers) {
            const activeMarkup = allMarkups.find(markup => markup.markupnumber === markupNumber);
            if (activeMarkup) {
              this._showLeaderLineForMarkup(markupNumber, activeMarkup);
            }
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
            this.activeMarkupNumber = -1;
          } else if (selectedMarkup && this.activeMarkupNumber !== selectedMarkup.markupnumber) {
            this.activeMarkupNumber = selectedMarkup.markupnumber;
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

      // Clear all pending operations first
      this._clearAllTimeouts();

      if (this.connectorLine) {
        //RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
      }

      // Reset viewport reference on page change - critical for multi-page support
      this.documentViewport = null;

      // Always hide all leader lines first when page changes to prevent visual artifacts
      this._hideAllLeaderLines();

      // If there are active markups, check which ones belong to the current page
      if (this.activeMarkupNumbers.size > 0) {
        const allMarkups = [
          ...(this.rxCoreService.getGuiMarkupList() || []),
          ...(this.rxCoreService.getGuiAnnotList() || [])
        ];

        // Wait for page to fully render before showing leader lines
        this.leaderLineUpdateTimeout = setTimeout(() => {
          // Check each active markup to see if it should be shown on current page
          for (const markupNumber of this.activeMarkupNumbers) {
            const activeMarkup = allMarkups.find(markup => markup.markupnumber === markupNumber);

            if (activeMarkup) {
              if (activeMarkup.pagenumber === state.currentpage) {
                // The active markup is on the current page, show leader line
                this._showLeaderLineForMarkup(markupNumber, activeMarkup);
              }
            } else {
              console.warn(`❌ Active markup ${markupNumber} not found in markup lists`);
            }
          }
        }, 250); // Increased delay for page rendering
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

        // Sync filters with canvas when markups are created or modified
        // Only if switches are active
        if ((this.showAnnotations || this.showMeasurements) && !this.showAll) {
          setTimeout(() => {
            this._syncFiltersWithVisibleMarkups();
          }, 300);
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
      // Update position immediately for pan operations - but only if we have active markups
      if (this.activeMarkupNumbers.size > 0) {
        this._updateLeaderLinePosition();
      }
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
    this.selectedSortOption = event;
    
    // Clear previous selections when changing sort field to ensure clean state
    this.selectedSortFilterValues = [];
    
    this._updateSortFilterOptions();
    
    // Ensure proper initialization when both switches are ON
    setTimeout(() => {
      this._ensureProperFilterInitialization();
    }, 50);
    
    // Apply the sort filter to both canvas and comment list
    this._applySortFilterToCanvas();
    this._processList(this.rxCoreService.getGuiMarkupList());

    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
  }

  // Method to update sort filter options based on selected sort field
  private _updateSortFilterOptions(): void {
    const allMarkupList = this.rxCoreService.getGuiMarkupList();
  
    
    // CRITICAL FIX: Always include hidden annotations in filter options
    const allHiddenNumbers = new Set([...this.hiddenAnnotations, ...this.groupHiddenAnnotations]);
    const hiddenMarkups = allMarkupList.filter(markup => allHiddenNumbers.has(markup.markupnumber));
    
    // Filter markups based on annotation/measurement switch state
    let filteredMarkupList = allMarkupList;
    if (this.showAnnotations && !this.showMeasurements) {
      // Only annotations
      filteredMarkupList = allMarkupList.filter(markup => !(markup as any).ismeasure);
    } else if (!this.showAnnotations && this.showMeasurements) {
      // Only measurements
      filteredMarkupList = allMarkupList.filter(markup => (markup as any).ismeasure);
    } else if (!this.showAnnotations && !this.showMeasurements) {
      // Nothing is enabled, so no options should show
      filteredMarkupList = [];
    }

    // Ensure hidden annotations are always included in filter options, regardless of switch state
    const hiddenToInclude = hiddenMarkups.filter(hiddenMarkup => {
      // Include hidden annotation if it matches the switch filter OR if it was already hidden (preserve it)
      if (this.showAnnotations && !this.showMeasurements) {
        return !(hiddenMarkup as any).ismeasure; // Include hidden annotations when showing annotations
      } else if (!this.showAnnotations && this.showMeasurements) {
        return (hiddenMarkup as any).ismeasure; // Include hidden measurements when showing measurements
      } else if (!this.showAnnotations && !this.showMeasurements) {
        return false; // Don't include any hidden items when both switches are off
      } else {
        return true; // Include all hidden items when both switches are on
      }
    });
    
    // Add hidden annotations to the filtered list if they're not already there
    hiddenToInclude.forEach(hiddenMarkup => {
      if (!filteredMarkupList.find(existing => existing.markupnumber === hiddenMarkup.markupnumber)) {
        filteredMarkupList.push(hiddenMarkup);
      }
    });
    
    
    // Store previous selections to preserve user's filter choices
    const previousSelections = new Set(this.selectedSortFilterValues);
    
    
    this.sortFilterOptions = [];
    this.selectedSortFilterValues = [];

    switch (this.sortByField) {
      case 'author':
        this.sortFilterLabel = 'Authors';
        const uniqueAuthors = [...new Set(filteredMarkupList.map(markup => RXCore.getDisplayName(markup.signature)))];
        this.sortFilterOptions = uniqueAuthors.map(author => {
          // Check if this author was previously selected, default to true if no previous selections
          const wasSelected = previousSelections.size === 0 || previousSelections.has(author);
          return {
            value: author,
            label: author,
            selected: wasSelected
          };
        });
        // Only include previously selected authors in selectedSortFilterValues
        this.selectedSortFilterValues = uniqueAuthors.filter(author => 
          previousSelections.size === 0 || previousSelections.has(author)
        );
        break;

      case 'pagenumber':
        this.sortFilterLabel = 'Pages';
        const uniquePages = [...new Set(filteredMarkupList.map(markup => markup.pagenumber + 1))].sort((a, b) => a - b);
        this.sortFilterOptions = uniquePages.map(page => {
          // Check if this page was previously selected, default to true if no previous selections
          const wasSelected = previousSelections.size === 0 || previousSelections.has(page);
          return {
            value: page,
            label: page.toString(), // Show only the number
            selected: wasSelected
          };
        });
        // Only include previously selected pages in selectedSortFilterValues
        this.selectedSortFilterValues = uniquePages.filter(page => 
          previousSelections.size === 0 || previousSelections.has(page)
        );
        break;

      case 'annotation':
        this.sortFilterLabel = 'Annotation Types';
        const uniqueTypes = [...new Set(filteredMarkupList.map(markup => this.getAnnotationTitle(markup.type, markup.subtype)))];
        

        
        this.sortFilterOptions = uniqueTypes.map(type => {
          // Check if this type was previously selected, default to true if no previous selections
          const wasSelected = previousSelections.size === 0 || previousSelections.has(type);
          
          
          return {
            value: type,
            label: type,
            selected: wasSelected
          };
        });
        
        // Determine which types should be selected
        if (previousSelections.size === 0) {
          // No previous selections, select all available types
          this.selectedSortFilterValues = [...uniqueTypes];
        } else {
          // Some previous selections exist, but we need to ensure they're still valid
          const validPreviousSelections = uniqueTypes.filter(type => previousSelections.has(type));
          
          if (validPreviousSelections.length === 0) {
            // None of the previous selections are valid anymore, select all available types
            this.selectedSortFilterValues = [...uniqueTypes];
          } else {
            // Use valid previous selections
            this.selectedSortFilterValues = validPreviousSelections;
          }
        }
        
        break;

      case 'created':
        this.sortFilterLabel = 'Date of notes creation';
        // For created date, we use a date picker instead of predefined ranges
        this.sortFilterOptions = [];
        this.selectedSortFilterValues = [];
        // Don't reset date range when switching between annotation/measurement switches
        // Only reset if there was no previous date range
        if (!this.sortFilterDateRange.startDate && !this.sortFilterDateRange.endDate && previousSelections.size === 0) {
          this.sortFilterDateRange = { startDate: undefined, endDate: undefined };
        }
        break;

      default:
        this.sortFilterLabel = '';
        break;
    }
    
  }

  // Handle sort filter selection changes
  onSortFilterChange(selectedValues: Array<any>): void {
    const previousValues = [...this.selectedSortFilterValues];
    this.selectedSortFilterValues = selectedValues;
    
    // Special handling for page filtering
    if (this.sortByField === 'pagenumber') {
      // Get removed pages (pages that were in previous values but not in new values)
      const removedPages = previousValues.filter(page => !selectedValues.includes(page));
      
      // Force refresh the comment list to remove annotations from unselected pages
      if (removedPages.length > 0 || selectedValues.length === 0) {
        const markupList = this.rxCoreService.getGuiMarkupList();
        if (markupList) {
          // Clear individual visibility settings for annotations from removed pages
          removedPages.forEach(removedPage => {
            markupList.forEach(markup => {
              const pageNumber = markup.pagenumber + 1;
              if (pageNumber === removedPage) {
                // Remove from individual hidden sets since the page is now filtered out
                this.hiddenAnnotations.delete(markup.markupnumber);
                this.groupHiddenAnnotations.delete(markup.markupnumber);
                
                // Also clear any group hidden states for this page
                const groupKey = this._getGroupKeyForMarkup(markup);
                if (groupKey) {
                  // Check if all annotations in this group are from the removed page
                  const groupItems = this._getGroupItems(groupKey);
                  const allFromRemovedPage = groupItems.every(item => {
                    const itemPageNumber = item.pagenumber + 1;
                    return itemPageNumber === removedPage;
                  });
                  
                  if (allFromRemovedPage) {
                    this.hiddenGroups.delete(groupKey);
                  }
                }
              }
            });
          });
          
          // First collapse any expanded cards that will be hidden
          markupList.forEach(markup => {
            const pageNumber = markup.pagenumber + 1;
            if ((markup as any).isexpanded && (!selectedValues.includes(pageNumber) || selectedValues.length === 0)) {
              (markup as any).isexpanded = false;
            }
          });
          
          // Then process the list to update visibility
          this._processList(markupList);
          
          // Force canvas refresh to ensure annotations are hidden
          this._forceCanvasRefresh();
          
          // Additional step: Ensure annotations from unselected pages are hidden on canvas
          if (selectedValues.length > 0) {
            markupList.forEach(markup => {
              const pageNumber = markup.pagenumber + 1;
              if (!selectedValues.includes(pageNumber)) {
                // Hide annotations from unselected pages on canvas
                markup.setdisplay(false);
              }
            });
            RXCore.markUpRedraw();
          }
          
          // Force change detection
          this.cdr.detectChanges();
        }
      }
    }
    
    // Special handling for "all deselected" to "some selected" transitions
    const previouslyEmpty = previousValues.length === 0;
    const nowHasSelections = selectedValues.length > 0;
    const isRecoveringFromEmpty = previouslyEmpty && nowHasSelections;
    
    if (isRecoveringFromEmpty) {
      
      // Step 1: Clear all stuck states and flags
      this.isProcessingList = false;
      this.isUpdatingLeaderLine = false;
      
      // Step 2: Force immediate observable updates
      const markupList = this.rxCoreService.getGuiMarkupList();
      if (markupList) {
        // Force markup list observable to emit
        this.rxCoreService.setGuiMarkupList(markupList);
        
        // Step 3: Reset filter states completely
        this._updateCreatedByFilterOptions(markupList);
        this._updateSortFilterOptions();
        
        // Step 4: Apply canvas filters with immediate redraw
        this._applySortFilterToCanvas();
        RXCore.markUpRedraw();
        
        // Step 5: Force aggressive change detection immediately
        this.cdr.detectChanges();
        this.cdr.markForCheck();
        
        // Step 6: Process comment list with multiple retries
        setTimeout(() => {
          this.isProcessingList = false; // Ensure not blocked
          this._processList(markupList);
          this.cdr.detectChanges();
          
          // Immediate retry with different approach
          setTimeout(() => {
            this.isProcessingList = false;
            this._performProcessList(markupList, []);
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
                         // Final aggressive refresh
             setTimeout(() => {
               this.cdr.detectChanges();
               
               // Simulate the effect of clicking on a card by updating filter options again
               this._updateCreatedByFilterOptions(markupList);
               this.cdr.detectChanges();
               
               // Temporarily clear and restore the list to force re-render
               const tempList = { ...this.list };
               this.list = {};
               this.cdr.detectChanges();
               
               setTimeout(() => {
                 this.list = tempList;
                 this.cdr.detectChanges();
                 this.cdr.markForCheck();
                 
                 // Additional force update
                 setTimeout(() => {
                   this.cdr.detectChanges();
                   
                   // Force zone.js change detection cycle
                   setTimeout(() => {
                     this.cdr.detectChanges();
                     this.cdr.markForCheck();
                     
                     // Verify the result
                     setTimeout(() => {
                       this._verifySynchronizationAndRetryIfNeeded(markupList);
                     }, 100);
                   }, 0);
                 }, 10);
               }, 10);
             }, 50);
          }, 100);
        }, 150);
      }
    } else {
      // Normal enhanced synchronization
      this._enhancedSynchronizeCanvasAndCommentList();
    }

    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 150);
  }

  // Handle date picker selection for sort filter
  onSortFilterDateSelect(dateRange: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }): void {
    this.sortFilterDateRange = {
      startDate: dateRange.startDate ? dayjs(dateRange.startDate) : undefined,
      endDate: dateRange.endDate ? dayjs(dateRange.endDate) : undefined
    };
    
    // Enhanced synchronization to fix comment list not updating issue
    this._enhancedSynchronizeCanvasAndCommentList();
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 150);
  }

  // Handle HTML date input changes for sort filter
  onSortDateChange(event: any, type: 'start' | 'end'): void {
    const dateValue = event.target.value;
    
    if (type === 'start') {
      this.sortFilterDateRange.startDate = dateValue ? dayjs(dateValue) : undefined;
    } else {
      this.sortFilterDateRange.endDate = dateValue ? dayjs(dateValue) : undefined;
    }
    
    
    // Enhanced synchronization to fix comment list not updating issue
    this._enhancedSynchronizeCanvasAndCommentList();
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 150);
  }

  // Clear sort date filter
  clearSortDateFilter(): void {
    this.sortFilterDateRange = { startDate: undefined, endDate: undefined };
    
    // Enhanced synchronization to fix comment list not updating issue
    this._enhancedSynchronizeCanvasAndCommentList();
    
    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 150);
  }











  // Handle document clicks to close dropdown
  onDocumentClick(event: Event): void {
    // Handle status menu clicks
    const mouseEvent = event as MouseEvent;
    const menus = document.querySelectorAll('.statusMenu');
    const buttons = document.querySelectorAll('.statusMenuButton');

    let isClickInsideMenu = Array.from(menus).some((menu) =>
      menu.contains(mouseEvent.target as Node)
    );
    let isClickInsideButton = Array.from(buttons).some((button) =>
      button.contains(mouseEvent.target as Node)
    );

    if (!isClickInsideMenu && !isClickInsideButton) {
      this.closeStatusMenu();
    }
  }

  // Apply sort filter to canvas visibility
  private _applySortFilterToCanvas(): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;

    let visibleCount = 0;
    let hiddenCount = 0;
    let updatedCount = 0;
    
    for (const markup of markupList) {
      // First check annotation/measurement switch state
      let shouldShow = false;
      
      const isMeasurement = (markup as any).ismeasure === true;
      const showAnnotationsState = this.showAnnotations === true;
      const showMeasurementsState = this.showMeasurements === true;
      
      if (isMeasurement) {
        // This is a measurement - only show if measurements switch is on
        shouldShow = showMeasurementsState;
      } else {
        // This is an annotation - only show if annotations switch is on
        shouldShow = showAnnotationsState;
      }
      
      // If the switch allows it to be shown, then apply other filters
      if (shouldShow) {
        shouldShow = this._shouldShowMarkupForSortFilter(markup);
      }
      
      if (shouldShow) {
        shouldShow = this._shouldShowMarkupForAuthor(markup);
      }
      
      // Check individual annotation visibility (eye icon)
      if (shouldShow) {
        shouldShow = this.isAnnotationVisible(markup.markupnumber);
      }
      
      // Only update if the state actually changed
      const currentDisplay = (markup as any).display === true;
      if (currentDisplay !== shouldShow) {
        markup.setdisplay(shouldShow);
        updatedCount++;
      }
      
      if (shouldShow) {
        visibleCount++;
      } else {
        hiddenCount++;
      }
    }

    // Only redraw if we actually changed something
    if (updatedCount > 0) {
      RXCore.markUpRedraw();
    }
  }

  // Helper method to get the filter value for a markup based on current sort field
  private _getSortFilterValueForMarkup(markup: any): any {
    switch (this.sortByField) {
      case 'author':
        return RXCore.getDisplayName(markup.signature);
      case 'pagenumber':
        return markup.pagenumber + 1;
      case 'annotation':
        return this.getAnnotationTitle(markup.type, markup.subtype);
      case 'created':
        return dayjs(markup.timestamp).format('YYYY-MM-DD');
      default:
        return null;
    }
  }

  onCreatedByFilterChange(values): void {
    this.createdByFilter = new Set(values);
    
    
    // Enhanced synchronization to fix comment list not updating issue
    this._enhancedSynchronizeCanvasAndCommentList();

    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 150);
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
    
    // Auto-apply filter when both dates are selected
    if (dateRange.startDate && dateRange.endDate) {
      
      // Apply date filter to canvas annotations
      this._applyDateFilterToCanvas(dateRange);
      
      // Apply the date filter to comment list
      this._processList(this.rxCoreService.getGuiMarkupList());
      
      // Wait for DOM to be ready and then update leader line position
      setTimeout(() => {
        this._waitForDOMAndUpdateLeaderLine();
      }, 100);
    }
  }

  /**
   * Apply date filter to canvas annotations
   */
  private _applyDateFilterToCanvas(dateRange: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;


    markupList.forEach((markup: any) => {
      const markupDate = dayjs(markup.timestamp);
      const isInDateRange = markupDate.isSameOrAfter(dateRange.startDate) && 
                           markupDate.isSameOrBefore(dateRange.endDate.endOf('day'));
      
      // Show/hide annotation based on date range and switch states
      let shouldShow = isInDateRange;
      
      if (shouldShow) {
        // Also check if the annotation should be shown based on switches
        if (markup.ismeasure) {
          shouldShow = this.showMeasurements === true;
        } else {
          shouldShow = this.showAnnotations === true;
        }
      }
      
      
      markup.setdisplay(shouldShow);
    });

    // Redraw canvas to apply changes
    RXCore.markUpRedraw();
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

    // Use refresh method to apply all filters including switches
    this._refreshAnnotationList();
    this.filterVisible = false;

    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
  }

  /**
   * Enhanced toggle filter visibility with automatic synchronization
   */
  toggleFilterVisibility(): void {
    this.filterVisible = !this.filterVisible;
    
    if (this.filterVisible) {
      // When modal opens, sync the current canvas state with filter selections
      setTimeout(() => {
        this._ensureFilterSynchronization();
      }, 150);
    }

    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 200);
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

  onCommentKeyDown(event: KeyboardEvent, markup: any): void {
    // Submit comment on Enter (but not Shift+Enter)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.note[markup.markupnumber]?.trim()) {
        this.onAddNote(markup);
      }
    }
    
    // Auto-resize textarea
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  onCheckboxChange(event: any): void {
    // Handle checkbox change if needed
    // This method is called when the corner checkbox is clicked
    console.log('Checkbox changed:', event.target.checked);
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
        return;
      }

      // Clear any pending operations before starting new ones
      this._clearAllTimeouts();

      // Immediately set active state for visual feedback
      this.activeMarkupNumber = markupNo;

      // Force immediate change detection for responsive UI
      this.cdr.detectChanges();

      // Ensure the markup's author is always visible
      this._ensureActiveMarkupIsVisible(markup);

      // Navigate to the correct page where the annotation exists
      RXCore.gotoPage(markup.pagenumber);

      // Reprocess the list to ensure the active markup is visible
      this._processList(this.rxCoreService.getGuiMarkupList(), this.rxCoreService.getGuiAnnotList());

      // Use improved leader line system
      this._showLeaderLine(markup);
    }
  }

  ItemNoteClick(event, markupNo: number, markup: any): void {

    console.log(markupNo);

  }

  SetActiveCommentThread(event: MouseEvent, markupNo: number, markup: any): void {
    // If the click is on a control element (eye icon, status menu, etc.), ignore it
    const target = event.target as HTMLElement;
    if (target.closest('.eye-icon-container') || 
        target.closest('.statusMenuButton') || 
        target.closest('.comments-controls') ||
        target.closest('.note-input')) {
      return;
    }

    if (markupNo && markupNo > 0 && markup) {
      // Check if the switch allows this type to be interacted with
      const isMeasurement = (markup as any).ismeasure === true;
      const switchAllowsInteraction = isMeasurement ? this.showMeasurements : this.showAnnotations;
      
      if (!switchAllowsInteraction) {
        event.preventDefault();
        return;
      }

      // Safety check: prevent interaction with hidden annotation cards
      if (!this.isCommentCardClickable(markupNo)) {
        event.preventDefault();
        return;
      }

      // Force immediate change detection for responsive UI
      this.cdr.detectChanges();

      // Select the annotation (this is safe and doesn't affect visibility)
      this.onSelectAnnotation(markup);

      // Navigate to the correct page where the annotation exists
      RXCore.gotoPage(markup.pagenumber);

      // First, collapse ALL other cards and hide their leader lines
      let targetCard: any = null;
      Object.values(this.list || {}).forEach((comments) => {
        comments.forEach((comment: any) => {
          if (comment.markupnumber === markupNo) {
            // Store reference to the target card
            targetCard = comment;
          } else if (comment.IsExpanded) {
            // Collapse all other expanded cards
            comment.IsExpanded = false;
            // Hide leader line for this collapsed card
            this._hideLeaderLineForMarkup(comment.markupnumber);
          }
        });
      });

      // Now toggle the target card
      let isNowExpanded = false;
      if (targetCard) {
        targetCard.IsExpanded = !targetCard.IsExpanded;
        isNowExpanded = targetCard.IsExpanded;
      }

      // For hidden annotations, only show leader lines but don't modify canvas visibility
      const isHiddenAnnotation = this.hiddenAnnotations.has(markupNo) || this.groupHiddenAnnotations.has(markupNo);
      
      // Manage leader line for the target card based on its new expansion state
      if (isNowExpanded) {
        // Add a small delay to prevent race conditions
        setTimeout(() => {
          this._showLeaderLineForMarkup(markupNo, markup);
        }, 50);
        
        // If this is a hidden annotation, temporarily show it on canvas for leader line
        // BUT ONLY if the corresponding switch is ON
        if (isHiddenAnnotation) {
          const markupList = this.rxCoreService.getGuiMarkupList();
          if (markupList) {
            const targetMarkup = markupList.find(m => m.markupnumber === markupNo);
            if (targetMarkup) {
              // Check if the switch allows this type to be displayed
              const isMeasurement = (targetMarkup as any).ismeasure === true;
              const switchAllowsDisplay = isMeasurement ? this.showMeasurements : this.showAnnotations;
              
              if (switchAllowsDisplay) {
                // Only show if the appropriate switch is ON
                targetMarkup.setdisplay(true);
                RXCore.markUpRedraw();
              }
            }
          }
        }
      } else {
        // Card is now collapsed, hide its leader line immediately
        this._hideLeaderLineForMarkup(markupNo);
        
        // If this is a hidden annotation, restore its hidden state on canvas
        if (isHiddenAnnotation) {
          setTimeout(() => {
            this._updateIndividualAnnotationVisibility(markupNo, false);
          }, 100);
        }
      }

      // Ensure hidden annotations stay in the list and synchronize states
      setTimeout(() => {
        this._preserveHiddenAnnotationsInCommentList();
        this._forceSynchronizeCanvasAndCommentList();
      }, 150);

      // Force change detection to update the UI
      this.cdr.detectChanges();
    }
    event.preventDefault();
  }

  /**
   * Ensure hidden annotations remain in the comment list after interactions
   */
  private _preserveHiddenAnnotationsInCommentList(): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;
    
    // Check if any hidden annotations are missing from the comment list
    const allHiddenNumbers = new Set([...this.hiddenAnnotations, ...this.groupHiddenAnnotations]);
    const commentListNumbers = new Set<number>();
    
    // Collect all markup numbers currently in the comment list
    Object.values(this.list || {}).forEach((comments) => {
      comments.forEach((comment: any) => {
        commentListNumbers.add(comment.markupnumber);
      });
    });
    
    // Filter out hidden annotations that should not be preserved due to page filtering
    const preservedHiddenAnnotations = Array.from(allHiddenNumbers).filter(markupNumber => {
      const markup = markupList.find(m => m.markupnumber === markupNumber);
      if (!markup) return false;
      
      // If we're filtering by page, check if the annotation's page is selected
      if (this.sortByField === 'pagenumber' && this.selectedSortFilterValues.length > 0) {
        const pageNumber = markup.pagenumber + 1;
        return this.selectedSortFilterValues.includes(pageNumber);
      }
      
      return true; // Preserve for other filter types
    });
    
    // Check for missing hidden annotations that should be preserved
    const missingHiddenAnnotations = preservedHiddenAnnotations.filter(
      markupNumber => !commentListNumbers.has(markupNumber)
    );
    
    if (missingHiddenAnnotations.length > 0) {
      // Force reprocessing to include hidden annotations
      this._performProcessList(markupList, []);
    }
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

  // Removed trackByTaskId method


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
    if (this.guiModeSubscription) {
      this.guiModeSubscription.unsubscribe();
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

    // Clean up all leader lines
    this._hideAllLeaderLines();

    // Clear references
    this.scrollContainer = null;
    this.documentViewport = null;
    this.activeEndPoint = null;
    this.activeMarkupNumbers.clear();
    this.leaderLines.clear();
    this.activeEndPoints.clear();

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
        case MARKUP_TYPES.PAINT.POLYLINE.type: {
          // For polyline, use the last point (end of the line)
          let p;
          if (markup.points && markup.points.length > 0) {
            p = markup.points[markup.points.length - 1];
          } else {
            // Fallback to using the markup bounds
            p = { x: xscaledus + wscaledus, y: yscaledus + (hscaledus * 0.5) };
          }

          xval = (p.x / window.devicePixelRatio);
          yval = (p.y / window.devicePixelRatio);

          if(this.pageRotation != 0 && markup.getrotatedPoint){
            let rotpoint = markup.getrotatedPoint(p.x, p.y);
            if (rotpoint) {
              xval = rotpoint.x / window.devicePixelRatio;
              yval = rotpoint.y / window.devicePixelRatio;
            }
          }

          this.rectangle = {
            x : xval,
            y : yval,
            x_1: wscaled - 20,
            y_1: yscaled - 20,
          };

          break;
        }
        case MARKUP_TYPES.PAINT.FREEHAND.type: {
          // For freehand, use the rightmost point
          let p;
          if (markup.points && markup.points.length > 0) {
            p = markup.points[0];
            for (let point of markup.points) {
              if (point.x > p.x) {
                p = point;
              }
            }
          } else {
            // Fallback to using the markup bounds
            p = { x: xscaledus + wscaledus, y: yscaledus + (hscaledus * 0.5) };
          }

          xval = (p.x / window.devicePixelRatio);
          yval = (p.y / window.devicePixelRatio);

          if(this.pageRotation != 0 && markup.getrotatedPoint){
            let rotpoint = markup.getrotatedPoint(p.x, p.y);
            if (rotpoint) {
              xval = rotpoint.x / window.devicePixelRatio;
              yval = rotpoint.y / window.devicePixelRatio;
            }
          }

          this.rectangle = {
            x : xval,
            y : yval,
            x_1: wscaled - 20,
            y_1: yscaled - 20,
          };

          break;
        }
        case MARKUP_TYPES.MEASURE.MEASUREARC.type:
        case MARKUP_TYPES.ERASE.type:
        case MARKUP_TYPES.SHAPE.POLYGON.type:
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

    // Hide the leader line for this specific markup
    this._hideLeaderLineForMarkup(markupNo);

    if (this.connectorLine) {
      RXCore.unSelectAllMarkup();
      this.annotationToolsService.hideQuickActionsMenu();
      this.connectorLine.hide();
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

      // Update last scroll position for reference
      const target = event.target as HTMLElement;
      if (target) {
        this.lastScrollPosition = {
          x: target.scrollLeft || 0,
          y: target.scrollTop || 0
        };
      }

      // Throttle scroll updates for better performance with bounds checking
      if (this.scrollUpdateTimeout) {
        clearTimeout(this.scrollUpdateTimeout);
      }

      // Only update if we have active markups and we're not already updating
      if (this.activeMarkupNumbers.size > 0 && !this.isUpdatingLeaderLine) {
        this.scrollUpdateTimeout = setTimeout(() => {
          this._updateLeaderLinePosition();
        }, 16); // Increased frequency for smoother scroll tracking (~60fps)
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

  onSetStatus(markup: any, statusValue: string) {
    markup.status = statusValue;
    this.closeStatusMenu();
    event?.stopPropagation();
  }

  private _updateMarkupDisplay(markupList: any[], filterFn: (markup: any) => boolean, onoff: boolean) {
    if (!markupList) return;
    
    let updatedCount = 0;
    for (const markup of markupList) {
      if (filterFn(markup)) {
        markup.setdisplay(onoff);
        this._setmarkupTypeDisplay(markup, onoff);
        updatedCount++;
      }
    }
    
    // Only redraw if we actually updated something
    if (updatedCount > 0) {
      RXCore.markUpRedraw();
    }
    
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

    // Clear date picker when annotation switch is turned off
    if (!onoff) {
      this.clearSortDateFilter();
    }

    // Only update annotation markups (non-measurements)
    this._updateMarkupDisplay(markupList, (markup) => !(markup as any).ismeasure, onoff);

    // Update sort filter options when annotation switch changes
    this._updateSortFilterOptions();
  }

  onShowMeasurements(onoff: boolean) {
    const markupList = this.rxCoreService.getGuiMarkupList();
    this.showMeasurements = onoff;

    // Clear date picker when measurement switch is turned off
    if (!onoff) {
      this.clearSortDateFilter();
    }

    // Only update measurement markups
    this._updateMarkupDisplay(markupList, (markup) => (markup as any).ismeasure, onoff);

    // Update sort filter options when measurement switch changes
    this._updateSortFilterOptions();
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
   * Handle toggle for Annotations
   * Simplified logic to ensure proper switch behavior:
   * - When ON: Show only annotations (if measurements switch is OFF) or both (if measurements switch is ON)
   * - When OFF: Hide annotations, show measurements only if measurements switch is ON
   */
  onToggleAnnotations(onoff: boolean) {
    this.showAnnotations = onoff;
    
    if (onoff) {
      // Turn on annotations
      this.onShowAnnotations(true);
      
      // In non-View modes, turn off measurements (exclusive behavior)
      if (this.currentMode !== 'View') {
        this.showMeasurements = false;
        this.onShowMeasurements(false);
      }
      
      // Update filter options to include annotation types
      this._updateSortFilterOptions();
      
      // Apply filters with current switch states
      this._applySortFilterToCanvas();
    } else {      
      // Turn off annotations
      this.onShowAnnotations(false);
      
      // Update filter options
      this._updateSortFilterOptions();
      
      // Apply filters with current switch states
      this._applySortFilterToCanvas();
    }
    
    // Refresh the comment list
    this._refreshAnnotationList();
  }

  /**
   * Handle toggle for Measurements  
   * Simplified logic to ensure proper switch behavior:
   * - When ON: Show only measurements (if annotations switch is OFF) or both (if annotations switch is ON)
   * - When OFF: Hide measurements, show annotations only if annotations switch is ON
   */
  onToggleMeasurements(onoff: boolean) {
    this.showMeasurements = onoff;
    
    if (onoff) {
      // Turn on measurements
      this.onShowMeasurements(true);
      
      // In non-View modes, turn off annotations (exclusive behavior)
      if (this.currentMode !== 'View') {
        this.showAnnotations = false;
        this.onShowAnnotations(false);
      }
      
      // Update filter options to include measurement types
      this._updateSortFilterOptions();
      
      // Apply filters with current switch states
      this._applySortFilterToCanvas();
    } else {  
      // Turn off measurements
      this.onShowMeasurements(false);
      
      // Update filter options
      this._updateSortFilterOptions();
      
      // Apply filters with current switch states
      this._applySortFilterToCanvas();
    }
    
    // Refresh the comment list
    this._refreshAnnotationList();
  }

  /**
   * Refresh the annotation list to apply current filters
   */
  private _refreshAnnotationList(): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (markupList) {
      this._processList(markupList);
    }
  }

  /**
   * Force synchronization between canvas display and comment list filters
   * This ensures that both annotations and measurements respect all active filters
   */
  private _forceSynchronizeCanvasAndCommentList(): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;
    
    console.log('🔍 Synchronizing canvas and comment list states');
    
    markupList.forEach(markup => {
      const markupNumber = markup.markupnumber;
      const isMeasurement = (markup as any).ismeasure === true;
      
      // Check if the switch allows this type to be displayed
      const switchAllowsDisplay = isMeasurement ? this.showMeasurements : this.showAnnotations;
      
      // Access display state through the markup object
      const displayState = (markup as any).display === true;
      const isVisibleInList = this.isAnnotationVisible(markupNumber);
      
      // Only update if the switch allows this type to be displayed
      if (switchAllowsDisplay && displayState !== isVisibleInList) {
        console.log(`🔍 State mismatch for markup ${markupNumber}:`, {
          canvasDisplay: displayState,
          listVisible: isVisibleInList,
          isMeasurement,
          switchAllowsDisplay
        });
        
        // Update canvas to match list state
        markup.setdisplay(isVisibleInList);
      } else if (!switchAllowsDisplay && displayState === true) {
        // If switch is OFF but markup is displayed, hide it
        console.log(`🔍 Hiding markup ${markupNumber} because switch is OFF:`, {
          isMeasurement,
          switchAllowsDisplay
        });
        markup.setdisplay(false);
      }
    });
    
    // Ensure changes are reflected
    RXCore.markUpRedraw();
  }

  /**
   * Enhanced synchronization method to fix comment list not updating after page filter changes
   * This addresses the timing issue where canvas updates and comment list updates are out of sync
   */
  private _enhancedSynchronizeCanvasAndCommentList(): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;

    // Step 1: Apply all filters to canvas (this already respects switch states)
    this._applySortFilterToCanvas();
    
    // Step 2: Force immediate canvas redraw to update markup display states
    RXCore.markUpRedraw();
    
    // Step 3: Process comment list to apply filters
    // We need to process the comment list to apply the new filters
    // Hidden annotations will be preserved by the _processList protection
    this._processList(markupList);
    
    // Step 4: Force change detection
    this.cdr.detectChanges();
  }

  /**
   * Verify that canvas and comment list are properly synchronized
   * If not, attempt to fix the synchronization
   */
  private _verifySynchronizationAndRetryIfNeeded(markupList: any[]): void {
    if (!markupList) return;
    
    // Skip verification if there are hidden annotations to prevent removing them
    if (this.hiddenAnnotations.size > 0) {
      return;
    }
    
    let canvasVisibleCount = 0;
    let commentListCount = 0;
    let canvasVisibleMarkups: any[] = [];
    let commentListMarkups: any[] = [];
    
    // Count visible markups on canvas and collect them for debugging
    for (const markup of markupList) {
      const shouldShowOnCanvas = this._shouldShowMarkupForCanvas(markup);
      if (shouldShowOnCanvas) {
        canvasVisibleCount++;
        canvasVisibleMarkups.push({
          id: markup.markupnumber,
          page: markup.pagenumber + 1,
          type: this.getAnnotationTitle(markup.type, markup.subtype),
          isMeasurement: !!(markup as any).ismeasure
        });
      }
    }
    
    // Count visible markups in comment list and collect them
    for (const groupKey in this.list) {
      if (this.list[groupKey]) {
        commentListCount += this.list[groupKey].length;
        for (const markup of this.list[groupKey]) {
          commentListMarkups.push({
            id: markup.markupnumber,
            page: markup.pagenumber + 1,
            type: this.getAnnotationTitle(markup.type, markup.subtype),
            isMeasurement: !!(markup as any).ismeasure
          });
        }
      }
    }
    

    // If counts don't match, we have a synchronization issue - retry with more aggressive approach
    if (canvasVisibleCount !== commentListCount) {
      
      // Find the missing markups
      const canvasIds = new Set(canvasVisibleMarkups.map(m => m.id));
      const commentIds = new Set(commentListMarkups.map(m => m.id));
      const missingFromComments = canvasVisibleMarkups.filter(m => !commentIds.has(m.id));
      const extraInComments = commentListMarkups.filter(m => !canvasIds.has(m.id));
      
      
      // Enhanced retry with forced canvas update first
      setTimeout(() => {
        this._applySortFilterToCanvas();
        RXCore.markUpRedraw();
        
                 // Then wait and update comment list
         setTimeout(() => {
           
           // Clear processing flags and update list
           this.isProcessingList = false;
           // Skip comment list processing if there are hidden annotations
           if (this.hiddenAnnotations.size === 0) {
             this._processList(markupList);
           }
           
           // Aggressive change detection for retry
           this.cdr.detectChanges();
           this.cdr.markForCheck();
           
           setTimeout(() => {
             this.cdr.detectChanges();
             
             setTimeout(() => {
               this.cdr.detectChanges();
               
               // Final verification
               setTimeout(() => {
                 this._finalSynchronizationCheck(markupList);
               }, 100);
             }, 10);
           }, 10);
         }, 150);
      }, 100);
    } 
  }

  /**
   * Check if a specific annotation is visible (not hidden by eye icon or group toggle)
   */
  isAnnotationVisible(markupNumber: number): boolean {
    // First check if the annotation is hidden individually
    if (this.hiddenAnnotations.has(markupNumber)) {
      return false;
    }

    // Then check if it's hidden by group
    if (this.groupHiddenAnnotations.has(markupNumber)) {
      return false;
    }

    // Get the markup object to check its group
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return true;

    const markup = markupList.find(m => m.markupnumber === markupNumber);
    if (!markup) return true;

    // Check if the group is hidden
    const groupKey = this._getGroupKeyForMarkup(markup);
    if (this.hiddenGroups.has(groupKey)) {
      return false;
    }

    // If none of the above conditions are met, the annotation is visible
    return true;
  }

  /**
   * Check if a comment card can be clicked (expanded/collapsed)
   */
  isCommentCardClickable(markupNumber: number): boolean {
    // Get the markup object
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return false;

    const markup = markupList.find(m => m.markupnumber === markupNumber);
    if (!markup) return false;

    // Strictly check the switch state
    const isMeasurement = (markup as any).ismeasure === true;
    const switchAllowsDisplay = isMeasurement ? this.showMeasurements : this.showAnnotations;
    if (!switchAllowsDisplay) return false;

    // Always allow clicking if the annotation is visible
    if (this.isAnnotationVisible(markupNumber)) {
      return true;
    }

    // For hidden annotations, check if they're in the list
    const isInList = Object.values(this.list || {}).some(group =>
      group.some(item => item.markupnumber === markupNumber)
    );

    return isInList;
  }

  /**
   * Check if a comment card should be disabled (grayed out)
   */
  isCommentCardDisabled(markupNumber: number): boolean {
    return !this.isCommentCardClickable(markupNumber);
  }

  /**
   * Toggle the visibility of an individual annotation
   */
  private async _collapseAndHideAnnotation(markup: any): Promise<void> {
    // If card is expanded, collapse it first
    if (markup.IsExpanded) {
      markup.IsExpanded = false;
      // Clear active markup number if this was the active one
      if (this.activeMarkupNumber === markup.markupnumber) {
        this.activeMarkupNumber = -1;
      }
      // Wait for collapse animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Hide the annotation individually
    this.hiddenAnnotations.add(markup.markupnumber);
    // Remove from group hidden if it was there
    this.groupHiddenAnnotations.delete(markup.markupnumber);
    
    // Update the canvas and hide leader lines
    this._updateIndividualAnnotationVisibility(markup.markupnumber, false);
    this._hideLeaderLineForMarkup(markup.markupnumber);
    
    // Force change detection and canvas refresh
    this.cdr.detectChanges();
    setTimeout(() => {
      this._forceCanvasRefresh();
    }, 100);
  }

  async toggleAnnotationVisibility(event: Event, markup: any): Promise<void> {
    event.stopPropagation(); // Prevent triggering the card click
    
    const isCurrentlyVisible = this.isAnnotationVisible(markup.markupnumber);
    if (isCurrentlyVisible) {
      await this._collapseAndHideAnnotation(markup);
    } else {
      // Before showing individually, check if the appropriate switch is ON
      const isMeasurement = markup.ismeasure === true;
      const switchAllowsDisplay = isMeasurement ? this.showMeasurements : this.showAnnotations;
      
      if (!switchAllowsDisplay) {
        // Don't show if the appropriate switch is OFF
        return;
      }
      
      // Show the annotation individually
      this.hiddenAnnotations.delete(markup.markupnumber);
      this.groupHiddenAnnotations.delete(markup.markupnumber);
      this._updateIndividualAnnotationVisibility(markup.markupnumber, true);
      
      // Force updates
      this.cdr.detectChanges();
      setTimeout(() => {
        this._forceCanvasRefresh();
      }, 100);
    }
  }

  /**
   * Update the visibility of a specific annotation on the canvas
   */
  private _updateIndividualAnnotationVisibility(markupNumber: number, shouldShow: boolean): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;
    
    const markup = markupList.find(m => m.markupnumber === markupNumber);
    if (!markup) return;
    
    // Get the group key for this markup
    const groupKey = this._getGroupKeyForMarkup(markup);
    
    // Update visibility state based on shouldShow parameter
    if (shouldShow) {
      // Remove from both individual and group hidden sets
      this.hiddenAnnotations.delete(markupNumber);
      this.groupHiddenAnnotations.delete(markupNumber);
      
      // If this was the last hidden annotation in the group, remove the group from hidden groups
      const groupItems = this._getGroupItems(groupKey);
      const hasOtherHiddenAnnotations = groupItems.some(item => 
        item.markupnumber !== markupNumber && 
        (this.hiddenAnnotations.has(item.markupnumber) || this.groupHiddenAnnotations.has(item.markupnumber))
      );
      
      if (!hasOtherHiddenAnnotations) {
        this.hiddenGroups.delete(groupKey);
      }
    } else {
      // Add to individual hidden set
      this.hiddenAnnotations.add(markupNumber);
      
      // If all annotations in the group are now hidden, add the group to hidden groups
      const groupItems = this._getGroupItems(groupKey);
      const allHidden = groupItems.every(item => 
        this.hiddenAnnotations.has(item.markupnumber) || 
        this.groupHiddenAnnotations.has(item.markupnumber)
      );
      
      if (allHidden) {
        this.hiddenGroups.add(groupKey);
      }
    }
    
    // Check if the annotation should be shown based on all other filters
    const shouldShowBasedOnFilters = this._shouldShowMarkupForCanvasIgnoringIndividualVisibility(markup);
    
    // Apply the individual visibility setting, but respect switch states
    const finalVisibility = shouldShow && shouldShowBasedOnFilters;
    
    // Set the display state
    markup.setdisplay(finalVisibility);
    
    // Force immediate redraw for better responsiveness
    RXCore.markUpRedraw();
    
    // Additional redraw after a short delay to ensure all annotations are properly updated
    setTimeout(() => {
      RXCore.markUpRedraw();
      
      // Ensure synchronization
      this._forceSynchronizeCanvasAndCommentList();
    }, 50);
  }

  /**
   * Reset all individual annotation visibility settings
   */
  resetAllAnnotationVisibility(): void {
    this.hiddenAnnotations.clear();
    this.hiddenGroups.clear(); // Also clear hidden groups
    this.groupHiddenAnnotations.clear(); // Clear group-hidden annotations
    
    // Update all annotations on canvas - this will respect switch states
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (markupList) {
      this._applySortFilterToCanvas();
    }
    
    // Force refresh of comment list since we can now process it safely
    this._forceRefreshCommentList();
    
    // Ensure all annotation types are properly displayed on canvas (respecting switches)
    this._forceCanvasRefresh();
    
    this.cdr.detectChanges();
  }

  /**
   * Force a comprehensive canvas refresh to ensure all annotation types are properly displayed
   */
  private _forceCanvasRefresh(): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;
    
    // Apply the same consistent logic for all markups
    markupList.forEach(markup => {
      const markupNumber = markup.markupnumber;
      
      // Check if annotation/measurement should be shown based on switch states
      const isMeasurement = (markup as any).ismeasure === true;
      const switchAllowsDisplay = isMeasurement ? this.showMeasurements : this.showAnnotations;
      
      if (!switchAllowsDisplay) {
        // If switch is OFF, hide immediately
        markup.setdisplay(false);
        return;
      }
      
      // If switch is ON, check individual visibility and filters
      const groupKey = this._getGroupKeyForMarkup(markup);
      const isGroupHidden = this.hiddenGroups.has(groupKey);
      const isIndividuallyHidden = this.hiddenAnnotations.has(markupNumber);
      const isHiddenByGroup = this.groupHiddenAnnotations.has(markupNumber);
      const isVisibleByIndividualToggle = !isIndividuallyHidden && !isHiddenByGroup && !isGroupHidden;
      
      // Check if passes other filters (author, sort, type, etc.)
      const passesOtherFilters = this._shouldShowMarkupForCanvasIgnoringIndividualVisibility(markup);
      
      // Final visibility is the combination of all conditions
      const finalVisibility = isVisibleByIndividualToggle && passesOtherFilters;
      
      markup.setdisplay(finalVisibility);
    });
    
    // Force immediate redraw
    RXCore.markUpRedraw();
    
    // Ensure comment list is synchronized
    this._preserveHiddenAnnotationsInCommentList();
    this._forceSynchronizeCanvasAndCommentList();
  }

  /**
   * Check if a group is visible (not hidden by group toggle AND has at least one visible annotation)
   */
  isGroupVisible(groupKey: string): boolean {
    // First check if the group is explicitly hidden by group toggle
    if (this.hiddenGroups.has(groupKey)) {
      // Even if group is hidden, it's considered "visible" if any annotation has individual override
      const groupItems = this._getGroupItems(groupKey);
      const hasIndividualOverride = groupItems.some(item => 
        !this.hiddenAnnotations.has(item.markupnumber) && !this.groupHiddenAnnotations.has(item.markupnumber)
      );
      return hasIndividualOverride;
    }
    
    // Get all annotations in this group to check individual visibility
    const groupItems = this._getGroupItems(groupKey);
    
    // If no items in group, consider it visible
    if (groupItems.length === 0) {
      return true;
    }
    
    // Check if at least one annotation in the group is individually visible
    const hasVisibleAnnotation = groupItems.some(item => 
      this.isAnnotationVisible(item.markupnumber)
    );
    
    return hasVisibleAnnotation;
  }

  /**
   * Get the group key for a markup based on current sort field
   */
  private _getGroupKeyForMarkup(markup: any): string {
    switch (this.sortByField) {
      case 'created':
        return dayjs(markup.timestamp).fromNow();
      case 'author':
        return RXCore.getDisplayName(markup.signature);
      case 'annotation':
        return this.getAnnotationTitle(markup.type, markup.subtype);
      case 'pagenumber':
        return `Page ${markup.pagenumber + 1}`;
      default:
        return '';
    }
  }

  /**
   * Get all items that belong to a specific group
   */
  private _getGroupItems(groupKey: string): Array<any> {
    if (!this.list || !this.list[groupKey]) {
      return [];
    }
    return this.list[groupKey];
  }

  /**
   * Toggle the visibility of all annotations in a group
   */
  async toggleGroupVisibility(groupKey: string, groupItems: Array<any>): Promise<void> {
    const isCurrentlyVisible = this.isGroupVisible(groupKey);
    const isExplicitlyHiddenByGroup = this.hiddenGroups.has(groupKey);
    
    console.log('🔍 Group Visibility Toggle:', {
      groupKey,
      isCurrentlyVisible,
      isExplicitlyHiddenByGroup,
      itemCount: groupItems.length,
      hiddenAnnotations: Array.from(this.hiddenAnnotations),
      groupHiddenAnnotations: Array.from(this.groupHiddenAnnotations)
    });
    
    if (isCurrentlyVisible) {
      // First collapse all expanded cards in the group
      const expandedItems = groupItems.filter(item => item.IsExpanded);
      for (const item of expandedItems) {
        item.IsExpanded = false;
        // Clear active markup number if this was the active one
        if (this.activeMarkupNumber === item.markupnumber) {
          this.activeMarkupNumber = -1;
        }
        // Hide any leader lines for this markup
        this._hideLeaderLineForMarkup(item.markupnumber);
      }
      
      // Wait for collapse animation to complete if there were expanded items
      if (expandedItems.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Hide the group explicitly
      this.hiddenGroups.add(groupKey);
      
      // Hide all annotations in this group on canvas
      groupItems.forEach(item => {
        const markupNumber = item.markupnumber;
        this.hiddenAnnotations.add(markupNumber);
        this.groupHiddenAnnotations.add(markupNumber);
        this._updateIndividualAnnotationVisibility(markupNumber, false);
      });

      console.log('🔍 After Hiding Group:', {
        groupKey,
        hiddenGroups: Array.from(this.hiddenGroups),
        hiddenAnnotations: Array.from(this.hiddenAnnotations),
        groupHiddenAnnotations: Array.from(this.groupHiddenAnnotations)
      });
    } else {
      // Group is currently not visible - show all annotations in the group
      this.hiddenGroups.delete(groupKey);
      
      // Show ALL annotations in this group
      const markupList = this.rxCoreService.getGuiMarkupList();
      if (!markupList) return;
      
      // First, clear all hidden states for this group
      groupItems.forEach(item => {
        const markupNumber = item.markupnumber;
        this.hiddenAnnotations.delete(markupNumber);
        this.groupHiddenAnnotations.delete(markupNumber);
      });
      
      // Then update visibility for each annotation
      groupItems.forEach(item => {
        const markupNumber = item.markupnumber;
        const markup = markupList.find(m => m.markupnumber === markupNumber);
        if (markup) {
          // Check if the annotation should be shown based on filters
          const shouldShow = this._shouldShowMarkupForCanvasIgnoringIndividualVisibility(markup);
          markup.setdisplay(shouldShow);
        }
      });
      
      // Force immediate canvas redraw
      RXCore.markUpRedraw();
      
      // Additional redraw to ensure all types are properly rendered
      setTimeout(() => {
        RXCore.markUpRedraw();
      }, 50);


    }
    
    // Force change detection to update the toggle switch and eye icons
    this.cdr.detectChanges();
    
    // Ensure proper synchronization after group toggle
    setTimeout(() => {
      this._ensureGroupToggleSynchronization(groupKey, groupItems);
      this._preserveHiddenAnnotationsInCommentList();
      this._forceSynchronizeCanvasAndCommentList();
    }, 100);
  }

  /**
   * Ensure proper synchronization after group toggle to prevent inconsistencies
   */
  private _ensureGroupToggleSynchronization(groupKey: string, groupItems: Array<any>): void {
    const isGroupVisible = this.isGroupVisible(groupKey);
    const markupList = this.rxCoreService.getGuiMarkupList();
    
    if (!markupList) return;
    
    // Verify and fix any inconsistencies with switch state respect
    groupItems.forEach(item => {
      const markupNumber = item.markupnumber;
      const markup = markupList.find(m => m.markupnumber === markupNumber);
      
      if (!markup) return;
      
      // First check if the switch allows this type to be displayed
      const isMeasurement = (markup as any).ismeasure === true;
      const switchAllowsDisplay = isMeasurement ? this.showMeasurements : this.showAnnotations;
      
      if (!switchAllowsDisplay) {
        // If switch is OFF, hide regardless of group state
        markup.setdisplay(false);
        return;
      }
      
      // If switch is ON, check individual and group visibility
      const isIndividuallyHidden = this.hiddenAnnotations.has(markupNumber);
      const isGroupHidden = this.groupHiddenAnnotations.has(markupNumber);
      const shouldBeVisible = !isIndividuallyHidden && !isGroupHidden && isGroupVisible;
      
      // Calculate the expected display state with all filters
      const expectedDisplayState = shouldBeVisible && this._shouldShowMarkupForCanvasIgnoringIndividualVisibility(markup);
      
      markup.setdisplay(expectedDisplayState);
    });
    
    // Force immediate redraw to reflect all changes
    RXCore.markUpRedraw();
  }

  /**
   * Check if markup should be visible on canvas, ignoring individual visibility state
   */
  private _shouldShowMarkupForCanvasIgnoringIndividualVisibility(markup: any): boolean {
    // First strictly check the annotation/measurement switch states
    const isMeasurement = (markup as any).ismeasure === true;

    // Early return based on switch states
    if (isMeasurement && !this.showMeasurements) {
      return false;
    }
    
    if (!isMeasurement && !this.showAnnotations) {
      return false;
    }

    // If we get here, the appropriate switch is ON, now check other filters
    const authorFilterResult = this._shouldShowMarkupForAuthor(markup);
    if (!authorFilterResult) {
      return false;
    }

    const sortFilterResult = this._shouldShowMarkupForSortFilter(markup);
    if (!sortFilterResult) {
      return false;
    }

    const typeFilterResult = this._getmarkupTypeDisplay(markup);
    if (typeFilterResult === false) {
      return false;
    }

    // Apply page-specific filtering
    if (this.pageNumber > 0 && markup.pagenumber !== this.pageNumber - 1) {
      return false;
    }

    // Apply date filter if active
    if (this.dateFilter.startDate || this.dateFilter.endDate) {
      const passesDateFilter = (this.dateFilter.startDate
        ? dayjs(markup.timestamp).isSameOrAfter(this.dateFilter.startDate)
        : true) &&
      (this.dateFilter.endDate
        ? dayjs(markup.timestamp).isSameOrBefore(this.dateFilter.endDate.endOf('day'))
        : true);

      if (!passesDateFilter) {
        return false;
      }
    }

    // If all checks pass, the markup should be shown
    return true;
  }



  private _forceRefreshCommentList(): void {
    
    // Temporarily clear the list to trigger a fresh rebuild
    this.list = {};
    
    // Force immediate processing of the current markup list
    const markupList = this.rxCoreService.getGuiMarkupList();
    const annotList = this.rxCoreService.getGuiAnnotList();
    
    // Clear the timeout to ensure immediate processing
    if (this.processListTimeout) {
      clearTimeout(this.processListTimeout);
    }
    
    // Process immediately since no annotations are hidden
    this._performProcessList(markupList, annotList);
  }

  /**
   * Final synchronization check - if still mismatched, log detailed info for debugging
   */
  private _finalSynchronizationCheck(markupList: any[]): void {
    let finalCanvasCount = 0;
    let finalCommentCount = 0;
    
    // Count final states
    for (const markup of markupList) {
      if (this._shouldShowMarkupForCanvas(markup)) {
        finalCanvasCount++;
      }
    }
    
    for (const groupKey in this.list) {
      if (this.list[groupKey]) {
        finalCommentCount += this.list[groupKey].length;
      }
    }
    
  }

  /**
   * Helper method to check if markup should be visible on canvas based on current filters
   * This uses the EXACT same logic as _shouldShowMarkupInCommentList to ensure synchronization
   */
  private _shouldShowMarkupForCanvas(markup: any): boolean {
    // Use the exact same logic as comment list filtering but without the final canvas display check
    // to avoid circular dependency
    
    // Check annotation/measurement switch states first
    const isMeasurement = (markup as any).ismeasure === true;
    const showAnnotationsState = this.showAnnotations === true;
    const showMeasurementsState = this.showMeasurements === true;
    
    let switchAllowsDisplay = false;
    if (isMeasurement) {
      switchAllowsDisplay = showMeasurementsState;
    } else {
      switchAllowsDisplay = showAnnotationsState;
    }
    
    if (!switchAllowsDisplay) {
      return false;
    }
    
    // Check author filter state
    const authorFilterResult = this._shouldShowMarkupForAuthor(markup);
    if (!authorFilterResult) {
      return false;
    }
    
    // Check sort filter values
    const sortFilterResult = this._shouldShowMarkupForSortFilter(markup);
    if (!sortFilterResult) {
      return false;
    }
    
    // Check the type filter state for additional filtering logic
    const typeFilterResult = this._getmarkupTypeDisplay(markup);
    if (typeFilterResult === false) {
      return false;
    }
    
    // Apply the same date filter logic as in _performProcessList
    if (this.pageNumber > 0) {
      // Page-specific filtering
      if (markup.pagenumber !== this.pageNumber - 1) {
        return false;
      }
    }
    
    // Apply date filter
    if (this.dateFilter.startDate || this.dateFilter.endDate) {
      const passesDateFilter = (this.dateFilter.startDate
        ? dayjs(markup.timestamp).isSameOrAfter(this.dateFilter.startDate)
        : true) &&
      (this.dateFilter.endDate
        ? dayjs(markup.timestamp).isSameOrBefore(this.dateFilter.endDate.endOf('day'))
        : true);
      
      if (!passesDateFilter) {
        return false;
      }
    }
    
    // Check bisTextArrow filter (same as in _performProcessList)
    if (markup.bisTextArrow) {
      return false;
    }
    
    // Check individual annotation visibility (eye icon and group toggle)
    const isIndividuallyVisible = this.isAnnotationVisible(markup.markupnumber);
    if (!isIndividuallyVisible) {
      return false;
    }
    
    return true;
  }

  /**
   * Ensure proper initialization of filter options when switches are toggled
   * This fixes the issue where annotation type filter shows no selected values
   */
  private _ensureProperFilterInitialization(): void {

    // Handle annotation type filter specifically
    if (this.sortByField === 'annotation' && this.sortFilterOptions.length > 0) {
      const markupList = this.rxCoreService.getGuiMarkupList();
      if (!markupList) return;

      // Get all available types based on current switch states
      const availableTypes = new Set<string>();
      
      if (this.showAnnotations) {
        // Add annotation types
        const annotationMarkups = markupList.filter(markup => !(markup as any).ismeasure);
        annotationMarkups.forEach(markup => {
          availableTypes.add(this.getAnnotationTitle(markup.type, markup.subtype));
        });
      }
      
      if (this.showMeasurements) {
        // Add measurement types
        const measurementMarkups = markupList.filter(markup => (markup as any).ismeasure);
        measurementMarkups.forEach(markup => {
          availableTypes.add(this.getAnnotationTitle(markup.type, markup.subtype));
        });
      }

      // If no types are selected but we have available types, select them all
      if (this.selectedSortFilterValues.length === 0 && availableTypes.size > 0) {
        // Select all available types
        this.selectedSortFilterValues = Array.from(availableTypes);
        this.sortFilterOptions.forEach(option => {
          option.selected = availableTypes.has(option.value);
        });
        // Apply the fix to canvas and comment list
        this._forceSynchronizeCanvasAndCommentList();
      } else if (this.selectedSortFilterValues.length > 0) {
        // Some types are selected, but we need to ensure they match the available types
        const validSelectedTypes = this.selectedSortFilterValues.filter(type => availableTypes.has(type));
        
        if (validSelectedTypes.length !== this.selectedSortFilterValues.length) {
          
          this.selectedSortFilterValues = validSelectedTypes;
          this.sortFilterOptions.forEach(option => {
            option.selected = validSelectedTypes.includes(option.value);
          });
          
          
          // Apply the fix to canvas and comment list
          this._forceSynchronizeCanvasAndCommentList();
        }
      }
    }
  }

  /**
   * Preserve existing filters and apply them to measurements when measurements switch is turned on
   */
  private _preserveFiltersAndApplyToMeasurements(): void {
    
    // Don't modify existing filter selections - they are already preserved by _updateSortFilterOptions()
    // Just ensure that the canvas shows both annotations and measurements that match the existing filters
    
    // The existing selectedSortFilterValues and sortFilterDateRange should already contain the user's selections
    // and _updateSortFilterOptions() has preserved them
    
    // Apply the existing filter criteria to canvas to show both annotations and measurements
    this._applySortFilterToCanvas();
    
    // Update the filter options to include measurement types that match the existing filter criteria
    // This ensures newly visible measurements are included in the available filter options
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (markupList) {
      // Add any new measurement authors/pages/types that weren't previously available
      this._expandFilterOptionsForMeasurements(markupList);
    }
    
    // Force a complete synchronization to ensure everything is consistent
    setTimeout(() => {
      this._forceSynchronizeCanvasAndCommentList();
    }, 100);
  }

  /**
   * Handle the case when a switch is turned back ON to ensure proper filter synchronization
   */
  private _handleSwitchTurnedOn(switchType: 'annotations' | 'measurements'): void {
    console.log(`🔄 Switch turned ON: ${switchType}`, {
      showAnnotations: this.showAnnotations,
      showMeasurements: this.showMeasurements,
      sortByField: this.sortByField
    });

    // If we're currently on annotation type filter, we need to update the selections
    if (this.sortByField === 'annotation') {
      const markupList = this.rxCoreService.getGuiMarkupList();
      if (!markupList) return;

      // Get the types that should be available now
      const availableTypes = new Set<string>();
      
      if (this.showAnnotations) {
        const annotationMarkups = markupList.filter(markup => !(markup as any).ismeasure);
        annotationMarkups.forEach(markup => {
          availableTypes.add(this.getAnnotationTitle(markup.type, markup.subtype));
        });
      }
      
      if (this.showMeasurements) {
        const measurementMarkups = markupList.filter(markup => (markup as any).ismeasure);
        measurementMarkups.forEach(markup => {
          availableTypes.add(this.getAnnotationTitle(markup.type, markup.subtype));
        });
      }


      // Add new types to the filter options if they don't exist
      const newTypes = Array.from(availableTypes).filter(type => 
        !this.sortFilterOptions.some(option => option.value === type)
      );

      if (newTypes.length > 0) {
        newTypes.forEach(type => {
          this.sortFilterOptions.push({
            value: type,
            label: type,
            selected: true
          });
          this.selectedSortFilterValues.push(type);
        });
      }

      // Update the selected state of existing options
      this.sortFilterOptions.forEach(option => {
        if (availableTypes.has(option.value)) {
          option.selected = true;
          if (!this.selectedSortFilterValues.includes(option.value)) {
            this.selectedSortFilterValues.push(option.value);
          }
        }
      });

    }
  }

  /**
   * Preserve existing filters and apply them to annotations when annotations switch is turned on
   */
  private _preserveFiltersAndApplyToAnnotations(): void {
    
    // Don't modify existing filter selections - they are already preserved by _updateSortFilterOptions()
    // Just ensure that the canvas shows both annotations and measurements that match the existing filters
    
    // The existing selectedSortFilterValues and sortFilterDateRange should already contain the user's selections
    // and _updateSortFilterOptions() has preserved them
    
    // Apply the existing filter criteria to canvas to show both annotations and measurements
    this._applySortFilterToCanvas();
    
    // Update the filter options to include annotation types that match the existing filter criteria
    // This ensures newly visible annotations are included in the available filter options
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (markupList) {
      // Add any new annotation authors/pages/types that weren't previously available
      this._expandFilterOptionsForAnnotations(markupList);
    }
    
    // Force a complete synchronization to ensure everything is consistent
    setTimeout(() => {
      this._forceSynchronizeCanvasAndCommentList();
    }, 100);
  }

  /**
   * Expand filter options to include measurement types while preserving existing selections
   */
  private _expandFilterOptionsForMeasurements(markupList: any[]): void {
    // Get measurement markups
    const measurementMarkups = markupList.filter(markup => (markup as any).ismeasure);
    
    if (measurementMarkups.length === 0) {
      return;
    }


    // For annotation type filter, add measurement types if not already present
    if (this.sortByField === 'annotation') {
      const existingTypeValues = new Set(this.sortFilterOptions.map(option => option.value));
      const newMeasurementTypes = [...new Set(measurementMarkups.map(markup => this.getAnnotationTitle(markup.type, markup.subtype)))]
        .filter(type => !existingTypeValues.has(type));
      
      
      // Add new measurement types as selected (since user wants to see measurements)
      newMeasurementTypes.forEach(type => {
        this.sortFilterOptions.push({
          value: type,
          label: type,
          selected: true
        });
        this.selectedSortFilterValues.push(type);
      });
      
    }

    // For author filter, add measurement authors if not already present
    if (this.sortByField === 'author') {
      const existingAuthorValues = new Set(this.sortFilterOptions.map(option => option.value));
      const newMeasurementAuthors = [...new Set(measurementMarkups.map(markup => RXCore.getDisplayName(markup.signature)))]
        .filter(author => !existingAuthorValues.has(author));
      
      // Add new measurement authors as selected (since user wants to see measurements)
      newMeasurementAuthors.forEach(author => {
        this.sortFilterOptions.push({
          value: author,
          label: author,
          selected: true
        });
        this.selectedSortFilterValues.push(author);
      });
    }

    // For page filter, add measurement pages if not already present
    if (this.sortByField === 'pagenumber') {
      const existingPageValues = new Set(this.sortFilterOptions.map(option => option.value));
      const newMeasurementPages = [...new Set(measurementMarkups.map(markup => markup.pagenumber + 1))]
        .filter(page => !existingPageValues.has(page));
      
      // Add new measurement pages as selected (since user wants to see measurements)
      newMeasurementPages.forEach(page => {
        this.sortFilterOptions.push({
          value: page,
          label: page.toString(),
          selected: true
        });
        this.selectedSortFilterValues.push(page);
      });
      
      // Sort pages numerically
      this.sortFilterOptions.sort((a, b) => {
        if (typeof a.value === 'number' && typeof b.value === 'number') {
          return a.value - b.value;
        }
        return 0;
      });
    }
  }

  /**
   * Expand filter options to include annotation types while preserving existing selections
   */
  private _expandFilterOptionsForAnnotations(markupList: any[]): void {
    // Get annotation markups
    const annotationMarkups = markupList.filter(markup => !(markup as any).ismeasure);
    
    if (annotationMarkups.length === 0) {
      return;
    }

    // For annotation type filter, add annotation types if not already present
    if (this.sortByField === 'annotation') {
      const existingTypeValues = new Set(this.sortFilterOptions.map(option => option.value));
      const newAnnotationTypes = [...new Set(annotationMarkups.map(markup => this.getAnnotationTitle(markup.type, markup.subtype)))]
        .filter(type => !existingTypeValues.has(type));
      
      // Add new annotation types as selected (since user wants to see annotations)
      newAnnotationTypes.forEach(type => {
        this.sortFilterOptions.push({
          value: type,
          label: type,
          selected: true
        });
        this.selectedSortFilterValues.push(type);
      });
    }

    // For author filter, add annotation authors if not already present
    if (this.sortByField === 'author') {
      const existingAuthorValues = new Set(this.sortFilterOptions.map(option => option.value));
      const newAnnotationAuthors = [...new Set(annotationMarkups.map(markup => RXCore.getDisplayName(markup.signature)))]
        .filter(author => !existingAuthorValues.has(author));
      
      // Add new annotation authors as selected (since user wants to see annotations)
      newAnnotationAuthors.forEach(author => {
        this.sortFilterOptions.push({
          value: author,
          label: author,
          selected: true
        });
        this.selectedSortFilterValues.push(author);
      });
    }

    // For page filter, add annotation pages if not already present
    if (this.sortByField === 'pagenumber') {
      const existingPageValues = new Set(this.sortFilterOptions.map(option => option.value));
      const newAnnotationPages = [...new Set(annotationMarkups.map(markup => markup.pagenumber + 1))]
        .filter(page => !existingPageValues.has(page));
      
      // Add new annotation pages as selected (since user wants to see annotations)
      newAnnotationPages.forEach(page => {
        this.sortFilterOptions.push({
          value: page,
          label: page.toString(),
          selected: true
        });
        this.selectedSortFilterValues.push(page);
      });
      
      // Sort pages numerically
      this.sortFilterOptions.sort((a, b) => {
        if (typeof a.value === 'number' && typeof b.value === 'number') {
          return a.value - b.value;
        }
        return 0;
      });
    }
  }

  /**
   * Filter methods simplified - removed comment list filters dependency
   */
  private _selectAnnotationTypesInFilters(): void {
    // Simplified - no filter component dependency
  }

  private _deselectAnnotationTypesInFilters(): void {
    // Simplified - no filter component dependency
  }

  private _selectMeasurementTypesInFilters(): void {
    // Simplified - no filter component dependency
  }

  private _deselectMeasurementTypesInFilters(): void {
    // Simplified - no filter component dependency
  }

  private _clearAllFilterSelections(): void {
    // Simplified - no filter component dependency
  }

  private _clearAuthorAndPageSelections(): void {
    // Simplified - no filter component dependency
  }

  /**
   * Ensure all measurement types are properly cleared - simplified without filter component
   */
  private _ensureMeasurementTypesCleared(): void {
    // Simplified - no filter component dependency
  }

  /**
   * Helper method to determine if a type is a measurement type
   */
  private _isMeasurementType(type: any): boolean {
    // Check by label first (fallback method)
    if (type.label) {
      const label = type.label.toLowerCase();
      if (label.includes('measure') || 
          label.includes('area') || 
          label.includes('length') || 
          label.includes('distance') || 
          label.includes('perimeter') ||
          label.includes('count')) {
        return true;
      }
    }
    
    // Use the same logic as the comment-list-filters component
    const measurementTypes = [
      { type: 7, subtype: undefined }, // MEASURE.LENGTH
      { type: 8, subtype: 0 }, // MEASURE.AREA  
      { type: 8, subtype: undefined }, // MEASURE.AREA (alternative)
      { type: 1, subtype: 3 }, // MEASURE.PATH
      { type: 3, subtype: 6 }, // MEASURE.RECTANGLE
      { type: 1, subtype: 4 }, // MEASURE.ANGLECLOCKWISE
      { type: 1, subtype: 5 }, // MEASURE.ANGLECCLOCKWISE
      { type: 14, subtype: 0 }, // MEASURE.MEASUREARC
      { type: 13, subtype: undefined } // COUNT
    ];
    
    // Check if this type matches any measurement type
    const typeNumber = parseInt(type.type) || type.type;
    const subtypeNumber = type.subtype !== undefined && type.subtype !== '' ? parseInt(type.subtype) : type.subtype;
    
    const isMatch = measurementTypes.some(measureType => {
      if (measureType.subtype !== undefined) {
        const match = typeNumber === measureType.type && subtypeNumber === measureType.subtype;
        return match;
      } else {
        const match = typeNumber === measureType.type;
        return match;
      }
    });
    
        return isMatch;
  }

  /**
   * Clear measurement types by label - simplified without filter component
   */
  private _clearMeasurementTypesByLabel(): void {
    // Simplified - no filter component dependency
  }

   /**
   * Force immediate clearing - simplified without filter component
   */
  private _forceImmediateClearAllMeasurementTypes(): void {
    // Simplified - no filter component dependency
  }

  /**
   * Select relevant authors and pages - simplified without filter component
   */
  private _selectRelevantAuthorsAndPages(annotationsEnabled: boolean, measurementsEnabled: boolean): void {
    // Simplified - no filter component dependency
  }

  /**
   * Synchronize filter selections - simplified without filter component
   */
  private _syncFiltersWithVisibleMarkups(): void {
    // Simplified - no filter component dependency
  }

  /**
   * Enhanced method to ensure proper synchronization - simplified without filter component
   */
  private _ensureFilterSynchronization(): void {
    // Simplified - no filter component dependency
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

  // Add flag to prevent circular event handling
  private isProcessingFilterChange: boolean = false;

  onShowType($event: any, type : any) {

    // Prevent circular event handling
    if (this.isProcessingFilterChange) {
      return;
    }

    // Check if this is coming from the filter component with enhanced data
    if ($event.isSelected !== undefined && $event.action !== undefined) {
      // This is a filter-driven change, use the enhanced handler

      // Set flag to prevent circular processing
      this.isProcessingFilterChange = true;

      try {
        // Use the enhanced type matching function for better accuracy
        this._handleShowMarkupTypeEnhanced(type, {
          target: {
            checked: $event.isSelected
          }
        });
        
        // Refresh the list to apply the changes
        this._refreshAnnotationList();
      } finally {
        // Always clear the flag, even if an error occurs
        setTimeout(() => {
          this.isProcessingFilterChange = false;
        }, 100);
      }
      return;
    }

    // Check if this is a direct checkbox event (has target.checked property)
    if ($event.target && $event.target.checked !== undefined) {
      // This is a direct checkbox interaction - use your original simple logic

      // Set flag to prevent circular processing
      this.isProcessingFilterChange = true;

      try {
        // Use your original working logic for direct checkboxes
        this._handleShowMarkupType(type, $event, markup => markup.getMarkupType().label === type.label);
      } finally {
        // Always clear the flag, even if an error occurs
        setTimeout(() => {
          this.isProcessingFilterChange = false;
        }, 100);
      }
      return;
    }


    // For button clicks, we need to toggle the current state
    const currentState = this.showType(type);
    const newState = !currentState;


    // Set flag to prevent circular processing
    this.isProcessingFilterChange = true;

    try {
    // Create a mock event object that mimics checkbox behavior for compatibility
    const mockEvent = {
      target: {
        checked: newState
      }
    };

      // Use your original working logic
    this._handleShowMarkupType(type, mockEvent, markup => markup.getMarkupType().label === type.label);
    } finally {
      // Always clear the flag, even if an error occurs
      setTimeout(() => {
        this.isProcessingFilterChange = false;
      }, 100);
    }
  }

  /**
   * Enhanced type handling with better matching and consistent behavior
   */
  private _handleShowMarkupTypeEnhanced(type: any, event: any): void {

    // Update the rxTypeFilter state
    this._setmarkupTypeDisplayFilter(type, event.target.checked);
    this.rxTypeFilterLoaded = this.rxTypeFilter.filter((rxtype) => rxtype.loaded);

    // Define comprehensive type matching function
    const typeMatchFunction = (markup: any) => {
      // First try exact type/subtype matching
      if (type.type !== undefined && type.subtype !== undefined) {
        const typeMatch = parseInt(type.type) === markup.type;
        const subtypeMatch = type.subtype === '' || parseInt(type.subtype) === markup.subtype;
        if (typeMatch && subtypeMatch) {
          return true;
        }
      }

      // Fallback to typename matching for legacy compatibility
      const markupType = RXCore.getMarkupType(markup.type, markup.subtype);
      let markupTypename = markupType.type;
      
      if (Array.isArray(markupType.type)) {
        markupTypename = markupType.type[1];
      }

      const typenameMatch = type.typename === markupTypename;
      if (typenameMatch) {
        return true;
      }

      // Additional safety check using label matching as last resort
      const labelMatch = markup.getMarkupType().label === type.label;
      if (labelMatch) {

        return true;
      }

      return false;
    };

    // Apply the visibility change to canvas markups
    this._updateMarkupDisplay(
      this.rxCoreService.getGuiMarkupList(),
      typeMatchFunction,
      event.target.checked
    );


    // Sync the filter component selections to reflect the change
    setTimeout(() => {
      // Only sync if we're not already processing a filter change (prevent circular updates)
      if (!this.isProcessingFilterChange) {
        this._syncFilterSelectionsWithTypeState();
      }
    }, 50);

    // Wait for DOM to be ready and then update leader line position
    setTimeout(() => {
      this._waitForDOMAndUpdateLeaderLine();
    }, 100);
  }

  /**
   * Enhanced method to handle individual filter type changes from the filter component
   */
  private _handleFilterTypeChange(typeValue: string, isSelected: boolean): void {
    
    // Find the corresponding type object in rxTypeFilterLoaded
    const typeObj = this.rxTypeFilterLoaded.find(t => {
      const value = t.value || t.typename || (t.subtype ? `${t.type}_${t.subtype}` : t.type);
      return value === typeValue;
    });

    if (!typeObj) {
      console.warn('❌ Could not find type object for value:', typeValue);
      return;
    }


    // Create mock event for compatibility
    const mockEvent = {
      target: {
        checked: isSelected
      }
    };

    // Use the enhanced handler
    this._handleShowMarkupTypeEnhanced(typeObj, mockEvent);
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
        
        // Also update individual markups to respect switch states
        this._updateAuthorMarksWithSwitchRespect(author, false);
      }

    } else {
      this.authorFilter.add(author);

      RXCore.SetUserMarkupdisplay(userindx, true);
      //turn on display for this user
      
      // Also update individual markups to respect switch states
      this._updateAuthorMarksWithSwitchRespect(author, true);

    }

    // Apply the complete filter including both switches and author selection
    this._applySortFilterToCanvas();
    
    this._refreshAnnotationList();
  }

  // Removed comment card event handlers

  // Handle filter count changes from the comments list filters component
  onFilterCountChange(count: number): void {
    this.activeFilterCount = count;
  }

    // Clear all filters
  clearAllFilters(): void {
    
    // Reset date filter
    this.dateFilter = {
      startDate: undefined,
      endDate: undefined
    };
    
    // Reset page filter
    this.pageNumber = -1;
    
    // Reset sort filter
    this.selectedSortFilterValues = [...this.sortFilterOptions.map(option => option.value)];
    this.sortFilterOptions.forEach(option => option.selected = true);
    this.sortFilterDateRange = { startDate: undefined, endDate: undefined };
    
    // Apply the reset sort filter to canvas
    this._applySortFilterToCanvas();
    
    // Reset canvas annotations to show based on switch states only
    this._resetCanvasAnnotationsDateFilter();
    
    // If switches are active, apply them to ensure proper visibility
    if(this.showAnnotations){
      this.onToggleAnnotations(true);
    }
    
    if(this.showMeasurements){
      this.onToggleMeasurements(true);
    }

    // Reset author filters in note-panel
    this.authorFilter = new Set(this.getUniqueAuthorList());
    
    // Reset individual annotation visibility (eye icon)
    this.resetAllAnnotationVisibility();
    
    // Trigger author selection in comment-list-filter component
    this.triggerAuthorSelection();
    
    // Reprocess the list to show all comment cards after clearing filters
    this._processList(this.rxCoreService.getGuiMarkupList());
    
  }

  /**
   * Reset canvas annotations when date filter is cleared
   */
  private _resetCanvasAnnotationsDateFilter(): void {
    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;


    markupList.forEach((markup: any) => {
      // Show annotation based on switch states only (no date filtering)
      let shouldShow = true;
      
      if (markup.ismeasure) {
        shouldShow = this.showMeasurements === true;
      } else {
        shouldShow = this.showAnnotations === true;
      }
      
      markup.setdisplay(shouldShow);
    });

    // Redraw canvas to apply changes
    RXCore.markUpRedraw();
  }

  // Method to trigger author selection - simplified without filter component
  triggerAuthorSelection(): void {
    // Simplified - no filter component dependency
  }

  /**
   * Get annotation title based on type and subtype
   * @param type - The annotation type
   * @param subtype - The annotation subtype (optional)
   * @returns Human-readable title for the annotation
   */
  getAnnotationTitle(type: number, subtype?: number): string {
    // Handle cases with both type and subtype
    if (subtype !== undefined && subtype !== null) {
      switch (type) {
        case 0:
          if (subtype === 0) return 'Freehand';
          if (subtype === 1) return 'Erase';
          break;
        case 1:
          if (subtype === 1) return 'Polyline';
          if (subtype === 2) return 'Polygon';
          if (subtype === 3) return 'Path Measure';
          if (subtype === 4) return 'Angle Clockwise';
          if (subtype === 5) return 'Angle Counter-Clockwise';
          break;
        case 3:
          if (subtype === 0) return 'Rectangle';
          if (subtype === 1) return 'Rounded Rectangle';
          if (subtype === 3) return 'Highlighter';
          if (subtype === 6) return 'Rectangle Measure';
          break;
        case 5:
          if (subtype === 0) return 'Cloud';
          break;
        case 6:
          if (subtype === 0) return 'Arrow';
          if (subtype === 1) return 'Filled Arrow';
          if (subtype === 2) return 'Double Arrow';
          if (subtype === 3) return 'Filled Double Arrow';
          if (subtype === 6) return 'Callout';
          break;
        case 8:
          if (subtype === 0) return 'Area Measure';
          break;
        case 10:
          if (subtype === 0) return 'Note';
          break;
        case 11:
          if (subtype === 1) return 'Symbol';
          if (subtype === 3) return 'Signature';
          if (subtype === 12) return 'Stamp';
          break;
        case 14:
          if (subtype === 0) return 'Arc Measure';
          break;
      }
    }

    // Handle cases with only type
    switch (type) {
      case 4: return 'Ellipse';
      case 7: return 'Length Measure';
      case 9: return 'Text';
      case 13: return 'Count';
      case 20: return 'Link';
      default: return 'Unknown Annotation';
    }
  }

  /**
   * Sync filter selections - simplified without filter component
   */
  private _syncFilterSelectionsWithTypeState(): void {
    // Simplified - no filter component dependency
  }

  /**
   * Handle author filtering - similar to type filtering but for authors
   */
  onShowAuthor($event: any, author: any) {


    // Prevent circular event handling
    if (this.isProcessingFilterChange) {
      return;
    }

    // Check if this is coming from the filter component with enhanced data
    if ($event.isSelected !== undefined && $event.action !== undefined) {
      // This is a filter-driven change
      

      // Set flag to prevent circular processing
      this.isProcessingFilterChange = true;

      try {
        // Handle author filtering by updating canvas and comment list
        this._handleShowMarkupAuthor(author, {
          target: {
            checked: $event.isSelected
          }
        });
        
        // Refresh the list to apply the changes
        this._refreshAnnotationList();
      } finally {
        // Always clear the flag, even if an error occurs
        setTimeout(() => {
          this.isProcessingFilterChange = false;
        }, 100);
      }
      return;
    }

    // Check if this is a direct checkbox event (has target.checked property)
    if ($event.target && $event.target.checked !== undefined) {
      

      // Set flag to prevent circular processing
      this.isProcessingFilterChange = true;

      try {
        // Handle author filtering
        this._handleShowMarkupAuthor(author, $event);
      } finally {
        // Always clear the flag, even if an error occurs
        setTimeout(() => {
          this.isProcessingFilterChange = false;
        }, 100);
      }
      return;
    }
  }

  /**
   * Update individual author markups while respecting switch states
   */
  private _updateAuthorMarksWithSwitchRespect(authorName: string, isVisible: boolean): void {


    const markupList = this.rxCoreService.getGuiMarkupList();
    if (!markupList) return;

    // Update markups on canvas based on author
    for (const markup of markupList) {
      // Check if this markup belongs to the author
      const markupAuthor = RXCore.getDisplayName(markup.signature);
      if (markupAuthor === authorName) {

        
        // Respect the annotation/measurement switch states
        let shouldShow = isVisible;
        
        if (isVisible) {
          // Only show if the switches allow it
          if ((markup as any).ismeasure) {
            // This is a measurement - only show if measurements switch is ON
            shouldShow = this.showMeasurements === true;
          } else {
            // This is an annotation - only show if annotations switch is ON
            shouldShow = this.showAnnotations === true;
          }
          

        }
        
        // Update canvas display
        markup.setdisplay(shouldShow);
      }
    }

    // Redraw canvas
    RXCore.markUpRedraw();    
  }

  /**
   * Handle showing/hiding markups by author
   */
  private _handleShowMarkupAuthor(author: any, event: any): void {


    const markupList = this.rxCoreService.getGuiMarkupList();
    const isVisible = event.target.checked;

    if (!markupList) return;

    // Update markups on canvas based on author
    for (const markup of markupList) {
      // Check if this markup belongs to the author
      if (markup.signature === author.value) {
       
        
        // Respect the annotation/measurement switch states
        let shouldShow = isVisible;
        
        if (isVisible) {
          // Only show if the switches allow it
          if ((markup as any).ismeasure) {
            // This is a measurement - only show if measurements switch is ON
            shouldShow = this.showMeasurements === true;
          } else {
            // This is an annotation - only show if annotations switch is ON
            shouldShow = this.showAnnotations === true;
          }
        
        }
        
        // Update canvas display
        markup.setdisplay(shouldShow);
      }
    }

    // Redraw canvas
    RXCore.markUpRedraw();
    
    // Update comment list
    this._processList(markupList);

  }

  private _updateSwitchStates(): void {
    switch (this.currentMode) {
      case 'View':
        // Both switches enabled in View mode
        this.isAnnotationSwitchDisabled = false;
        this.isMeasurementSwitchDisabled = false;
        break;
      case 'Annotate':
        // Measurement switch disabled in Annotate mode
        this.isAnnotationSwitchDisabled = false;
        this.isMeasurementSwitchDisabled = true;
        break;
      case 'Measure':
        // Annotation switch disabled in Measure mode
        this.isAnnotationSwitchDisabled = true;
        this.isMeasurementSwitchDisabled = false;
        break;
      default:
        // Default to View mode behavior
        this.isAnnotationSwitchDisabled = false;
        this.isMeasurementSwitchDisabled = false;
    }
  }



}

