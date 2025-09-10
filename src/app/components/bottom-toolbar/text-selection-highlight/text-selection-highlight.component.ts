import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { NotificationService } from '../../notification/notification.service';
import { RXCore } from 'src/rxcore';

@Component({
  selector: 'rx-text-selection-highlight',
  templateUrl: './text-selection-highlight.component.html',
  styleUrls: ['./text-selection-highlight.component.scss'],
  host: {
    '(document:selectionEnd)': 'handleSelectionEnd($event)',
    '(document:click)': 'handleClickOutside($event)',
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class TextSelectionHighlightComponent implements OnInit {
  @Input() visible: boolean = false;
  top: number | undefined = undefined;
  left: number | undefined = undefined;
  pdfTextSelectionData: any;

  constructor(
    private elem: ElementRef,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    let selectionEndTimeout: any = null;
    const event = new Event('selectionEnd');
    ["mouseup", "selectionchange"].map(e => {
      document.addEventListener(e.toString(), (evt) => {
        if (selectionEndTimeout && evt.type == "selectionchange") {
          this.visible = false;
          clearTimeout(selectionEndTimeout);
        }
        selectionEndTimeout = setTimeout(function () {
            if (evt.type == "mouseup" && window.getSelection()?.toString() != "") {
              document.dispatchEvent(event);
            }
        }, 100);
      });
    });


    

    RXCore.onGuiTextCopied((fileurl: string, textData : string) => {
      if (typeof textData === 'string') {
        //this.copyToClipBoard(textData);

       this.copyToClipBoard(textData).then(() =>{
          this.notificationService.notification({message: 'Text successfully copied.', type: 'info'});     

       }).catch((error) =>{
          this.notificationService.notification({message: 'Something went wrong.', type: 'error'});    
       });


        this.pdfTextSelectionData = textData;
      }
    });
  }



  handleSelectionEnd(event): void {
    const rect = window.getSelection()?.getRangeAt(0)?.getClientRects()[0];
    this.top = (rect?.top || 0) - 62;
    this.left = (rect?.left || 0) + ((rect?.width || 0) / 2) - 28;
    this.visible = true;
  }

  handleClickOutside(event) {
    if (this.pdfTextSelectionData && this.pdfTextSelectionData.rectarray?.length) {
      this.top = event.clientY - 75 - (this.pdfTextSelectionData.startpos[1] - this.pdfTextSelectionData.endpos[1])
      this.left = event.clientX + ((this.pdfTextSelectionData.startpos[0] - this.pdfTextSelectionData.endpos[0]) * 1.25);
      this.visible = true;
      return;
    }

    if (!this.visible) return;
    const clickedInside = this.elem.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.visible = false;
    }
  }

  handleKeyboardEvents($event: KeyboardEvent) {
    if (!this.visible) return;
    
    //$event.preventDefault();
    if ($event.code === 'Escape') {
      this.visible = false;
    }
  }

  private _copyText(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
          document.execCommand('copy') ? res() : rej();
          textArea.remove();
      });
    }
  }

  onCopyTextClick(event): void {
    const text: any = window.getSelection()?.toString() || this.pdfTextSelectionData.rectarray[0].text;
    this.pdfTextSelectionData = undefined;

    this._copyText(text)
      .then(() => {
        this.notificationService.notification({message: 'Text successfully copied.', type: 'info'}); 
      })
      .catch((err) => { this.notificationService.notification({message: 'Something went wrong.', type: 'error'}); });
  }

  copyToClipBoard(textToCopy : string) : Promise<any>{
    // navigator clipboard api needs a secure context (https)

    var ok : boolean = false;
    //var fail 

    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      try{
        navigator.clipboard.writeText(textToCopy);
        ok = true;
      }
      
      catch{
        ok = false;
      }
      
    } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      document.execCommand('copy') ? ok = true : ok = false;
      textArea.remove();
    }

    return new Promise<void>((res, rej) => {
      // here the magic happens
      ok ? res() : rej();
      
    });


  }

}
