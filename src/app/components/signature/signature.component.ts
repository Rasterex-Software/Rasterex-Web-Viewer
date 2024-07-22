import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { GuiMode } from 'src/rxcore/enums/GuiMode';
import { ISignatureData, ISignatures } from 'src/rxcore/models/ISignatures';
import { SignatureService } from './signature.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'rx-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class SignatureComponent implements OnInit {
  guiMode$ = this.rxCoreService.guiMode$;
  currentBlock: any;
  signatureBlocks: Array<any> = [];
  visible: boolean = false;
  dropdownPanelOpened: boolean = false;
  adoptSignatureOpened: boolean = false;
  adoptSignatureMode: string = 'create';
  applyPanelOpened: boolean = false;
  quickActionsOpened: boolean = false;
  confirmDeleteOpened: boolean = false;
  confirmDismissOpened: boolean = false;
  placeInAllBlocks: boolean = false;
  numpages: number = 0;
  top: number = -9999;
  left: number = -9999;
  qTop: number = -9999;
  qLeft: number = -9999;
  selectedSignature: ISignatureData | undefined;
  signatures: ISignatures | undefined;

  private _setDefaults(): void {
    this.signatureBlocks = [];
    this.currentBlock = undefined;
    this.dropdownPanelOpened = false;
    this.applyPanelOpened = false;
    this.selectedSignature = undefined;
    this.placeInAllBlocks = false;
    this.top = -9999;
    this.left = -9999;
    this.qTop = -9999;
    this.qLeft = -9999;
  }

  constructor (
    private readonly rxCoreService: RxCoreService,
    private readonly signatureService: SignatureService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.rxCoreService.guiState$.subscribe((state) => {
      this.visible = state.isPDF;
      this.numpages = state.numpages;
      RXCore.lockMarkup(false);
      RXCore.singlePageScrollPan(this.visible);
    });

    this.guiMode$.subscribe((mode: string) => {
      this._setDefaults();

      if (mode == "signature" && this.visible) {
        RXCore.getTextRects('Please Sign Here', true);
        this.signatureService.getSignatures();
      } else {
        this.onConfirmDismiss(false);
      }
    });

    this.rxCoreService.guiMarkup$.subscribe(({ markup, operation }: any) => {
      this.currentBlock = markup;
      this.dropdownPanelOpened = false;
      this.quickActionsOpened = false;

      if (markup === -1) return;
      if (markup.GetAttribute("CustomAction")?.value == "Done") return;

      const wscaled = markup.wscaled / window.devicePixelRatio;
      const hscaled = markup.hscaled / window.devicePixelRatio;
      const xscaled = markup.xscaled / window.devicePixelRatio;
      const yscaled = markup.yscaled / window.devicePixelRatio;

      if (markup.type == MARKUP_TYPES.SIGNATURE.type && markup.subtype == MARKUP_TYPES.SIGNATURE.subType) {
        this.left =(markup.rotatedrect.x / window.devicePixelRatio) + (wscaled / 2);
        this.top = (markup.rotatedrect.y / window.devicePixelRatio) + hscaled;

        RXCore.unSelectAllMarkup();
        this.dropdownPanelOpened = true;
      } else if (operation.modified && markup.type == MARKUP_TYPES.SIGNATURE.type && markup.subtype == MARKUP_TYPES.STAMP.subType && markup.GetAttribute("Signature")?.value) {
        this.qLeft = xscaled - 20;
        this.qTop = yscaled + (hscaled / 2) + 24;
        this.quickActionsOpened = true;
      }
    });

    this.rxCoreService.guiOnMarkupChanged.subscribe(({annotation, operation}) => {
      this.quickActionsOpened = false;
    });

    RXCore.onGuiMathcesRectsPage((rects, currentpage) => {
      if (currentpage == this.numpages - 1) {
        RXCore.gotoPage(0);
      }

      if (!rects?.length) {
        return;
      }

      const pgscale = RXCore.getPageScale(currentpage) / 2;

      for (let rect of rects) {
        RXCore.markupButtonFromMatch(
          rect,
          currentpage,
          {
            src: "/assets/images/sign-here.svg",
            width: 148 * pgscale,
            height: 42 * pgscale,
            orgwidth: 148,
            orgheight: 42
          },
          {
            left: 0,
            top: 10*pgscale,
            right: 0,
            bottom: 0
          })
          .then((signButton) => {
            signButton.imageloaded = true;
            signButton.AddAttribute("CustomAction", "SetSignature");
            signButton.AddAttribute("Signature", "Demo User");
            signButton.AddAttribute("SignatureRect", rect);
            signButton.setLink("ButtonAction", true);
            signButton.setUniqueID(Date.now());
            this.signatureBlocks.push(signButton);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });

    this.signatureService.adoptSignatureOpened$.subscribe(payload => {
      this.adoptSignatureOpened = payload.opened;
      this.adoptSignatureMode = payload.mode;
    });

    this.signatureService.applySignatureInAllBlocks$.subscribe((signature) => {
      this.selectedSignature = undefined;

      if (!this.signatureBlocks.length) {
        this.notificationService.notification({message: 'Current document does not contain any fields to sign.', type: 'info'});
        return;
      }

      for (let block of this.signatureBlocks) {
        if (block.subtype != 3) {
          RXCore.markUpSubType(3);
        }

        block.updateAttribute("CustomAction", "ApplySignature");
        block.replaceImage(signature);
        RXCore.selectMarkupbyGUID(block.uniqueID);
        RXCore.markUpSubType(1);
      }

      RXCore.unSelectAllMarkup();
      RXCore.foxitForceRedraw();
      RXCore.gotoPage(0);
      this.applyPanelOpened = true;
    });

    this.signatureService.signatures$.subscribe((signatures) => {
      this.signatures = signatures;
    });
  }

  handleKeyboardEvents($event: KeyboardEvent) {
    if (!this.dropdownPanelOpened) return;

    $event.preventDefault();
    if ($event.code === 'Escape') {
      this.dropdownPanelOpened = false;
    }
  }

  onApplyClick(): void {
    for (let signature of this.signatureBlocks) {
      if (signature.GetAttribute("CustomAction")?.value == "SetSignature") {
        if (this.placeInAllBlocks) {
          RXCore.selectMarkupbyGUID(signature.uniqueID);
          signature.replaceImage(this.selectedSignature?.src);
          signature.updateAttribute("CustomAction", "Done");
          RXCore.markUpSubType(1);
        } else {
          RXCore.selectMarkupbyGUID(signature.uniqueID);
          RXCore.markUpSubType(1);
          RXCore.deleteMarkUp();
        }
      } else {
        if (signature.GetAttribute("CustomAction")?.value == "ApplySignature") {
          RXCore.selectMarkupbyGUID(signature.uniqueID)
          RXCore.markUpSubType(3);
          signature.updateAttribute("CustomAction", "Done");
          RXCore.markUpSubType(1);
        }
      }
    }

    RXCore.unSelectAllMarkup();
    RXCore.markUpSave();
    RXCore.foxitForceRedraw();
    RXCore.gotoPage(0);

    this.applyPanelOpened = false;
    this.rxCoreService.setGuiMode(GuiMode.View);
  }

  onAdoptSignature(signatures: ISignatures): void {
    if (signatures.signature?.data) {
      this.signatureService.putSignature(signatures.signature?.data);
    }
    if (signatures.initials?.data) {
      this.signatureService.putSignature(signatures.initials?.data, true);
    }
  }

  onConfirmDismiss(resetGuiMode: boolean = true): void {
    for (let signature of this.signatureBlocks) {
      RXCore.selectMarkupbyGUID(signature.uniqueID);
      RXCore.markUpSubType(1);
      RXCore.deleteMarkUp();
    }

    //RXCore.gotoPage(0);

    this.applyPanelOpened = false;
    this.confirmDismissOpened = false;

    if (resetGuiMode) {
      this.rxCoreService.setGuiMode(GuiMode.View);
    }
  }

  onConfirmDelete(): void {
    RXCore.deleteMarkUp();
    this.applyPanelOpened = false;
    this.confirmDeleteOpened = false;
  }

  onSignatureSelect(signature: ISignatureData): void {
    this.dropdownPanelOpened = false;
    if (this.currentBlock.subtype != 3) {
      RXCore.markUpSubType(3);
    }
    this.currentBlock.updateAttribute("CustomAction", "ApplySignature");
    this.currentBlock.replaceImage(signature);
    RXCore.selectMarkupbyGUID(this.currentBlock.uniqueID);
    RXCore.markUpSubType(1);
    RXCore.unSelectAllMarkup();
    RXCore.foxitForceRedraw();

    this.applyPanelOpened = true;
    this.selectedSignature = signature;
  }

}
