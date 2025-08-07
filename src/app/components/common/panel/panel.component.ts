import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'rx-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent {
  @Input() title: string;
  @Input() maxHeight: number = Number.MAX_SAFE_INTEGER;
  @Input() draggable: boolean = true;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  
  bounds: HTMLElement = document.getElementById("mainContent") as HTMLElement;

  onCloseClick(): void {
    this.onClose.emit();
  }

}
