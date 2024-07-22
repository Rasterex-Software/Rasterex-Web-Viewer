import { Directive, Input, HostListener } from '@angular/core';
import { RXCore } from 'src/rxcore';

@Directive({
  selector: '[interactiveStampTemplate]'
})
export class InteractiveStampTemplateDirective {
  @Input() interactiveStampTemplate: any;

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) return;

    console.log(event.dataTransfer.effectAllowed);

    RXCore.markupSymbol(true);
    event.dataTransfer.effectAllowed = "move";

    

    event.dataTransfer.setData('Text', JSON.stringify(this.interactiveStampTemplate));
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    RXCore.markupSymbol(false);
  }

}
