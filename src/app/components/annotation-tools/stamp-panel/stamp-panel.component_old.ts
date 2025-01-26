import { Component, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { STAMP_TEMPLATES } from './stamp-templates';
import { StampData } from './StampData';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  templates: any = STAMP_TEMPLATES;
  opened: boolean = false;
  interactiveStampOpened: boolean = false;
  activeIndex: number = 0;

  stampText: string = 'Draft';
  textColor: string = '#000000';
  selectedFontStyle: string = 'Arial';
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  username: boolean = false;
  date: boolean = false;
  time: boolean = false;
  usernameDefaultText: string = 'Demo';
  dateDefaultText: string;
  timeDefaultText: string;
  strokeWidth: number = 1;
  strokeColor: string = '#000000';
  strokeRadius: number = 0;
  activeIndexStamp: number = 1;
  customStamps: any[] = [];
  svgContent: string = '';
  customStampes: StampData[] = [];
  interactiveStampes: StampData[] = [];
  font: any;
  color: string;
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

  constructor(  private readonly rxCoreService: RxCoreService, private cdr: ChangeDetectorRef,
                private readonly colorHelper: ColorHelper,private sanitizer: DomSanitizer
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
    let style = `font-family: ${this.selectedFontStyle}; font-size: 6px; fill: ${this.textColor};`;
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

  get hasTimestampp(): boolean {
    return this.username || this.date || this.time;
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
  ngOnInit(): void {
    // this.loadSvg();
    const now = new Date();
    this.dateDefaultText = now.toLocaleDateString();
    this.timeDefaultText = now.toLocaleTimeString();
    this._setDefaults();
    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {


      if (markup === -1 || operation.created || operation.deleted) return;
      this.color = this.colorHelper.rgbToHex(markup.textcolor);
      this.font = {
          style: {
            bold: markup.font.bold,
            italic: markup.font.italic
          },
          font: markup.font.fontName
      }; 
    });
    this.getCustomStamps();
    this.getInteractiveStamps();
  }
 
  getCustomStamps() {
    let stamps = JSON.parse(localStorage.getItem('CustomStamps') || '[]');
    const stampPromises = stamps.map(async (item: any) => {
      const blobUrl = await this.convertBase64ToBlobUrl(item.content);
      return {
        id: item.id,
        src: blobUrl,
        height: 75, 
        width: 210 
      };
    });
  
    // Resolve all promises to get the stamp data
    Promise.all(stampPromises).then(resolvedStamps => {
      this.customStampes = resolvedStamps;
      console.log('Stamps retrieved successfully:', this.customStampes);
    }).catch(error => {
      console.error('Error retrieving stamps:', error);
    });

  }
  getInteractiveStamps() {
    let stamps = JSON.parse(localStorage.getItem('InteractiveStamps') || '[]');
    const stampPromises = stamps.map(async (item: any) => {
      const blobUrl = await this.convertBase64ToBlobUrl(item.content);
      const svgContent = await this.fetchSvgContent(blobUrl);
      const { width, height } = this.extractSvgDimensions(svgContent);
      return {
        id: item.id,
        src: blobUrl,
        height: height || 200,  
        width: width || 400, 
        svgContent: this.sanitizer.bypassSecurityTrustHtml(svgContent),
      };
    });
  
    // Resolve all promises to get the stamp data
    Promise.all(stampPromises).then(resolvedStamps => {
      this.interactiveStampes = resolvedStamps;
      console.log('Interactive Stampes retrieved successfully:', this.interactiveStampes);
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

  
  deleteCustomStamp(index: number): void {
    let stamps = JSON.parse(localStorage.getItem('CustomStamps') || '[]');
    
    if (index > -1 && index < stamps.length) {
      stamps.splice(index, 1);
      localStorage.setItem('CustomStamps', JSON.stringify(stamps));
      this.getCustomStamps();
    } else {
      console.error('Invalid index for deleting Custom Stamp');
    }
  }
  deleteInteractiveStamp(index: number): void {
    let stamps = JSON.parse(localStorage.getItem('InteractiveStamps') || '[]');
    
    if (index > -1 && index < stamps.length) {
      stamps.splice(index, 1);
      localStorage.setItem('InteractiveStamps', JSON.stringify(stamps));
      this.getInteractiveStamps();
    } else {
      console.error('Invalid index for deleting interactive stamp');
    }
  }
  
  async convertBase64ToBlobUrl(base64Data: string): Promise<string> {
    const blob = await this.convertBase64ToBlob(base64Data);
    return URL.createObjectURL(blob);
  }
  
  convertBase64ToBlob(base64Data: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      resolve(new Blob([byteArray], { type: 'image/svg+xml' }));
    });
  }
  onColorSelect(color: string): void {
    this.textColor = color;
    this.color = color;
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
      <rect x="${strokeWidth / 2}" y="${strokeWidth / 2}" width="${svgWidth - strokeWidth}" height="${svgHeight - strokeWidth}" fill="none" stroke="${this.strokeColor}" stroke-width="${strokeWidth}" rx="${cornerRadius}" ry="${cornerRadius}"/>
      <text x="${textX}" y="${textY}" text-anchor="middle" alignment-baseline="middle" font-size="${fontSize}" style="font-family: ${this.selectedFontStyle}; fill: ${this.textColor};">
        <tspan>${this.stampText}</tspan>
        ${this.hasTimestamp()? `<tspan x="${textX}" dy="2.2em" style="${timestampStyle}">${this.timestampText}</tspan>` : ''}
      </text>
    </svg>
  `;
}





  
  uploadCustomStamp(): void {
    this.svgContent = this.getSvgData();
    
    const svgBase64 = btoa(this.svgContent);
    const stampName = 'custom-stamp.svg';
    const stampType = 'image/svg+xml';

    const newStamp = {
      name: stampName,
      type: stampType,
      content: svgBase64
    };
    let stamps = JSON.parse(localStorage.getItem('CustomStamps') || '[]');
    stamps.push(newStamp);
    localStorage.setItem('CustomStamps', JSON.stringify(stamps));
    this.opened = false;
    this.getCustomStamps();
    // const link = document.createElement('a');
    // link.href = 'data:image/svg+xml;base64,' + svgBase64;
    // link.download = 'custom-stamp.svg';
    // link.click();
  }
 

  uploadInteractiveStampScript(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = reader.result as string;
  
        // Extract the JSON-like part from the file content
        const configMatch = fileContent.match(/const\s+form\s*=\s*(\[[\s\S]*?\]);/);
        if (configMatch && configMatch[1]) {
          try {
            // Evaluate the configuration part
            const config = eval('(' + configMatch[1] + ')');
            this.form = config;
  
            // Update the form with default values
            this.uploadInteractiveStamp();
          } catch (error) {
            console.error('Error parsing configuration:', error);
          }
        } else {
          console.error('Configuration data not found in the file.');
        }
      };
      reader.readAsText(file);
    }
  }
  
  uploadInteractiveStamp(): void {
    const svgContent = this.getInteractiveSvgData();
    const svgBase64 = btoa(unescape(encodeURIComponent(svgContent)));
    const stampName = 'interactive-stamp-form.svg';
    const stampType = 'image/svg+xml';
  
    const newStamp = {
      name: stampName,
      type: stampType,
      content: svgBase64
    };
  
    let stamps = JSON.parse(localStorage.getItem('InteractiveStamps') || '[]');
    stamps.push(newStamp);
    localStorage.setItem('InteractiveStamps', JSON.stringify(stamps));
    this.interactiveStampOpened = false;
    this.getInteractiveStamps();
  }
  
  getInteractiveSvgData(): string {
    const itemWidth = 130; // Width for each radio button group
    const itemSpacing = 10; // Space between radio buttons
    const fieldWidth = 170; // Width for each input field
    const fieldHeight = 40; // Height for each input field
    const lineHeight = 50; // Height for each line
    const padding = 10; // Padding for elements
    const heightpadding = 70; // Padding for elements
    
    // Create radio button content
    let radioButtons = '';
    let radioYPosition = padding;
    let radioXPosition = padding;
    let totalHeight = heightpadding; // Start with padding
  
    this.form.forEach((item: any, index: number) => {
      if (item.radioButtons) {
        item.radioButtons.forEach((button: any, btnIndex: number) => {
          const col = btnIndex % 3; // Determine column index
          const row = Math.floor(btnIndex / 3); // Determine row index
          radioXPosition = padding + (itemWidth + itemSpacing) * col;
          radioYPosition = padding + row * lineHeight;
          radioButtons += `
            <foreignObject x="${radioXPosition}" y="${radioYPosition}" width="${itemWidth}" height="30">
              <body xmlns="http://www.w3.org/1999/xhtml">
                <div class="editable">
                  <input type="radio" class="radio-btn" id="radio-${index}-${btnIndex}" name="radio-group-${index}" />
                  <label for="radio-${index}-${btnIndex}">${button.description}</label>
                </div>
              </body>
            </foreignObject>
          `;
        });
        // Update total height after radio buttons
        totalHeight = Math.max(totalHeight, radioYPosition + lineHeight);
      }
    });
  
    // Adjust yPosition to the next section after radio buttons
    let yPosition = totalHeight + padding;
  
    // Create field content with labels and input boxes
    let fields = '';
    this.form.forEach((item: any, index: number) => {
      if (item.field) {
        const col = index % 2; //column index
        const row = Math.floor(index / 2); // row index
        const fieldXPosition = padding + (fieldWidth + padding) * col;
        const fieldYPosition = yPosition + row * lineHeight;
  
        fields += `
          <text x="${fieldXPosition}" y="${fieldYPosition + 12}" font-size="12" font-family="Arial">${item.description}:</text>
          <foreignObject x="${fieldXPosition}" y="${fieldYPosition + 20}" width="${fieldWidth}" height="${fieldHeight}">
            <body xmlns="http://www.w3.org/1999/xhtml">
              <div class="editable">
                <input type="text" placeholder="${item.description}" style="width: 100%; height: 100%;" />
              </div>
            </body>
          </foreignObject>
        `;
  
        // Update total height after each field
        totalHeight = Math.max(totalHeight, fieldYPosition + fieldHeight + padding);
      }
    });
  
    // Increase SVG height based on content height and add 20% extra space
    const svgHeight = (totalHeight + padding) * 1.2;
  
    // Generate SVG content
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="${svgHeight}">
        <rect x="0" y="0" width="400" height="${svgHeight - 35}" fill="none" stroke="black" stroke-width="2" rx="5" ry="5"/>
        
        <!-- Dynamic radio buttons -->
        ${radioButtons}
        
        <!-- Dynamic labels and input boxes -->
        ${fields}
      </svg>
    `;
}

updateStampContent(id: string): void {
  let stamps = JSON.parse(localStorage.getItem('InteractiveStamps') || '[]');
  const updatedStamps = stamps.map((stamp: any) => {
      if (stamp.id === id) {
          // Extract updated SVG content here
          const updatedSvgContent = this.extractUpdatedSvgContent(id);
          return { ...stamp, content: updatedSvgContent };
      }
      return stamp;
  });
  localStorage.setItem('InteractiveStamps', JSON.stringify(updatedStamps));
  this.getInteractiveStamps();
}


extractUpdatedSvgContent(id: string): string {
  const element = document.getElementById(id);
  if (element instanceof SVGSVGElement) {
      return new XMLSerializer().serializeToString(element);
  } else {
      console.error('Element with the given ID is not an SVGSVGElement');
      return '';
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
}
