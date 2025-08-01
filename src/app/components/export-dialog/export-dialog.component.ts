import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  ExportService,
  ExportOptions,
  ExportFormat,
  PaperSize,
} from '../../services/export.service';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isOpen = false;
  currentFileType = '';
  exportOptions: ExportOptions = {
    format: 'PDF',
    includeAnnotations: 1,
    paperSize: 'A4',
  };
  availableFormats: ExportFormat[] = [];
  paperSizes: PaperSize[] = [];
  showAdvancedOptions = false;
  showPasswordField = false;
  showDigitalSignatureField = false;
  isValid = true;
  validationMessage = '';
  layoutInputString: string = '';
  pageInputString: string = '';
  constructor(private exportService: ExportService) {}

  ngOnInit(): void {
    // Subscribe to dialog state
    this.exportService.exportDialogOpened$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isOpen = isOpen;
        if (isOpen) {
          this.initializeDialog();
        }
      });

    // Subscribe to file type changes
    this.exportService.currentFileType$
      .pipe(takeUntil(this.destroy$))
      .subscribe((fileType) => {
        this.currentFileType = fileType;
        this.updateAvailableOptions();
      });

    // Subscribe to export options
    this.exportService.exportOptions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((options) => {
        this.exportOptions = { ...options };
      });

    // Get paper sizes
    this.paperSizes = this.exportService.paperSizes;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDialog(): void {
    // Reset to default options
    this.exportOptions = {
      format: 'PDF',
      includeAnnotations: 1,
      paperSize: 'A4',
    };

    this.showAdvancedOptions = false;
    this.showPasswordField = false;
    this.showDigitalSignatureField = false;
    this.isValid = true;
    this.validationMessage = '';
  }

  private updateAvailableOptions(): void {
    this.availableFormats = this.exportService.getAvailableFormats(
      this.currentFileType
    );
    const formatExists = this.availableFormats.find(
      (f) => f.value === this.exportOptions.format
    );
    if (!formatExists && this.availableFormats.length > 0) {
      this.exportOptions.format = this.availableFormats[0].value;
    }
  }

  onFormatChange(format: string): void {
    this.exportOptions.format = format;
    this.updateExportOptions();
    this.validateOptions();
  }

  onIncludeAnnotationsChange(mode: number | undefined): void {
    this.exportOptions.includeAnnotations = mode;
    this.updateExportOptions();
  }

  onPaperSizeChange(paperSize: string): void {
    this.exportOptions.paperSize = paperSize;
    this.updateExportOptions();
  }

  //   onPasswordChange(password: string): void {
  //     this.exportOptions.password = password;
  //     this.updateExportOptions();
  //     this.validateOptions();
  //   }

  //   onDigitalSignatureChange(signed: boolean): void {
  //     this.exportOptions.digitalSignature = signed;
  //     this.updateExportOptions();
  //     this.validateOptions();
  //   }

  //   onCtbFileChange(ctbFile: string): void {
  //     this.exportOptions.ctbFile = ctbFile;
  //     this.updateExportOptions();
  //   }

  //   onMonochromeChange(monochrome: boolean): void {
  //     this.exportOptions.monochrome = monochrome;
  //     this.updateExportOptions();
  //   }

  //   onSelectedPagesChange(pages: number[]): void {
  //     this.exportOptions.selectedPages = pages;
  //     this.updateExportOptions();
  //   }

  // onSelectedLayoutsToggle(enabled: boolean): void {
  //   if (!enabled) {
  //     this.exportOptions.selectedLayouts = undefined; // send all layouts
  //     this.layoutInputString = '';
  //   } else {
  //     this.exportOptions.selectedLayouts = [];
  //   }
  //   this.updateExportOptions();
  // }

  // onSelectedPagesToggle(enabled: boolean): void {
  //   if (!enabled) {
  //     this.exportOptions.selectedPages = undefined; // send all pages
  //     this.pageInputString = '';
  //   } else {
  //     this.exportOptions.selectedPages = [];
  //   }
  //   this.updateExportOptions();
  // }

  // onPageInputChange(input: string): void {
  //   this.exportOptions.selectedPages = this.parsePageInput(input);
  //   this.updateExportOptions();
  // }

  // private parsePageInput(input: string): number[] {
  //   const result: number[] = [];

  //   const parts = input.split(',');
  //   for (const part of parts) {
  //     const trimmed = part.trim();
  //     if (trimmed.includes('-')) {
  //       const [start, end] = trimmed.split('-').map(Number);
  //       if (!isNaN(start) && !isNaN(end) && start <= end) {
  //         for (let i = start; i <= end; i++) {
  //           result.push(i);
  //         }
  //       }
  //     } else {
  //       const page = Number(trimmed);
  //       if (!isNaN(page)) {
  //         result.push(page);
  //       }
  //     }
  //   }
  //   return result;
  // }

  // onLayoutInputChange(input: string): void {
  //   this.exportOptions.selectedLayouts = this.parseLayoutInput(input);
  //   this.updateExportOptions();
  // }

  // private parseLayoutInput(input: string): string[] {
  //   return input
  //     .split(',')
  //     .map(s => s.trim())
  //     .filter(s => s.length > 0);
  // }
  //   onSelectedLayoutsChange(layouts: string[]): void {
  //     this.exportOptions.selectedLayouts = layouts;
  //     this.updateExportOptions();
  //   }

  //   onToggleAdvancedOptions(): void {
  //     this.showAdvancedOptions = !this.showAdvancedOptions;
  //   }

  //   onTogglePasswordField(): void {
  //     this.showPasswordField = !this.showPasswordField;
  //     if (!this.showPasswordField) {
  //       this.exportOptions.password = undefined;
  //       this.updateExportOptions();
  //     }
  //   }

  //   onToggleDigitalSignatureField(): void {
  //   this.showDigitalSignatureField = !this.showDigitalSignatureField;
  //   this.exportOptions.digitalSignature = this.showDigitalSignatureField;
  //   this.updateExportOptions();
  // }

  onCancel(): void {
    this.exportService.closeExportDialog();
  }

  onExport(): void {
    if (this.validateOptions()) {
      this.exportService.executeExport(this.exportOptions);
    }
  }

  // Helper Methods
  private updateExportOptions(): void {
    this.exportService.updateExportOptions(this.exportOptions);
  }

  private validateOptions(): boolean {
    this.isValid = true;
    this.validationMessage = '';

    // Validate password if provided
    if (this.exportOptions.password && this.exportOptions.password.length < 6) {
      this.isValid = false;
      this.validationMessage = 'Password must be at least 6 characters long.';
      return false;
    }

    // Validate digital signature requirements
    if (this.exportOptions.digitalSignature && !this.exportOptions.password) {
      this.isValid = false;
      this.validationMessage = 'Digital signature requires a password.';
      return false;
    }

    return true;
  }
  get shouldShowPaperSize(): boolean {
    return this.exportService.shouldShowPaperSize(this.currentFileType);
  }

  get selectedFormat(): ExportFormat | undefined {
    return this.availableFormats.find(
      (f) => f.value === this.exportOptions.format
    );
  }

  get selectedPaperSize(): PaperSize | undefined {
    return this.paperSizes.find(
      (p) => p.value === this.exportOptions.paperSize
    );
  }

  // get shouldShowPasswordOption(): boolean {
  //   return this.exportService.shouldShowPasswordOption();
  // }

  // get shouldShowDigitalSignatureOption(): boolean {
  //   return this.exportService.shouldShowDigitalSignatureOption();
  // }

  // get shouldShowCtbFileOption(): boolean {
  //   return this.exportService.shouldShowCtbFileOption(this.currentFileType);
  // }

  // get shouldShowMonochromeOption(): boolean {
  //   return this.exportService.shouldShowMonochromeOption(this.currentFileType);
  // }

  // get shouldShowPageSelection(): boolean {
  //   return this.exportService.shouldShowPageSelection(this.currentFileType);
  // }

  // get shouldShowLayoutSelection(): boolean {
  //   return this.exportService.shouldShowLayoutSelection(this.currentFileType);
  // }
}
