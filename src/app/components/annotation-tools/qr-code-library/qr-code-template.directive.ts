import { Directive, Input, HostListener } from '@angular/core';
import { RXCore } from 'src/rxcore';

@Directive({
  selector: '[qrCodeTemplate]'
})
export class QRCodeTemplateDirective {
  @Input() qrCodeTemplate: any;

  constructor() {}

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) return;

    // Create a stamp-like object from QR code data
    const qrCodeStamp = {
      id: this.qrCodeTemplate.id,
      name: this.qrCodeTemplate.name,
      src: `data:image/png;base64,${this.qrCodeTemplate.imageData}`,
      type: 'image/png',
      height: this.qrCodeTemplate.size * 27, // Convert QR size to pixels
      width: this.qrCodeTemplate.size * 27,
      qrData: this.qrCodeTemplate // Keep original QR data for reference
    };

    RXCore.markupImageStamp(true);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData('Text', JSON.stringify(qrCodeStamp));
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    RXCore.markupImageStamp(false);
  }
} 