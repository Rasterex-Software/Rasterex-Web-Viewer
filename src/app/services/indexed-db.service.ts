import { Injectable  } from '@angular/core';
import { NgxIndexedDBService, ObjectStoreMeta } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class IndexedDbService {

  constructor(private dbService: NgxIndexedDBService) {}

   // Allows to create a new object store ad-hoc. Use with caution. Using this method will increase the version number.
  createObjectStore(storeSchema: ObjectStoreMeta, migrationFactory?: () => {
      [key: number]: (db: IDBDatabase, transaction: IDBTransaction) => void;
  }): Promise<void> {
      return this.dbService.createObjectStore(storeSchema, migrationFactory);
  }
  // Check if a store exists
  storeExists(storeName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dbService.getAllObjectStoreNames().subscribe({
        next: (storeNames) => {
          resolve(storeNames.includes(storeName));
        },
      error: (error) => {
        reject(error);
      }
    });
    });
  }
  
  // Add a new item to the specified store
  addItem(storeName: string, item: any): Observable<any> {
    return this.dbService.add(storeName, item);
  }

  // Get an item by ID from the specified store
  getItemById(storeName: string, id: any): Observable<any> {
    return this.dbService.getByID(storeName, id);
  }

  // Get all items from the specified store
  getAllItems(storeName: string): Observable<any[]> {
    return this.dbService.getAll(storeName);
  }

  // Update an item in the specified store
  updateItem(storeName: string, item: any): Observable<any> {
    return this.dbService.update(storeName, item);
  }

  // Delete an item by ID from the specified store
  deleteItem(storeName: string, id: any): Observable<any> {
    return this.dbService.delete(storeName, id);
  }
}
