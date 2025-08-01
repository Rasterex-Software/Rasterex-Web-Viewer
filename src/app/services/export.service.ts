import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RXCore } from 'src/rxcore';

export interface ExportOptions {
  format: string;
  includeAnnotations?: number; 
  paperSize?: string;
  password?: string;
  digitalSignature?: boolean;
  ctbFile?: string;
  monochrome?: boolean;
  selectedPages?: number[];
  selectedLayouts?: string[];
}

export interface ExportFormat {
  value: string;
  label: string;
  description?: string;
  availableForFileTypes: string[];
}

export interface PaperSize {
  value: string;
  label: string;
  width?: number;
  height?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private _exportDialogOpened = new BehaviorSubject<boolean>(false);
  public exportDialogOpened$: Observable<boolean> =
    this._exportDialogOpened.asObservable();

  private _currentFileType = new BehaviorSubject<string>('');
  public currentFileType$: Observable<string> =
    this._currentFileType.asObservable();

  private _exportOptions = new BehaviorSubject<ExportOptions>(
    this.getDefaultOptions()
  );
  public exportOptions$: Observable<ExportOptions> =
    this._exportOptions.asObservable();

  // Available export formats
  public readonly exportFormats: ExportFormat[] = [
    {
      value: 'PDF',
      label: 'PDF',
      description: 'Standard PDF format',
      availableForFileTypes: ['*'],
    },
    {
      value: 'PDF/A-1b',
      label: 'PDF/A-1b',
      description: 'PDF/A-1b (ISO 19005-1)',
      availableForFileTypes: ['*'],
    },
    {
      value: 'PDF/A-2b',
      label: 'PDF/A-2b',
      description: 'PDF/A-2b (ISO 19005-2)',
      availableForFileTypes: ['*'],
    },
    {
      value: 'PDF/A-3b',
      label: 'PDF/A-3b',
      description: 'PDF/A-3b (ISO 19005-3)',
      availableForFileTypes: ['*'],
    },
    {
      value: 'PDF/A-2u',
      label: 'PDF/A-2u',
      description: 'PDF/A-2u (ISO 19005-2)',
      availableForFileTypes: ['*'],
    },
    {
      value: 'PDF/A-3u',
      label: 'PDF/A-3u',
      description: 'PDF/A-3u (ISO 19005-3)',
      availableForFileTypes: ['*'],
    },
    {
      value: 'PDF/A-4',
      label: 'PDF/A-4',
      description: 'PDF/A-4 (ISO 19005-4)',
      availableForFileTypes: ['*'],
    },
    {
      value: 'PDF/A-4e',
      label: 'PDF/A-4e',
      description: 'PDF/A-4e (ISO 19005-4)',
      availableForFileTypes: ['*'],
    },
  ];

  // Available paper sizes (only for non-PDF files)
  public readonly paperSizes: PaperSize[] = [
    { value: 'A4', label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
    { value: 'A3', label: 'A3 (297 × 420 mm)', width: 297, height: 420 },
    { value: 'A2', label: 'A2 (420 × 594 mm)', width: 420, height: 594 },
    { value: 'A1', label: 'A1 (594 × 841 mm)', width: 594, height: 841 },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)', width: 216, height: 279 },
    { value: 'Legal', label: 'Legal (8.5 × 14 in)', width: 216, height: 356 },
  ];

  constructor() {}

  private getDefaultOptions(): ExportOptions {
    return {
      format: 'PDF',
      includeAnnotations: 1,
      paperSize: 'A4',
    };
  }

  public;
  openExportDialog(fileType: string): void {
    const normalizedFileType = fileType ? fileType.toLowerCase().trim() : '';

    // If no file type provided, default to PDF
    const finalFileType = normalizedFileType || 'pdf';

    this._currentFileType.next(finalFileType);
    this._exportDialogOpened.next(true);
  }

  public closeExportDialog(): void {
    this._exportDialogOpened.next(false);
  }

  public updateExportOptions(options: Partial<ExportOptions>): void {
    const currentOptions = this._exportOptions.value;
    this._exportOptions.next({ ...currentOptions, ...options });
  }

  public getAvailableFormats(fileType: string): ExportFormat[] {
    return this.exportFormats.filter(
      (format) =>
        format.availableForFileTypes.includes('*') ||
        format.availableForFileTypes.includes(fileType)
    );
  }

  // public shouldShowPaperSize(fileType: string): boolean {
  //   // Show paper size selection for non-PDF files (DWG, etc.)
  //   return !fileType.toLowerCase().includes('pdf');
  // }

  // public shouldShowPasswordOption(): boolean {
  //   // Password protection is available for all PDF formats
  //   return true;
  // }

  // public shouldShowDigitalSignatureOption(): boolean {
  //   // Digital signature requires server-side certificate
  //   return true;
  // }

  //   public shouldShowCtbFileOption(fileType: string): boolean {
  //     // CTB is only relevant for 2D CAD files
  //     return fileType.toLowerCase() === '2d';
  //   }

  //   public shouldShowMonochromeOption(fileType: string): boolean {
  //     // Monochrome is only relevant for 2D CAD files
  //     return fileType.toLowerCase() === '2d';
  //   }

  //   public shouldShowLayoutSelection(fileType: string): boolean {
  //     // Layout selection is only relevant for 2D CAD files
  //     return fileType.toLowerCase() === '2d';
  //   }
  //   public shouldShowPageSelection(fileType: string): boolean {
  //     // Page selection for multi-page documents
  //     return true;
  //   }

  // shouldShowPaperSize remains conditional: show only for non‑PDF
  public shouldShowPaperSize(fileType: string): boolean {
    return fileType.toLowerCase() !== 'pdf';
  }

  public executeExport(options: ExportOptions): void {
    RXCore.exportWithOptions({
      format: options.format,
      includeAnnotations: options.includeAnnotations,
      paperSize: options.paperSize,
      // password: options.password,
      // digitalSignature: options.digitalSignature
      // ctbFile, monochrome, selectedPages, selectedLayouts removed
      // monochrome: options.monochrome,
      // selectedPages: options.selectedPages,
      // selectedLayouts: options.selectedLayouts
    });
    this.closeExportDialog();
  }
}
