import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { AnnotationToolsService } from '../annotation-tools.service';
import { MeasurePanelService } from '../measure-panel/measure-panel.service';
import { metricUnitsOptions, imperialUnitsOptions } from 'src/app/shared/measure-options';
import { MetricUnitType } from 'src/app/domain/enums';
import { RxCoreService } from 'src/app/services/rxcore.service';
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

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private elem: ElementRef,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly measurePanelService: MeasurePanelService,
    private readonly rxCoreService: RxCoreService) { }

  ngOnInit(): void {
    this.subscription = this.rxCoreService.guiPage$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleSelect(item: any) {
    this.selectedScale = item;
    this.onValueChange.emit(this.selectedScale);
    this.opened = false;
    this.cdr.markForCheck();
  }

  handleClear(): void {
    if (this.selectedScale) {
      this.selectedScale = undefined;
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
      this.measurePanelService.setMeasurePanelEditState({
        metricType: this.selectedScale.metric,
        metricUnit: this.selectedScale.metricUnit,
        precision: this.selectedScale.dimPrecision,
        pageScaleValue: this.selectedScale.value ? this.selectedScale.value.split(':')[0] : 1,
        displayScaleValue: this.selectedScale.value ? this.selectedScale.value.split(':')[1] : 1,
        originalLabel: this.selectedScale.label
      });
    }

    this.cdr.markForCheck();
  }

  get selectedScaleLabel(): string {
    if (!this.selectedScale) return '';
    const metric = this.selectedScale.metric;
    let separator = metric === '1' ? ' = ' : ' : ';
    let left: string;
    let right: string;

    if (metric === '1') {
      // Handle cases where imperial properties might be missing
      const numerator = this.selectedScale.imperialNumerator || 1;
      const denominator = this.selectedScale.imperialDenominator || 1;
      left = `${numerator}/${denominator}`;
      right = this.selectedScale.value && this.selectedScale.value.includes(':') ? this.selectedScale.value.split(':')[1] : (this.selectedScale.customScaleValue || '');
      if (this.selectedScale.metricUnit === 'Feet' && right.toString() === '12') {
        right = '1';
      }
    } else {
      left = this.selectedScale.value && this.selectedScale.value.includes(':') ? this.selectedScale.value.split(':')[0] : (this.selectedScale.pageScaleValue || '');
      right = this.selectedScale.value && this.selectedScale.value.includes(':') ? this.selectedScale.value.split(':')[1] : (this.selectedScale.customScaleValue || '');
    }

    const unitShortLabel = this.getUnitShortLabel(this.selectedScale.metric, this.selectedScale.metricUnit);
    return `${left}${separator}${right} ${unitShortLabel}`;
  }

  getScaleLabel(item: any): string {
    if (!item) return '';
    const metric = item.metric;
    let separator = metric === '1' ? ' = ' : ' : ';
    let left: string;
    let right: string;

    if (metric === '1') {
      // Handle cases where imperial properties might be missing
      const numerator = item.imperialNumerator || 1;
      const denominator = item.imperialDenominator || 1;
      left = `${numerator}/${denominator}`;
      right = item.value && item.value.includes(':') ? item.value.split(':')[1] : (item.customScaleValue || '');
      
      if (item.metricUnit === 'Feet' && right.toString() === '12') {
        right = '1';
      }
    } else {
      left = item.value && item.value.includes(':') ? item.value.split(':')[0] : (item.pageScaleValue || '');
      right = item.value && item.value.includes(':') ? item.value.split(':')[1] : (item.customScaleValue || '');
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
}