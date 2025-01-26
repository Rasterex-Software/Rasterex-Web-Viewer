import { Injectable } from '@angular/core';
import { NgxIndexedDBService, ObjectStoreMeta } from 'ngx-indexed-db';
//import { NgxIndexedDBService } from 'ngx-indexed-db';
//import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class IndexedDbService {

  constructor(private dbService: NgxIndexedDBService) { }

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
