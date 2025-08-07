import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { SymbolsLibraryService } from './symbols-library.service';
import { HttpClient } from '@angular/common/http';

interface SymbolFolder {
  id: string;
  name: string;
  symbols: any[];
  isExpanded?: boolean;
}

interface Symbol {
  id: string;
  src: string;
  name: string;
  width: number;
  height: number;
  folderId: string;
}

@Component({
  selector: 'rx-symbols-library',
  templateUrl: './symbols-library.component.html',
  styleUrls: ['./symbols-library.component.scss']
})
export class SymbolsLibraryComponent implements OnInit {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @Output() onSymbolSelect: EventEmitter<any> = new EventEmitter<any>();
  @Input() drawingBounds?: { width: number; height: number; x: number; y: number };
  @Input() viewScale?: number = 1;

  opened: boolean = false;
  symbols: any[] = [];
  folders: SymbolFolder[] = [];
  selectedFolderId: string | null = null;
  draggedSymbol: any = null;
  loadingFolders = false;
  loadingSymbols = false;
  error: string | null = null;

  constructor(private symbolsService: SymbolsLibraryService) {}

  ngOnInit(): void {
    this.fetchFolders();
  }

  onPanelClose(): void {
    this.onClose.emit();
  }

  // Helper methods for template
  getFolderById(folderId: string): SymbolFolder | undefined {
    return this.folders.find(f => f.id === folderId);
  }

  trackByFolderId(index: number, folder: SymbolFolder): string {
    return folder.id;
  }

  trackBySymbolId(index: number, symbol: any): string {
    return symbol.id;
  }

  // Folder Management Methods
  selectFolder(folderId: string | null): void {
    this.selectedFolderId = folderId;
    if (folderId) {
      this.fetchSymbols(folderId);
    }
  }

  toggleFolder(folderId: string): void {
    const folder = this.folders.find(f => f.id === folderId);
    if (folder) {
      folder.isExpanded = !folder.isExpanded;
    }
  }

  // Drag and Drop Methods
  onSymbolDragStart(event: DragEvent, symbol: any): void {
    this.draggedSymbol = symbol;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(symbol));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onSymbolClick(symbol: any): void {
    // Calculate scaled dimensions to fit the view
    const scaledSymbol = this.scaleSymbolToFit(symbol);
    this.onSymbolSelect.emit(scaledSymbol);
  }

  private scaleSymbolToFit(symbol: any): any {
    if (!this.viewScale || !this.drawingBounds) {
      return symbol;
    }

    const maxWidth = this.drawingBounds.width * 0.2; // Max 20% of drawing width
    const maxHeight = this.drawingBounds.height * 0.2; // Max 20% of drawing height
    
    const widthScale = maxWidth / symbol.width;
    const heightScale = maxHeight / symbol.height;
    const scale = Math.min(widthScale, heightScale, 1); // Don't scale up, only down

    return {
      ...symbol,
      width: Math.round(symbol.width * scale),
      height: Math.round(symbol.height * scale),
      scale: scale
    };
  }

  private ensureSymbolInBounds(x: number, y: number, symbolWidth: number, symbolHeight: number): { x: number; y: number } {
    if (!this.drawingBounds) {
      return { x, y };
    }

    const { width: boundsWidth, height: boundsHeight, x: boundsX, y: boundsY } = this.drawingBounds;
    
    // Ensure symbol doesn't go outside the drawing bounds
    const adjustedX = Math.max(boundsX, Math.min(x, boundsX + boundsWidth - symbolWidth));
    const adjustedY = Math.max(boundsY, Math.min(y, boundsY + boundsHeight - symbolHeight));
    
    return { x: adjustedX, y: adjustedY };
  }

  fetchFolders(): void {
    this.loadingFolders = true;
    this.symbolsService.getFolders().subscribe({
      next: (folders) => {
        this.folders = folders;
        this.loadingFolders = false;
        if (this.folders.length > 0) {
          this.selectedFolderId = this.folders[0].id;
          this.fetchSymbols(this.selectedFolderId);
        }
      },
      error: (err) => {
        this.error = 'Failed to load folders';
        this.loadingFolders = false;
    }
    });
  }

  fetchSymbols(folderId: string): void {
    this.loadingSymbols = true;
    this.symbolsService.getSymbols(folderId).subscribe({
      next: (symbols) => {
        this.symbols = symbols.map((symbol: any) => {
          let parsedData: any = {};
          try {
            parsedData = JSON.parse(symbol.data);
          } catch (e) {}
          const src = parsedData.content
            ? `data:${parsedData.type};base64,${parsedData.content}`
            : '';
      return {
            id: symbol.id,
            src,
            name: parsedData.name || symbol.name,
            width: parsedData.width || 210,
            height: parsedData.height || 210,
            folderId: symbol.folderId
      };
    });
        this.loadingSymbols = false;
      },
      error: (err) => {
        this.error = 'Failed to load symbols';
        this.loadingSymbols = false;
      }
    });
  }
}
 