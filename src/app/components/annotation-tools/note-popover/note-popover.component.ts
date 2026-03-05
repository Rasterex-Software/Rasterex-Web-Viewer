import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { AnnotationToolsService } from '../annotation-tools.service';

@Component({
  selector: 'rx-note-popover',
  templateUrl: './note-popover.component.html',
  styleUrls: ['./note-popover.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class NotePopoverComponent implements OnInit {
  @Input() mode: 'editor' | 'tooltip' = 'editor';

  top: number | undefined;
  left: number | undefined;
  visible: boolean = false;
  note: any;
  text: string;
  btnTitle: string = "Post";

  constructor(
    private elem: ElementRef,
    private readonly rxCoreService: RxCoreService,
    private readonly service: AnnotationToolsService) {}

  ngOnInit(): void {
    if (this.mode == 'tooltip') {
      this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
        if (markup != -1 && markup.selected) {
          this.visible = false;
          return;
        }
      });
      this.rxCoreService.guiMarkupHover$.subscribe(({markup, x, y}) => {
        if (!markup || markup.type != MARKUP_TYPES.NOTE.type || markup.selected) {
          this.visible = false;
          return;
        }

        this.note = markup;
        this.note.author = RXCore.getDisplayName(markup.signature);
        this.note.created = (markup as any).GetDateTime(true);
        this.text = markup.text;
        this.left = (x / window.devicePixelRatio) - 10;
        this.top = (y / window.devicePixelRatio) + 12;
        this.visible = true
      });
    } else {
      this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
        this.note = markup;
        this.visible = false;
        this.top = undefined;
        this.left = undefined;

        if (markup === -1 || operation.deleted || markup.type != MARKUP_TYPES.NOTE.type) {
          return;
        }

        const xscaled = (markup.xscaled || markup.x) / window.devicePixelRatio;
        const yscaled = (markup.yscaled || markup.y) / window.devicePixelRatio;


        this.note.author = RXCore.getDisplayName(markup.signature);
        this.note.created = (markup as any).GetDateTime(true);
        this.text = markup.text;

        this.left = xscaled - 10;
        this.top = yscaled + 12;
        
        //this.left = markup.x;
        //this.top = markup.y + 20;

        if (operation.created) {
          this.visible = true;
          RXCore.unSelectAllMarkup();
          RXCore.selectMarkUpByIndex(markup.markupnumber);
        } else {
          this.btnTitle = "Update";
        }
      });

      this.service.notePopoverState$.subscribe(state => {
        const { markup, visible } = state;

        if (markup == -1) {
          this.visible = false;
          return;
        }

        const xscaled = (markup.xscaled || markup.x) / window.devicePixelRatio;
        const yscaled = (markup.yscaled || markup.y) / window.devicePixelRatio;
  
        this.note = markup;
        this.note.author = RXCore.getDisplayName(markup.signature);
        this.note.created = (markup as any).GetDateTime(true);
        this.text = markup.text;

        this.left = xscaled - 10;
        this.top = yscaled + 12;
        //this.left = markup.x;
        //this.top =  + 20;

        if (this.visible != visible) {
          this.visible = true;
        }
      });
    }
  }

  onDocumentClick(event) {
    if (this.mode == 'editor') return;

    const clickedInside = this.elem.nativeElement.contains(event.target);
    if (clickedInside) {
      return;
    }

    const clickedInsideCanvas = (document.getElementById('imageTemp') as any)?.contains(event.target);
    if (!clickedInsideCanvas && event.target.id != 'quickActionsMenuEdit') {
      this.visible = false;
    }
  }

  onOk(): void {
    RXCore.setNoteText(this.text);
    this.visible = false;
  }

}
