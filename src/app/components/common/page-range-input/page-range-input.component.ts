import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rx-page-range-input',
  templateUrl: './page-range-input.component.html',
  styleUrls: ['./page-range-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PageRangeInputComponent),
      multi: true
    }
  ]
})
export class PageRangeInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() totalPages: number = 0;
  @Input() placeholder: string = 'Enter page range (e.g., 1-5, 1,3,5)';
  @Input() disabled: boolean = false;
  @Input() defaultToAllPages: boolean = true;
  @Output() rangeChange = new EventEmitter<number[][]>();
  @Output() currentPage = new EventEmitter<number>();

  value: string = '';
  pageRanges: number[][] = [];
  errorMessage: string = '';

  private onChange = (value: number[][]) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.setDefaultIfNeeded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] && !changes['totalPages'].firstChange) {
      this.setDefaultIfNeeded();
    }
  }

  writeValue(value: number[][]): void {
    this.pageRanges = value || [];
    this.value = this.formatRangesToString(this.pageRanges);
    
    this.setDefaultIfNeeded();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.parseAndValidateInput();
  }

  onBlur(): void {
    this.onTouched();
    this.parseAndValidateInput();
  }

  parseAndValidateInput(): void {
    this.errorMessage = '';
    
    if (!this.value.trim()) {
      this.pageRanges = [];
      this.emitChange();
      return;
    }

    try {
      this.pageRanges = this.parsePageRanges(this.value);
      this.validatePageRanges();
      this.emitChange();
    } catch (error) {
      this.errorMessage = error as string;
    }
  }

  parsePageRanges(input: string): number[][] {
    const ranges: number[][] = [];
    const parts = input.split(',').map(part => part.trim()).filter(part => part.length > 0);

    for (const part of parts) {
      if (part.includes('-')) {
        const rangeParts = part.split('-').map(p => p.trim());
        if (rangeParts.length !== 2) {
          throw new Error('Invalid range format. Use "start-end" (e.g., "1-5")');
        }

        const start = parseInt(rangeParts[0]);
        const end = parseInt(rangeParts[1]);

        if (isNaN(start) || isNaN(end)) {
          throw new Error('Range values must be numbers');
        }

        if (start > end) {
          throw new Error('Start page must be less than or equal to end page');
        }

        if (start < 1) {
          throw new Error('Page numbers must be 1 or greater');
        }

        ranges.push([start, end]);
      } else {
        const page = parseInt(part);
        if (isNaN(page)) {
          throw new Error('Page numbers must be valid numbers');
        }

        if (page < 1) {
          throw new Error('Page numbers must be 1 or greater');
        }

        ranges.push([page, page]);
      }
    }

    return ranges;
  }

  validatePageRanges(): void {
    if (this.totalPages === 0) return;

    for (const range of this.pageRanges) {
      if (range[1] > this.totalPages) {
        throw new Error(`Page ${range[1]} exceeds total pages (${this.totalPages})`);
      }
    }
  }

  formatRangesToString(ranges: number[][]): string {
    return ranges.map(range => {
      if (range[0] === range[1]) {
        return range[0].toString();
      } else {
        return `${range[0]}-${range[1]}`;
      }
    }).join(', ');
  }

  setAllPages(): void {
    if (this.totalPages > 0) {
      this.pageRanges = [[1, this.totalPages]];
      this.value = `1-${this.totalPages}`;
      this.emitChange();
    }
  }

  setCurrentPage(): void {  
    this.currentPage.emit();
  }

  private emitChange(): void {
    this.onChange(this.pageRanges);
    this.rangeChange.emit(this.pageRanges);
  }

  getRangeDescription(): string {
    if (this.pageRanges.length === 0) {
      return 'No pages selected';
    }

    const totalPages = this.pageRanges.reduce((sum, range) => {
      return sum + (range[1] - range[0] + 1);
    }, 0);

    if (this.pageRanges.length === 1 && this.pageRanges[0][0] === this.pageRanges[0][1]) {
      return `Page ${this.pageRanges[0][0]}`;
    } else if (this.pageRanges.length === 1) {
      return `Pages ${this.pageRanges[0][0]}-${this.pageRanges[0][1]} (${totalPages} pages)`;
    } else {
      return `${totalPages} pages selected`;
    }
  }

  private setDefaultIfNeeded(): void {
    if (this.defaultToAllPages && 
        this.totalPages > 0 && 
        this.pageRanges.length === 0 && 
        !this.value.trim()) {
      this.setAllPages();
    }
  }
} 