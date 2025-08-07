import { Injectable } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from './rxcore.service';
import { BehaviorSubject } from 'rxjs';
import { MetricUnitType } from 'src/app/domain/enums';
import { METRIC } from 'src/rxcore/constants';

export interface ScaleWithPageRange {
  value: string;
  label: string;
  metric: any;
  metricUnit: string;
  dimPrecision: number;
  isSelected: boolean;
  imperialNumerator?: number;
  imperialDenominator?: number;
  pageRanges?: number[][]; 
  isGlobal?: boolean; 
}

@Injectable({
  providedIn: 'root'
})
export class ScaleManagementService {
  private scalesSubject = new BehaviorSubject<ScaleWithPageRange[]>([]);
  public scales$ = this.scalesSubject.asObservable();

  private currentPageSubject = new BehaviorSubject<number>(0);
  public currentPage$ = this.currentPageSubject.asObservable();

  private totalPagesSubject = new BehaviorSubject<number>(0);
  public totalPages$ = this.totalPagesSubject.asObservable();

  private lastAutoAppliedScale: { page: number; scale: ScaleWithPageRange; timestamp: number } | null = null;
  private readonly AUTO_APPLY_TIMEOUT = 1000;

  constructor(private rxCoreService: RxCoreService) {
    this.initializeService();
  }

  private initializeService(): void {
    this.rxCoreService.guiPage$.subscribe(pageState => {
      if (pageState?.currentpage !== undefined) {
        this.currentPageSubject.next(pageState.currentpage);
        this.applyScaleForCurrentPage();
      }
    });

    this.rxCoreService.guiState$.subscribe(state => {
      if (state?.numpages !== undefined) {
        this.totalPagesSubject.next(state.numpages);
      }
    });

    this.loadScales();
  }

  private applyScaleForCurrentPage(): void {
    const currentPage = this.getCurrentPage();
    const scaleForPage = this.getScaleForPage(currentPage + 1);
    
    if (scaleForPage) {
      this.applyScaleToCurrentPageInternal(scaleForPage);
    }
  }

  private applyScaleToCurrentPageInternal(scale: ScaleWithPageRange): void {
    this.updateMetric(scale.metric as MetricUnitType);
    this.updateMetricUnit(scale.metric as MetricUnitType, scale.metricUnit);
    RXCore.scale(scale.value);
    RXCore.setScaleLabel(scale.label);
    RXCore.setDimPrecisionForPage(scale.dimPrecision);
    
    this.lastAutoAppliedScale = {
      page: this.getCurrentPage(),
      scale: scale,
      timestamp: Date.now()
    };
  }

  private updateMetric(selectedMetricType: MetricUnitType): void {
    switch (selectedMetricType) {
      case MetricUnitType.METRIC:
        RXCore.setUnit(1);
        break;
      case MetricUnitType.IMPERIAL:
        RXCore.setUnit(2);
        break;
    }
  }

  private updateMetricUnit(metric: MetricUnitType, metricUnit: string): void {
    if (metric === METRIC.UNIT_TYPES.METRIC) {
      RXCore.metricUnit(metricUnit);
    } else if (metric === METRIC.UNIT_TYPES.IMPERIAL) {
      RXCore.imperialUnit(metricUnit);
    }
  }

  loadScales(): void {
    const scales = RXCore.getDocScales() || [];
    this.scalesSubject.next(scales);
  }

  getScales(): ScaleWithPageRange[] {
    return this.scalesSubject.value;
  }

  getCurrentPage(): number {
    return this.currentPageSubject.value;
  }

  getTotalPages(): number {
    return this.totalPagesSubject.value;
  }

  addScale(scale: ScaleWithPageRange): void {
    const currentScales = this.getScales();
    
    const existingIndex = currentScales.findIndex(s => s.label === scale.label);
    
    if (existingIndex !== -1) {
      currentScales[existingIndex] = { ...scale };
    } else {
      currentScales.push(scale);
    }

    this.updateScales(currentScales);
  }

  updateScale(originalLabel: string, updatedScale: ScaleWithPageRange): void {
    const currentScales = this.getScales();
    const index = currentScales.findIndex(s => s.label === originalLabel);
    
    if (index !== -1) {
      currentScales[index] = { ...updatedScale };
      this.updateScales(currentScales);

      const currentPage = this.getCurrentPage();
      if (this.isScaleApplicableToPage(updatedScale, currentPage + 1)) {
        this.applyScaleToCurrentPageInternal(updatedScale);
      }
    }
  }

