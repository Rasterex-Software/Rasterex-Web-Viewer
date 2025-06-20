import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

declare const RxConfig: any;

export interface QRCodeData {
  id: string;
  text: string;
  size: number;
  level: number;
  margin: number;
  imageData: string; // Base64 encoded image
  createdAt: Date;
  name: string;
}

export interface QRCodeRequest {
  Command: string;
  LicenseID: string;
  Size: number;
  Text: string;
}

@Injectable({
  providedIn: 'root'
})
export class QRCodeLibraryService {
  private readonly qrEndpoint = 'https://test.rasterex.com/RxBinWeb/RxCSISAPI.dll?CommandJSON';
  private readonly dbName = 'QRCodeDB';
  private readonly storeName = 'qrcodes';
  private readonly version = 1;

  constructor(private http: HttpClient) {}

  generateQRCode(text: string, size: number = 10, level: number = 0, margin: number = 1): Observable<Blob> {
    const requestBody: QRCodeRequest[] = [
      {
        Command: "CreateQR",
        LicenseID: "6",
        Size: size,
        Text: text
      }
    ];

    return this.http.post(this.qrEndpoint, requestBody, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('text', 'text', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  saveQRCode(qrData: QRCodeData): Observable<QRCodeData> {
    return from(this.openDatabase().then(db => {
      return new Promise<QRCodeData>((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(qrData);
        
        request.onsuccess = () => resolve(qrData);
        request.onerror = () => reject(request.error);
      });
    }));
  }

  getAllQRCodes(): Observable<QRCodeData[]> {
    return from(this.openDatabase().then(db => {
      return new Promise<QRCodeData[]>((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }));
  }

  deleteQRCode(id: string): Observable<void> {
    return from(this.openDatabase().then(db => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }));
  }

  deleteAllQRCodes(): Observable<void> {
    return from(this.openDatabase().then(db => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }));
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/png;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
} 