import { Injectable } from '@angular/core';
import { IndexedDbService } from 'src/app/services/indexed-db.service';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { StampLibraryService } from './stamp-library.service';
import { StampStoreData, StampType } from './StampData';

@Injectable({
  providedIn: 'root'
})

export class StampStorageService {

  private localStoreStamp: boolean = true;
  private guiConfig$ = this.rxCoreService.guiConfig$;
  constructor(
    private readonly rxCoreService: RxCoreService,
    private indexedDbService: IndexedDbService,
    private stampLibraryService: StampLibraryService
) { 
    this.guiConfig$.subscribe(config => {
        this.localStoreStamp = !!config.localStoreStamp;
        console.log(`localStoreStamp: ${this.localStoreStamp}`);
    });
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
        if (this.localStoreStamp) {
            this.indexedDbService.addItem(type, { 'name': stamp.name, 'data': JSON.stringify(stamp)}).subscribe(callbackObj);
        }
        else {
            this.stampLibraryService.addStamp(type, stamp).subscribe(callbackObj);
        }      
    });
}
  // Add a new item to db
  addCustomStamp(stamp: StampStoreData): Promise<any> {
    return this.addStamp(stamp, StampType.CustomStamp);
  }

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
        if (this.localStoreStamp) {
            this.indexedDbService.deleteItem(type, stampId).subscribe(callbackObj);
        }
        else {
            this.stampLibraryService.deleteStamp(type, stampId).subscribe(callbackObj);
        }      
    });
  }

  deleteCustomStamp(stampId: number): Promise<any> {
    return this.deleteStamp(stampId, StampType.CustomStamp);
  }

  deleteUploadImageStamp(stampId: number): Promise<any> {
    return this.deleteStamp(stampId, StampType.UploadStamp);
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
        if (this.localStoreStamp) {
            this.indexedDbService.getAllItems(type).subscribe(callbackObj);
        }
        else {
            this.stampLibraryService.getAllStamps(type).subscribe(callbackObj);
        }      
    });
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
