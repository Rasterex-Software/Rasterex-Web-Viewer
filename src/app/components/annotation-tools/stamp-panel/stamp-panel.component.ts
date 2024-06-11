import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { STAMP_TEMPLATES } from './stamp-templates';
import { RXCore } from 'src/rxcore';

@Component({
  selector: 'rx-stamp-panel',
  templateUrl: './stamp-panel.component.html',
  styleUrls: ['./stamp-panel.component.scss']
})
export class StampPanelComponent implements OnInit {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  templates: any = STAMP_TEMPLATES;
  customTemplates: any = [];
  opened: boolean = false;
  activeIndex: number = 0;
  height: number | undefined = 20;
  width: number | undefined= 20;
  previewSrc = ''

  constructor() { }

  ngOnInit(): void {
    this.previewSrc = '';
    var templatesString = localStorage.getItem('customStamp') || '[]';
    this.customTemplates = JSON.parse(templatesString);
  }

  handleImage(event) {
    const file = event?.target?.files[0];
    if (!file) {
      return;
    }
    // Create a blob URL from the file
    const blobUrl = URL.createObjectURL(file);
    this.previewSrc = blobUrl

  }
  addCustomStamp(){
    if(!this.previewSrc) {
      this.opened  = false;
    }
    console.log('Stamp saved. URL:', this.previewSrc);
    this.customTemplates.push({
      id: 10,
      src: this.previewSrc,
      height: this.height,
      width: this.width
    })
    this.opened = false;
    localStorage.setItem('customStamp', JSON.stringify(this.customTemplates || []));
  }

  onPanelClose(): void {
    this.onClose.emit();
  }
}
