import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { QRCodeLibraryService, QRCodeData } from './qr-code-library.service';

@Component({
  selector: 'app-qr-code-library',
  templateUrl: './qr-code-library.component.html',
  styleUrls: ['./qr-code-library.component.scss']
})
export class QRCodeLibraryComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() onQRCodeSelect = new EventEmitter<QRCodeData>();

  qrCodes: QRCodeData[] = [];
  showCreateDialog = false;
  
  // Form fields
  qrText = '';
  qrSize = 10;
  qrLevel = 0;
  qrMargin = 1;
  
  // Loading and error states
  loadingQRCodes = false;
  creatingQRCode = false;
  deletingQRCodes = new Set<string>(); // Track which QR codes are being deleted
  error: string | null = null;
  
  // Error correction level options
  errorLevels = [
    { value: 0, label: '7% (Default)' },
    { value: 1, label: '15%' },
    { value: 2, label: '25%' },
    { value: 3, label: '30%' }
  ];

  constructor(private qrService: QRCodeLibraryService) {}

  ngOnInit(): void {
    this.loadQRCodes();
  }

  loadQRCodes(): void {
    this.loadingQRCodes = true;
    this.error = null;
    
    this.qrService.getAllQRCodes().subscribe({
      next: (qrCodes) => {
        this.qrCodes = qrCodes.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loadingQRCodes = false;
      },
      error: (error) => {
        console.error('Failed to load QR codes:', error);
        this.error = 'Failed to load QR codes';
        this.loadingQRCodes = false;
      }
    });
  }

  onPanelClose(): void {
    this.onClose.emit();
  }

  showCreateQRDialog(): void {
    this.showCreateDialog = true;
    this.resetForm();
  }

  hideCreateQRDialog(): void {
    this.showCreateDialog = false;
    this.resetForm();
  }

  resetForm(): void {
    this.qrText = '';
    this.qrSize = 10;
    this.qrLevel = 0;
    this.qrMargin = 1;
    this.error = null;
  }

  createQRCode(): void {
    if (!this.qrText.trim()) {
      this.error = 'Please enter text for the QR code';
      return;
    }

    this.creatingQRCode = true;
    this.error = null;

    this.qrService.generateQRCode(this.qrText, this.qrSize, this.qrLevel, this.qrMargin).subscribe({
      next: async (blob) => {
        try {
          const imageData = await this.qrService.blobToBase64(blob);
          const generatedName = this.generateQRCodeName(this.qrText);
          const qrData: QRCodeData = {
            id: this.generateId(),
            text: this.qrText,
            size: this.qrSize,
            level: this.qrLevel,
            margin: this.qrMargin,
            imageData: imageData,
            createdAt: new Date(),
            name: generatedName
          };

          this.qrService.saveQRCode(qrData).subscribe({
            next: (savedQR) => {
              this.qrCodes.unshift(savedQR);
              this.hideCreateQRDialog();
              this.creatingQRCode = false;
            },
            error: (error) => {
              console.error('Failed to save QR code:', error);
              this.error = 'Failed to save QR code';
              this.creatingQRCode = false;
            }
          });
        } catch (error) {
          console.error('Failed to process QR code image:', error);
          this.error = 'Failed to process QR code image';
          this.creatingQRCode = false;
        }
      },
      error: (error) => {
        console.error('Failed to generate QR code:', error);
        this.error = 'Failed to generate QR code. Please check your connection and try again.';
        this.creatingQRCode = false;
      }
    });
  }

  selectQRCode(qrCode: QRCodeData): void {
    this.onQRCodeSelect.emit(qrCode);
  }

  deleteQRCode(qrCode: QRCodeData, event: Event): void {
    event.stopPropagation();
    
    // Clear any previous errors
    this.error = null;
    
    // Create a better confirmation message
    const confirmMessage = `Are you sure you want to delete this QR code?\n\nName: ${qrCode.name}\nText: ${qrCode.text.substring(0, 50)}${qrCode.text.length > 50 ? '...' : ''}`;
    
    if (confirm(confirmMessage)) {
      // Add to deleting set to show loading state
      this.deletingQRCodes.add(qrCode.id);
      
      this.qrService.deleteQRCode(qrCode.id).subscribe({
        next: () => {
          // Remove from deleting set
          this.deletingQRCodes.delete(qrCode.id);
          // Remove from local array
          this.qrCodes = this.qrCodes.filter(qr => qr.id !== qrCode.id);
          console.log(`QR code "${qrCode.name}" deleted successfully`);
        },
        error: (error) => {
          // Remove from deleting set
          this.deletingQRCodes.delete(qrCode.id);
          console.error('Failed to delete QR code:', error);
          this.error = `Failed to delete QR code "${qrCode.name}". Please try again.`;
        }
      });
    }
  }

  isDeleting(qrCodeId: string): boolean {
    return this.deletingQRCodes.has(qrCodeId);
  }

  getQRCodeImageUrl(qrCode: QRCodeData): string {
    return `data:image/png;base64,${qrCode.imageData}`;
  }

  getSizeDisplayText(size: number): string {
    const pixels = size * 27;
    return `${pixels}x${pixels}px`;
  }

  getErrorLevelDisplayText(level: number): string {
    const errorLevel = this.errorLevels.find(l => l.value === level);
    return errorLevel ? errorLevel.label : `${level}`;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateQRCodeName(text: string): string {
    // Extract domain from URL or use first 30 characters of text
    try {
      const url = new URL(text);
      return `QR_${url.hostname}_${Date.now()}`;
    } catch {
      // Not a valid URL, use first 30 characters
      const cleanText = text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      return `QR_${cleanText}_${Date.now()}`;
    }
  }
} 