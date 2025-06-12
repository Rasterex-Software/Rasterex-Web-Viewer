import { Component, OnInit, OnChanges, Output, EventEmitter, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-comments-list-filters',
  templateUrl: './comments-list-filters.component.html',
  styleUrls: ['./comments-list-filters.component.scss']
})
export class CommentsListFiltersComponent implements OnInit, OnChanges {
  // Inputs from parent component
  @Input() isFilterActive: boolean = false;
  @Input() pageNumbers: any[] = [];
  @Input() rxTypeFilterLoaded: any[] = [];
  @Input() createdByFilterOptions: any[] = [];
  @Input() dateFilter: any = { startDate: null, endDate: null };
  @Input() guiConfig: any = null;

  // Outputs to parent component
  @Output() onClose = new EventEmitter<void>();
  @Output() filterCountChange = new EventEmitter<number>();
  @Output() toggleFilterVisibility = new EventEmitter<void>();
  @Output() clearAllFilters = new EventEmitter<void>();
  @Output() onFilterApply = new EventEmitter<void>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onCreatedByFilterChange = new EventEmitter<any>();
  @Output() onDateSelect = new EventEmitter<any>();
  @Output() onShowType = new EventEmitter<{ event: any, type: any }>();

  // Collapsible state
  isCollapsed = false;

  // Group By options
  groupByOptions = [
    { label: 'None', value: 'none' },
    { label: 'Page', value: 'page', disabled: false },
    { label: 'Author', value: 'author', disabled: false },
    { label: 'Date', value: 'date', disabled: false }
  ];
  selectedGroupBy = this.groupByOptions[0]; // Default to "None"

  // Sort By options (only fields, no order)
  sortByOptions = [
    { label: 'Author', value: 'author' },
    { label: 'Date', value: 'date' },
    { label: 'Page', value: 'page' },
    { label: 'Type', value: 'type' }
  ];
  selectedSortBy = this.sortByOptions[0];

  // Sort order (separate from sort field)
  sortOrder: 'asc' | 'desc' = 'asc'; // 'asc' for ascending, 'desc' for descending

  // Page filter options
  pageOptions = [
    { label: 'All Pages', value: 'all' },
    { label: '1', value: 'page1' },
    { label: '2', value: 'page2' },
    { label: '3', value: 'page3' },
    { label: '4', value: 'page4' },
    { label: '5', value: 'page5' }
  ];
  selectedPages: string[] = []; // No initially selected pages
  pageDropdownOpen = false;

  // Author filter options
  authorOptions = [
    { label: 'All Authors', value: 'all' },
    { label: 'John Doe', value: 'john' },
    { label: 'Jane Roe', value: 'jane' },
    { label: 'Mike Smith', value: 'mike' },
    { label: 'Sarah Wilson', value: 'sarah' }
  ];
  selectedAuthors: string[] = []; // No initially selected authors
  authorDropdownOpen = false;

  // Type dropdown properties
  typeDropdownOpen = false;
  currentTypeWrapper: HTMLElement | null = null;

  // Store wrapper references for repositioning
  currentPageWrapper: HTMLElement | null = null;
  currentAuthorWrapper: HTMLElement | null = null;

  // Type filter options with icons and annotation types
  typeOptions = [
    {
      label: 'Circle',
      value: 'circle',
      type: 'circle',
      subtype: '',
      emoji: '⭕'
    },
    {
      label: 'Arrow',
      value: 'arrow',
      type: 'arrow',
      subtype: '',
      emoji: '➡️'
    },
    {
      label: 'Fixed it',
      value: 'fixed',
      type: 'text',
      subtype: 'fixed',
      emoji: '🔧'
    },
    {
      label: 'Freehand pen',
      value: 'freehand',
      type: 'freehand',
      subtype: '',
      emoji: '✏️'
    },
    {
      label: 'Marker',
      value: 'marker',
      type: 'text',
      subtype: 'marker',
      emoji: '📍'
    }
  ];
  selectedTypes: string[] = []; // No initially selected types

  // Date filter for notes creation
  selectedDate: string = ''; // Empty string for no date selected

