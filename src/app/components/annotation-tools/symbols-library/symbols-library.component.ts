import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';

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

  ngOnInit(): void {
    this.loadFoldersAndSymbols();
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

  getSymbolCountForFolder(folderId: string): number {
    const allSymbols = JSON.parse(localStorage.getItem('SymbolsData') || '[]');
    return allSymbols.filter((symbol: any) => symbol.folderId === folderId).length;
  }

  // Folder Management Methods
  selectFolder(folderId: string): void {
    this.selectedFolderId = folderId;
    this.loadSymbolsForFolder(folderId);
  }

  toggleFolder(folderId: string): void {
    const folder = this.folders.find(f => f.id === folderId);
    if (folder) {
      folder.isExpanded = !folder.isExpanded;
      this.saveFolders();
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

  // Storage Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveFolders(): void {
    localStorage.setItem('SymbolFolders', JSON.stringify(this.folders));
  }

  private loadFolders(): void {
    const storedFolders = localStorage.getItem('SymbolFolders');
    if (storedFolders) {
      this.folders = JSON.parse(storedFolders);
    } else {
      // Create default folder if none exist
      const defaultFolder: SymbolFolder = {
        id: this.generateId(),
        name: 'Default',
        symbols: [],
        isExpanded: true
      };
      this.folders = [defaultFolder];
      this.saveFolders();
    }
  }

  private loadSymbolsForFolder(folderId: string): void {
    const allSymbols = JSON.parse(localStorage.getItem('SymbolsData') || '[]');
    const folderSymbols = allSymbols.filter((symbol: any) => symbol.folderId === folderId);
    
    this.symbols = folderSymbols.map((symbolObject: any) => {
      const byteArray = new Uint8Array(symbolObject.imageData);
      const blob = new Blob([byteArray], { type: symbolObject.imageType });
      const imageSrc = URL.createObjectURL(blob);

      return {
        id: symbolObject.id,
        src: imageSrc,
        name: symbolObject.imageName,
        height: symbolObject.height || 210,
        width: symbolObject.width || 210,
        folderId: symbolObject.folderId
      };
    });
  }

  private loadFoldersAndSymbols(): void {
    this.loadFolders();
    
    // Migrate old symbols to default folder if they exist
    this.migrateOldSymbols();
    
    // Select first folder by default
    if (this.folders.length > 0 && !this.selectedFolderId) {
      this.selectedFolderId = this.folders[0].id;
      this.loadSymbolsForFolder(this.selectedFolderId);
    }
  }

  private migrateOldSymbols(): void {
    const oldSymbols = localStorage.getItem('UploadedSymbols');
    if (oldSymbols) {
      const symbols = JSON.parse(oldSymbols);
      const defaultFolder = this.folders.find(f => f.name === 'Default');
      
      if (defaultFolder && symbols.length > 0) {
        const allSymbols = JSON.parse(localStorage.getItem('SymbolsData') || '[]');
        
        symbols.forEach((symbol: any, index: number) => {
          const migratedSymbol = {
            id: this.generateId(),
            imageData: symbol.imageData,
            imageName: symbol.imageName || `Symbol_${index}`,
            imageType: symbol.imageType,
            width: symbol.width,
            height: symbol.height,
            folderId: defaultFolder.id
          };
          allSymbols.push(migratedSymbol);
        });
        
        localStorage.setItem('SymbolsData', JSON.stringify(allSymbols));
        localStorage.removeItem('UploadedSymbols'); // Remove old storage
      }
    }
  }
}
 