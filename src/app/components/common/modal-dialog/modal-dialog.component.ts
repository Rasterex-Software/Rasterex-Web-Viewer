import { Component, OnInit, OnDestroy, ViewEncapsulation, Input, ElementRef, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'rx-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss']
})
export class ModalDialogComponent implements OnInit, OnDestroy {
  @Input() opened: boolean = true;
  @Input() position: { top, right };
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  constructor(private element: ElementRef) { }

  ngOnInit(): void {
      document.body.appendChild(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.element.nativeElement.remove();
  }

  close(): void {
    this.onClose.emit();
  }
}
