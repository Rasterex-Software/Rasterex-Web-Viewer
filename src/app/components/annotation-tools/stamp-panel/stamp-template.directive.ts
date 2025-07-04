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

    //console.log('🚀 Starting drag for stamp:', this.stampTemplate.name, `(${this.stampTemplate.width}x${this.stampTemplate.height})`);

    if (!event.dataTransfer) {
      console.error('❌ No dataTransfer object available');
      return;
    }


    try {
      const newStampTemplate = { ...this.stampTemplate };

      if (this.stampTemplate.type === 'image/svg+xml') {
        let svgString = this.replaceDateTimeInSvg(this.convertBlobUrlToSvgString(this.stampTemplate.src));

        svgString = this.replaceUsernameInSvg(svgString);


        const blobUrl = this.svgToBlobUrl(svgString);

        newStampTemplate.src = blobUrl;
        newStampTemplate.svgContent = svgString;



      }

      RXCore.markupImageStamp(true);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData('Text', JSON.stringify(newStampTemplate));
      console.log('✅ Drag started successfully');

    } catch (error) {
      console.error('💥 Error in drag start:', error);
      
      // Create minimal fallback data
      const fallbackData = {
        id: this.stampTemplate.id,
        name: this.stampTemplate.name,
        type: this.stampTemplate.type,
        width: this.stampTemplate.width,
        height: this.stampTemplate.height,
        _fallback: true
      };
      RXCore.markupImageStamp(true);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData('Text', JSON.stringify(fallbackData));
      console.log('🔄 Using fallback data due to error');
    }

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

    // Replace template placeholders with actual values
    updatedSvgContent = updatedSvgContent.replace(/\bDate\b/g, currentDate);
    updatedSvgContent = updatedSvgContent.replace(/\bTime\b/g, currentTime);

    // Keep existing logic for backward compatibility with old stamps



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

    // if not logged in, use Demo as fallback
    const displayName = user?.displayName || 'Demo';

    /*if (!user || !user.displayName) {
      return svgContent;
    }*/

    let updatedSvgContent = svgContent;

    // Replace template placeholder with actual username
     updatedSvgContent = updatedSvgContent.replace(/\bUser\b/g, displayName);


    // The username in svg is always 'Demo' for now, this is not a strict solution but should be ok for now
    // Keep existing logic for backward compatibility with old stamps
    



    const usernameFormat = /Demo/;
    //updatedSvgContent = updatedSvgContent.replace(usernameFormat, `${user.displayName}`);
    updatedSvgContent = updatedSvgContent.replace(usernameFormat, displayName);

    return updatedSvgContent;
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    RXCore.markupImageStamp(false);
  }

}
