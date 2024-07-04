import { Directive, HostListener, Input } from '@angular/core';
import { RXCore } from 'src/rxcore';

@Directive({
  selector: '[linkTemplate]'
})
export class LinkDragDropDirective {
    @Input() linkTemplate: any;

    @HostListener('dragstart', ['$event'])
    onDragStart(event: DragEvent): void {
      if (!event.dataTransfer) return;
  
      console.log(event.dataTransfer.effectAllowed);
  
      RXCore.markupSymbol(true);
      event.dataTransfer.effectAllowed = "move";
  
      
  
      event.dataTransfer.setData('Text', JSON.stringify(this.linkTemplate));
    }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    RXCore.markupSymbol(this.linkTemplate);
  }
}
