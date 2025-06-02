import { Component, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { StampData, StampType } from './StampData';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StampStorageService } from './stamp-storage.service';
import { UserService } from '../../user/user.service';
// import { HttpClient } from '@angular/common/http'; // Uncomment when implementing actual backend API

@Component({
  selector: 'rx-stamp-panel',
  templateUrl: './stamp-panel.component.html',
  styleUrls: ['./stamp-panel.component.scss']
})
export class StampPanelComponent implements OnInit {
   
  form: any = {};
  formConfig: any[];
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('stampPreview', { static: false }) stampPreview: ElementRef<HTMLDivElement>;
  opened: boolean = false;
  activeIndex: number = 0;

 remoteImageUrl: string = '';

  stampText: string = 'Draft';
  textColor: string = '#000000';
  selectedFontStyle: string = 'Arial';
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  username: boolean = false;
  date: boolean = false;
  time: boolean = false;
  subTextFontSize = 6;
  textOffset = this.subTextFontSize;
  usernameDefaultText: string = 'Demo';
  dateDefaultText: string;
  timeDefaultText: string;
  strokeWidth: number = 1;
  strokeColor: string = '#000000';
  strokeRadius: number = 8;
  activeIndexStamp: number = 1;
  svgContent: string = '';
  templates: StampData[] = [];
  customStamps: StampData[] = [];
  uploadImageStamps: StampData[] = [];
  font: any;
  color: string;
  fillColor = "#ffffff";
  snap: boolean = false;
  isTextAreaVisible: boolean = false;
  fillOpacity: number = 0;
  isFillOpacityVisible: boolean = true;
  isArrowsVisible: boolean = false;
  isThicknessVisible: boolean = false;
  isSnapVisible: boolean = false;
  isBottom: boolean = false;
  style: any;
  text: string = '';
  strokeThickness: number = 1;
  safeSvgContents: SafeHtml[] = [];
  isDragOver: boolean = false;
  isSyncing: boolean = false;
  syncStatus: { message: string; type: 'success' | 'error' | 'info' } | null = null;

  // Add permission observables
  canAddAnnotation = this.userService.canAddAnnotation$;
  canUpdateAnnotation = this.userService.canUpdateAnnotation$;
  canDeleteAnnotation = this.userService.canDeleteAnnotation$;
  isLoggedIn = this.userService.currentUser$;

  constructor(  private readonly rxCoreService: RxCoreService, private cdr: ChangeDetectorRef,
                private readonly colorHelper: ColorHelper,private sanitizer: DomSanitizer,
                private readonly storageService: StampStorageService,
                private readonly userService: UserService
                // private readonly http: HttpClient // Uncomment when implementing actual backend API
  ) {}
  private _setDefaults(): void {

    this.isTextAreaVisible = false;
    this.isFillOpacityVisible = true;
    this.isArrowsVisible = false;
    this.isThicknessVisible = false;
    this.isSnapVisible = false;
    this.text = '';
    this.font = {
      style: {
          bold: false,
          italic: false
      },
      font: 'Arial'
    };
    this.color = "#000000FF";
    this.strokeThickness = 1;
    this.snap = RXCore.getSnapState();
  }
  get textStyle(): string {
    const textWidth = 120;
    const borderMargin = 5;
    const strokeWidth = this.strokeWidth || 1;
    const availableWidth = textWidth - (2 * borderMargin) - strokeWidth;
    let fontSize = 18;
    if (this.stampText.length * 10 > availableWidth) {
      fontSize = availableWidth / (this.stampText.length * 0.6);
    }
  
    let style = `font-family: ${this.selectedFontStyle}; font-size: ${fontSize}px; fill: ${this.textColor};`;
    if (this.isBold) style += ` font-weight: bold;`;
    if (this.isItalic) style += ` font-style: italic;`;
    if (this.isUnderline) style += ` text-decoration: underline;`;
    return style;
  }
  
  get subtleTextStyle(): string {
    let style = `font-family: ${this.selectedFontStyle}; font-size: ${this.subTextFontSize}px; fill: ${this.textColor};`;
    if (this.isBold) style += ` font-weight: bold;`;
    if (this.isItalic) style += ` font-style: italic;`;
    return style;
  }
  get timestampText(): string {
    const userName = this.username ? this.usernameDefaultText : '';
    const date = this.date ? this.dateDefaultText : '';
    const time = this.time ? this.timeDefaultText : '';
    return `${userName} ${date} ${time}`.trim();
  }

