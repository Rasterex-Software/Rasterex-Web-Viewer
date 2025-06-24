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
  @Output() onShowType = new EventEmitter<{ 
    event: any, 
    type: any,
    isSelected?: boolean,
    wasSelected?: boolean,
    action?: 'select' | 'deselect',
    isBulkOperation?: boolean
  }>();
  @Output() onShowAuthor = new EventEmitter<{ 
    event: any, 
    author: any,
    isSelected?: boolean,
    wasSelected?: boolean,
    action?: 'select' | 'deselect'
  }>();

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

  /**
   * Alternative method to check if an element is part of our dropdown system
   */
  private isElementPartOfDropdownSystem(element: HTMLElement): boolean {
    // Check for multi-select related classes
    const dropdownClasses = [
      'multi-select-container',
      'multi-select-wrapper', 
      'multi-select-dropdown',
      'dropdown-options',
      'dropdown-option',
      'selected-items',
      'selected-page-pill',
      'selected-author-pill', 
      'selected-type-pill',
      'dropdown-arrow',
      'type-option-content',
      'type-icon',
      'type-label',
      'type-emoji',
      'pill-type-icon',
      'pill-type-label',
      'pill-type-emoji'
    ];

    // Check if element or any parent has dropdown-related classes
    let currentElement: HTMLElement | null = element;
    while (currentElement) {
      if (dropdownClasses.some(className => currentElement!.classList.contains(className))) {
        return true;
      }
      
      // Also check for our component's main element
      if (currentElement === this.elementRef.nativeElement) {
        return true;
      }
      
      currentElement = currentElement.parentElement;
    }

    return false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Use our robust method to check if the click is part of the dropdown system
    const isPartOfDropdownSystem = this.isElementPartOfDropdownSystem(target);

    // console.log('🎯 Document click detected:', {
    //   targetElement: target.tagName,
    //   targetClasses: target.className,
    //   isPartOfDropdownSystem,
    //   pageDropdownOpen: this.pageDropdownOpen,
    //   authorDropdownOpen: this.authorDropdownOpen,
    //   typeDropdownOpen: this.typeDropdownOpen
    // });

    // If the click is part of our dropdown system, don't close the dropdowns
    if (isPartOfDropdownSystem) {
      // console.log('🎯 Click within dropdown system - keeping dropdowns open');
      return;
    }

    // Close all dropdowns for clicks outside the dropdown system
    // console.log('🎯 Click outside dropdown system - closing all dropdowns');
      this.closeAllDropdowns();
  }

  private closeAllDropdowns(): void {
    // console.log('🎯 Closing all dropdowns:', {
    //   pageDropdownOpen: this.pageDropdownOpen,
    //   authorDropdownOpen: this.authorDropdownOpen,
    //   typeDropdownOpen: this.typeDropdownOpen
    // });
    
    this.pageDropdownOpen = false;
    this.authorDropdownOpen = false;
    this.typeDropdownOpen = false;
    this.currentPageWrapper = null;
    this.currentAuthorWrapper = null;
    this.currentTypeWrapper = null;
    
    // console.log('🎯 All dropdowns closed');
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
  public emitFilterCountChange(): void {
    const count = this.getActiveFilterCount();
    // console.log('Filter count calculation:', {
    //   selectedPages: this.selectedPages.length,
    //   selectedAuthors: this.selectedAuthors.length,
    //   selectedTypes: this.selectedTypes.length,
    //   selectedDate: this.selectedDate ? 1 : 0,
    //   groupBy: this.selectedGroupBy.value !== 'none' ? 1 : 0,
    //   totalCount: count
    // });
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
    
    // console.log('All filters cleared in comments-list-filters');
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

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    // console.log('🎯 Escape key pressed - closing all dropdowns');
    this.closeAllDropdowns();
  }

  onGroupByChange(option: any): void {
    this.selectedGroupBy = option;
    console.log('Group by changed:', option);
    this.emitFilterCountChange();
  }

  onSortByChange(option: any): void {
    this.selectedSortBy = option;
    // console.log('Sort by changed:', option, 'Order:', this.sortOrder);
    this.emitFilterCountChange();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    // console.log('Sort order changed:', this.sortOrder, 'Field:', this.selectedSortBy);
    this.emitFilterCountChange();
  }

  // Date picker methods
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    // console.log('Date selected:', this.selectedDate);
    this.emitFilterCountChange();
    // Emit date selection to parent
    this.onDateSelect.emit({ startDate: this.selectedDate, endDate: this.selectedDate });
  }

  clearDate(): void {
    this.selectedDate = '';
    // console.log('Date filter cleared');
    this.emitFilterCountChange();
  }

  // Page filter methods
  togglePageDropdown(event: Event): void {
    event.stopPropagation();
    
    // console.log('🎯 Toggling page dropdown. Current state:', this.pageDropdownOpen);
    
    // Close all other dropdowns first
    this.authorDropdownOpen = false;
    this.typeDropdownOpen = false;
    this.currentAuthorWrapper = null;
    this.currentTypeWrapper = null;
    
    // Toggle page dropdown
    this.pageDropdownOpen = !this.pageDropdownOpen;
    
    // console.log('🎯 Page dropdown new state:', this.pageDropdownOpen);
    
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
    // console.log('Selected pages:', this.selectedPages);
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
    
    // console.log('🎯 Toggling author dropdown. Current state:', this.authorDropdownOpen);
    
    // Close all other dropdowns first
    this.pageDropdownOpen = false;
    this.typeDropdownOpen = false;
    this.currentPageWrapper = null;
    this.currentTypeWrapper = null;
    
    // Toggle author dropdown
    this.authorDropdownOpen = !this.authorDropdownOpen;
    
    // console.log('🎯 Author dropdown new state:', this.authorDropdownOpen);
    
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
    event.preventDefault(); // Prevent any default behavior
    
    // console.log('🎯 onAuthorSelect START:', { 
    //   authorValue, 
    //   currentSelected: [...this.selectedAuthors],
    //   wasSelected: this.selectedAuthors.includes(authorValue)
    // });
    
    const wasSelected = this.selectedAuthors.includes(authorValue);
    
    // Handle individual author selection/deselection
      const index = this.selectedAuthors.indexOf(authorValue);
    
      if (index > -1) {
      // Deselect the author
        this.selectedAuthors.splice(index, 1);
      // console.log('🎯 Deselected author:', authorValue);
      } else {
      // Select the author
        this.selectedAuthors.push(authorValue);
      // console.log('🎯 Selected author:', authorValue);
    }
    
    const isNowSelected = this.selectedAuthors.includes(authorValue);
    const authorObj = this.authorOptions.find(a => a.value === authorValue);
    
    // console.log('🎯 Individual author change:', {
    //   author: authorObj?.label,
    //   wasSelected,
    //   isNowSelected,
    //   action: isNowSelected ? 'select' : 'deselect'
    // });
    
    if (authorObj) {
      // Use setTimeout to prevent immediate re-processing and ensure state is stable
      setTimeout(() => {
        this.onShowAuthor.emit({ 
          event: { 
            ...event, 
            target: { 
              checked: isNowSelected 
            } 
          }, 
          author: authorObj,
          isSelected: isNowSelected,
          wasSelected: wasSelected,
          action: isNowSelected ? 'select' : 'deselect'
        });
      }, 0);
    }
    
    // console.log('🎯 onAuthorSelect END:', { 
    //   authorValue, 
    //   finalSelected: [...this.selectedAuthors]
    // });
    
    this.updateGroupByOptions();
    this.checkAndResetGrouping();
    this.emitFilterCountChange();
    // Emit author change to parent (for backward compatibility)
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
    
    // console.log('🎯 Toggling type dropdown. Current state:', this.typeDropdownOpen);
    
    // Close all other dropdowns first
    this.pageDropdownOpen = false;
    this.authorDropdownOpen = false;
    this.currentPageWrapper = null;
    this.currentAuthorWrapper = null;
    
    // Toggle type dropdown
    this.typeDropdownOpen = !this.typeDropdownOpen;
    
    // console.log('🎯 Type dropdown new state:', this.typeDropdownOpen);
    
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
    event.preventDefault(); // Prevent any default behavior
    
    // console.log('🎯 onTypeSelect START:', { 
    //   typeValue, 
    //   currentSelected: [...this.selectedTypes],
    //   wasSelected: this.selectedTypes.includes(typeValue)
    // });
    
    const wasSelected = this.selectedTypes.includes(typeValue);
    
    // Handle individual type selection/deselection
      const index = this.selectedTypes.indexOf(typeValue);
    
      if (index > -1) {
      // Deselect the type
        this.selectedTypes.splice(index, 1);
      // console.log('🎯 Deselected type:', typeValue);
      } else {
      // Select the type
        this.selectedTypes.push(typeValue);
      // console.log('🎯 Selected type:', typeValue);
    }
    
    const isNowSelected = this.selectedTypes.includes(typeValue);
    const typeObj = this.typeOptions.find(t => t.value === typeValue);
    
    // console.log('🎯 Individual type change:', {
    //   type: typeObj?.label,
    //   wasSelected,
    //   isNowSelected,
    //   action: isNowSelected ? 'select' : 'deselect'
    // });
    
    if (typeObj) {
      // Use setTimeout to prevent immediate re-processing and ensure state is stable
      setTimeout(() => {
        this.onShowType.emit({ 
          event: { 
            ...event, 
            target: { 
              checked: isNowSelected 
            } 
          }, 
          type: typeObj,
          isSelected: isNowSelected,
          wasSelected: wasSelected,
          action: isNowSelected ? 'select' : 'deselect',
          isBulkOperation: false
        });
      }, 0);
    }
    
    // console.log('🎯 onTypeSelect END:', { 
    //   typeValue, 
    //   finalSelected: [...this.selectedTypes]
    // });
    
    // Update filter count
    this.emitFilterCountChange();
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
      this.authorOptions = [...validAuthors];
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

  /**
   * Public methods for programmatic type selection based on annotation/measurement switches
   */
  
  // Method to select all annotation types (non-measurement types)
  selectAnnotationTypes(): void {
    // Clear all previous selections first
    this.selectedTypes = [];
    
    const annotationTypes = this.typeOptions.filter(type => !this.isMeasurementType(type));
    const annotationTypeValues = annotationTypes.map(type => type.value);
    
    // Set the annotation types as selected
    this.selectedTypes = [...annotationTypeValues];
    
    this.forceUIRefresh();
    // console.log('Selected annotation types:', annotationTypeValues);
  }
  
  // Method to deselect all annotation types
  deselectAnnotationTypes(): void {
    const annotationTypes = this.typeOptions.filter(type => !this.isMeasurementType(type));
    const annotationTypeValues = annotationTypes.map(type => type.value);
    
    // console.log('🎯 Deselecting annotation types:', annotationTypeValues);
    // console.log('🎯 Current selectedTypes before deselection:', this.selectedTypes);
    
    // Remove annotation types from selected types
    this.selectedTypes = this.selectedTypes.filter(typeValue => 
      !annotationTypeValues.includes(typeValue)
    );
    
    // console.log('🎯 selectedTypes after deselection:', this.selectedTypes);
    
    // Force UI refresh to update the display
    this.forceUIRefresh();
    // console.log('🎯 Deselected annotation types - UI refreshed');
  }
  
  // Method to select all measurement types
  selectMeasurementTypes(): void {
    // Clear all previous selections first
    this.selectedTypes = [];
    
    const measurementTypes = this.typeOptions.filter(type => this.isMeasurementType(type));
    const measurementTypeValues = measurementTypes.map(type => type.value);
    
    // Set the measurement types as selected
    this.selectedTypes = [...measurementTypeValues];
    
    this.forceUIRefresh();
    console.log('Selected measurement types:', measurementTypeValues);
  }
  
  // Method to deselect all measurement types
  deselectMeasurementTypes(): void {
    const measurementTypes = this.typeOptions.filter(type => this.isMeasurementType(type));
    const measurementTypeValues = measurementTypes.map(type => type.value);
    
    // console.log('🎯 Deselecting measurement types:', measurementTypeValues);
    // console.log('🎯 Current selectedTypes before deselection:', this.selectedTypes);
    
    // Remove measurement types from selected types
    this.selectedTypes = this.selectedTypes.filter(typeValue => 
      !measurementTypeValues.includes(typeValue)
    );
    
    // console.log('🎯 selectedTypes after deselection:', this.selectedTypes);
    
    // Force UI refresh to update the display
    this.forceUIRefresh();
    // console.log('🎯 Deselected measurement types - UI refreshed');
  }
  
  // Helper method to determine if a type is a measurement type
  private isMeasurementType(type: any): boolean {
    // Use the same logic as the note panel component
    // Check if the type corresponds to measurement types based on actual markup constants
    const measurementTypes = [
      { type: 7, subtype: undefined }, // MEASURE.LENGTH
      { type: 8, subtype: 0 }, // MEASURE.AREA
      { type: 1, subtype: 3 }, // MEASURE.PATH
      { type: 3, subtype: 6 }, // MEASURE.RECTANGLE
      { type: 1, subtype: 4 }, // MEASURE.ANGLECLOCKWISE
      { type: 1, subtype: 5 }, // MEASURE.ANGLECCLOCKWISE
      { type: 14, subtype: 0 }, // MEASURE.MEASUREARC
      { type: 13, subtype: undefined } // COUNT
    ];
    
    // Check if this type matches any measurement type
    const typeNumber = parseInt(type.type) || type.type;
    const subtypeNumber = type.subtype !== undefined ? parseInt(type.subtype) : type.subtype;
    
    return measurementTypes.some(measureType => {
      if (measureType.subtype !== undefined) {
        return typeNumber === measureType.type && subtypeNumber === measureType.subtype;
      } else {
        return typeNumber === measureType.type;
      }
    });
  }
  
  // Method to select authors whose annotations/measurements are currently visible
  selectRelevantAuthors(relevantAuthors: string[]): void {
    // Only auto-select authors if there are any relevant authors
    if (relevantAuthors.length === 0) {
      return;
    }
    
    // Clear current selection
    this.selectedAuthors = [];
    
    // Select relevant authors
    relevantAuthors.forEach(author => {
      // Find author in options
      const authorOption = this.authorOptions.find(opt => 
        opt.label === author
      );
      
      if (authorOption && !this.selectedAuthors.includes(authorOption.value)) {
        this.selectedAuthors.push(authorOption.value);
      }
    });
    
    this.forceUIRefresh();
    // console.log('Selected relevant authors:', this.selectedAuthors);
  }
  
  // Method to select pages that contain annotations/measurements
  selectRelevantPages(relevantPages: string[]): void {
    // Only auto-select pages if there are any relevant pages
    if (relevantPages.length === 0) {
      return;
    }
    
    // Clear current selection
    this.selectedPages = [];
    
    // Select relevant pages
    relevantPages.forEach(page => {
      // Find page in options (excluding 'all')
      const pageOption = this.pageOptions.find(opt => 
        opt.value !== 'all' && opt.value === page
      );
      
      if (pageOption && !this.selectedPages.includes(pageOption.value)) {
        this.selectedPages.push(pageOption.value);
      }
    });
    
    this.forceUIRefresh();
    // console.log('Selected relevant pages:', this.selectedPages);
  }

  /**
   * Force refresh of UI and change detection
   * Call this after programmatic changes to ensure the UI updates properly
   */
  public forceUIRefresh(): void {
    // Trigger change detection and UI refresh
    this.emitFilterCountChange();
    
    // Log current state for debugging
    // console.log('🎯 UI refreshed - current state:', {
    //   selectedTypes: this.selectedTypes,
    //   selectedAuthors: this.selectedAuthors,
    //   selectedPages: this.selectedPages,
    //   typeOptions: this.typeOptions.length
    // });
  }

  /**
   * Public method to close all dropdowns - can be called from parent components
   */
  public closeDropdowns(): void {
    this.closeAllDropdowns();
  }
}
