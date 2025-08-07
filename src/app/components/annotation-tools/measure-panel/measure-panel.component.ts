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
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, distinctUntilChanged, Subscription } from 'rxjs';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { ScaleManagementService, ScaleWithPageRange } from 'src/app/services/scale-management.service';
import { RXCore } from 'src/rxcore';
import { MARKUP_TYPES, METRIC } from 'src/rxcore/constants';
import { AnnotationToolsService } from '../annotation-tools.service';
import { MeasurePanelService } from './measure-panel.service';
import { MetricUnitType } from 'src/app/domain/enums';
import { 
  MeasureOption, 
  metricUnitsOptions, 
  imperialUnitsOptions, 
  precisionOptions, 
  presetOptions,
  imperialPresetOptions,
  metricSystemOptions,
  PresetOption,
  imperialPrecisionOptions,
} from 'src/app/shared/measure-options';
import { UserScaleStorageService } from 'src/app/services/user-scale-storage.service';
import { UserService } from '../../user/user.service';
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
  private stateSubscription: Subscription;
  private guiMarkupSubscription: Subscription;
  private guifileloadSub: Subscription;
  bounds: HTMLElement = document.getElementById('mainContent') as HTMLElement;
  MetricUnitType = MetricUnitType;
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
  presetOptions = presetOptions;
  imperialPresetOptions = imperialPresetOptions;
  selectedMetricType = MetricUnitType.METRIC;
  selectedMetricUnit: MeasureOption = this.scaleUnits.metric[0];
  selectedScalePrecision: MeasureOption = precisionOptions[2];
  calibrateLength: string;
  measuredCalibrateLength: string;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isScaleUnitOpened) {
      const target = event.target as HTMLElement;
      if (!this.scaleUnitTrigger?.nativeElement?.contains(target) && 
          !this.scaleUnitDropdown?.nativeElement?.contains(target)) {
        this.isScaleUnitOpened = false;
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
    this.calibrateLength = '0';
    this.measuredCalibrateLength = '0';
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

  private metricTypeState$ = new BehaviorSubject<MetricUnitType>(MetricUnitType.METRIC);
  private metricTypeSub: Subscription;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly measurePanelService: MeasurePanelService,
    private readonly scaleManagementService: ScaleManagementService,
    private toastr: ToastrService,
    private userScaleStorage: UserScaleStorageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this._setDefaults();

    const dontShow = localStorage.getItem('dontShowCalibrateAgain');
    this.dontShowCalibrateAgain = dontShow === 'true';

    this.initializePageRangeData();

    // Subscribe to user changes and reload user-specific scales
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        const userScales = this.userScaleStorage.getScales(user.id);
        if (userScales && userScales.length > 0) {
          this.scalesOptions = this.ensureImperialScaleProperties(userScales);
          // Select the first scale but don't apply it yet - wait for RXCore to be ready
          this.selectedScale = this.scalesOptions[0];
          // Don't apply the scale yet - we'll do it when RXCore is ready
        } else {
          this.scalesOptions = [];
        }
      } else {
        // User logged out, clear scales
        this.scalesOptions = [];
      }
    });

    this.measurePanelService.measureScaleState$.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe(() => {
      // Only update scales from RXCore if we don't have user scales loaded
      if (!this.scalesOptions || this.scalesOptions.length === 0) {
        this.scalesOptions = this.ensureImperialScaleProperties(RXCore.getDocScales());
      }
    });

    this.metricTypeSub = this.metricTypeState$.subscribe(type => {
      this.selectedMetricType = type;
    });

    this.stateSubscription =
      this.annotationToolsService.measurePanelState$.subscribe((state) => {
        this.visible = state.visible;

        this.measurePanelService.setMeasureScaleState({ visible: true });

        if (this.visible) {
          this.setCurrentPageScale();
        }

        if (!this.visible && this.isSelectedCalibrate) {
          this.cancelCalibrate();

          if (this.selectedScale) {
            this.applyScale(this.selectedScale);
          }

          this.measuredCalibrateLength = '0';
        }
      });

    this.rxCoreService.guiCalibrateFinished$.subscribe((state) => {
      this.calibrateLength = parseFloat(state.data || '0').toFixed(
        this.countDecimals(this.selectedScalePrecision?.value as number)
      );
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
    if (RXCore.getDocScales()) {
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
      this.selectedScale = this.scalesOptions.find(
        (item) => item.label === scaleLabel
      );

      if (this.selectedScale) {
        this.currentScale = this.selectedScale.label;
        this.measurePanelService.setMeasureScaleState({
          visible: true,
          value: this.currentScale,
        });
      } else {
        this.selectedScale = this.scalesOptions[0];
      }
    }
  }

  selectMetricUnit(unit: MeasureOption): void {
    this.selectedMetricUnit = unit;
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
    // Don't call applyScaleToDefault() as it resets the selected scale
    // Just set the basic calibration parameters without changing the current scale
    
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
    this.measuredCalibrateLength = '0.00';

    // Store the current selected scale before switching to calibrate mode
    const currentSelectedScale = this.selectedScale;

    this.isSelectedCalibrate ? this.calibrate(true) : this.cancelCalibrate();
    
    if (this.isSelectedCalibrate) {
      localStorage.setItem('dontShowCalibrateAgain', String(this.dontShowCalibrateAgain));
      this.isCalibrateModalOpened = false;
      // Don't change the selected scale when entering calibrate mode
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
    return value % 1 ? value.toString().split('.')[1].length : 0;
  }

  cancelCalibrate(): void {
    let snap = RXCore.getSnapState();
    RXCore.calibrate(false);

    this.isSelectedCalibrate = false;
    this.isCalibrateFinished = false;

    this.calibrateLength = '0';

    if (snap === false) {
      RXCore.changeSnapState(false);
    }

    // Don't call setCurrentPageScale() as it resets the selected scale
    // The selected scale will be restored by onCalibrateCheckedChange
  }

  updateMetric(selectedMetricType: MetricUnitType): void {
    switch (selectedMetricType) {
      case MetricUnitType.METRIC:
        RXCore.setUnit(1);
        break;
      case MetricUnitType.IMPERIAL:
        RXCore.setUnit(2);
        break;
    }
  }

  updateMetricUnit(metric: MetricUnitType, metricUnit: string): void {
    if (metric === METRIC.UNIT_TYPES.METRIC) {
      RXCore.metricUnit(metricUnit);
    } else if (metric === METRIC.UNIT_TYPES.IMPERIAL) {
      RXCore.imperialUnit(metricUnit);
    }
  }

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
    let selectedMetricForPage = '1';
    let unitScaleForPage;
    let unitScaleForDisplay;

    if (selectedMetricForPage === this.selectedMetricType) {
      unitScaleForPage = 1;
      unitScaleForDisplay =
        this.selectedMetricType === MetricUnitType.METRIC
          ? this.convertToMM(this.selectedMetricUnit.label)
          : this.convertToInch(this.selectedMetricUnit.label);
    } else {
      unitScaleForPage = 1;
      unitScaleForDisplay = 1;
    }

    const scaleForPage = this.customPageScaleValue * unitScaleForPage;
    const scaleForDisplay = this.customDisplayScaleValue * unitScaleForDisplay;

    return `${scaleForPage}:${scaleForDisplay}`;
  }

  applyScale(selectedScaleObj: any): void {
    this.updateMetric(selectedScaleObj.metric as MetricUnitType);
    this.updateMetricUnit(selectedScaleObj.metric as MetricUnitType, selectedScaleObj.metricUnit);
    RXCore.setDimPrecisionForPage(
      this.countDecimals(this.selectedScalePrecision?.value as number)
    );
    RXCore.scale(selectedScaleObj.value);
    RXCore.setScaleLabel(selectedScaleObj.label);

    this.scalesOptions = this.setPropertySelected(
      this.scalesOptions,
      'isSelected',
      'label',
      selectedScaleObj.label
    );

    RXCore.updateScaleList(this.scalesOptions);

    this.currentScale = selectedScaleObj.label;
    this.measurePanelService.setMeasureScaleState({
      visible: true,
      value: this.currentScale,
    });

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
    this.updateMetric(MetricUnitType.METRIC);
    this.updateMetricUnit(MetricUnitType.METRIC, 'Millimeter');
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

  addNewScale(): void {
    const getPageScaleObject = RXCore.getPageScaleObject(0);

    if (this.isSelectedCalibrate) {
      this.applyCalibrate();
      return;
    }

    // For imperial scales, use fraction format in the label
    let scaleLabel: string;
    if (this.selectedMetricType === MetricUnitType.IMPERIAL) {
      scaleLabel = `${this.imperialNumerator}/${this.imperialDenominator} = ${this.customDisplayScaleValue} ${this.selectedMetricUnit.label}`;
    } else {
      scaleLabel = `${this.customPageScaleValue} ${this.selectedMetricUnit.label} : ${this.customDisplayScaleValue} ${this.selectedMetricUnit.label}`;
    }
    let scale = this.calculateScale();

    if (this.isEditingScale) {
      const existingScaleIndex = this.scalesOptions.findIndex(
        (item) => item.label === this.editingScaleOriginalLabel
      );

      if (existingScaleIndex !== -1) {
        const updatedScale: ScaleWithPageRange = {
          value: scale,
          label: scaleLabel,
          metric: this.selectedMetricType,
          metricUnit: this.selectedMetricUnit.label,
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

        // Create a new array reference to trigger change detection
        this.scalesOptions = [...this.scalesOptions];
        this.scalesOptions[existingScaleIndex] = updatedScale;
        this.selectedScale = updatedScale;
        this.applyScale(this.selectedScale);

        RXCore.updateScaleList(this.scalesOptions);

        this.currentScale = this.selectedScale.label;

        this.measurePanelService.setMeasureScaleState({
          visible: true,
          value: this.currentScale,
        });
        this.measurePanelService.setScaleState({
          created: true,
          scaleLabel: this.selectedScale.label,
          scalesOptions: this.scalesOptions, // Pass the updated scales
        });

        this.isEditingScale = false;
        this.editingScaleOriginalLabel = '';

        this.onCloseClick();
        return;
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

    let obj: ScaleWithPageRange = {
      value: scale,
      label: scaleLabel,
      metric: this.selectedMetricType,
      metricUnit: this.selectedMetricUnit.label,
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

    // Create a new array reference to trigger change detection
    this.scalesOptions = [...this.scalesOptions, obj];
    this.selectedScale = obj;
    this.applyScale(this.selectedScale);

    RXCore.updateScaleList(this.scalesOptions);

    this.currentScale = this.selectedScale.label;

    this.measurePanelService.setMeasureScaleState({
      visible: true,
      value: this.currentScale,
    });
    this.measurePanelService.setScaleState({
      created: true,
      scaleLabel: this.selectedScale.label,
      scalesOptions: this.scalesOptions, // Pass the updated scales
    });

    this.onCloseClick();

    // Update scale list
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userScaleStorage.saveScales(user.id, this.scalesOptions);
    }
  }

  applyCalibrate(): void {
    if (
      this.measuredCalibrateLength === this.calibrateLength &&
      this.currentPageMetricUnitCalibrate === this.selectedMetricUnit.label
    ) {
      return;
    }

    this.updateMetric(this.selectedMetricType);
    this.updateMetricUnit(this.selectedMetricType, this.selectedMetricUnit.label);

    this.calibrateLength = this.calibrateLength.trim();
    const calibrateconn = RXCore.getCalibrateGUI();

    const converttedCalibrateLength =
      parseInt(this.calibrateLength) *
      (this.selectedMetricType === MetricUnitType.METRIC
        ? this.convertToMM(this.selectedMetricUnit.label)
        : this.convertToInch(this.selectedMetricUnit.label));

    calibrateconn.SetTempCal(converttedCalibrateLength);
    calibrateconn.setCalibrateScaleByLength();

    if (!Number.isFinite(calibrateconn.getMeasureScale())) {
      return;
    }

    calibrateconn.setCalibration(true);

    RXCore.setDimPrecisionForPage(
      this.countDecimals(this.selectedScalePrecision?.value as number)
    );

    RXCore.scale('Calibration');

    let measureScale = calibrateconn.getMeasureScale().toFixed(2);
    measureScale = parseFloat(measureScale);

    const scaleVaue = `1:${measureScale}`;
    const pageScaleLebel = this.selectedMetricType === MetricUnitType.METRIC ? this.currentPageMetricUnitCalibrate : 'Inch';
    const convertedMeasureScale =
      this.selectedMetricType === MetricUnitType.METRIC
        ? (
            measureScale / this.convertToMM(this.selectedMetricUnit.label)
          ).toFixed(2)
        : (
            measureScale / this.convertToInch(this.selectedMetricUnit.label)
          ).toFixed(2);

    // For imperial scales, use fraction format in the label
    let scaleLabel: string;
    if (this.selectedMetricType === MetricUnitType.IMPERIAL) {
      scaleLabel = `1/1 = ${convertedMeasureScale} ${this.selectedMetricUnit.label}`;
    } else {
      scaleLabel = `1 ${pageScaleLebel} : ${convertedMeasureScale} ${this.selectedMetricUnit.label}`;
    }
    RXCore.setScaleLabel(scaleLabel);

    RXCore.calibrate(false);

    this.isSelectedCalibrate = false;
    RXCore.scale(scaleVaue);
    this.measuredCalibrateLength = '0';
    
    let obj = {
      value: scaleVaue,
      label: scaleLabel,
      metric: this.selectedMetricType,
      metricUnit: this.selectedMetricUnit.label,
      dimPrecision: this.countDecimals(this.selectedScalePrecision?.value as number),
      isSelected: true,
      imperialNumerator: this.selectedMetricType === MetricUnitType.IMPERIAL ? 1 : undefined,
      imperialDenominator: this.selectedMetricType === MetricUnitType.IMPERIAL ? 1 : undefined,
    };

    // Check if a scale with the same label already exists,
    // if it does, override the existing scale with the new one
    const existingScaleIndex = this.scalesOptions.findIndex(scale => scale.label === obj.label);

    if (existingScaleIndex !== -1) {
      this.scalesOptions[existingScaleIndex] = obj;
    } else {
      this.scalesOptions.push(obj);
    }

    this.selectedScale = obj;
    this.scalesOptions = this.setPropertySelected(
      this.scalesOptions,
      'isSelected',
      'label',
      this.selectedScale.label
    );

    RXCore.updateScaleList(this.scalesOptions);

    this.currentScale = this.selectedScale.label;

    this.measurePanelService.setMeasureScaleState({
      visible: true,
      value: this.currentScale,
    });
    this.measurePanelService.setScaleState({
      created: true,
      scaleLabel: this.selectedScale.label,
      scalesOptions: this.scalesOptions, // Pass the updated scales
    });

    this.onCloseClick();

    // Update scale list
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userScaleStorage.saveScales(user.id, this.scalesOptions);
    }
  }

  loadScaleList(): void {
    const scales: any = RXCore.getDocScales();

    if (scales && scales.length) {
      this.scalesOptions = this.ensureImperialScaleProperties(scales);
    } else if (!this.scalesOptions || this.scalesOptions.length === 0) {
      // Only insert unscaled if we don't have any user scales loaded
      this.insertUnscaled();
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

  onRadioSelectionChange(value: MetricUnitType): void {
    this.metricTypeState$.next(value);
    
    this.selectedMetricType = value;
    if (this.selectedMetricType === MetricUnitType.METRIC) {
      this.customPageScaleValue = 1;
      this.customDisplayScaleValue = 1;
      this.scaleUnitOptions = this.scaleUnits.metric;
      this.selectedMetricUnit = this.scaleUnits.metric[0];
      this.selectedScalePrecision = this.precisionOptions[2];
    } else {
      this.customPageScaleValue = 1/1;
      this.customDisplayScaleValue = 1;
      this.imperialNumerator = 1;
      this.imperialDenominator = 1;

      this.scaleUnitOptions = this.scaleUnits.imperial;
      this.selectedMetricUnit = this.scaleUnits.imperial[1];
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

    if (this.selectedMetricType === MetricUnitType.IMPERIAL) {
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

  mapEditStateToPanel(editState: any): void {
    this.isEditingScale = true;

    if (editState.metricType !== undefined) {
      this.selectedMetricType = editState.metricType;
      this.onRadioSelectionChange(editState.metricType);
    }

    if (editState.metricUnit) {
      const unitOptions = this.selectedMetricType === MetricUnitType.METRIC ? 
        this.scaleUnits.metric : this.scaleUnits.imperial;
      const unit = unitOptions.find(u => u.label === editState.metricUnit);
      if (unit) {
        this.selectedMetricUnit = unit;
      }
    }

    if (editState.precision !== undefined) {
      if (this.selectedMetricType === MetricUnitType.IMPERIAL) {
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
      if (this.selectedMetricType === MetricUnitType.IMPERIAL) {
        this.setImperialFractionFromValue(editState.pageScaleValue);
      }
    }

    if (editState.displayScaleValue !== undefined) {
      this.customDisplayScaleValue = editState.displayScaleValue;
    }

    this.editingScaleOriginalLabel = editState.originalLabel || '';
    
    this.selectedPageRanges = editState.pageRanges || (this.totalPages > 0 ? [[1, this.totalPages]] : []);
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
    this.selectedPageRanges = pageRanges;
  }

  setScaleForCurrentPage(): void {
    const currentPage = this.scaleManagementService.getCurrentPage();
    this.selectedPageRanges = [[currentPage + 1, currentPage + 1]];
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
      metric: this.selectedMetricType,
      metricUnit: this.selectedMetricUnit.label,
      dimPrecision: this.countDecimals(this.selectedScalePrecision?.value as number),
      isSelected: false,
      pageRanges: this.selectedPageRanges
    });

    return conflicts.length > 0;
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
      this.selectedPageRanges = [[1, this.totalPages]];
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
