import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
declare var RxConfig: any;
export interface FileMetadata {
  filename: string;
  filesize: string;
  format: string;
  thumbnail: string;
  layouts?: Array<{
    name: string;
    blocks: string[];
  }>;
  layers?: string[];
}

export interface FileSelectionOptions {
  selectedLayers: string[];
  selectedBlocks: string[];
}
@Injectable({
  providedIn: 'root'
})
export class FileMetadataService {
 
  constructor(private http: HttpClient) {}

  getFileMetadata(fileName: string, width: number = 300, height: number = 300): Observable<FileMetadata> {
    const url = `${RxConfig.SampleFileMetadata}&${encodeURIComponent(fileName)}&${width}&${height}`;

    return this.http.get<FileMetadata>(url);
  }


  getUploadedFileMetadata(fileName: string, width: number = 300, height: number = 300): Observable<FileMetadata> {
    const fullPath = `${RxConfig.UploadServerfolder}${fileName}`;
    const url = `${RxConfig.UploadedFileMetadata}&${fullPath}&${width}&${height}`;
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(text => {
        const cleaned = text.replace(/,\s*([\]}])/g, '$1'); 
        return JSON.parse(cleaned);
      })
    );
  }

  isCADFile(fileName: string): boolean {
    const cadExtensions = ['.dwg', '.dgn', '.idw'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return cadExtensions.includes(extension);
  }
}
