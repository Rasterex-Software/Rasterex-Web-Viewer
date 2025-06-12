import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailCacheService {
  private dbPromise: Promise<IDBPDatabase>;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB('thumbnail-cache', 1, {
      upgrade(db) {
        db.createObjectStore('thumbnails', { keyPath: 'fileName' });
      }
    });
  }

  async getCachedThumbnail(fileName: string): Promise<string | null> {
    const db = await this.dbPromise;
    const cached = await db.get('thumbnails', fileName);

    if (cached) {
      const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
      if (!isExpired) {
        return cached.thumbnail;
      }
      // Remove expired cache
      await db.delete('thumbnails', fileName);
    }
    return null;
  }

  async cacheThumbnail(fileName: string, thumbnail: string): Promise<void> {
    const db = await this.dbPromise;
    await db.put('thumbnails', {
      fileName,
      thumbnail,
      timestamp: Date.now()
    });
  }
}
