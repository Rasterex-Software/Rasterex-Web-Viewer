import { Component, EventEmitter, OnInit, Output } from '@angular/core';

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
  ngOnInit(): void {
    this.loadFoldersAndSymbols();
  }
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  opened: boolean = false;
  symbols: any[] = [];
  folders: SymbolFolder[] = [];
  selectedFolderId: string | null = null;
  isCreatingFolder: boolean = false;
  newFolderName: string = '';
  showCreateFolderModal: boolean = false;
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
  private convertUrlToBase64Data(url: string, newWidth?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas');
      img.crossOrigin = '*';
      img.onload = () => {
          const originalWidth = img.width, originalHeight = img.height;
          const aspectRatio = originalWidth / originalHeight;
          const width = newWidth || originalWidth, height = newWidth ? newWidth / aspectRatio : originalHeight;
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL();
          const base64Index = base64.indexOf('base64,') + 'base64,'.length;
          const imageData = base64.substring(base64Index);
          resolve({imageData, width, height});
      };
      img.onerror = function () {
          reject(new Error('Error convert to base64'));
      };
      img.src = url;
    })
  }

  handleSymbolsUpload(event: any) {
    if (!this.selectedFolderId) {
      alert('Please select a folder first before uploading symbols.');
      return;
    }

    const files = event.target.files;
    const uploadPromises: Promise<any>[] = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
  
      const uploadPromise = new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          const imageDataWithPrefix = e.target?.result as string;
  
          const {imageData, width, height} = await this.convertUrlToBase64Data(imageDataWithPrefix, 210);
  
          const imageName = file.name;
          const imageType = "image/png";
  
          // Convert base64 string to byte array
          const byteCharacters = window.atob(imageData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
  
          // Create an object to store in local storage
          const symbolObject = {
            id: this.generateId(),
            imageData: Array.from(byteArray),
            imageName: imageName,
            imageType: imageType,
            width,
            height,
            folderId: this.selectedFolderId
          };
          
          this.addSymbolToFolder(symbolObject);
          resolve(symbolObject);
        };
  
        reader.onerror = (error) => {
          reject(error);
        };
  
        reader.readAsDataURL(file);
      });
  
      uploadPromises.push(uploadPromise);
    }
  
    // Wait for all uploads to finish before refreshing the symbols list for the selected folder only
    Promise.all(uploadPromises).then(() => {
      if (this.selectedFolderId) {
        this.loadSymbolsForFolder(this.selectedFolderId);
      }
    });
  }
  
  // Folder Management Methods
  createFolder(): void {
    this.showCreateFolderModal = true;
  }

  confirmCreateFolder(): void {
    if (this.newFolderName.trim()) {
      const newFolder: SymbolFolder = {
        id: this.generateId(),
        name: this.newFolderName.trim(),
        symbols: [],
        isExpanded: true
      };
      
      this.folders.push(newFolder);
      this.saveFolders();
      this.newFolderName = '';
      this.showCreateFolderModal = false;
      this.selectedFolderId = newFolder.id;
      this.symbols = []; // Clear symbol list for new folder
    }
  }

  cancelCreateFolder(): void {
    this.newFolderName = '';
    this.showCreateFolderModal = false;
  }

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

  deleteFolder(folderId: string): void {
    if (confirm('Are you sure you want to delete this folder and all its symbols?')) {
      this.folders = this.folders.filter(f => f.id !== folderId);
      this.saveFolders();
      
      // Remove all symbols from this folder
      const allSymbols = JSON.parse(localStorage.getItem('SymbolsData') || '[]');
      const filteredSymbols = allSymbols.filter((symbol: any) => symbol.folderId !== folderId);
      localStorage.setItem('SymbolsData', JSON.stringify(filteredSymbols));
      
      if (this.selectedFolderId === folderId) {
        this.selectedFolderId = null;
        this.symbols = [];
      }
    }
  }

  deleteSymbol(symbolId: string): void {
    if (confirm('Are you sure you want to delete this symbol?')) {
      const allSymbols = JSON.parse(localStorage.getItem('SymbolsData') || '[]');
      const filteredSymbols = allSymbols.filter((symbol: any) => symbol.id !== symbolId);
      localStorage.setItem('SymbolsData', JSON.stringify(filteredSymbols));
      
      // Update the current folder's symbols
      if (this.selectedFolderId) {
        this.loadSymbolsForFolder(this.selectedFolderId);
      }
    }
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

  private addSymbolToFolder(symbolObject: any): void {
    const allSymbols = JSON.parse(localStorage.getItem('SymbolsData') || '[]');
    allSymbols.push(symbolObject);
    localStorage.setItem('SymbolsData', JSON.stringify(allSymbols));
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
 