  get textX(): number {
    const textWidth = 120;
    const borderMargin = 5;
    const strokeWidth = this.strokeWidth || 1;
    return (textWidth + (2 * borderMargin) + strokeWidth) / 2;
  }

  get textY(): number {
    const textHeight = 30;
    const borderMargin = 5;
    const strokeWidth = this.strokeWidth || 1;
    var a = ((textHeight + (2 * borderMargin) + strokeWidth + 20) / 2) - 10;
    return a;
  }

  get svgWidth(): number {
    const textWidth = 120;
    const borderMargin = 5;
    const strokeWidth = this.strokeWidth || 1;
    return textWidth + (2 * borderMargin) + strokeWidth;
  }

  get svgHeight(): number {
    const textHeight = 30;
    const borderMargin = 5;
    const strokeWidth = this.strokeWidth || 1;
    return textHeight + (2 * borderMargin) + strokeWidth + 20;
  }

  get isAdmin() {
    return this.userService.isAdmin();
  }

  ngOnInit(): void {
    // this.loadSvg();
    const now = new Date();
    this.dateDefaultText = now.toLocaleDateString();
    this.timeDefaultText = now.toLocaleTimeString();
    this._setDefaults();
    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {


      if (markup === -1 || operation.created || operation.deleted) return;

      try {
        this.color = this.colorHelper.rgbToHex(markup.textcolor);
      } catch (error) {
        this.color = "#FF0000";
      } 

      
      this.font = {
          style: {
            bold: markup.font.bold,
            italic: markup.font.italic
          },
          font: markup.font.fontName
      }; 
    });
    this.getStandardStamps();
    this.getCustomStamps();
    this.getUploadImageStamps();
  }

  private async convertToStampData(item: any): Promise<StampData> {
      const blobUrl = await this.convertBase64ToBlobUrl(item.content, item.type);
      // const svgContent = atob(item.content);
      // const { width, height } = this.extractSvgDimensions(svgContent);
      const width = item.width ? item.width : 210;
      const height = item.height ? item.height :75;
      return {
        id: item.id,
        name: item.name,
        src: blobUrl,
        type: item.type,
        height: height, 
        width: width
      };
  }

  getStandardStamps() {
    this.storageService.getAllStandardStamps().then((stamps: any[]) => {
      const stampPromises = stamps.map(async (item: any) => {
        return this.convertToStampData({id: item.id, ...JSON.parse(item.data)});
      });

      // Resolve all promises to get the stamp data
      Promise.all(stampPromises).then(resolvedStamps => {
        this.templates = resolvedStamps;
        console.log('Standard stamps retrieved successfully:', this.templates);
      }).catch(error => {
        console.error('Failed to convert stamps:', error);
      });;

    }).catch(error => {
      console.error('Error retrieving stamps:', error);
    });
  }
 
  getCustomStamps() {
    this.storageService.getAllCustomStamps().then((stamps: any[]) => {
      const stampPromises = stamps.map(async (item: any) => {
        return this.convertToStampData({id: item.id, ...JSON.parse(item.data)});
      });

      // Resolve all promises to get the stamp data
      Promise.all(stampPromises).then(resolvedStamps => {
        this.customStamps = resolvedStamps;
        console.log('Custom stamps retrieved successfully:', this.customStamps);
      }).catch(error => {
        console.error('Failed to convert stamps:', error);
      });;

    }).catch(error => {
      console.error('Error retrieving stamps:', error);
    });
  }

  getUploadImageStamps() {
    this.storageService.getAllUploadImageStamps().then((stamps: any[]) => {
      const stampPromises = stamps.map(async (item: any) => {
        return this.convertToStampData({id: item.id, ...JSON.parse(item.data)});
      });

      // Resolve all promises to get the stamp data
      Promise.all(stampPromises).then(resolvedStamps => {
        this.uploadImageStamps = resolvedStamps;
        console.log('Upload image stamps retrieved successfully:', this.uploadImageStamps);
      }).catch(error => {
        console.error('Failed to convert stamps:', error);
      });;

    }).catch(error => {
      console.error('Error retrieving stamps:', error);
    });
  }
 
   extractSvgDimensions(svgContent: string): { width: number, height: number } {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Extract width and height from the SVG element
    const width = svgElement.getAttribute('width');
    const height = svgElement.getAttribute('height');

    return {
      width: width ? parseFloat(width) : 400, // Default width if not specified
      height: height ? parseFloat(height) : 200 // Default height if not specified
    };
  }

   async fetchSvgContent(blobUrl: string): Promise<string> {
    const response = await fetch(blobUrl);
    const svgText = await response.text();
    return svgText;
  }

  
  deleteCustomStamp(id: number): void {
    this.storageService.deleteCustomStamp(id).then(() => {
       for (let i = 0; i < this.customStamps.length; i++) {
        if (this.customStamps[i].id === id) {
          this.customStamps.splice(i, 1);
          break;
        }
      }
    }).catch(error => {
      console.error('Error deleting stamp:', error);
    });
  }

  deleteStandardStamp(id: number): void {
    this.storageService.deleteStandardStamp(id).then(() => {
       for (let i = 0; i < this.templates.length; i++) {
        if (this.templates[i].id === id) {
          this.templates.splice(i, 1);
          break;
        }
      }
    }).catch(error => {
      console.error('Error deleting stamp:', error);
    });
  }

  async convertToStandardStamp(type: StampType, id: number) {
    let currentStamp;
    if (type ===  StampType.CustomStamp) {
      currentStamp = this.customStamps.find(d => d.id === id);
      this.deleteCustomStamp(id);
    } else if (type=== StampType.UploadStamp) {
      currentStamp = this.uploadImageStamps.find(d => d.id === id);
      this.deleteImageStamp(id);
    }
    const {imageData, width, height} = await this.convertUrlToBase64Data(currentStamp.src);
    const newStamp = {
      name: currentStamp.name,
      type: StampType.StandardStamp,
      width: width,
      height: height,
      content: imageData
    };
    this.storageService.addStandardStamp(newStamp).then(() => {
      // refresh standard list
      this.getStandardStamps();
    }).catch(error => {
      console.error('Error add standard stamp:', error);
    });
  }

  private convertUrlToBase64Data(url: string, newWidth?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas');
      img.crossOrigin = '*';
      img.onload = () => {
          const originalWidth = img.width, originalHeight = img.height;
          const aspectRatio = originalWidth / originalHeight;
          const width = newWidth || originalWidth, height = newWidth ? newWidth / aspectRatio : originalHeight;
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d')!;
          //ctx.fillStyle = 'white';
          //ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL();
          const base64Index = base64.indexOf('base64,') + 'base64,'.length;
          const imageData = base64.substring(base64Index);
          resolve({imageData, width, height});
      };
      img.onerror = function () {
          reject(new Error('Error convert to base64'));
      };
      img.src = url;
    })
  }
  
  async convertBase64ToBlobUrl(base64Data: string, type: string): Promise<string> {
    const blob = await this.convertBase64ToBlob(base64Data, type);
    return URL.createObjectURL(blob);
  }
  
  convertBase64ToBlob(base64Data: string, type: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      resolve(new Blob([byteArray], { type }));
    });
  }

  onChangeSubTitle() {
    this.textOffset = this.hasTimestamp() ? 0 : this.subTextFontSize;
  }

  onColorSelect(color: string): void {
    this.textColor = color;
    this.color = color;
  }
  onFillColorSelect(color: string): void {
    this.fillColor = color;
  }
  onTextStyleSelect(font): void {
    this.font = font;
    this.selectedFontStyle = font.font;
    this.font.style.bold ? this.isBold = true : this.isBold = false;
    this.font.style.italic ? this.isItalic = true : this.isItalic = false;
    RXCore.setFontFull(font);
  }
  onStrokeColorSelect(color: string): void {
    this.strokeColor = color;
    this.color = color;
  }
  convertSvgToDataUri(svg: string): string {
    const base64Svg = btoa(svg);
    return `data:image/svg+xml;base64,${base64Svg}`;
  }
  
  async convertBase64ToSvg(base64Data: string): Promise<string> {
    // Assuming the base64 data is a complete SVG string
    return atob(base64Data);
  }
  hasTimestamp(): boolean {
    const userName = this.username ?  this.dateDefaultText: '';
    const date = this.date ? this.dateDefaultText : '';
    const time = this.time ? this.timeDefaultText : '';
    return !!(userName || date || time);
}

