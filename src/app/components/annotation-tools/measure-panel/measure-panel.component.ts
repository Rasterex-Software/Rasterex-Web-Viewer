import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, distinctUntilChanged, Subscription } from 'rxjs';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { ScaleManagementService, ScaleWithPageRange } from 'src/app/services/scale-management.service';

import { RXCore } from 'src/rxcore';
import { MARKUP_TYPES, METRIC } from 'src/rxcore/constants';
import { AnnotationToolsService } from '../annotation-tools.service';
import { MeasurePanelService } from './measure-panel.service';
import { MetricUnitType, MeasurementSystem } from 'src/app/domain/enums';
import { 
  MeasureOption, 
  metricUnitsOptions, 
  imperialUnitsOptions, 
  precisionOptions, 
  presetOptions,
  imperialPresetOptions,
  metricSystemOptions,
  measurementSystemOptions,
  PresetOption,
  imperialPrecisionOptions,
} from 'src/app/shared/measure-options';
import { UserService } from '../../user/user.service';
import { FileScaleStorageService } from 'src/app/services/file-scale-storage.service';

@Component({
  selector: 'rx-measure-panel',
  templateUrl: './measure-panel.component.html',
  styleUrls: ['./measure-panel.component.scss'],
})
export class MeasurePanelComponent implements OnInit, OnDestroy {
  @Input() maxHeight: number = Number.MAX_SAFE_INTEGER;
  @Input() draggable: boolean = true;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('scaleUnitDropdown') scaleUnitDropdown: ElementRef;
  @ViewChild('scaleUnitTrigger') scaleUnitTrigger: ElementRef;
  @ViewChild('fractionScaleUnitTrigger') fractionScaleUnitTrigger: ElementRef;
  @ViewChild('fractionScaleUnitDropdown') fractionScaleUnitDropdown: ElementRef;
  private stateSubscription: Subscription;
  private guiMarkupSubscription: Subscription;
  private guifileloadSub: Subscription;
  bounds: HTMLElement = document.getElementById('mainContent') as HTMLElement;
  MetricUnitType = MetricUnitType;
  MeasurementSystem = MeasurementSystem;
  MARKUP_TYPES = MARKUP_TYPES;
  visible: boolean = false;
  created: boolean = true;
  type: number = MARKUP_TYPES.MEASURE.LENGTH.type;
  color: string;
  lengthMeasureType: number;
  strokeThickness: number;
  strokeLineStyle: number;
  snap: boolean;
  expandedIndex: number | null = 0;
  scaleUnits: {
    metric: MeasureOption[],
    imperial: MeasureOption[],
  } = {
    metric: metricUnitsOptions,
    imperial: imperialUnitsOptions,
  };
  precisionOptions = precisionOptions;
  imperialPrecisionOptions = imperialPrecisionOptions;
  metricSystemOptions = metricSystemOptions;
  measurementSystemOptions = measurementSystemOptions;
  presetOptions = presetOptions;
  imperialPresetOptions = imperialPresetOptions;
  selectedMetricType = MeasurementSystem.METRIC;
  selectedMeasurementSystem = MeasurementSystem.METRIC;

  

  selectedMetricUnit: MeasureOption = this.scaleUnits.metric[0];
  selectedMetricUnitFraction: MeasureOption = this.scaleUnits.imperial[1];

  selectedUnitOption: MeasureOption = this.scaleUnits.metric[0]; 
  selectedUnitFractionOption: MeasureOption = this.scaleUnits.imperial[1];
  
  selectedUnitFractionOptionInch: MeasureOption = this.scaleUnits.imperial[0];
  selectedUnitFractionOptionFoot: MeasureOption = this.scaleUnits.imperial[1];


  
  selectedScalePrecision: MeasureOption = precisionOptions[2];
  
  calibrateLength: number;
  calibrateTempScale:number = 1;
  calibrateLengthString: string;
  calibrateLengthFraction: string;
  calibrateCorrectionMetricValue: string = '';

  calibrateCorrectionFeetValue : string = '0';
  calibrateCorrectionInchValue : string = '0';

  measuredCalibrateLength: number;
  calibrateScale: string;
  isSelectedCalibrate: boolean;
  isCalibrateFinished: boolean;
  currentScale: string;
  isActivefile: boolean;
  setlabelonfileload: boolean = false;
  customPageScaleValue: number;
  customDisplayScaleValue: number;
  currentPageMetricUnitCalibrate = '';
  selectedScale: any;
  scalesOptions: any = [];
  isScaleUnitOpened: boolean = false;
  isScaleUnitOpenedFraction: boolean = false;
  isCalibrateModalOpened: boolean = false;
  scaleUnitOptions: MeasureOption[] = this.scaleUnits.metric;

  dontShowCalibrateAgain: boolean = false;
  isEditingScale: boolean = false;
  editingScaleOriginalLabel: string = '';

  imperialNumerator: number = 1;
  imperialDenominator: number = 1;

  // Page range properties
  selectedPageRanges: number[][] = [];
  totalPages: number = 0;
  currentPage: number = 0;

