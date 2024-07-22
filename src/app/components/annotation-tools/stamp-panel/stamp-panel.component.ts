import { Component, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { STAMP_TEMPLATES } from './stamp-templates';
import { StampData } from './StampData';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { ColorHelper } from 'src/app/helpers/color.helper';

@Component({
  selector: 'rx-stamp-panel',
  templateUrl: './stamp-panel.component.html',
  styleUrls: ['./stamp-panel.component.scss']
})
export class StampPanelComponent implements OnInit {
  form: any = {
    companyName: '',
    companyLogo: null,
    approved: false,
    revise: false,
    rejected: false,
    by: '',
    date: '',
    submittal: '',
    spec: ''
  };
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

  constructor(  private readonly rxCoreService: RxCoreService, private cdr: ChangeDetectorRef,
                private readonly colorHelper: ColorHelper
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
      return {
        id: item.id,
        src: blobUrl,
        height: 200, 
        width: 400 
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
    const logo = this.form.companyLogo ? 
      `<image  x="290" y="0" width="80" height="75"  href="${this.form.companyLogo}" />` : 
      '<text x="320" y="20" font-size="16" font-family="Arial">Company Logo</text>';
    
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
        <rect x="0" y="0" width="400" height="165" fill="none" stroke="black" stroke-width="2" rx="5" ry="5"/>
        <text x="10" y="40" font-size="25" font-family="Arial">${this.form.companyName}</text>
        ${logo}
        <text x="10" y="80" font-size="12" font-family="Arial">APPROVED: ${this.form.approved ? '✓' : ' '}</text>
        <text x="160" y="80" font-size="12" font-family="Arial">REVISE: ${this.form.revise ? '✓' : ' '}</text>
        <text x="300" y="80" font-size="12" font-family="Arial">REJECTED: ${this.form.rejected ? '✓' : ' '}</text>
        <text x="10" y="110" font-size="16" font-family="Arial">BY: ${this.form.by}</text>
        <text x="200" y="110" font-size="16" font-family="Arial">DATE: ${this.form.date}</text>
        <text x="10" y="140" font-size="16" font-family="Arial">SUBMITTAL#: ${this.form.submittal}</text>
        <text x="200" y="140" font-size="16" font-family="Arial">SPEC: ${this.form.spec}</text>
      </svg>
    `;
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
