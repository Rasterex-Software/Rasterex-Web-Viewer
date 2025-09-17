import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { AnnotationToolsService } from '../annotation-tools.service';
import { MeasurePanelService } from '../measure-panel/measure-panel.service';
import { metricUnitsOptions, imperialUnitsOptions } from 'src/app/shared/measure-options';
import { MetricUnitType } from 'src/app/domain/enums';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { FileScaleStorageService } from 'src/app/services/file-scale-storage.service';
import { ScaleManagementService } from 'src/app/services/scale-management.service';
import { RXCore } from 'src/rxcore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'rx-scale-dropdown',
  templateUrl: './scale-dropdown.component.html',
  styleUrls: ['./scale-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'handleClickOutside($event)',
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class ScaleDropdownComponent implements OnInit, OnDestroy {
  @Input() options: Array<any> = [];
  @Input() selectedScale: any;
  
  ngOnChanges(changes: any): void {
    if (changes.options || changes.selectedScale) {
      this.cdr.markForCheck();
    }
  }
  
  @Input() showDelete: boolean = false;
  @Output('valueChange') onValueChange = new EventEmitter<any>();
  @Output('valueDelete') onValueDelete = new EventEmitter<any>();

  public opened: boolean = false;
  private currentIndex = -1;
  private subscription: Subscription;
  private currentFile: any = null;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private elem: ElementRef,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly measurePanelService: MeasurePanelService,
    private readonly rxCoreService: RxCoreService,
    private readonly fileScaleStorage: FileScaleStorageService,
    private readonly scaleManagementService: ScaleManagementService
    ) { }

  ngOnInit(): void {
    this.subscription = this.rxCoreService.guiPage$.subscribe(() => {
      this.cdr.markForCheck();
    });
    // Track file changes to update scale options
    this.rxCoreService.guiState$.subscribe(state => {
      const file = RXCore.getOpenFilesList().find(file => file.isActive);
      
      if (file && (!this.currentFile || this.currentFile.index !== file.index)) {
        this.currentFile = file;
        this.updateScaleOptionsFromFile();
        // Force apply the selected scale for the new file
        this.forceApplySelectedScaleForFile();
      }else if (!file && this.currentFile) {
        // All files are closed, clear scales and reset to default
        this.currentFile = null;
        this.options = [];
        this.selectedScale = null;
        this.resetToDefaultScale();
        // Clear all stored scales when no files are active
        this.fileScaleStorage.clearAllScales();
        this.cdr.markForCheck();
      }
    });

    // Listen for scale changes to refresh options
    this.scaleManagementService.scales$.subscribe(scales => {
      if (this.currentFile) {
        this.updateScaleOptionsFromFile();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleSelect(item: any) {
    this.selectedScale = item;

    if (this.currentFile) {
      this.fileScaleStorage.setSelectedScaleForFile(this.currentFile, item);
    }
    this.onValueChange.emit(this.selectedScale);
    this.opened = false;
    this.cdr.markForCheck();
  }

  handleClear(): void {
    if (this.selectedScale) {
      this.selectedScale = undefined;
      if (this.currentFile) {
        this.fileScaleStorage.setSelectedScaleForFile(this.currentFile, null);
      }
      this.onValueChange.emit(this.selectedScale);
      this.cdr.markForCheck();
    }
  }

  handleClickOutside(event: any) {
    if (!this.opened) return;
    const clickedInside = this.elem.nativeElement.contains(event.target);

    if (!clickedInside) {
        this.opened = false;
    }

    this.cdr.markForCheck();
  }

  handleKeyboardEvents($event: KeyboardEvent) {
    if (this.opened) {
      const target = $event.target as HTMLElement;
      if (target.nodeName !== 'INPUT') {
        $event.preventDefault();
      }
    } else {
        return;
    }

    if ($event.code === 'ArrowUp') {
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        } else if (this.currentIndex > 0) {
            this.currentIndex--;
        }

        this.elem.nativeElement.querySelectorAll('li').item(this.currentIndex).focus();
    } else if ($event.code === 'ArrowDown') {
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        } else if (this.currentIndex < this.options.length-1) {
            this.currentIndex++;
        }

        this.elem.nativeElement.querySelectorAll('li').item(this.currentIndex).focus();
    } else if (($event.code === 'Enter' || $event.code === 'NumpadEnter') && this.currentIndex >= 0) {
        this.selectByIndex(this.currentIndex);
    } else if ($event.code === 'Escape') {
        this.opened = false;
    }

    this.cdr.markForCheck();
  }

  private selectByIndex(i: number) {
    let value = this.options[i];
    this.handleSelect(value);
  }

  onDeleteClick(event, item: any): void {
    event.stopPropagation();

    if (this.currentFile) {
      this.fileScaleStorage.deleteScaleFromFile(this.currentFile, item.label);
    }

    this.onValueDelete.emit(item);
    this.cdr.markForCheck();
  }

  showScaleSettings(): void {
    this.opened = false;

    this.annotationToolsService.setMeasurePanelState({ visible: true });

    this.cdr.markForCheck();
  }

  onEditScale(): void {
    this.opened = false;

    this.annotationToolsService.setMeasurePanelState({ visible: true });
    
    if (this.selectedScale) {

      let displayScaleValue = this.selectedScale.value ? this.selectedScale.value.split(':')[1] : 1;
      
      // Convert feet back from inches for editing
      if (this.selectedScale.metricUnit === 'Feet') {
        const feetValue = parseFloat(displayScaleValue) / 12;
        displayScaleValue = Math.round(feetValue * 10000) / 10000;
      }

      this.measurePanelService.setMeasurePanelEditState({
        metricType: this.selectedScale.metric,
        metricUnit: this.selectedScale.metricUnit,
        precision: this.selectedScale.dimPrecision,
        pageScaleValue: this.selectedScale.value ? this.selectedScale.value.split(':')[0] : 1,
        displayScaleValue: displayScaleValue,
        originalLabel: this.selectedScale.label
      });
    }

    this.cdr.markForCheck();
  }

  get selectedScaleLabel(): string {
    if (!this.selectedScale) return '';
    const metric = this.selectedScale.metric;
    const precision = this.selectedScale.dimPrecision;
    let separator = metric === '1' ? ' = ' : ' : ';
    let left: string;
    let right: string;

    if (metric === '1') {
      // Handle cases where imperial properties might be missing
      const numerator = this.selectedScale.imperialNumerator || 1;
      const denominator = this.selectedScale.imperialDenominator || 1;
      left = `${numerator}/${denominator}`;
      right = this.selectedScale.value && this.selectedScale.value.includes(':') ? this.selectedScale.value.split(':')[1] : (this.selectedScale.customScaleValue || '');
      if (this.selectedScale.metricUnit === 'Feet') {
        const feetValue = parseFloat(right) / 12;
        right = this.formatWithPrecision(feetValue.toString(), precision);
      } else {
        right = this.formatWithPrecision(right, precision);
      }      
    } else {
      left = this.selectedScale.value && this.selectedScale.value.includes(':') ? this.selectedScale.value.split(':')[0] : (this.selectedScale.pageScaleValue || '');
      right = this.selectedScale.value && this.selectedScale.value.includes(':') ? this.selectedScale.value.split(':')[1] : (this.selectedScale.customScaleValue || '');
      right = this.formatWithPrecision(right, precision);
    }

    const unitShortLabel = this.getUnitShortLabel(this.selectedScale.metric, this.selectedScale.metricUnit);
    return `${left}${separator}${right} ${unitShortLabel}`;
  }

  getScaleLabel(item: any): string {
    if (!item) return '';
    const metric = item.metric;
    const precision = item.dimPrecision;
    let separator = metric === '1' ? ' = ' : ' : ';
    let left: string;
    let right: string;

    if (metric === '1') {
      // Handle cases where imperial properties might be missing
      const numerator = item.imperialNumerator || 1;
      const denominator = item.imperialDenominator || 1;
      left = `${numerator}/${denominator}`;
      right = item.value && item.value.includes(':') ? item.value.split(':')[1] : (item.customScaleValue || '');
      if (item.metricUnit === 'Feet') {
        const feetValue = parseFloat(right) / 12;
        right = this.formatWithPrecision(feetValue.toString(), precision);
      } else {
        right = this.formatWithPrecision(right, precision);
      }
    } else {
      left = item.value && item.value.includes(':') ? item.value.split(':')[0] : (item.pageScaleValue || '');
      right = item.value && item.value.includes(':') ? item.value.split(':')[1] : (item.customScaleValue || '');
      right = this.formatWithPrecision(right, precision);
    }

    const unitShortLabel = this.getUnitShortLabel(item.metric, item.metricUnit);
    return `${left}${separator}${right} ${unitShortLabel}`;
  }

  isScaleSelected(item: any): boolean {
    if (!item || !this.selectedScale) {
      return false;
    }
    
    // Compare by label first, then by value as fallback
    return item.label === this.selectedScale.label || item.value === this.selectedScale.value;
  }

  private getUnitShortLabel(metric: string, metricUnit: string): string {
    let unitOptions;
    
    if (metric === MetricUnitType.METRIC) {
      unitOptions = metricUnitsOptions;
    } else if (metric === MetricUnitType.IMPERIAL) {
      unitOptions = imperialUnitsOptions;
    } else {
      return metricUnit; 
    }

    const unitOption = unitOptions.find(option => option.label === metricUnit);
    return unitOption?.shortLabel || metricUnit; 
  }

  private formatWithPrecision(value: string, precision: number): string {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    // Handle special case for "Rounded" precision (precision = 0 means round to whole numbers)
    if (precision === 0) {
      return Math.round(numValue).toString();
    }
    
    return numValue.toFixed(precision);
  }

  private updateScaleOptionsFromFile(): void {
    if (!this.currentFile) {
      this.options = [];
      this.selectedScale = null;
      this.cdr.markForCheck();
      return;
    }

    const fileScales = this.fileScaleStorage.getScalesForFile(this.currentFile);
    const selectedFileScale = this.fileScaleStorage.getSelectedScaleForFile(this.currentFile);

    // Update options and selected scale
    this.options = fileScales;
    this.selectedScale = selectedFileScale;

    if (this.selectedScale) {
      this.applyScaleToRXCore(this.selectedScale);
    } else if (fileScales.length === 0) {
      this.resetToDefaultScale();
    }

    this.cdr.markForCheck();
  }
  private applyScaleToRXCore(scale: any): void {
    try {
      // Update metric type
      if (scale.metric === MetricUnitType.METRIC) {
        RXCore.setUnit(1);
      } else if (scale.metric === MetricUnitType.IMPERIAL) {
        RXCore.setUnit(2);
      }

      // Update metric unit
      if (scale.metric === MetricUnitType.METRIC) {
        RXCore.metricUnit(scale.metricUnit);
      } else if (scale.metric === MetricUnitType.IMPERIAL) {
        RXCore.imperialUnit(scale.metricUnit);
      }

      // Use precise value if available, otherwise fall back to display value
      const scaleValue = scale.preciseValue !== undefined 
        ? `1:${scale.preciseValue}` 
        : scale.value;
      
      RXCore.scale(scaleValue);
      RXCore.setScaleLabel(scale.label);
      
      const precision = scale.dimPrecision !== undefined && scale.dimPrecision !== null ? scale.dimPrecision : 2;
      RXCore.setDimPrecisionForPage(precision);

      // Redraw measurements to reflect the new scale
      RXCore.markUpRedraw();

      
    } catch (error) {
      console.error('ScaleDropdown: Error applying scale to RXCore:', error);
    }
  }
  private resetToDefaultScale(): void {
    try {
      RXCore.scale('1:1');
      RXCore.setScaleLabel('Unscaled');
      RXCore.setUnit(1); // Set to metric
      RXCore.metricUnit('Millimeter');
      // Use the current selected precision instead of hardcoded 2
      const currentPrecision = this.selectedScale?.dimPrecision !== undefined && this.selectedScale?.dimPrecision !== null 
        ? this.selectedScale.dimPrecision 
        : 2;
      RXCore.setDimPrecisionForPage(currentPrecision);
    } catch (error) {
      console.error('ScaleDropdown: Error resetting to default scale:', error);
    }
  }
  private forceApplySelectedScaleForFile(): void {
    if (!this.currentFile) {
      return;
    }

    const selectedFileScale = this.fileScaleStorage.getSelectedScaleForFile(this.currentFile);
    
    if (selectedFileScale) {
      this.selectedScale = selectedFileScale;
      this.applyScaleToRXCore(selectedFileScale);
    } else {
      this.selectedScale = null;
      this.resetToDefaultScale();
    }
    
    this.cdr.markForCheck();
  }


}