  // File-specific properties
  currentFile: any = null;
  isUpdatingScales = false; // Flag to prevent reloading scales during updates

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isScaleUnitOpened || this.isScaleUnitOpenedFraction) {
      const target = event.target as HTMLElement;
      if (!this.scaleUnitTrigger?.nativeElement?.contains(target) && 
          !this.scaleUnitDropdown?.nativeElement?.contains(target) &&
          !this.fractionScaleUnitTrigger?.nativeElement?.contains(target) &&
          !this.fractionScaleUnitDropdown?.nativeElement?.contains(target)) {
        this.isScaleUnitOpened = false;
        this.isScaleUnitOpenedFraction = false;
      }
    }
  }

  private _setDefaults(): void {
    this.created = false;
    this.color = '#FF0000';
    this.lengthMeasureType = 1;
    this.strokeThickness = 2;
    this.strokeLineStyle = 0;
    this.snap = true;
    this.calibrateLength = 0;
    this.calibrateLengthFraction = '0';
    this.measuredCalibrateLength = 0;
    this.calibrateScale = '';
    this.isSelectedCalibrate = false;
    this.isCalibrateFinished = false;
    this.customPageScaleValue = 1;
    this.customDisplayScaleValue = 1;
    this.resetEditingState();
    this.imperialNumerator = 1;
    this.imperialDenominator = 1;
    this.selectedPageRanges = [];
    this.expandedIndex = 0;
  }

  private metricTypeState$ = new BehaviorSubject<MeasurementSystem>(MeasurementSystem.METRIC);
  private metricTypeSub: Subscription;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly measurePanelService: MeasurePanelService,
    private readonly scaleManagementService: ScaleManagementService,
    private toastr: ToastrService,
    private userService: UserService,
    private fileScaleStorage: FileScaleStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._setDefaults();

    const dontShow = localStorage.getItem('dontShowCalibrateAgain');
    this.dontShowCalibrateAgain = dontShow === 'true';

    this.initializePageRangeData();
    this.initializeFileTracking();

    // Subscribe to user changes and reload user-specific scales
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.loadScalesForCurrentFile();
      } else {
        // User logged out, clear scales
        this.scalesOptions = [];
      }
    });

    // Listen to scale state changes (including deletion events)
    this.measurePanelService.scaleState$.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe((state) => {
      
      // If this is a deletion event, clear local scales and reload from file storage
      if (state?.deleted) {
        this.scalesOptions = [];
        this.selectedScale = null;
        this.loadScalesForCurrentFile();
        return;
      }
    });

    this.measurePanelService.measureScaleState$.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe(() => {
      // Load scales for current file
      this.loadScalesForCurrentFile();
    });

    this.metricTypeSub = this.metricTypeState$.subscribe(type => {
      this.selectedMeasurementSystem = type;
    });

    this.stateSubscription =
      this.annotationToolsService.measurePanelState$.subscribe((state) => {
        this.visible = state.visible;

        this.measurePanelService.setMeasureScaleState({ visible: true });

        if (this.visible) {
          // Load scales for current file when measure panel becomes visible
          this.loadScalesForCurrentFile();
          this.setCurrentPageScale();
        }

        if (!this.visible && this.isSelectedCalibrate) {
          this.cancelCalibrate();

          if (this.selectedScale) {
            this.applyScale(this.selectedScale);
          }

          this.measuredCalibrateLength = 0;
        }
      });

    this.rxCoreService.guiCalibrateFinished$.subscribe((state) => {

      this.calibrateLength = state.data;

      if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {

        this.calibrateLengthString = RXCore.getFractionString(this.calibrateLength, 32);

      } else {
        
        this.calibrateCorrectionMetricValue = this.calibrateLength.toFixed(this.countDecimals(this.selectedScalePrecision?.value as number)).toString();
        
      }

      this.measuredCalibrateLength = this.calibrateLength;


      this.isCalibrateFinished = state.isFinished;
      if (state.isFinished) {
        this.calibrateScale = this.currentScale;
      }
    });

    this.rxCoreService.guiConfig$.subscribe((config) => {
      if (config.disableMarkupMeasureButton === true) {
        this.visible = false;
      }
    });

    this.rxCoreService.guiState$.subscribe((state) => {
      if (state?.activefile) {
        this.isActivefile = true;
      }
    });

    this.rxCoreService.guiScaleListLoadComplete$.subscribe(() => {
      this.loadAndSetPageScale();
    });

    this.measurePanelService.measurePanelEditState$.subscribe((editState) => {
      if (editState && Object.keys(editState).length > 0) {
        this.mapEditStateToPanel(editState);
      }
    });

    // Wait for RXCore to be ready before applying scales
    this.rxCoreService.guiFoxitReady$.subscribe(() => {
      console.log('Measure panel: RXCore is ready, applying selected scale if available');
      if (this.selectedScale) {
        console.log('Measure panel: Applying first scale now that RXCore is ready...');
        this.applyScale(this.selectedScale);
      }
    });
  }

  ngOnDestroy(): void {
    this.stateSubscription?.unsubscribe();
    this.guiMarkupSubscription?.unsubscribe();
    this.guifileloadSub?.unsubscribe();
  }

  onLengthMeasureTypeChange(type: number): void {
    this.lengthMeasureType = type;
    if (this.created) {
      RXCore.markUpDimension(true, type);
    } else {
      RXCore.markUpSubType(type);
    }
  }

  onColorSelect(color): void {
    this.color = color;
    RXCore.setGlobalStyle(true);
    RXCore.changeStrokeColor(color);
  }

  onStrokeThicknessChange(): void {
    RXCore.setLineWidth(this.strokeThickness);
  }

  onStrokeLineStyleSelect(lineStyle: number): void {
    this.strokeLineStyle = lineStyle;
    RXCore.setLineStyle(lineStyle);
  }

  onSnapChange(onoff: boolean): void {
    RXCore.changeSnapState(onoff);
  }

  loadAndSetPageScale(): void {
    // Only load scales from RXCore if there's an active file
    const activeFile = RXCore.getOpenFilesList().find(file => file.isActive);
    if (activeFile && RXCore.getDocScales()) {
      // Only load scales from RXCore if we don't have user scales loaded
      if (!this.scalesOptions || this.scalesOptions.length === 0) {
        this.loadScaleList();
      }
      this.setCurrentPageScale();
    }
  }

  setCurrentPageScale(): void {
    const scaleLabel = RXCore.getCurrentPageScaleLabel();

    if (!scaleLabel) {
      return;
    }

    const currentPage = this.scaleManagementService.getCurrentPage();

    if (this.scaleManagementService.wasScaleRecentlyAutoApplied(currentPage)) {
      return;
    }

    if (this.scalesOptions.length) {
      // First, try to find a scale that matches the current page's scale label
      this.selectedScale = this.scalesOptions.find(
        (item) => item.label === scaleLabel
      );

      if (this.selectedScale) {
        this.currentScale = this.selectedScale?.label || '';
        this.measurePanelService.setMeasureScaleState({
          visible: true,
          value: this.currentScale,
        });
      } else {
        // If no exact match, try to find a scale that applies to the current page
        const currentPageNumber = currentPage + 1; // Convert to 1-based indexing
        const pageSpecificScale = this.scalesOptions.find(scale => 
          scale.pageRanges && scale.pageRanges.length > 0 &&
          scale.pageRanges.some(range => {
            const [start, end] = range;
            return currentPageNumber >= start && currentPageNumber <= end;
          })
        );
        
        if (pageSpecificScale) {
          this.selectedScale = pageSpecificScale;
          this.currentScale = this.selectedScale?.label || '';
          this.measurePanelService.setMeasureScaleState({
            visible: true,
            value: this.currentScale,
          });
        } else {
          // Fallback to the first available scale
          this.selectedScale = this.scalesOptions[0];
        }
      }
    }
  }

  selectMetricUnit(unit: MeasureOption): void {
    this.selectedUnitOption = unit;
    this.isScaleUnitOpened = false;
    this.isScaleUnitOpenedFraction = false;
  }

  selectMetricUnitFraction(unit: MeasureOption): void {
    this.selectedUnitFractionOption = unit;
    this.isScaleUnitOpenedFraction = false;
    this.isScaleUnitOpened = false;
  }

  onScalePrecisionChanged(precision: any): void {
    this.selectedScalePrecision = precision;
  }

  onCloseClick(): void {
    this._setDefaults();
    this.resetEditingState();
    this.annotationToolsService.setMeasurePanelState({ visible: false });
    this.cancelCalibrate();
    this.onClose.emit();
  }

  resetEditingState(): void {
    this.isEditingScale = false;
    this.editingScaleOriginalLabel = '';
  }

  calibrate(selected: boolean): void {
    RXCore.onGuiCalibratediag(onCalibrateFinished);
    let rxCoreSvc = this.rxCoreService;
    function onCalibrateFinished(data) {
      rxCoreSvc.setCalibrateFinished(true, data);
      RXCore.restoreDefault();
    }

    RXCore.calibrate(selected);
    this.annotationToolsService.setSnapState(true);
  }

  onCalibrateCheckedChange(event: boolean): void {
    this.isSelectedCalibrate = event;
    this.measuredCalibrateLength = 0.0;

    // Store the current selected scale before switching to calibrate mode
    const currentSelectedScale = this.selectedScale;

    this.isSelectedCalibrate ? this.calibrate(true) : this.cancelCalibrate();
    
    if (this.isSelectedCalibrate) {
      localStorage.setItem('dontShowCalibrateAgain', String(this.dontShowCalibrateAgain));
      this.isCalibrateModalOpened = false;
    } else {
      // Restore the selected scale when canceling calibrate
      if (currentSelectedScale) {
        this.selectedScale = currentSelectedScale;
        // Also restore the scale in RXCore if it was a valid scale
        if (currentSelectedScale.value && currentSelectedScale.value !== '1:1') {
          this.applyScale(currentSelectedScale);
        }
      }
    }
  }

  countDecimals(value: number): number {
    // Handle special case for "Rounded" precision (value = 1)
    if (value === 1) {
      return 0; // Rounded means 0 decimal places (whole numbers)
    }
    
    // For other precision values (0.1, 0.01, 0.001, etc.), 
    // calculate the number of decimal places
    if (value < 1) {
      return value.toString().split('.')[1].length;
    }
    
    return 0;
  }

  cancelCalibrate(): void {
    let snap = RXCore.getSnapState();
    RXCore.calibrate(false);

    this.isSelectedCalibrate = false;
    this.isCalibrateFinished = false;

    this.calibrateLength = 0;
    this.calibrateLengthFraction = '0';

    if (snap === false) {
      RXCore.changeSnapState(false);
    }
  }

  updateMeasureSystem(selectedMeasurementSystem: MeasurementSystem): void {
    RXCore.setUnit(selectedMeasurementSystem);
  }

  /*updateMetric(selectedMeasurementSystem: MeasurementSystem): void {
    
    
    switch (selectedMetricType) {
      case MeasurementSystem.METRIC:
        RXCore.setUnit(1);
        break;
      case MeasurementSystem.IMPERIAL:
        RXCore.setUnit(2);
        break;
    }
  }*/

  updateMeasureSystemUnit(metric: MeasurementSystem, measureUnit: string): void {
    if (metric === MeasurementSystem.METRIC) {
      RXCore.metricUnit(measureUnit);
    } else if (metric === MeasurementSystem.IMPERIAL) {
      RXCore.imperialUnit(measureUnit);
    }
  }

  /*updateMetricUnit(metric: MeasurementSystem, metricUnit: string): void {
    if (metric === MeasurementSystem.METRIC) {
      RXCore.metricUnit(metricUnit);
    } else if (metric === MeasurementSystem.IMPERIAL) {
      RXCore.imperialUnit(metricUnit);
    }
  }*/

  convertToMM(value: string): number {
    let unitScale = 1;

    if (value === 'Centimeter') {
      unitScale = 10;
    } else if (value === 'Decimeter') {
      unitScale = 100;
    } else if (value === 'Meter') {
      unitScale = 1000;
    } else if (value === 'Kilometer') {
      unitScale = 1000000;
    } else if (value === 'Nautical Miles') {
      unitScale = 185200000;
    } else if (value === 'Inch') {
      unitScale = 25.4;
    }

    return unitScale;
  }

  convertToInch(value: string): number {
    let unitScale = 1;

    if (value === 'Feet') {
      unitScale = 12;
    } else if (value === 'Yard') {
      unitScale = 36;
    } else if (value === 'Mile') {
      unitScale = 63360;
    } else if (value === 'Nautical Miles') {
      unitScale = 72913.3858;
    } else if (value === 'Millimeter') {
      unitScale = 0.0393701;
    } else if (value === 'Centimeter') {
      unitScale = 0.393701;
    }

    return unitScale;
  }


  calculateScale(): string {
    if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
      const drawingInches =
        Number(this.imperialNumerator) / Number(this.imperialDenominator);
  
      const realInches =
        Number(this.customDisplayScaleValue) *
        this.convertToInch(this.selectedUnitOption.label);
  
      if (!Number.isFinite(drawingInches) || drawingInches === 0) {
        return '1:1';
      }
  
      const scale = realInches / drawingInches;
  
      return `1:${scale}`;
    }
  
    const scaleForPage = Number(this.customPageScaleValue);
    const scaleForDisplay =
      Number(this.customDisplayScaleValue) *
      this.convertToMM(this.selectedUnitOption.label);
  
    return `${scaleForPage}:${scaleForDisplay}`;
  }  

  

  applyScale(selectedScaleObj: any): void {

    // Check if the scale is applicable to the current page
    const currentPage = this.scaleManagementService.getCurrentPage();
    if (!this.scaleManagementService.isScaleApplicableToPage(selectedScaleObj, currentPage + 1)) {
      console.warn(`Scale "${selectedScaleObj.label}" is not applicable to current page ${currentPage + 1}`);
      return;
    }

    this.updateMeasureSystem(selectedScaleObj.metric as MeasurementSystem);
    this.updateMeasureSystemUnit(selectedScaleObj.metric as MeasurementSystem, selectedScaleObj.metricUnit);
    RXCore.setDimPrecisionForPage(
      this.countDecimals(this.selectedScalePrecision?.value as number)
    );
    
    // Use precise value if available, otherwise fall back to display value
    const scaleValue = selectedScaleObj.preciseValue !== undefined 
      ? `1:${selectedScaleObj.preciseValue}` 
      : selectedScaleObj.value;
    
    RXCore.scale(scaleValue);
    RXCore.setScaleLabel(selectedScaleObj.label);

    // Redraw measurements to reflect the new scale
    RXCore.markUpRedraw();

    // Use the service to properly manage scale selection
    this.scaleManagementService.setSelectedScale(selectedScaleObj.label);
    this.scalesOptions = this.scaleManagementService.getScales();

    this.currentScale = selectedScaleObj.label;
    this.measurePanelService.setMeasureScaleState({
      visible: true,
      value: this.currentScale,
    });

    // Save selected scale to file storage
    if (this.currentFile) {
      this.fileScaleStorage.setSelectedScaleForFile(this.currentFile, selectedScaleObj);
    }

    if (this.isSelectedCalibrate) {
      this.isSelectedCalibrate = false;
      this.isCalibrateFinished = false;
    }

    if (this.setlabelonfileload) {
      this.setCurrentPageScale();
      this.setlabelonfileload = false;
    }
  }

  applyScaleToDefault(rerenderMeasurePanel = false): void {
    this.updateMeasureSystem(MeasurementSystem.METRIC);
    this.updateMeasureSystemUnit(MeasurementSystem.METRIC, 'Millimeter');
    RXCore.setDimPrecisionForPage(3);
    RXCore.scale('1:1');

    this.currentScale = 'Unscaled';
    this.measurePanelService.setMeasureScaleState({
      visible: true,
      value: this.currentScale,
    });

    if (rerenderMeasurePanel) {
      let mrkUp: any = RXCore.getSelectedMarkup();

      if (!mrkUp.isempty) {
        RXCore.unSelectAllMarkup();
        RXCore.selectMarkUpByIndex(mrkUp.markupnumber);
      }
    }
  }

  confirmCalibrate(): void {

    this.applyCalibrate();

    // switch from calibration view
    //this.isEditingScale = false;
    //this.isSelectedCalibrate = false;


    /*console.log('before populate', {
      imperialNumerator: this.imperialNumerator,
      imperialDenominator: this.imperialDenominator,
      customDisplayScaleValue: this.customDisplayScaleValue,
      customPageScaleValue: this.customPageScaleValue
    });*/


    // populate scale edit values



  }

  private getImperialScaleLabel(): string {
    const numerator = this.imperialNumerator || 1;
    const denominator = this.imperialDenominator || 1;
    const displayValue = this.customDisplayScaleValue || 1;
  
    if (this.selectedUnitOption.label === 'Feet') {
      return `${numerator}/${denominator}" = ${displayValue}'`;
    }
  
    if (this.selectedUnitOption.label === 'Inch') {
      return `${numerator}/${denominator}" = ${displayValue}"`;
    }
  
    return `${numerator}/${denominator}" = ${displayValue} ${this.selectedUnitOption.label}`;
  }
 
  addNewScale(): void {
    //const getPageScaleObject = RXCore.getPageScaleObject(0);

    // For imperial scales, use fraction format in the label
    let scaleLabel: string;
    if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
      scaleLabel = this.getImperialScaleLabel();
      //scaleLabel = `${this.imperialNumerator}/${this.imperialDenominator} = ${this.customDisplayScaleValue} ${this.selectedUnitOption.label}`;
    } else {

      scaleLabel = `${this.customPageScaleValue}:${this.customDisplayScaleValue} ${this.selectedUnitOption.label}`;
      //scaleLabel = `${this.customPageScaleValue} ${this.selectedUnitOption.label} : ${this.customDisplayScaleValue} ${this.selectedUnitOption.label}`;
    }
    let scale = this.calculateScale();

    if (this.isEditingScale) {
      // Set flag early to prevent race conditions
      this.isUpdatingScales = true;
      
      const existingScaleIndex = this.scalesOptions.findIndex(
        (item) => item.label === this.editingScaleOriginalLabel
      );

      if (existingScaleIndex !== -1) {



        // Extract precise value from the calculated scale string
        const scaleParts = scale.split(':');

        const pageScaleValue = scaleParts.length > 1 ? parseFloat(scaleParts[0]) : 1;
        const displayScaleValue = scaleParts.length > 1 ? parseFloat(scaleParts[1]) : 1;
        // For RXCore, we need the ratio of display to page scale
        const preciseValue = displayScaleValue / pageScaleValue;

        const updatedScale: ScaleWithPageRange = {
          value: scale,
          preciseValue: preciseValue, // Store precise value for accurate scaling
          label: scaleLabel,
          metric: this.selectedMeasurementSystem,
          metricUnit: this.selectedUnitOption.label,
          dimPrecision: this.countDecimals(this.selectedScalePrecision?.value as number),
          isSelected: true,
          pageRanges: this.selectedPageRanges,
          isGlobal: this.selectedPageRanges.length === 0 || 
                    (this.selectedPageRanges.length === 1 && 
                     this.selectedPageRanges[0][0] === 1 && 
                     this.selectedPageRanges[0][1] === this.totalPages),
          imperialNumerator: this.imperialNumerator,
          imperialDenominator: this.imperialDenominator,
        };

        // Update the scale in the service
        this.scaleManagementService.updateScale(this.editingScaleOriginalLabel, updatedScale);
        
        // Update local state from service
        this.scalesOptions = this.scaleManagementService.getScales();
        this.selectedScale = this.scalesOptions.find(scale => scale.isSelected);
        
        if (this.selectedScale) {
          this.applyScale(this.selectedScale);
        }

        this.currentScale = this.selectedScale?.label || '';

        this.measurePanelService.setMeasureScaleState({
          visible: true,
          value: this.currentScale,
        });
        this.measurePanelService.setScaleState({
          created: true,
          scaleLabel: this.selectedScale?.label || '',
          scalesOptions: this.scalesOptions, // Pass the updated scales
        });

        // Update scale list for current file BEFORE closing the panel
        if (this.currentFile) {
          this.fileScaleStorage.saveScalesForFile(this.currentFile, this.scalesOptions);
          this.fileScaleStorage.setSelectedScaleForFile(this.currentFile, this.selectedScale);
          
          // Update scale management service to notify other components
          this.scaleManagementService.setScales(this.scalesOptions);
        }
        
        this.isUpdatingScales = false; // Allow other components to reload scales again

        this.isEditingScale = false;
        this.editingScaleOriginalLabel = '';

        this.onCloseClick();
        return;
      } else {
        // Reset editing state and fall through to add new scale logic
        this.isEditingScale = false;
        this.editingScaleOriginalLabel = '';
        this.isUpdatingScales = false; 
      }
    }

    const scaleObj = this.scalesOptions.find(
      (item) => item.label === scaleLabel
    );

    if (scaleObj) {
      this.selectedScale = scaleObj;
      this.applyScale(this.selectedScale);
      this.onCloseClick();
      return;
    }

    // Extract precise value from the calculated scale string
    const scaleParts = scale.split(':');

    const pageScaleValue = scaleParts.length > 1 ? parseFloat(scaleParts[0]) : 1;
    const displayScaleValue = scaleParts.length > 1 ? parseFloat(scaleParts[1]) : 1;
    // For RXCore, we need the ratio of display to page scale
    const preciseValue = displayScaleValue / pageScaleValue;
    

    let obj: ScaleWithPageRange = {
      value: scale,
      preciseValue: preciseValue, // Store precise value for accurate scaling
      label: scaleLabel,
      metric: this.selectedMeasurementSystem,
      metricUnit: this.selectedUnitOption.label,
      dimPrecision: this.countDecimals(this.selectedScalePrecision?.value as number),
      isSelected: true,
      pageRanges: this.selectedPageRanges,
      isGlobal: this.selectedPageRanges.length === 0 || 
                (this.selectedPageRanges.length === 1 && 
                 this.selectedPageRanges[0][0] === 1 && 
                 this.selectedPageRanges[0][1] === this.totalPages),
      imperialNumerator: this.imperialNumerator,
      imperialDenominator: this.imperialDenominator,
    };

    console.log('obj', obj);

    // Use the scale management service to add the scale (handles file storage automatically)
    this.scaleManagementService.addScale(obj);
    
    // Update local state from service (which now has proper selection state)
    this.scalesOptions = this.scaleManagementService.getScales();
    this.selectedScale = this.scalesOptions.find(scale => scale.isSelected);
    
    if (this.selectedScale) {
      this.applyScale(this.selectedScale);
    }

    this.currentScale = this.selectedScale?.label || '';

    this.measurePanelService.setMeasureScaleState({
      visible: true,
      value: this.currentScale,
    });
    this.measurePanelService.setScaleState({
      created: true,
      scaleLabel: this.selectedScale?.label || '',
      scalesOptions: this.scalesOptions,
    });

    this.onCloseClick();
  }

  private populateScaleEditorFromCalibration(calibrationScale: number): void {
    if (!Number.isFinite(calibrationScale)) {
      return;
    }
  
    if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
      // calibrationScale = real inches per drawing inch
      const drawingInchesForOneFoot = 12 / calibrationScale;
  
      const fraction = RXCore.getFractionScaleParts(drawingInchesForOneFoot, 32);
  
      this.imperialNumerator = fraction.numerator;
      this.imperialDenominator = fraction.denominator;
      this.customDisplayScaleValue = 1;
      this.selectedUnitOption = this.scaleUnits.imperial[1]; // Feet
    } else {
      this.customPageScaleValue = 1;
      this.customDisplayScaleValue = Number(calibrationScale.toFixed(2));
    }
  
    this.isEditingScale = false;
    this.isSelectedCalibrate = false;

    /*this.customPageScaleValue
    this.customDisplayScaleValue
    this.imperialNumerator
    this.imperialDenominator
    this.selectedUnitOption*/


  }

  private getConvertedCalibrateLength(): number {

    if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
  
      const feet = parseFloat(this.calibrateCorrectionFeetValue) || 0;
      const inches = parseFloat(this.calibrateCorrectionInchValue) || 0;
  
      return (feet * 12) + inches;
    }
  
    const metricValue = parseFloat(this.calibrateCorrectionMetricValue);
  
    if (!Number.isFinite(metricValue)) {
      return NaN;
    }
  
    return metricValue * this.convertToMM(this.selectedUnitOption.label);
  }



  applyCalibrate(): void {
    const calibrateconn = RXCore.getCalibrateGUI();
  
    const convertedCalibrateLength = this.getConvertedCalibrateLength();
  
    if (!Number.isFinite(convertedCalibrateLength)) {
      return;
    }
  
    calibrateconn.SetTempCal(convertedCalibrateLength);
      
    this.calibrateTempScale = calibrateconn.getCalibrationScale();
  
    if (!Number.isFinite(this.calibrateTempScale)) {
      return;
    }
  
    this.populateScaleEditorFromCalibration(this.calibrateTempScale);

  
    this.isEditingScale = false;
    this.isSelectedCalibrate = false;
  }

  

  loadScaleList(): void {
    if (!this.scalesOptions || this.scalesOptions.length === 0) {

      // Only load scales from RXCore if there's an active file
      const activeFile = RXCore.getOpenFilesList().find(file => file.isActive);

      if (activeFile) {
        const scales: any = RXCore.getDocScales();

        if (scales && scales.length) {
          this.scalesOptions = this.ensureImperialScaleProperties(scales);
        } else {
          this.insertUnscaled();
        }
  
      }else{
        this.scalesOptions = [];
        this.selectedScale = null;
        this.applyScaleToDefault();
      }

      

    }
  }

  insertUnscaled(): void {
    this.currentScale = 'Unscaled';
    this.measurePanelService.setMeasureScaleState({
      visible: true,
      value: this.currentScale,
    });
  }

  setPropertySelected(array: any[], property: string, conditionKey: string, conditionValue: any): any[] {
    array.forEach(obj => obj[property] = false);
    array.forEach(obj => {
      if (obj[conditionKey] === conditionValue) {
        obj[property] = true;
      }
    });
    return array;
  }

  showSuccess(): void {
    this.toastr.success(
      'Start measuring by selecting one of the measurement tools.',
      'Scale has been successfully set',
      {
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      }
    );
  }

  onRadioSelectionChange(value: MeasurementSystem): void {
    this.metricTypeState$.next(value);

    
    this.updateMeasureSystem(value);
    
    this.selectedMeasurementSystem = value;
    if (this.selectedMeasurementSystem === MeasurementSystem.METRIC) {
      this.customPageScaleValue = 1;
      this.customDisplayScaleValue = 1;
      this.scaleUnitOptions = this.scaleUnits.metric;
      this.selectedUnitOption = this.scaleUnits.metric[0];
      this.selectedScalePrecision = this.precisionOptions[2];
    } else {
      this.customPageScaleValue = 1/1;
      this.customDisplayScaleValue = 1;
      this.imperialNumerator = 1;
      this.imperialDenominator = 1;

      this.scaleUnitOptions = this.scaleUnits.imperial;
      this.selectedUnitOption = this.scaleUnits.imperial[0];
      this.selectedScalePrecision = this.imperialPrecisionOptions[0];

      this.setImperialFractionFromValue(this.customPageScaleValue);
    }
  }

  onExpandedIndexChange(index: number | null): void {
    if (this.expandedIndex !== index) {
      this.expandedIndex = index;
    }
  }

  onPresetChanged(preset: PresetOption): void {
    this.customPageScaleValue = preset.pageScaleValue;
    this.customDisplayScaleValue = preset.customScaleValue;

    if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
      if (preset.imperialNumerator && preset.imperialDenominator) {
        this.imperialNumerator = preset.imperialNumerator;
        this.imperialDenominator = preset.imperialDenominator;
      } else {
        this.setImperialFractionFromValue(preset.pageScaleValue);
      }
    }
  }

  onCalibrateButtonClick(): void {
    

    if (this.dontShowCalibrateAgain) {
      this.onCalibrateCheckedChange(true);
    } else {
      this.isCalibrateModalOpened = true;
    }
  }

  private findUnitOption(metricType: number, unitLabel: string): MeasureOption | undefined {
    const unitList = metricType === MeasurementSystem.METRIC ? this.scaleUnits.metric : this.scaleUnits.imperial;
    return unitList.find(u => u.label === unitLabel);
  }
  

  private getImperialDisplayValue(scale: any): number {
    return Number(scale.customDisplayScaleValue ?? scale.displayScaleValue ?? 1);
  }
  
  private getMetricPageValue(scale: any): number {
    const value = scale.value?.includes(':')
      ? Number(scale.value.split(':')[0])
      : Number(scale.pageScaleValue ?? 1);
  
    return Number.isFinite(value) ? value : 1;
  }
  
  private getMetricDisplayValue(scale: any): number {
    const internalDisplayValue = scale.value?.includes(':')
      ? Number(scale.value.split(':')[1])
      : Number(scale.displayScaleValue ?? scale.customScaleValue ?? 1);
  
    const unitScale = this.convertToMM(scale.metricUnit);
  
    const displayValue = internalDisplayValue / unitScale;
  
    return Number.isFinite(displayValue) ? displayValue : 1;
  }

  mapEditStateToPanel(editState: any): void {
    this.isEditingScale = true;


    this.selectedMeasurementSystem = editState.metric;

    const unitOption = this.findUnitOption(editState.metric, editState.metricUnit);

    if (unitOption) {
      this.selectedUnitOption = unitOption; // safe assignment
    } else {
      console.warn(`Unit option not found for ${editState.metricUnit}, keeping previous selection.`); 
    }

    if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
      this.imperialNumerator = editState.imperialNumerator ?? 1;
      this.imperialDenominator = editState.imperialDenominator ?? 1;
      this.customDisplayScaleValue = this.getImperialDisplayValue(editState);
    } else {
      this.customPageScaleValue = this.getMetricPageValue(editState);
      this.customDisplayScaleValue = this.getMetricDisplayValue(editState);
    }

    if (editState.metricType !== undefined) {
      this.selectedMeasurementSystem = editState.metricType;
      this.onRadioSelectionChange(editState.metricType);
    }

    if (editState.metricUnit) {
      const unitOptions = this.selectedMeasurementSystem === MeasurementSystem.METRIC ? 
        this.scaleUnits.metric : this.scaleUnits.imperial;
      const unit = unitOptions.find(u => u.label === editState.metricUnit);
      if (unit) {
        this.selectedUnitOption = unit;
      }
    }

    if (editState.precision !== undefined) {
      if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
        this.selectedScalePrecision = imperialPrecisionOptions[0];
      } else {
        const precisionValue = editState.precision === 0 ? 1 : (1 / Math.pow(10, editState.precision));
        const precision = this.precisionOptions.find(p => p.value === precisionValue);
        if (precision) {
          this.selectedScalePrecision = precision;
        }
      }
    }

    if (editState.pageScaleValue !== undefined) {
      this.customPageScaleValue = editState.pageScaleValue;
      if (this.selectedMeasurementSystem === MeasurementSystem.IMPERIAL) {
        this.setImperialFractionFromValue(editState.pageScaleValue);
      }
    }

    if (editState.displayScaleValue !== undefined) {
      this.customDisplayScaleValue = editState.displayScaleValue;
    }

    this.editingScaleOriginalLabel = editState.originalLabel || '';
    

    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.selectedPageRanges = editState.pageRanges || (this.totalPages > 0 ? [[1, this.totalPages]] : []);
      this.cdr.detectChanges();
    }, 0);
  }

  onImperialFractionChange(): void {
    this.customPageScaleValue = this.imperialDenominator > 0 ? (this.imperialNumerator / this.imperialDenominator) : 0;
  }

  setImperialFractionFromValue(value: number): void {
    const fractions = [
      [1, 1], [1, 2], [1, 4], [1, 8], [1, 16], [1, 32], [1, 64], [1, 128],
      [3, 2], [3, 4], [3, 8], [3, 16], [3, 32], [3, 64],
      [5, 4], [5, 8], [5, 16], [5, 32],
      [7, 4], [7, 8], [7, 16], [7, 32]
    ];

    let closestFraction = [1, 1];
    let minDifference = Math.abs(value - 1);

    for (const [num, den] of fractions) {
      const fractionValue = num / den;
      const difference = Math.abs(value - fractionValue);
      if (difference < minDifference) {
        minDifference = difference;
        closestFraction = [num, den];
      }
    }

    this.imperialNumerator = closestFraction[0];
    this.imperialDenominator = closestFraction[1];
  }

  onPageRangeChange(pageRanges: number[][]): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.selectedPageRanges = pageRanges;
    }, 0);    
  }

  setScaleForCurrentPage(): void {
    const currentPage = this.scaleManagementService.getCurrentPage();

    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.selectedPageRanges = [[currentPage + 1, currentPage + 1]];
    }, 0);
    

  }

  getPageRangeDescription(): string {
    if (!this.selectedPageRanges || this.selectedPageRanges.length === 0) {
      return 'All pages';
    }

    const descriptions = this.selectedPageRanges.map(range => {
      if (range[0] === range[1]) {
        return `Page ${range[0]}`;
      } else {
        return `Pages ${range[0]}-${range[1]}`;
      }
    });

    return descriptions.join(', ');
  }

  hasConflictingScales(): boolean {
    if (!this.selectedPageRanges || this.selectedPageRanges.length === 0) {
      return false;
    }

    const conflicts = this.scaleManagementService.getConflictingScales({
      label: this.isEditingScale ? this.editingScaleOriginalLabel : '',
      value: '',
      metric: this.selectedMeasurementSystem,
      metricUnit: this.selectedUnitOption.label,
      dimPrecision: this.countDecimals(this.selectedScalePrecision?.value as number),
      isSelected: false,
      pageRanges: this.selectedPageRanges
    });

    return conflicts.length > 0;
  }

  onFractionScaleUnitTriggerClick(): void {
    this.isScaleUnitOpenedFraction = !this.isScaleUnitOpenedFraction;
    this.isScaleUnitOpened = false;
  }

  onScaleUnitTriggerClick(): void {
    this.isScaleUnitOpened = !this.isScaleUnitOpened;
    this.isScaleUnitOpenedFraction = false;
  }

  private initializePageRangeData(): void {
    this.rxCoreService.guiState$.subscribe(state => {
      if (state?.numpages !== undefined) {
        this.totalPages = state.numpages;
        this.setDefaultPageRange();
      }
    });

    this.rxCoreService.guiPage$.subscribe(pageState => {
      if (pageState?.currentpage !== undefined) {
        this.currentPage = pageState.currentpage;
      }

      this.loadAndSetPageScale();
    });
  }

  private setDefaultPageRange(): void {
    if (this.totalPages > 0 && this.selectedPageRanges.length === 0) {


      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.selectedPageRanges = [[1, this.totalPages]];
        this.cdr.detectChanges();
      }, 0);
    }
  }

  private ensureImperialScaleProperties(scales: any[]): any[] {
    if (!scales || !Array.isArray(scales)) {
      return [];
    }
    return scales.map(scale => {
      const updatedScale = { ...scale };
      
      // Ensure imperial properties
      if (scale.metric === MeasurementSystem.IMPERIAL) {
        updatedScale.imperialNumerator = scale.imperialNumerator || 1;
        updatedScale.imperialDenominator = scale.imperialDenominator || 1;
      }
      
      // Ensure precise value is available (extract from value string if not present)
      if (updatedScale.preciseValue === undefined && updatedScale.value) {
        const scaleParts = updatedScale.value.split(':');
        if (scaleParts.length > 1) {

          const pageScaleValue = parseFloat(scaleParts[0]);
          const displayScaleValue = parseFloat(scaleParts[1]);
          // For RXCore, we need the ratio of display to page scale
          updatedScale.preciseValue = displayScaleValue / pageScaleValue;

        }
      }
      
      return updatedScale;
    });
  }

  private initializeFileTracking(): void {
    // Track file changes
    this.rxCoreService.guiState$.subscribe(state => {
      const file = RXCore.getOpenFilesList().find(file => file.isActive);
      
      if (file && (!this.currentFile || this.currentFile.index !== file.index)) {
        this.currentFile = file;
        this.loadScalesForCurrentFile();

        // Force apply the selected scale for the new file
        // Fix any inconsistencies in selected scales

        setTimeout(() => {
          this.forceApplySelectedScaleForCurrentFile();
          this.fileScaleStorage.fixSelectedScaleConsistency();
        }, 100);

      }else if (!file && this.currentFile) {
        // All files are closed, clear scales and reset to default
        this.currentFile = null;
        this.scalesOptions = [];
        this.selectedScale = null;
        this.applyScaleToDefault();
        // Clear all stored scales when no files are active
        this.fileScaleStorage.clearAllScales();
      }
    });
  }

  private loadScalesForCurrentFile(): void {
    // Prevent reloading scales when we're in the middle of updating them
    if (this.isUpdatingScales) {
      return;
    }

    if (!this.currentFile) {
      // Try to get current file
      const file = RXCore.getOpenFilesList().find(file => file.isActive);
      if (file) {
        this.currentFile = file;
      } else {
        return;
      }
    }

    // First try to load from file-specific storage
    const fileScales = this.fileScaleStorage.getScalesForFile(this.currentFile);
    const selectedFileScale = this.fileScaleStorage.getSelectedScaleForFile(this.currentFile);

    if (fileScales && fileScales.length > 0) {
      this.scalesOptions = this.ensureImperialScaleProperties(fileScales);
      this.selectedScale = selectedFileScale || this.scalesOptions[0];
      
      // Apply the selected scale if RXCore is ready
      if (this.selectedScale) {
        this.applyScale(this.selectedScale);
      }
      return;
    }

    // For new files, start with empty scales array instead of inheriting from other sources
    this.scalesOptions = [];
    this.selectedScale = null;
    this.applyScaleToDefault();
  }

  private forceApplySelectedScaleForCurrentFile(): void {
    if (!this.currentFile) {
      return;
    }
    
    // Get the selected scale for this file
    const selectedFileScale = this.fileScaleStorage.getSelectedScaleForFile(this.currentFile);
    
    if (selectedFileScale) {
      // Update the local selected scale
      this.selectedScale = selectedFileScale;
      this.applyScale(selectedFileScale);
    } else {
      // Reset to default scale if no selected scale
      this.selectedScale = null;
      this.applyScaleToDefault();
    }
  }
}