  // Mock grouped data for demonstration (simplified - no per-group type selection)
  groupedData = {
    page: [
      {
        id: 'page1',
        label: 'Page 1',
        count: 3,
        expanded: true,
        types: ['circle', 'fixed', 'arrow'] // Available types for this group
      },
      {
        id: 'page2',
        label: 'Page 2',
        count: 2,
        expanded: true,
        types: ['arrow', 'circle']
      }
    ],
    author: [
      {
        id: 'john',
        label: 'John Doe',
        count: 4,
        expanded: true,
        types: ['circle', 'arrow', 'fixed']
      },
      {
        id: 'jane',
        label: 'Jane Roe',
        count: 1,
        expanded: true,
        types: ['fixed']
      }
    ],
    date: [
      {
        id: 'today',
        label: 'Today',
        count: 3,
        expanded: true,
        types: ['circle', 'arrow']
      },
      {
        id: 'yesterday',
        label: 'Yesterday',
        count: 2,
        expanded: true,
        types: ['fixed', 'circle']
      }
    ]
  };

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    // Initialize component
    this.updateOptionsFromParent();
    this.updateGroupByOptions();
    
    // Emit initial filter count after slight delay to ensure component is ready
    setTimeout(() => {
      this.emitFilterCountChange();
    }, 0);
    
