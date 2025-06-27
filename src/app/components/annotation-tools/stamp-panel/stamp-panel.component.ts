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
  // These are no longer needed as we use template placeholders
  // usernameDefaultText, dateDefaultText, timeDefaultText removed
  //usernameDefaultText: string = 'Demo';
  //dateDefaultText: string;
  //timeDefaultText: string;
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
  isStandardDragOver: boolean = false;
  draggedStamp: StampData | null = null;
  draggedStampType: 'custom' | 'upload' | null = null;

  // Edit mode variables
  isEditMode: boolean = false;
  editingStampId: number | null = null;
  
  
  // Make Math available in template
  Math = Math;

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

        // For template preview and saved stamps, show placeholders instead of actual values
        const userName = this.username ? 'User' : '';
        const date = this.date ? 'Date' : '';
        const time = this.time ? 'Time' : '';
        return `${userName} ${date} ${time}`.trim();
    
    /*const userName = this.username ? this.usernameDefaultText : '';
    const date = this.date ? this.dateDefaultText : '';
    const time = this.time ? this.timeDefaultText : '';
    return `${userName} ${date} ${time}`.trim();*/
  }

   // New method to get actual timestamp text for when stamp is applied
   get actualTimestampText(): string {
    const userName = this.username ? (this.userService.getCurrentUser()?.displayName || 'Demo') : '';
    const date = this.date ? new Date().toLocaleDateString() : '';
    const time = this.time ? new Date().toLocaleTimeString() : '';
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

  // Helper method to truncate filename with ellipsis
  truncateFilename(filename: string, maxLength: number = 25): string {
    if (!filename || filename.length <= maxLength) {
      return filename || '';
    }
    
    const extension = filename.substring(filename.lastIndexOf('.'));
    const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
    
    if (nameWithoutExtension.length + extension.length <= maxLength) {
      return filename;
    }
    
    const maxNameLength = maxLength - extension.length - 3; // 3 for "..."
    if (maxNameLength <= 0) {
      return filename.substring(0, maxLength - 3) + '...';
    }
    
    return nameWithoutExtension.substring(0, maxNameLength) + '...' + extension;
  }

  ngOnInit(): void {
        // this.loadSvg();
    // Template placeholders will be used instead of actual default values

    //const now = new Date();
    //this.dateDefaultText = now.toLocaleDateString();
    //this.timeDefaultText = now.toLocaleTimeString();

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
        width: width,
        originalFileName: item.originalFileName // Include originalFileName if available
      };
  }



  async getStandardStamps(): Promise<void> {
    try {
      const stamps = await this.storageService.getAllStandardStamps();
      const stampPromises = stamps.map(async (item: any) => {
        return this.convertToStampData({id: item.id, ...JSON.parse(item.data)});
      });

      // Resolve all promises to get the stamp data
      this.templates = await Promise.all(stampPromises);
      console.log('Standard stamps retrieved successfully:', this.templates);
    } catch (error) {
      console.error('Error retrieving standard stamps:', error);
    }
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

  
  async deleteCustomStamp(id: number): Promise<void> {
    try {
      await this.storageService.deleteCustomStamp(id);
      for (let i = 0; i < this.customStamps.length; i++) {
        if (this.customStamps[i].id === id) {
          this.customStamps.splice(i, 1);
          break;
        }
      }
    } catch (error) {
      console.error('Error deleting custom stamp:', error);
    }
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
      // Note: No longer deleting custom stamp to keep it in the list
    } else if (type=== StampType.UploadStamp) {
      currentStamp = this.uploadImageStamps.find(d => d.id === id);
      // Note: No longer deleting upload stamp to keep it in the list
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
      console.log(`Converted ${type} stamp to standard (original kept in collection)`);
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
          
          // Define maximum dimensions for stamp images to ensure drag and drop works
          // These limits are chosen to be reasonable for stamp usage while avoiding RXCore restrictions
          const MAX_STAMP_WIDTH = 300;  // Maximum width for stamp images
          const MAX_STAMP_HEIGHT = 200; // Maximum height for stamp images
          
          let width = newWidth || originalWidth;
          let height = newWidth ? newWidth / aspectRatio : originalHeight;
          
          // Always enforce maximum dimensions for uploaded stamp images
          // This ensures drag and drop will work regardless of original image size
          if (width > MAX_STAMP_WIDTH || height > MAX_STAMP_HEIGHT) {
            console.log(`🔧 Resizing image from ${originalWidth}x${originalHeight} to fit stamp limits`);
            
            if (width / MAX_STAMP_WIDTH > height / MAX_STAMP_HEIGHT) {
              // Width is the limiting factor
              width = MAX_STAMP_WIDTH;
              height = width / aspectRatio;
            } else {
              // Height is the limiting factor  
              height = MAX_STAMP_HEIGHT;
              width = height * aspectRatio;
            }
            
            console.log(`✅ New dimensions: ${Math.round(width)}x${Math.round(height)}`);
          }
          
          // Round dimensions to avoid fractional pixels
          width = Math.round(width);
          height = Math.round(height);
          
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d')!;
          
          try {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/png', 0.8); // Use PNG with good quality
            const base64Index = base64.indexOf('base64,') + 'base64,'.length;
            const imageData = base64.substring(base64Index);
            
            console.log(`📊 Final image: ${width}x${height}, Base64 size: ${imageData.length} characters`);
            resolve({imageData, width, height});
          } catch (error) {
            // If canvas.toDataURL() fails (e.g., due to very large images), reject
            reject(new Error('Error converting image to base64: ' + (error instanceof Error ? error.message : 'Unknown error')));
          }
      };
      img.onerror = function () {
          reject(new Error('Error loading image'));
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

    return !!(this.username || this.date || this.time);

    /*const userName = this.username ?  this.dateDefaultText: '';
    const date = this.date ? this.dateDefaultText : '';
    const time = this.time ? this.timeDefaultText : '';
    return !!(userName || date || time);*/
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

    const stampName = this.isEditMode ? 
      this.customStamps.find(s => s.id === this.editingStampId)?.name || 'custom-stamp_' + new Date().getTime() : 
      'custom-stamp_' + new Date().getTime();
    //const stampName = 'custom-stamp_' + new Date().getTime();
    const stampType = 'image/svg+xml';

    // Collect all stamp settings for future editing
    const stampSettings = {
      stampText: this.stampText,
      textColor: this.textColor,
      selectedFontStyle: this.selectedFontStyle,
      isBold: this.isBold,
      isItalic: this.isItalic,
      isUnderline: this.isUnderline,
      username: this.username,
      date: this.date,
      time: this.time,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      strokeRadius: this.strokeRadius,
      fillColor: this.fillColor,
      fillOpacity: this.fillOpacity,
      font: this.font
    };


    // Include width and height for proper SVG handling
    const stampData = {
      name: stampName,
      type: stampType,
      content: svgBase64,
      width: this.svgWidth,
      height: this.svgHeight,
      stampSettings: stampSettings
    };


    if (this.isEditMode && this.editingStampId) {
      // Update existing stamp
      this.updateCustomStamp(this.editingStampId, stampData);
    } else {
      // Create new stamp
      this.storageService.addCustomStamp(stampData).then(async (item: any) => {
        console.log('Custom stamp added successfully:', item);
        const newStampData = await this.convertToStampData({id: item.id, ...stampData});
        this.customStamps.push(newStampData);
        this.opened = false;
        this.resetEditMode();
      }).catch(error => {
        console.error('Error adding custom stamp:', error);
      });
    }

    
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

async deleteImageStamp(id: number): Promise<void> {
  try {
    await this.storageService.deleteUploadImageStamp(id);
    for (let i = 0; i < this.uploadImageStamps.length; i++) {
      if (this.uploadImageStamps[i].id === id) {
        this.uploadImageStamps.splice(i, 1);
        break;
      }
    }
  } catch (error) {
    console.error('Error deleting image stamp:', error);
  }
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
    if (!stampToEdit) {
      console.error('Stamp not found for editing');
      return;
    }

    // Load original stamp data with settings
    this.getOriginalStampData(id, 'custom').then((originalData) => {
      if (originalData && originalData.stampSettings) {
        // Load settings into form
        this.loadStampSettings(originalData.stampSettings);
      } else {
        // If no settings saved, use default values
        this._setDefaults();
        this.stampText = 'Edit Stamp';
      }
      
      // Set edit mode
      this.isEditMode = true;
      this.editingStampId = id;
      this.opened = true;
    }).catch(error => {
      console.error('Error loading stamp for editing:', error);
    });
    //Logic to edit
  }

  private updateCustomStamp(id: number, stampData: any): void {
    // Update the stamp in storage using the proper update method
    this.storageService.updateCustomStamp(id, stampData).then(async () => {
      console.log('Custom stamp updated successfully');
      
      // Update in local array - keep the same ID
      const index = this.customStamps.findIndex(s => s.id === id);
      if (index !== -1) {
        const updatedStampData = await this.convertToStampData({id: id, ...stampData});
        this.customStamps[index] = updatedStampData;
      }
      
      this.opened = false;
      this.resetEditMode();
    }).catch(error => {
      console.error('Error updating custom stamp:', error);
    });
  }

  resetEditMode(): void {
    this.isEditMode = false;
    this.editingStampId = null;
    this._setDefaults();
  }

  private loadStampSettings(settings: any): void {
    this.stampText = settings.stampText || 'Draft';
    this.textColor = settings.textColor || '#000000';
    this.selectedFontStyle = settings.selectedFontStyle || 'Arial';
    this.isBold = settings.isBold || false;
    this.isItalic = settings.isItalic || false;
    this.isUnderline = settings.isUnderline || false;
    this.username = settings.username || false;
    this.date = settings.date || false;
    this.time = settings.time || false;
    this.strokeWidth = settings.strokeWidth || 1;
    this.strokeColor = settings.strokeColor || '#000000';
    this.strokeRadius = settings.strokeRadius || 8;
    this.fillColor = settings.fillColor || '#ffffff';
    this.fillOpacity = settings.fillOpacity || 0;
    this.font = settings.font || {
      style: {
        bold: false,
        italic: false
      },
      font: 'Arial'
    };
    this.color = this.textColor;
  }

  // Stamp Drag and Drop Methods - Only for Standard conversion tracking
  onStampDragStart(event: DragEvent, stamp: StampData, type: 'custom' | 'upload'): void {
    console.log('Drag start for Standard conversion tracking:', stamp, type);
    // Only track for potential Standard conversion, don't interfere with original drag
    this.draggedStamp = stamp;
    this.draggedStampType = type;
    
    // Don't modify the drag event - let the original stampTemplate directive handle it
    // The original functionality should work as before
  }

  onStampDragEnd(event: DragEvent): void {
    console.log('Drag end - clearing Standard conversion tracking');
    // Clear our tracking state
    setTimeout(() => {
      this.draggedStamp = null;
      this.draggedStampType = null;
      this.isStandardDragOver = false;
    }, 100);
  }

  onStandardDragOver(event: DragEvent): void {
    // Only show visual feedback if we have a tracked stamp AND user is logged in AND has permission
    if (this.draggedStamp && this.draggedStampType && this.userService.getCurrentUser() && this.userService['_canAddAnnotation'].value) {
      // Only prevent default for the specific standard drop zone, not globally
      const target = event.target as HTMLElement;
      if (target.closest('.standard-drop-zone')) {
        event.preventDefault();
        this.isStandardDragOver = true;
        console.log('Standard drop zone drag over - showing feedback');
      }
    }
  }

  onStandardDragLeave(event: DragEvent): void {
    this.isStandardDragOver = false;
  }

  onStandardDrop(event: DragEvent): void {
    // Only handle if we're in the standard drop zone, have a tracked stamp, AND user is logged in AND has permission
    if (this.draggedStamp && this.draggedStampType && this.userService.getCurrentUser() && this.userService['_canAddAnnotation'].value) {
      const target = event.target as HTMLElement;
      if (target.closest('.standard-drop-zone')) {
        event.preventDefault();
        event.stopPropagation();
        this.isStandardDragOver = false;

        console.log('Converting stamp to standard via drop zone');
        this.convertStampToStandard(this.draggedStamp, this.draggedStampType);
        
        this.draggedStamp = null;
        this.draggedStampType = null;
      }
    }
  }

  // Tab-specific drag and drop methods
  onStandardTabDragOver(event: DragEvent): void {
    if (this.draggedStamp && this.draggedStampType && this.userService.getCurrentUser() && this.userService['_canAddAnnotation'].value) {
      event.preventDefault();
      this.isStandardDragOver = true;
      console.log('Standard TAB drag over - showing feedback');
    }
  }

  onStandardTabDragLeave(event: DragEvent): void {
    this.isStandardDragOver = false;
  }

  onStandardTabDrop(event: DragEvent): void {
    if (this.draggedStamp && this.draggedStampType && this.userService.getCurrentUser() && this.userService['_canAddAnnotation'].value) {
      event.preventDefault();
      event.stopPropagation();
      this.isStandardDragOver = false;

      console.log('Converting stamp to standard via TAB');
      // Switch to Standard tab first
      this.activeIndexStamp = 1;
      
      // Convert the stamp to standard
      this.convertStampToStandard(this.draggedStamp, this.draggedStampType);
      
      this.draggedStamp = null;
      this.draggedStampType = null;
    }
  }

  private async convertStampToStandard(stamp: StampData, sourceType: 'custom' | 'upload'): Promise<void> {
    try {
      console.log('Converting stamp to standard:', stamp, sourceType);
      
      let newStamp: any;
      
      if (sourceType === 'custom') {
        // For custom stamps (SVG), preserve the original SVG data
        const originalStampData = await this.getOriginalStampData(stamp.id, 'custom');
        if (originalStampData && originalStampData.type === 'image/svg+xml') {
          // Preserve SVG format for better quality
          newStamp = {
            name: stamp.name,
            type: originalStampData.type, // Keep as SVG
            width: stamp.width,
            height: stamp.height,
            content: originalStampData.content // Use original SVG base64 data
          };
        } else {
          // Fallback to rasterization if original data not available
          const {imageData, width, height} = await this.convertUrlToBase64Data(stamp.src);
          newStamp = {
            name: stamp.name,
            type: StampType.StandardStamp,
            width: width,
            height: height,
            content: imageData
          };
        }
      } else if (sourceType === 'upload') {
        // For uploaded images, get the original data to preserve quality
        const originalStampData = await this.getOriginalStampData(stamp.id, 'upload');
        if (originalStampData) {
          newStamp = {
            name: stamp.name,
            type: originalStampData.type,
            width: originalStampData.width || stamp.width,
            height: originalStampData.height || stamp.height,
            content: originalStampData.content
          };
        } else {
          // Fallback to current conversion method
          const {imageData, width, height} = await this.convertUrlToBase64Data(stamp.src);
          newStamp = {
            name: stamp.name,
            type: StampType.StandardStamp,
            width: width,
            height: height,
            content: imageData
          };
        }
      }

      console.log('Adding new standard stamp:', newStamp);
      
      // Add to standard stamps
      const addedStamp = await this.storageService.addStandardStamp(newStamp);
      console.log('Standard stamp added successfully:', addedStamp);

      
      // Refresh standard stamps list
      await this.getStandardStamps();
      console.log('Standard stamps list refreshed');
      
      console.log(`Successfully converted ${sourceType} stamp to standard stamp`);
    } catch (error) {
      console.error('Error converting stamp to standard:', error);
    }
  }

  private async getOriginalStampData(stampId: number, sourceType: 'custom' | 'upload'): Promise<any> {
    try {
      if (sourceType === 'custom') {
        const stamps = await this.storageService.getAllCustomStamps();
        const stampRecord = stamps.find(s => s.id === stampId);
        if (stampRecord) {
          return JSON.parse(stampRecord.data);
        }
      } else if (sourceType === 'upload') {
        const stamps = await this.storageService.getAllUploadImageStamps();
        const stampRecord = stamps.find(s => s.id === stampId);
        if (stampRecord) {
          return JSON.parse(stampRecord.data);
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting original stamp data:', error);
      return null;
    }
  }

  private async handleFileUpload(files: File[]): Promise<void> {
    const uploadPromises: Promise<void>[] = [];

    for (const file of files) {
      console.log('🔄 Processing file:', file.name, 'Size:', file.size, 'bytes (', (file.size / 1024).toFixed(2), 'KB)');
      const reader = new FileReader();

      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const imageDataWithPrefix = e.target?.result as string;
            console.log('📤 Original image data URL length:', imageDataWithPrefix.length, 'characters');
            
            const {imageData, width, height} = await this.convertUrlToBase64Data(imageDataWithPrefix);
            console.log('🖼️ Processed image dimensions:', width, 'x', height, 'Base64 length:', imageData.length);

            const imageName = file.name + '_' + new Date().getTime();
            const imageType = "image/png";

            const imageObject = {
              content: imageData,
              name: imageName,
              type: imageType,
              width,
              height,
              originalFileName: file.name // Store the original filename
            };
            
            console.log('💾 Storing image object with size:', JSON.stringify(imageObject).length, 'characters');
            
            const item = await this.storageService.addUploadImageStamp(imageObject);
            console.log('✅ Upload image stamp added successfully:', item.id, 'Name:', imageName);
            const stampData = await this.convertToStampData({id: item.id, ...imageObject});
            console.log('🏷️ Converted stamp data:', {
              id: stampData.id,
              name: stampData.name,
              dimensions: `${stampData.width}x${stampData.height}`,
              srcLength: stampData.src.length,
              type: stampData.type
            });
            this.uploadImageStamps.push(stampData);
            resolve();

          } catch (error) {
            console.error('💥 Error processing file:', file.name, error);
            reject(error);
          }
        };

        reader.onerror = (error) => {
          console.error('💥 FileReader error for file:', file.name, error);
          reject(error);
        };

        reader.readAsDataURL(file);
      });

      uploadPromises.push(uploadPromise);
    }

    Promise.all(uploadPromises).then(() => {
      console.log('🎉 All image stamps uploaded successfully');
    }).catch(error => {
      console.error('💥 Error uploading some files:', error);
    });
  }

}
