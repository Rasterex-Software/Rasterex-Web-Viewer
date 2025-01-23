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
  // Add a new item to db
  addCustomStamp(stamp: StampStoreData): Promise<any> {
    return new Promise((resolve, reject) => {
        const callbackObj = {
            next: (data) => {
                resolve(data);
            },
            error: (e) => {
                console.error('Failed to add custom stamp', e);
                reject(e);
            }
        };

        if (this.localStoreStamp) {
            this.indexedDbService.addItem(StampType.CustomStamp, { 'name': stamp.name, 'data': JSON.stringify(stamp)}).subscribe(callbackObj);
        }
        else {
            this.stampLibraryService.addStamp(StampType.CustomStamp, stamp).subscribe(callbackObj);
        }     
    });
  }

  deleteCustomStamp(stampId: number): Promise<any> {
    return new Promise((resolve, reject) => {
        const callbackObj = {
            next: (data) => {
                resolve(data);
            },
            error: (e) => {
                console.error('Failed to delete custom stamp', e);
                reject(e);
            }
        };
        if (this.localStoreStamp) {
            this.indexedDbService.deleteItem(StampType.CustomStamp, stampId).subscribe(callbackObj);
        }
        else {
            this.stampLibraryService.deleteStamp(StampType.CustomStamp, stampId).subscribe(callbackObj);
        }

    });
  }

  // Get all items from db
  getAllCustomStamps(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const callbackObj = {
            next: (data) => {
                resolve(data);
            },
            error: (e) => {
                console.error('Failed to get all custom stamps', e);
                reject(e);
            }
        };
        if (this.localStoreStamp) {
            this.indexedDbService.getAllItems(StampType.CustomStamp).subscribe(callbackObj);
        }
        else {
            this.stampLibraryService.getAllStamps(StampType.CustomStamp).subscribe(callbackObj);
        }      
    });
  }
}