    // Add scroll listener to the main scrollable container
    setTimeout(() => {
      const mainSection = document.querySelector('.main-section');
      if (mainSection) {
        mainSection.addEventListener('scroll', () => {
          this.onContainerScroll();
        });
      }
    }, 100);
  }

  ngOnChanges(): void {
    // Update options when inputs change
    this.updateOptionsFromParent();
  }

  private onContainerScroll(): void {
    if (this.pageDropdownOpen) {
      this.updatePageDropdownPosition();
    }
    if (this.authorDropdownOpen) {
      this.updateAuthorDropdownPosition();
    }
    if (this.typeDropdownOpen) {
      this.updateTypeDropdownPosition();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  private closeAllDropdowns(): void {
    this.pageDropdownOpen = false;
    this.authorDropdownOpen = false;
    this.typeDropdownOpen = false;
    this.currentPageWrapper = null;
    this.currentAuthorWrapper = null;
    this.currentTypeWrapper = null;
  }

  // Calculate the number of active filters
  getActiveFilterCount(): number {
    let count = 0;
    
    // Count selected pages
    if (this.selectedPages.length > 0) {
      count += this.selectedPages.length;
    }
    
    // Count selected authors
    if (this.selectedAuthors.length > 0) {
      count += this.selectedAuthors.length;
    }
    
    // Count selected types
    if (this.selectedTypes.length > 0) {
      count += this.selectedTypes.length;
    }
    
    // Count date filter
    if (this.selectedDate) {
      count++;
    }
    
    // Count if grouping is enabled (not "None")
    if (this.selectedGroupBy.value !== 'none') {
      count++;
    }
    
    // Count if sort order is not default (if you want to count sorting as a filter)
    // if (this.sortOrder !== 'asc') {
    //   count++;
    // }
    
    return count;
  }

  // Emit filter count change
  private emitFilterCountChange(): void {
    const count = this.getActiveFilterCount();
    console.log('Filter count calculation:', {
      selectedPages: this.selectedPages.length,
      selectedAuthors: this.selectedAuthors.length,
      selectedTypes: this.selectedTypes.length,
      selectedDate: this.selectedDate ? 1 : 0,
      groupBy: this.selectedGroupBy.value !== 'none' ? 1 : 0,
      totalCount: count
    });
    this.filterCountChange.emit(count);
  }

  // Clear all filters method
  clearAllFiltersInternal(): void {
    this.selectedPages = [];
    this.selectedAuthors = [];
    this.selectedTypes = [];
    this.selectedDate = ''; // Clear date filter
    this.selectedGroupBy = this.groupByOptions[0]; // Reset to "None"
    this.selectedSortBy = this.sortByOptions[0]; // Reset to first option
    this.sortOrder = 'asc'; // Reset to ascending
    
    console.log('All filters cleared in comments-list-filters');
    this.emitFilterCountChange();
    this.clearAllFilters.emit(); // Emit to parent
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  onWindowEvent(): void {
    if (this.pageDropdownOpen) {
      this.updatePageDropdownPosition();
    }
    if (this.authorDropdownOpen) {
      this.updateAuthorDropdownPosition();
    }
    if (this.typeDropdownOpen) {
      this.updateTypeDropdownPosition();
    }
  }

  onGroupByChange(option: any): void {
    this.selectedGroupBy = option;
    console.log('Group by changed:', option);
    this.emitFilterCountChange();
  }

  onSortByChange(option: any): void {
    this.selectedSortBy = option;
    console.log('Sort by changed:', option, 'Order:', this.sortOrder);
    this.emitFilterCountChange();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    console.log('Sort order changed:', this.sortOrder, 'Field:', this.selectedSortBy);
    this.emitFilterCountChange();
  }

  // Date picker methods
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    console.log('Date selected:', this.selectedDate);
    this.emitFilterCountChange();
    // Emit date selection to parent
    this.onDateSelect.emit({ startDate: this.selectedDate, endDate: this.selectedDate });
  }

  clearDate(): void {
    this.selectedDate = '';
    console.log('Date filter cleared');
    this.emitFilterCountChange();
  }

  // Page filter methods
  togglePageDropdown(event: Event): void {
    event.stopPropagation();
    // Close all other dropdowns first
    this.authorDropdownOpen = false;
    this.typeDropdownOpen = false;
    this.currentAuthorWrapper = null;
    this.currentTypeWrapper = null;
    
    // Toggle page dropdown
    this.pageDropdownOpen = !this.pageDropdownOpen;
    
    if (this.pageDropdownOpen) {
      setTimeout(() => this.positionPageDropdown(event.target as HTMLElement), 0);
    } else {
      this.currentPageWrapper = null;
    }
  }

  positionPageDropdown(target: HTMLElement): void {
    const wrapper = target.closest('.multi-select-wrapper') as HTMLElement;
    this.currentPageWrapper = wrapper; // Store reference for repositioning
    this.updatePageDropdownPosition();
  }

  updatePageDropdownPosition(): void {
    if (!this.currentPageWrapper) return;
    
    const dropdown = this.currentPageWrapper.parentElement?.querySelector('.multi-select-dropdown') as HTMLElement;
    if (dropdown && this.currentPageWrapper) {
      const rect = this.currentPageWrapper.getBoundingClientRect();
      
      // Check if the wrapper is still visible
      if (rect.height === 0 || rect.width === 0) {
        this.pageDropdownOpen = false;
        return;
      }
      
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${rect.bottom + 2}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
      dropdown.style.right = 'auto';
      dropdown.style.maxHeight = '200px';
      dropdown.style.overflowY = 'auto';
    }
  }

  onPageSelect(pageValue: string, event: Event): void {
    event.stopPropagation();
    if (pageValue === 'all') {
      this.selectedPages = this.pageOptions.slice(1).map(p => p.value);
    } else {
      const index = this.selectedPages.indexOf(pageValue);
      if (index > -1) {
        this.selectedPages.splice(index, 1);
      } else {
        this.selectedPages.push(pageValue);
      }
    }
    console.log('Selected pages:', this.selectedPages);
    this.updateGroupByOptions();
    this.checkAndResetGrouping();
    this.emitFilterCountChange();
    // Emit page change to parent
    this.onPageChange.emit(pageValue);
  }

  removePageFilter(pageValue: string, event: Event): void {
    event.stopPropagation();
    const index = this.selectedPages.indexOf(pageValue);
    if (index > -1) {
      this.selectedPages.splice(index, 1);
    }
    this.updateGroupByOptions();
    this.checkAndResetGrouping();
    this.emitFilterCountChange();
  }

  isPageSelected(pageValue: string): boolean {
    return this.selectedPages.includes(pageValue);
  }

  getSelectedPageLabels(): string[] {
    return this.selectedPages.map(pageValue => {
      const page = this.pageOptions.find(p => p.value === pageValue);
      return page ? page.label : pageValue;
    });
  }

  // Author filter methods
  toggleAuthorDropdown(event: Event): void {
    event.stopPropagation();
    // Close all other dropdowns first
    this.pageDropdownOpen = false;
    this.typeDropdownOpen = false;
    this.currentPageWrapper = null;
    this.currentTypeWrapper = null;
    
    // Toggle author dropdown
    this.authorDropdownOpen = !this.authorDropdownOpen;
    
    if (this.authorDropdownOpen) {
      setTimeout(() => this.positionAuthorDropdown(event.target as HTMLElement), 0);
    } else {
      this.currentAuthorWrapper = null;
    }
  }

  positionAuthorDropdown(target: HTMLElement): void {
    const wrapper = target.closest('.multi-select-wrapper') as HTMLElement;
    this.currentAuthorWrapper = wrapper; // Store reference for repositioning
    this.updateAuthorDropdownPosition();
  }

  updateAuthorDropdownPosition(): void {
    if (!this.currentAuthorWrapper) return;
    
    const dropdown = this.currentAuthorWrapper.parentElement?.querySelector('.multi-select-dropdown') as HTMLElement;
    if (dropdown && this.currentAuthorWrapper) {
      const rect = this.currentAuthorWrapper.getBoundingClientRect();
      
      // Check if the wrapper is still visible
      if (rect.height === 0 || rect.width === 0) {
        this.authorDropdownOpen = false;
        return;
      }
      
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${rect.bottom + 2}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
      dropdown.style.right = 'auto';
      dropdown.style.maxHeight = '200px';
      dropdown.style.overflowY = 'auto';
    }
  }

  onAuthorSelect(authorValue: string, event: Event): void {
    event.stopPropagation();
    if (authorValue === 'all') {
      this.selectedAuthors = this.authorOptions.slice(1).map(a => a.value);
    } else {
      const index = this.selectedAuthors.indexOf(authorValue);
      if (index > -1) {
        this.selectedAuthors.splice(index, 1);
      } else {
        this.selectedAuthors.push(authorValue);
      }
    }
    console.log('Selected authors:', this.selectedAuthors);
    this.updateGroupByOptions();
    this.checkAndResetGrouping();
    this.emitFilterCountChange();
    // Emit author change to parent
    this.onCreatedByFilterChange.emit(this.selectedAuthors);
  }

  removeAuthorFilter(authorValue: string, event: Event): void {
    event.stopPropagation();
    const index = this.selectedAuthors.indexOf(authorValue);
    if (index > -1) {
      this.selectedAuthors.splice(index, 1);
    }
    this.emitFilterCountChange();
  }

  isAuthorSelected(authorValue: string): boolean {
    return this.selectedAuthors.includes(authorValue);
  }

  getSelectedAuthorLabels(): string[] {
    return this.selectedAuthors.map(authorValue => {
      const author = this.authorOptions.find(a => a.value === authorValue);
      return author ? author.label : authorValue;
    });
  }

  // Type filter methods - converted to dropdown
  toggleTypeDropdown(event: Event): void {
    event.stopPropagation();
    // Close all other dropdowns first
    this.pageDropdownOpen = false;
    this.authorDropdownOpen = false;
    this.currentPageWrapper = null;
    this.currentAuthorWrapper = null;
    
    // Toggle type dropdown
    this.typeDropdownOpen = !this.typeDropdownOpen;
    
    if (this.typeDropdownOpen) {
      setTimeout(() => this.positionTypeDropdown(event.target as HTMLElement), 0);
    } else {
      this.currentTypeWrapper = null;
    }
  }

  positionTypeDropdown(target: HTMLElement): void {
    const wrapper = target.closest('.multi-select-wrapper') as HTMLElement;
    this.currentTypeWrapper = wrapper; // Store reference for repositioning
    this.updateTypeDropdownPosition();
  }

  updateTypeDropdownPosition(): void {
    if (!this.currentTypeWrapper) return;
    
    const dropdown = this.currentTypeWrapper.parentElement?.querySelector('.multi-select-dropdown') as HTMLElement;
    if (dropdown && this.currentTypeWrapper) {
      const rect = this.currentTypeWrapper.getBoundingClientRect();
      
      // Check if the wrapper is still visible
      if (rect.height === 0 || rect.width === 0) {
        this.typeDropdownOpen = false;
        return;
      }
      
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${rect.bottom + 2}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
      dropdown.style.right = 'auto';
      dropdown.style.maxHeight = '200px';
      dropdown.style.overflowY = 'auto';
    }
  }

  getSelectedTypeLabels(): string[] {
    return this.selectedTypes.map(typeValue => {
      const type = this.typeOptions.find(t => t.value === typeValue);
      return type ? type.label : typeValue;
    });
  }

  // Get selected type objects with icon information
  getSelectedTypeObjects(): any[] {
    return this.selectedTypes.map(typeValue => {
      const type = this.typeOptions.find(t => t.value === typeValue);
      return type ? type : { label: typeValue, value: typeValue, type: '', subtype: '', emoji: '📍' };
    });
  }

  onTypeSelect(typeValue: string, event: Event): void {
    event.stopPropagation();
    if (typeValue === 'all') {
      if (this.selectedTypes.length === this.typeOptions.length) {
        // Deselect all if all are currently selected
        this.selectedTypes = [];
      } else {
        // Select all
        this.selectedTypes = this.typeOptions.map(t => t.value);
      }
    } else {
      const index = this.selectedTypes.indexOf(typeValue);
      if (index > -1) {
        this.selectedTypes.splice(index, 1);
      } else {
        this.selectedTypes.push(typeValue);
      }
    }
    console.log('Selected types:', this.selectedTypes);
    this.emitFilterCountChange();
    // Emit type change to parent
    const typeObj = this.typeOptions.find(t => t.value === typeValue);
    if (typeObj) {
      this.onShowType.emit({ event, type: typeObj });
    }
  }

  isTypeSelected(typeValue: string): boolean {
    return this.selectedTypes.includes(typeValue);
  }

  // Grouped mode methods
  toggleGroupExpanded(groupId: string): void {
    const currentGroupData = this.getCurrentGroupData();
    const group = currentGroupData.find(g => g.id === groupId);
    if (group) {
      group.expanded = !group.expanded;
    }
  }

  getAvailableTypesForGroup(groupId: string): any[] {
    const currentGroupData = this.getCurrentGroupData();
    const group = currentGroupData.find(g => g.id === groupId);
    if (!group) return [];

    return this.typeOptions.filter(type => group.types.includes(type.value));
  }

  // Check if grouping is enabled (not "None")
  isGroupingEnabled(): boolean {
    return this.selectedGroupBy.value !== 'none';
  }

  // Update group by options based on enabled pages/authors
  updateGroupByOptions(): void {
    // Disable Page grouping if no pages selected
    const pageOption = this.groupByOptions.find(opt => opt.value === 'page');
    if (pageOption) {
      pageOption.disabled = this.selectedPages.length === 0;
    }

    // Disable Author grouping if no authors selected
    const authorOption = this.groupByOptions.find(opt => opt.value === 'author');
    if (authorOption) {
      authorOption.disabled = this.selectedAuthors.length === 0;
    }
  }

  // Check and reset grouping if current grouping becomes invalid (only when NO pages/authors)
  checkAndResetGrouping(): void {
    if (this.selectedGroupBy.value === 'page' && this.selectedPages.length === 0) {
      this.selectedGroupBy = this.groupByOptions[0]; // Reset to "None"
    } else if (this.selectedGroupBy.value === 'author' && this.selectedAuthors.length === 0) {
      this.selectedGroupBy = this.groupByOptions[0]; // Reset to "None"
    }
  }

  // Get filtered grouped data (only show enabled pages/authors)
  getCurrentGroupData(): any[] {
    const baseData = this.groupedData[this.selectedGroupBy.value] || [];

    if (this.selectedGroupBy.value === 'page') {
      return baseData.filter(group => this.selectedPages.includes(group.id));
    } else if (this.selectedGroupBy.value === 'author') {
      return baseData.filter(group => this.selectedAuthors.includes(group.id));
    }

    return baseData;
  }

  close(): void {
    this.onClose.emit();
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Methods to emit events to parent component
  handleFilterApply(): void {
    this.onFilterApply.emit();
  }

  handleToggleFilterVisibility(): void {
    this.toggleFilterVisibility.emit();
  }

  // Method to update page and author options from parent data
  updateOptionsFromParent(): void {
    if (this.pageNumbers && this.pageNumbers.length > 0) {
      // Filter out any "Select" options and only keep valid page numbers
      const validPages = this.pageNumbers.filter(page => 
        page.label && page.label !== 'Select' && page.value && page.value !== 'select'
      );
      this.pageOptions = [{ label: 'All Pages', value: 'all' }, ...validPages];
    }
    
    if (this.createdByFilterOptions && this.createdByFilterOptions.length > 0) {
      // Filter out any "Select" options from author options
      const validAuthors = this.createdByFilterOptions.filter(author => 
        author.label && author.label !== 'Select' && author.value && author.value !== 'select'
      );
      this.authorOptions = [{ label: 'All Authors', value: 'all' }, ...validAuthors];
    }

    // Update type options from parent if provided
    if (this.rxTypeFilterLoaded && this.rxTypeFilterLoaded.length > 0) {
      this.typeOptions = this.rxTypeFilterLoaded.map(type => ({
        label: type.label,
        value: type.value || type.typename || (type.subtype ? `${type.type}_${type.subtype}` : type.type),
        type: type.type,
        subtype: type.subtype || '',
        emoji: type.emoji || '📍'
      }));
    }
  }

  // Check if type should be shown (for parent compatibility)
  showType(markupType: any): boolean {
    const typeValue = markupType.value || markupType.typename || (markupType.subtype ? `${markupType.type}_${markupType.subtype}` : markupType.type);
    return this.selectedTypes.includes(typeValue);
  }


}