getSvgData(): string {
  const textWidth = 120;
  const textHeight = 30;
  const borderMargin = 5;
  const cornerRadius = this.strokeRadius || 0;
  const strokeWidth = this.strokeWidth || 1;
  const availableWidth = textWidth - (2 * borderMargin) - strokeWidth;
  const availableHeight = textHeight - (2 * borderMargin) - strokeWidth;
  let fontSize = 18; 
  if (this.stampText.length * 10 > availableWidth) {
    fontSize = availableWidth / (this.stampText.length * 0.6);
  }

  const svgWidth = textWidth + (2 * borderMargin) + strokeWidth;
  const svgHeight = textHeight + (2 * borderMargin) + strokeWidth + 20;

  const textX = svgWidth / 2;
  const textY = svgHeight / 2;

  const timestampStyle = `font-size: 6px; fill: ${this.textColor};`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
      <rect x="${strokeWidth / 2}" y="${strokeWidth / 2}" width="${svgWidth - strokeWidth}" height="${svgHeight - strokeWidth}" fill="${this.fillColor}" stroke="${this.strokeColor}" stroke-width="${strokeWidth}" rx="${cornerRadius}" ry="${cornerRadius}"/>
      <text x="${textX}" y="${textY + this.subTextFontSize}" text-anchor="middle" alignment-baseline="middle" font-size="${fontSize}" style="font-family: ${this.selectedFontStyle}; fill: ${this.textColor};">
        <tspan>${this.stampText}</tspan>
        ${this.hasTimestamp()? `<tspan x="${textX}" dy="2.2em" style="${timestampStyle}">${this.timestampText}</tspan>` : ''}
      </text>
    </svg>
  `;
}

  uploadCustomStamp(): void {
    this.svgContent = this.getSvgData();
    
    //const svgBase64 = btoa(this.svgContent);
    const svgBase64 = btoa(unescape(encodeURIComponent(this.svgContent)));
    const stampName = 'custom-stamp_' + new Date().getTime();
    const stampType = 'image/svg+xml';

    const newStamp = {
      name: stampName,
      type: stampType,
      content: svgBase64
    };
    // let stamps = JSON.parse(localStorage.getItem('CustomStamps') || '[]');
    // stamps.push(newStamp);
    // localStorage.setItem('CustomStamps', JSON.stringify(stamps));
    this.storageService.addCustomStamp(newStamp).then(async (item: any) => {
      console.log('Custom stamp added successfully:', item);
      const stampData = await this.convertToStampData({id: item.id, ...newStamp});
      this.customStamps.push(stampData);
      this.opened = false;
    }).catch(error => {
      console.error('Error adding custom stamp:', error);
    });
   
    // const link = document.createElement('a');
    // link.href = 'data:image/svg+xml;base64,' + svgBase64;
    // link.download = 'custom-stamp.svg';
    // link.click();
  }
 
  async handleUploadImageUrl() {
    if (!this.remoteImageUrl) return;
    try {
      const {imageData, width, height} = await this.convertUrlToBase64Data(this.remoteImageUrl);
      const newStamp = {
        name: this.remoteImageUrl,
        type: StampType.StandardStamp,
        content: imageData,
        width, 
        height
      };
      this.storageService.addUploadImageStamp(newStamp).then(async (item: any) => {
        console.log('Upload image stamp added successfully:', item);
        const stampData = await this.convertToStampData({id: item.id, ...newStamp});
        this.uploadImageStamps.push(stampData);
      }).catch(error => {
        console.error('Error adding image stamp:', error);
      });
      
    } catch (error) {
      console.log(error);
    }
  }
  
handleImageUpload(event: any) {
  const files = event.target.files;
  if (files && files.length > 0) {
    // Convert FileList to Array for consistency with drag and drop
    const fileArray: File[] = Array.from(files);
    this.handleFileUpload(fileArray);
  }
  
  // Clear the input value to allow re-uploading the same file
  event.target.value = '';
}

deleteImageStamp(id: number): void {
  this.storageService.deleteUploadImageStamp(id).then(() => {
     for (let i = 0; i < this.uploadImageStamps.length; i++) {
      if (this.uploadImageStamps[i].id === id) {
        this.uploadImageStamps.splice(i, 1);
        break;
      }
    }
  }).catch(error => {
    console.error('Error deleting image stamp:', error);
  });
}


  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.companyLogo = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
  

  getTextStyle() {
    return {
      color: this.textColor,
      fontWeight: this.isBold? 'bold' : 'normal',
      fontStyle: this.isItalic? 'italic' : 'normal',
      textDecoration: this.isUnderline? 'underline' : 'none',
      fontFamily: this.selectedFontStyle
    };
  }
 
  onPanelClose(): void {
    this.onClose.emit();
  }

  onSnapChange(onoff: boolean): void {
    RXCore.changeSnapState(onoff);
  }

  onLockChange(onoff: boolean): void {
    //RXCore.changeSnapState(onoff);
    let mrkUp = RXCore.getSelectedMarkup();
    mrkUp.locked = onoff;
  }

  onFillOpacityChange(): void {
    RXCore.changeTransp(this.fillOpacity);
  }

  editCustomStamp(id: number): void {
    const stampToEdit = this.customStamps.find(stamp => stamp.id === id);
    //Logic to edit
  }

  // Drag and Drop Methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processDroppedFiles(files);
    }
  }

  onDropZoneClick(): void {
    // Get reference to the hidden file input and trigger click
    const fileInput = document.querySelector('input[type="file"][accept*="jpg"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  private processDroppedFiles(files: FileList): void {
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (allowedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        console.warn(`File ${file.name} is not a valid image type. Only JPG, JPEG, and PNG are allowed.`);
      }
    }

    if (validFiles.length > 0) {
      this.handleFileUpload(validFiles);
    }
  }

  private handleFileUpload(files: File[]): void {
    const uploadPromises: Promise<void>[] = [];

    for (const file of files) {
      const reader = new FileReader();

      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const imageDataWithPrefix = e.target?.result as string;
            const {imageData, width, height} = await this.convertUrlToBase64Data(imageDataWithPrefix);

            const imageName = file.name + '_' + new Date().getTime();
            const imageType = "image/png";

            const imageObject = {
              content: imageData,
              name: imageName,
              type: imageType,
              width,
              height
            };
            
            const item = await this.storageService.addUploadImageStamp(imageObject);
            console.log('Upload image stamp added successfully:', item);
            const stampData = await this.convertToStampData({id: item.id, ...imageObject});
            this.uploadImageStamps.push(stampData);
            resolve();

          } catch (error) {
            console.error('Error processing file:', error);
            reject(error);
          }
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(file);
      });

      uploadPromises.push(uploadPromise);
    }

    Promise.all(uploadPromises).then(() => {
      console.log('All image stamps uploaded successfully');
    }).catch(error => {
      console.error('Error uploading some files:', error);
    });
  }

  // Backend Sync Methods
  async syncToBackend(): Promise<void> {
    if (this.uploadImageStamps.length === 0) {
      this.syncStatus = { message: 'No stamps to sync', type: 'info' };
      setTimeout(() => this.syncStatus = null, 3000);
      return;
    }

    this.isSyncing = true;
    this.syncStatus = { message: 'Starting sync to backend...', type: 'info' };

    try {
      console.log('Starting sync to backend...');
      
      // Get all stamps from IndexDB
      const stamps = await this.storageService.getAllUploadImageStamps();
      
      for (let i = 0; i < stamps.length; i++) {
        const stamp = stamps[i];
        const stampData = JSON.parse(stamp.data);
        
        this.syncStatus = {
          message: `Syncing stamp ${i + 1} of ${stamps.length}...`,
          type: 'info'
        };
        
        // Prepare data for backend
        const backendData = {
          id: stamp.id,
          name: stampData.name,
          type: stampData.type,
          content: stampData.content,
          width: stampData.width,
          height: stampData.height,
          createdAt: new Date().toISOString()
        };

        // TODO: Replace with actual backend API call
        await this.sendToBackend(backendData);
      }

      this.syncStatus = {
        message: `Successfully synced ${stamps.length} stamps to backend!`,
        type: 'success'
      };
      
      console.log('Sync to backend completed successfully');
      
      // Optionally, you can clear IndexDB after successful sync
      // await this.clearIndexDBAfterSync();
      
    } catch (error) {
      console.error('Error syncing to backend:', error);
      this.syncStatus = {
        message: 'Error syncing to backend. Please try again.',
        type: 'error'
      };
    } finally {
      this.isSyncing = false;
      // Clear status after 5 seconds
      setTimeout(() => this.syncStatus = null, 5000);
    }
  }

  private async sendToBackend(stampData: any): Promise<void> {
    console.log('Sending stamp to backend:', stampData);
    
    // For now, just simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Stamp sent to backend:', stampData.name);
        resolve();
      }, 100);
    });
  }

  private async clearIndexDBAfterSync(): Promise<void> {
    try {
      // Clear all upload image stamps from IndexDB after successful sync
      for (const stamp of this.uploadImageStamps) {
        await this.storageService.deleteUploadImageStamp(stamp.id);
      }
      this.uploadImageStamps = [];
      console.log('IndexDB cleared after successful sync');
    } catch (error) {
      console.error('Error clearing IndexDB:', error);
    }
  }

}
