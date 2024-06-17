import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';

@Component({
  selector: 'rx-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  @Input() options: Array<{ label: string, value: any }> = [];
  @Input() selectedValue: any;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() placeholder: string = 'Select an option';
  isOpen: boolean = false;

  constructor(private eRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {}

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: { label: string, value: any }) {
    this.selectedValue = option.value;
    this.selectionChange.emit(this.selectedValue);
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    const selectedOption = this.options.find(option => option.value === this.selectedValue);
    return selectedOption ? selectedOption.label : 'Select...';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
