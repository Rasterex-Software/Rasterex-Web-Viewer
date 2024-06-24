import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

interface RecentFile {
  id: string;
  name: string;
  path: string;
  date: string;
  width: number;
  height: number;
  buffer: Uint8ClampedArray;
}

@Injectable({
  providedIn: 'root'
})
export class RecentFilesService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB('file-storage', 1, {
      upgrade(db) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
    });
  }

  async getRecentFiles(): Promise<any[]> {
    const db = await this.dbPromise;
    const allFiles = await db.getAll('files');
    const temp: any[] = [];
    const icanvas = document.createElement('canvas');
    const ictx = icanvas.getContext('2d');

    allFiles.forEach(item => {
      if (ictx) {
        const cimageData = ictx.createImageData(item.width, item.height);
        cimageData.data.set(item.buffer);
        temp.push({
          name: item.name,
          path: item.path,
          date: item.date,
          thumbnail: cimageData
        });
      }
    });

    return temp;
  }

  async addRecentFile(file: RecentFile): Promise<void> {
    const db = await this.dbPromise;
    const allFiles = await db.getAll('files');

    const existingIndex = allFiles.findIndex(f => f.name === file.name);
    if (existingIndex > -1) {
      await db.delete('files', allFiles[existingIndex].id);
    }

    file.id = new Date().getTime().toString(); // Unique ID for the file
    await db.put('files', file);

    if (allFiles.length >= 10) {
      const oldestFile = allFiles[allFiles.length - 1];
      await db.delete('files', oldestFile.id);
    }
  }
}
