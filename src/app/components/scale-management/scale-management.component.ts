import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScaleManagementService, ScaleWithPageRange } from 'src/app/services/scale-management.service';
import { RXCore } from 'src/rxcore';
import { ToastrService } from 'ngx-toastr';
import { UserScaleStorageService } from 'src/app/services/user-scale-storage.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'rx-scale-management',
  templateUrl: './scale-management.component.html',
  styleUrls: ['./scale-management.component.scss']
})
export class ScaleManagementComponent implements OnInit, OnDestroy {
  scales: ScaleWithPageRange[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  selectedPageRanges: number[][] = [];
  isAddingNewScale: boolean = false;
  editingScale: ScaleWithPageRange | null = null;
  
  scaleLabel: string = '';
  scaleValue: string = '';
  selectedMetricType: any;
  selectedMetricUnit: string = '';
  selectedPrecision: number = 3;
  imperialNumerator: number = 1;
  imperialDenominator: number = 1;

  private subscriptions: Subscription[] = [];

  constructor(
    private scaleManagementService: ScaleManagementService,
    private toastr: ToastrService,
    private userScaleStorage: UserScaleStorageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      // Load user-specific scales from localStorage
      const userScales = this.userScaleStorage.getScales(user.id);
      if (userScales && userScales.length > 0) {
        // Overwrite the observable with user-specific scales
        //this.scaleManagementService["scalesSubject"].next(userScales);
        this.scaleManagementService.setScales(userScales);
      }
    }
    this.subscriptions.push(
      this.scaleManagementService.scales$.subscribe(scales => {
        this.scales = scales;
      }),
      
      this.scaleManagementService.currentPage$.subscribe(page => {
        this.currentPage = page;
      }),
      
      this.scaleManagementService.totalPages$.subscribe(pages => {
        this.totalPages = pages;
        if (this.isAddingNewScale && (!this.selectedPageRanges || this.selectedPageRanges.length === 0) && pages > 0) {
          this.selectedPageRanges = [[1, pages]];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getScaleSummary() {
    return this.scaleManagementService.getScaleSummary();
  }

  getScalesForPage(pageNumber: number): ScaleWithPageRange[] {
    return this.scaleManagementService.getScalesForPage(pageNumber);
  }

  isScaleApplicableToPage(scale: ScaleWithPageRange, pageNumber: number): boolean {
    return this.scaleManagementService.isScaleApplicableToPage(scale, pageNumber);
  }

  getPageRangeDescription(scale: ScaleWithPageRange): string {
    if (!scale.pageRanges || scale.pageRanges.length === 0) {
      return 'All pages';
    }

    const descriptions = scale.pageRanges.map(range => {
      if (range[0] === range[1]) {
        return `Page ${range[0]}`;
      } else {
        return `Pages ${range[0]}-${range[1]}`;
      }
    });

    return descriptions.join(', ');
  }

  addNewScale(): void {
    this.isAddingNewScale = true;
    this.editingScale = null;
    this.resetForm();
    if (this.totalPages > 0) {
      this.selectedPageRanges = [[1, this.totalPages]];
    }
  }

  editScale(scale: ScaleWithPageRange): void {
    this.editingScale = scale;
    this.isAddingNewScale = true;
    this.populateForm(scale);
  }

  deleteScale(scale: ScaleWithPageRange): void {



    if (confirm(`Are you sure you want to delete the scale "${scale.label}"?`)) {
      this.scaleManagementService.deleteScale(scale.label);

      // Update the local scales array
      this.scales = this.scales.filter(s => s.label !== scale.label);

      
      // Save to localStorage for the current user
      const user = this.userService.getCurrentUser();
      if (user) {
        this.userScaleStorage.saveScales(user.id, this.scales);
      }

      this.toastr.success('Scale deleted successfully');
    }
  }

  applyScale(scale: ScaleWithPageRange): void {
    RXCore.scale(scale.value);
    RXCore.setScaleLabel(scale.label);
    RXCore.setDimPrecisionForPage(scale.dimPrecision);
    
    this.toastr.success(`Applied scale: ${scale.label}`);
  }

  saveScale(): void {
    if (!this.validateForm()) {
      return;
    }

    // For Imperial scales with feet, convert the display value back to inches for storage
    let storageValue = this.scaleValue;
    if (this.selectedMetricType === '1' && this.selectedMetricUnit === 'Feet' && this.scaleValue.includes(':')) {
      const parts = this.scaleValue.split(':');
      const inchesValue = parseFloat(parts[1]) * 12;
      storageValue = `${parts[0]}:${inchesValue}`;
    }

    const scale: ScaleWithPageRange = {
      value: storageValue,
      label: this.scaleLabel,
      metric: this.selectedMetricType,
      metricUnit: this.selectedMetricUnit,
      dimPrecision: this.selectedPrecision,
      isSelected: false,
      pageRanges: this.selectedPageRanges,
      isGlobal: this.selectedPageRanges.length === 0 || 
                (this.selectedPageRanges.length === 1 && 
                 this.selectedPageRanges[0][0] === 1 && 
                 this.selectedPageRanges[0][1] === this.totalPages),
      imperialNumerator: this.imperialNumerator,
      imperialDenominator: this.imperialDenominator,
    };

    if (this.editingScale) {
      this.scaleManagementService.updateScale(this.editingScale.label, scale);
      this.toastr.success('Scale updated successfully');
    } else {
      this.scaleManagementService.addScale(scale);
      this.toastr.success('Scale added successfully');
    }
    // Save to localStorage for the current user
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userScaleStorage.saveScales(user.id, this.scales);
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.isAddingNewScale = false;
    this.editingScale = null;
    this.resetForm();
  }

  onPageRangeChange(pageRanges: number[][]): void {
    this.selectedPageRanges = pageRanges;
  }

  setScaleForCurrentPage(): void {
    this.selectedPageRanges = [[this.currentPage + 1, this.currentPage + 1]];
  }

  setScaleForAllPages(): void {
    this.selectedPageRanges = this.totalPages > 0 ? [[1, this.totalPages]] : [];
  }

  private resetForm(): void {
    this.scaleLabel = '';
    this.scaleValue = '';
    this.selectedMetricType = null;
    this.selectedMetricUnit = '';
    this.selectedPrecision = 3;
    this.imperialNumerator = 1;
    this.imperialDenominator = 1;
  }

  private populateForm(scale: ScaleWithPageRange): void {
    this.scaleLabel = scale.label;


    // For Imperial scales with feet, convert the display value back from inches
    let displayValue = scale.value;
    if (scale.metric === '1' && scale.metricUnit === 'Feet' && scale.value.includes(':')) {
      const parts = scale.value.split(':');
      const feetValue = parseFloat(parts[1]) / 12;
      displayValue = `${parts[0]}:${feetValue}`;
    }
    this.scaleValue = displayValue;
    //this.scaleValue = scale.value;
    this.selectedMetricType = scale.metric;
    this.selectedMetricUnit = scale.metricUnit;
    this.selectedPrecision = scale.dimPrecision;
    this.selectedPageRanges = scale.pageRanges || [];
    
    if (scale.imperialNumerator && scale.imperialDenominator) {
      this.imperialNumerator = scale.imperialNumerator;
      this.imperialDenominator = scale.imperialDenominator;
    }
  }

  private validateForm(): boolean {
    if (!this.scaleLabel.trim()) {
      this.toastr.error('Scale label is required');
      return false;
    }

    if (!this.scaleValue.trim()) {
      this.toastr.error('Scale value is required');
      return false;
    }

    if (!this.selectedMetricType) {
      this.toastr.error('Metric type is required');
      return false;
    }

    if (!this.selectedMetricUnit) {
      this.toastr.error('Metric unit is required');
      return false;
    }

    const validation = this.scaleManagementService.validatePageRanges(this.selectedPageRanges, this.totalPages);
    if (!validation.isValid) {
      this.toastr.error(validation.errors.join(', '));
      return false;
    }

    return true;
  }

  getConflictingScales(): ScaleWithPageRange[] {
    if (!this.selectedPageRanges || this.selectedPageRanges.length === 0) {
      return [];
    }

    const tempScale: ScaleWithPageRange = {
      label: this.editingScale?.label || '',
      value: this.scaleValue,
      metric: this.selectedMetricType,
      metricUnit: this.selectedMetricUnit,
      dimPrecision: this.selectedPrecision,
      isSelected: false,
      pageRanges: this.selectedPageRanges
    };

    return this.scaleManagementService.getConflictingScales(tempScale);
  }

  hasConflictingScales(): boolean {
    return this.getConflictingScales().length > 0;
  }

  get selectedPageRangeDummyScale(): ScaleWithPageRange {
    return {
      value: '',
      label: '',
      metric: '',
      metricUnit: '',
      dimPrecision: 0,
      isSelected: false,
      pageRanges: this.selectedPageRanges,
      isGlobal: this.selectedPageRanges.length === 0
    };
  }
} 