import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
export interface FileSelectionState {
  layers: string[];
  blocks: string[];
}

@Injectable({ providedIn: 'root' })
export class FilePreselectionService {
  modalOpened = false;
  public hasHandledMetadata = false;
  public selectedLayers: string[] = [];
  public selectedBlocks: string[] = [];
  private selectedFileSubject = new Subject<any>();
  selectedFile$ = this.selectedFileSubject.asObservable();
  // Track per-file selections
  private fileSelections: Map<string, FileSelectionState> = new Map();
  public currentFileName: string | null = null;
  public context: 'default' | 'comparison' = 'default';

  setContext(ctx: 'default' | 'comparison') {
    this.context = ctx;
  }

  resetContext() {
    this.context = 'default';
  }

  isComparison(): boolean {
    return this.context === 'comparison';
  }


  reset(): void {
    this.fileSelections.clear();
    this.currentFileName = null;
  }

  emitSelectedFile(file: any) {
    this.currentFileName = file.file;
    this.selectedFileSubject.next(file);
  }
  setSelectionsForFile(fileName: string, layers: string[], blocks: string[]) {
    this.fileSelections.set(fileName, { layers, blocks });
  }

  getSelectionsForFile(fileName: string): FileSelectionState | null {
    return this.fileSelections.get(fileName) || null;
  }

}