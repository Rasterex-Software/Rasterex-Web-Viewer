import { Directive, Input, HostListener } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { UserService } from '../../user/user.service';

@Directive({
  selector: '[stampTemplate]'
})
export class StampTemplateDirective {
  @Input() stampTemplate: any;

  constructor(private userService: UserService) {}

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) return;

    const newStampTemplate = { ...this.stampTemplate };

    if (this.stampTemplate.type === 'image/svg+xml') {
      let svgString = this.replaceDateTimeInSvg(this.convertBlobUrlToSvgString(this.stampTemplate.src));

      svgString = this.replaceUsernameInSvg(svgString);

      //console.log(event.dataTransfer.effectAllowed);
      const blobUrl = this.svgToBlobUrl(svgString);

      newStampTemplate.src = blobUrl;
      newStampTemplate.svgContent = svgString;

      //this.stampTemplate.src = blobUrl;
      //this.stampTemplate.svgContent = svgString;
    }

    RXCore.markupImageStamp(true);
    event.dataTransfer.effectAllowed = "move";



    //event.dataTransfer.setData('Text', JSON.stringify(this.stampTemplate));
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

    let updatedSvgContent = svgContent;

    const dateFormats = [
      /(\d{4}\/\d{1,2}\/\d{1,2})/, // YYYY/MM/DD
      /(\d{1,2}\/\d{1,2}\/\d{4})/, // MM/DD/YYYY
      /(\d{1,2}\.\d{1,2}\.\d{4})/, // DD.MM.YYYY
    ];
    for (const format of dateFormats) {
      if (updatedSvgContent.match(format)) {
        updatedSvgContent = updatedSvgContent.replace(format, currentDate);
        break;
      }
    }

    updatedSvgContent = updatedSvgContent.replace(/(\d{1,2}:\d{2}:\d{2}( )?(AM|PM)?)/, `${currentTime}`);
    return updatedSvgContent;
  }

  private replaceUsernameInSvg(svgContent: string): string {
    const user = this.userService.getCurrentUser();
    // if not logged in, do nothing
    if (!user || !user.displayName) {
      return svgContent;
    }

    let updatedSvgContent = svgContent;

    // The username in svg is always 'Demo' for now, this is not a strict solution but should be ok for now
    const usernameFormat = /Demo/;
    updatedSvgContent = updatedSvgContent.replace(usernameFormat, `${user.displayName}`);
    return updatedSvgContent;
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    RXCore.markupImageStamp(false);
  }

}