  deleteScale(scaleLabel: string): void {
    const currentScales = this.getScales();
    const filteredScales = currentScales.filter(s => s.label !== scaleLabel);
    this.updateScales(filteredScales);
  }

  private updateScales(scales: ScaleWithPageRange[]): void {
    this.scalesSubject.next(scales);
    RXCore.updateScaleList(scales);
  }

  getScaleForPage(pageNumber: number): ScaleWithPageRange | null {
    const scales = this.getScales();
  
    let bestMatch: ScaleWithPageRange | null = null;
    for (const scale of scales) {
      if (this.isScaleApplicableToPage(scale, pageNumber)) {
        if (!bestMatch || 
            (scale.pageRanges && scale.pageRanges.length > 0 && 
             (!bestMatch.pageRanges || bestMatch.pageRanges.length === 0))) {
          bestMatch = scale;
        }
      }
    }

    return bestMatch;
  }

  isScaleApplicableToPage(scale: ScaleWithPageRange, pageNumber: number): boolean {
    if (scale.isGlobal || !scale.pageRanges || scale.pageRanges.length === 0) {
      return true;
    }
  
    const result = scale.pageRanges.some(range => {
      const [start, end] = range;
      const applies = pageNumber >= start && pageNumber <= end;
      return applies;
    });
    return result;
  }

  applyScaleToPageRange(scale: ScaleWithPageRange, pageRanges: number[][]): void {  
    const updatedScale = {
      ...scale,
      pageRanges: pageRanges,
      isGlobal: pageRanges.length === 0 || 
                (pageRanges.length === 1 && 
                 pageRanges[0][0] === 1 && 
                 pageRanges[0][1] === this.getTotalPages())
    };

    this.addScale(updatedScale);
  }

  applyScaleToAllPages(scale: ScaleWithPageRange): void {
    this.applyScaleToPageRange(scale, []);
  }

  applyScaleToCurrentPage(scale: ScaleWithPageRange): void {
    const currentPage = this.getCurrentPage();
    this.applyScaleToPageRange(scale, [[currentPage + 1, currentPage + 1]]);
  }

  getScalesForPage(pageNumber: number): ScaleWithPageRange[] {
    const scales = this.getScales();
    return scales.filter(scale => this.isScaleApplicableToPage(scale, pageNumber));
  }

  getConflictingScales(scale: ScaleWithPageRange): ScaleWithPageRange[] {
    if (!scale.pageRanges || scale.pageRanges.length === 0) {
      return []; 
    }

    const scales = this.getScales();
    const conflicts: ScaleWithPageRange[] = [];

    for (const existingScale of scales) {
      if (existingScale.label === scale.label) continue;

      if (this.hasOverlappingPageRanges(scale.pageRanges, existingScale.pageRanges || [])) {
        conflicts.push(existingScale);
      }
    }

    return conflicts;
  }

  private hasOverlappingPageRanges(ranges1: number[][], ranges2: number[][]): boolean {
    for (const range1 of ranges1) {
      for (const range2 of ranges2) {
        if (this.rangesOverlap(range1, range2)) {
          return true;
        }
      }
    }
    return false;
  }

  private rangesOverlap(range1: number[], range2: number[]): boolean {
    const [start1, end1] = range1;
    const [start2, end2] = range2;
    return start1 <= end2 && start2 <= end1;
  }

  validatePageRanges(pageRanges: number[][], totalPages: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const range of pageRanges) {
      const [start, end] = range;
      
      if (start < 1) {
        errors.push(`Page numbers must be 1 or greater (found ${start})`);
      }
      
      if (end > totalPages) {
        errors.push(`Page ${end} exceeds total pages (${totalPages})`);
      }
      
      if (start > end) {
        errors.push(`Start page (${start}) must be less than or equal to end page (${end})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getScaleSummary(): { totalScales: number; globalScales: number; pageSpecificScales: number } {
    const scales = this.getScales();
    const globalScales = scales.filter(s => s.isGlobal || !s.pageRanges || s.pageRanges.length === 0).length;
    const pageSpecificScales = scales.length - globalScales;

    return {
      totalScales: scales.length,
      globalScales,
      pageSpecificScales
    };
  }

  public wasScaleRecentlyAutoApplied(page: number): boolean {
    if (!this.lastAutoAppliedScale) {
      return false;
    }
    
    const timeSinceAutoApply = Date.now() - this.lastAutoAppliedScale.timestamp;
    return this.lastAutoAppliedScale.page === page && timeSinceAutoApply < this.AUTO_APPLY_TIMEOUT;
  }
} 