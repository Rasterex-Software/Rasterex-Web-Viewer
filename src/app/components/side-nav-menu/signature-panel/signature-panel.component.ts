import { Component, OnInit } from '@angular/core';
import { ISignatures, ISignatureData } from 'src/rxcore/models/ISignatures';
import { SignatureService } from '../../signature/signature.service';

@Component({
  selector: 'rx-signature-panel',
  templateUrl: './signature-panel.component.html',
  styleUrls: ['./signature-panel.component.scss']
})
export class SignaturePanelComponent implements OnInit {
  constructor(private readonly signatureService: SignatureService) {}

  signatures: ISignatures | undefined;

  ngOnInit(): void {
    this.signatureService.signatures$.subscribe((signatures) => {
      this.signatures = signatures;
    });
  }

  onAddClick(): void {
    this.signatureService.adoptSignatureOpened.next({ opened: true, mode: 'create' });
  }

  onEditClick(item: ISignatureData): void {
    this.signatureService.adoptSignatureOpened.next({ opened: true, mode: item.initials ? 'editInitials' : 'editSignature' });
  }

  onUseIanAllBlocksClick(item: ISignatureData): void {
    this.signatureService.applySignatureInAllBlocks.next(item);
  }
}
