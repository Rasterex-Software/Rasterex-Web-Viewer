import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'rx-text-style-select',
  templateUrl: './text-style-select.component.html',
  styleUrls: ['./text-style-select.component.scss']
})
export class TextStyleSelectComponent {

  fontFaces = [
    {
        label: 'Angsana New',
        value: "'Angsana New','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Arial',
        value: "'Arial','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Arial Black',
        value: "'Arial Black','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Batang',
        value: "'Batang','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Calibri',
        value: "'Calibri','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Cambria',
        value: "'Cambria','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Candara',
        value: "'Candara','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Century',
        value: "'Century','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Comic Sans MS',
        value: "'Comic Sans MS','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Consolas',
        value: "'Consolas','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Constantia',
        value: "'Constantia','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Corbel',
        value: "'Corbel','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Cordia New',
        value: "'Cordia New','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Courier New',
        value: "'Courier New','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Dotum',
        value: "'Dotum','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'FangSong',
        value: "'FangSong','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Garamond',
        value: "'Garamond','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Georgia',
        value: "'Georgia','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Gulim',
        value: "'Gulim','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'GungSuh',
        value: "'GungSuh','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Helvetica',
        value: "'Helvetica','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'KaiTi',
        value: "'KaiTi','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Malgun Gothic',
        value: "'Malgun Gothic','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Mangal',
        value: "'Mangal','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Microsoft JhengHei',
        value: "'Microsoft JhengHei','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Microsoft YaHei',
        value: "'Microsoft YaHei','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'MingLiU',
        value: "'MingLiU','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'MingLiU_HKSCS',
        value: "'MingLiU_HKSCS','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'MS Gothic',
        value: "'MS Gothic','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'MS Mincho',
        value: "'MS Mincho','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'MS PGothic',
        value: "'MS PGothic','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'MS PMincho',
        value: "'MS PMincho','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'PMingLiU',
        value: "'PMingLiU','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'PMingLiU-ExtB',
        value: "'PMingLiU-ExtB','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'SimHei',
        value: "'SimHei','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'SimSun',
        value: "'SimSun','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'SimSun-ExtB',
        value: "'SimSun-ExtB','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Tahoma',
        value: "'Tahoma','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Times',
        value: "'Times','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Times New Roman',
        value: "'Times New Roman','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Trebuchet MS',
        value: "'Trebuchet MS','Segoe UI',Tahoma,Sans-Serif;"
    },
    {
        label: 'Verdana',
        value: "'Verdana','Segoe UI',Tahoma,Sans-Serif;"
    }
  ];

  fontSizes = [
    { value: 8, label: 8 },
    { value: 9, label: 9 },
    { value: 10, label: 10 },
    { value: 11, label: 11 },
    { value: 12, label: 12 },
    { value: 14, label: 14 },
    { value: 18, label: 18 },
    { value: 24, label: 24 },
    { value: 30, label: 30 },
    { value: 36, label: 36 },
    { value: 48, label: 48 },
    { value: 60, label: 60 },
    { value: 72, label: 72 },
    { value: 96, label: 96 }
  ];

  @Input() value: any = {
    style: {
        bold: false,
        italic: false
    },
    font: 'Arial',
    size: 18
  };
@Input() showFontSize :boolean =false;
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  onFontStyleSelect(style: string): void {
    switch(style) {
        case 'bold':
            this.value.style.bold = !this.value.style.bold;
            if (this.value.style.bold) this.value.style.italic = false;
            this.valueChange.emit(this.value);
            return;
        case 'italic':
            this.value.style.italic = !this.value.style.italic;
            if (this.value.style.italic) this.value.style.bold = false;
            this.valueChange.emit(this.value);
            return;
    }
  }

  onFontFaceSelect(font): void {
    this.value.font = font.label;
    this.valueChange.emit(this.value);
  }

  onFontSizeSelect(size): void {
    this.value.size = size.value;
    this.valueChange.emit(this.value);
  }

}
