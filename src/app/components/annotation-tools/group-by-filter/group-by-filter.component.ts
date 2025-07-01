import { Component, EventEmitter, Input, Output, OnInit, HostListener } from '@angular/core';
import dayjs from 'dayjs';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';

@Component({
  selector: 'rx-group-by-filter',
  templateUrl: './group-by-filter.component.html',
  styleUrls: ['./group-by-filter.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class GroupByFilterComponent implements OnInit {
  @Input() guiConfig: IGuiConfig | undefined;
  @Input() visible: boolean = true;
  
  // Group by options and selection
  @Input() sortOptions = [
    { value: "created", label: "Created day", imgSrc: "calendar-ico.svg" },
    { value: "author", label: "Author", imgSrc: "author-icon.svg" },
    { value: "pagenumber", label: "Page", imgSrc: "file-ico.svg" },
    { value: 'annotation', label: 'Annotation Type', imgSrc: "bookmark-ico.svg" },
  ];
  
  @Input() selectedSortOption: any = this.sortOptions[0];
  @Input() sortByField: 'created' | 'author' | 'pagenumber' | 'annotation' = 'created';
  
  // Filter options and selection
  @Input() sortFilterOptions: Array<any> = [];
  @Input() selectedSortFilterValues: Array<any> = [];
  @Input() sortFilterLabel: string = '';
  
  // Date filter for 'created' sort option
  @Input() sortFilterDateRange: {
    startDate: dayjs.Dayjs | undefined,
    endDate: dayjs.Dayjs | undefined
  } = { startDate: undefined, endDate: undefined};
  
  // Dropdown state
  sortDropdownOpen: boolean = false;
  sortDropdownSearchText: string = '';
  filteredSortFilterOptions: Array<any> = [];
  
  // Outputs
  @Output() sortFieldChanged = new EventEmitter<any>();
  @Output() sortFilterChange = new EventEmitter<Array<any>>();
  @Output() sortFilterDateSelect = new EventEmitter<{ startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }>();
  @Output() sortDateChange = new EventEmitter<{ event: any, type: 'start' | 'end' }>();
  @Output() clearSortDateFilter = new EventEmitter<void>();

  ngOnInit(): void {
    this.filterSortDropdownOptions();
  }

  onSortFieldChanged(event: any): void {
    this.sortFieldChanged.emit(event);
  }

  onSortFilterDateSelect(dateRange: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }): void {
    this.sortFilterDateSelect.emit(dateRange);
  }

  onSortDateChange(event: any, type: 'start' | 'end'): void {
    this.sortDateChange.emit({ event, type });
  }

  onClearSortDateFilter(): void {
    this.clearSortDateFilter.emit();
  }

  toggleSortDropdown(event: Event): void {
    event.stopPropagation();
    this.sortDropdownOpen = !this.sortDropdownOpen;
    
    if (this.sortDropdownOpen) {
      this.sortDropdownSearchText = '';
      this.filterSortDropdownOptions();
    }
  }

  getSortFilterDisplayText(): string {
    if (this.selectedSortFilterValues.length === 0) {
      return '';
    } else if (this.selectedSortFilterValues.length === 1) {
      const option = this.sortFilterOptions.find(opt => opt.value === this.selectedSortFilterValues[0]);
      return option ? option.label : this.selectedSortFilterValues[0];
    } else if (this.selectedSortFilterValues.length <= 3) {
      return this.selectedSortFilterValues
        .map(value => {
          const option = this.sortFilterOptions.find(opt => opt.value === value);
          return option ? option.label : value;
        })
        .join(', ');
    } else {
      return `${this.selectedSortFilterValues.length} selected`;
    }
  }

  onSortDropdownSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.sortDropdownSearchText = target.value;
    this.filterSortDropdownOptions();
  }

  private filterSortDropdownOptions(): void {
    if (!this.sortDropdownSearchText) {
      this.filteredSortFilterOptions = [...this.sortFilterOptions];
    } else {
      const searchTerm = this.sortDropdownSearchText.toLowerCase();
      this.filteredSortFilterOptions = this.sortFilterOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm) ||
        option.value.toLowerCase().includes(searchTerm)
      );
    }
  }

  isSortFilterOptionSelected(value: any): boolean {
    return this.selectedSortFilterValues.includes(value);
  }

  onSortFilterOptionSelect(value: any, event: Event): void {
    event.stopPropagation();
    
    let newSelectedValues: Array<any>;
    
    if (this.selectedSortFilterValues.includes(value)) {
      // Remove the value
      newSelectedValues = this.selectedSortFilterValues.filter(v => v !== value);
    } else {
      // Add the value
      newSelectedValues = [...this.selectedSortFilterValues, value];
    }
    
    this.sortFilterChange.emit(newSelectedValues);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.sort-multi-select-container');
    
    if (!dropdown) {
      this.sortDropdownOpen = false;
    }
  }
} 