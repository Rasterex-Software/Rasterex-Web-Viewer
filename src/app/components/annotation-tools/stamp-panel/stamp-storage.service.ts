import { Injectable } from '@angular/core';
import { IndexedDbService } from 'src/app/services/indexed-db.service';
import { StampLibraryService } from './stamp-library.service';
import { StampStoreData, StampType } from './StampData';

@Injectable({
  providedIn: 'root'
})

export class StampStorageService {
  constructor(
    private indexedDbService: IndexedDbService,
    private stampLibraryService: StampLibraryService
) { 
}

private addStamp(stamp: StampStoreData, type: StampType): Promise<any> {
    return new Promise((resolve, reject) => {
        const callbackObj = {
            next: (data) => {
                resolve(data);
            },
            error: (e) => {
                console.error(`Failed to add ${type} stamp`, e);
                reject(e);
            }
        };
        if (type == StampType.StandardStamp) {
            this.stampLibraryService.addStamp(type, stamp).subscribe(callbackObj);
        }
        else {
            this.indexedDbService.addItem(type, { 'name': stamp.name, 'data': JSON.stringify(stamp)}).subscribe(callbackObj);
        }      
    });
}

  addStandardStamp(stamp: StampStoreData): Promise<any> {
    return this.addStamp(stamp, StampType.StandardStamp);
  }

  // Add a new item to indexed-db
  addCustomStamp(stamp: StampStoreData): Promise<any> {
    return this.addStamp(stamp, StampType.CustomStamp);
  }

  // Add a new item to indexed-db
  addUploadImageStamp(stamp: StampStoreData): Promise<any> {
    return this.addStamp(stamp, StampType.UploadStamp);
  }

  private deleteStamp(stampId: number, type: StampType): Promise<any> {
    return new Promise((resolve, reject) => {
        const callbackObj = {
            next: (data) => {
                resolve(data);
            },
            error: (e) => {
                console.error(`Failed to delete ${type} stamp`, e);
                reject(e);
            }
        };
        if (type == StampType.StandardStamp) {
            this.stampLibraryService.deleteStamp(stampId).subscribe(callbackObj);
        }
        else {
            this.indexedDbService.deleteItem(type, stampId).subscribe(callbackObj);
        }      
    });
  }

  deleteStandardStamp(stampId: number): Promise<any> {
    return this.deleteStamp(stampId, StampType.StandardStamp);
  }

  deleteCustomStamp(stampId: number): Promise<any> {
    return this.deleteStamp(stampId, StampType.CustomStamp);
  }

  deleteUploadImageStamp(stampId: number): Promise<any> {
    return this.deleteStamp(stampId, StampType.UploadStamp);
  }

  // Update an existing custom stamp
  updateCustomStamp(stampId: number, stamp: StampStoreData): Promise<any> {
    return new Promise((resolve, reject) => {
      const callbackObj = {
        next: (data) => {
          resolve(data);
        },
        error: (e) => {
          console.error('Failed to update custom stamp', e);
          reject(e);
        }
      };
      
      // Create update object with id and data
      const updateData = { 
        id: stampId, 
        name: stamp.name, 
        data: JSON.stringify(stamp) 
      };
      
      this.indexedDbService.updateItem(StampType.CustomStamp, updateData).subscribe(callbackObj);
    });
  }

  private getStampsByType(type: StampType): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const callbackObj = {
            next: (data) => {
                resolve(data);
            },
            error: (e) => {
                console.error(`Failed to get all ${type} stamps`, e);
                reject(e);
            }
        };
        if (type == StampType.StandardStamp) {
            this.stampLibraryService.getAllStamps(type).subscribe(callbackObj);
        }
        else {
            this.indexedDbService.getAllItems(type).subscribe(callbackObj);
        }      
    });
  }

  // Get all items from db
  getAllStandardStamps(): Promise<any[]> {
    return this.getStampsByType(StampType.StandardStamp);
  }

  // Get all items from db
  getAllCustomStamps(): Promise<any[]> {
    return this.getStampsByType(StampType.CustomStamp);
  }

  // Get all items from db
  getAllUploadImageStamps(): Promise<any[]> {
    return this.getStampsByType(StampType.UploadStamp);
  }

}
