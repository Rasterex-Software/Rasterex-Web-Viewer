import { Directive, Input, HostListener } from '@angular/core';
import { RXCore } from 'src/rxcore';

@Directive({
  selector: '[stampTemplate]'
})
export class StampTemplateDirective {
  @Input() stampTemplate: any;

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) return;

    const newStampTemplate = { ...this.stampTemplate };
    if (this.stampTemplate.type === 'image/svg+xml') {
      const svgString = this.replaceDateTimeInSvg(this.convertBlobUrlToSvgString(this.stampTemplate.src));

      //console.log(event.dataTransfer.effectAllowed);
      const blobUrl = this.svgToBlobUrl(svgString);
      newStampTemplate.src = blobUrl;
      newStampTemplate.svgContent = svgString;
    }

    RXCore.markupImageStamp(true);
    event.dataTransfer.effectAllowed = "move";

    

    event.dataTransfer.setData('Text', JSON.stringify(newStampTemplate));
  }

  private svgToBlobUrl(svgContent: string): string {
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    return URL.createObjectURL(svgBlob);
  }

  private convertBlobUrlToSvgString(blobUrl: string): string {
    let svgString = '';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', blobUrl, false); 
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        svgString = xhr.responseText;
      }
    };
    xhr.send();

    return svgString;
  }

  private replaceDateTimeInSvg(svgContent: string): string {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    if (svgContent.match(/(\d{4}\/\d{1,2}\/\d{1,2})/)) {
      svgContent = svgContent.replace(/(\d{4}\/\d{1,2}\/\d{1,2})/, `${currentDate}`);
    } else {
      svgContent = svgContent.replace(/(\d{1,2}\/\d{1,2}\/\d{4})/, `${currentDate}`);
    }

    const updatedTimeContent = svgContent.replace(/(\d{1,2}:\d{2}:\d{2}( )?(AM|PM)?)/, `${currentTime}`);

    return updatedTimeContent;
  }


  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    RXCore.markupImageStamp(false);
  }

}
