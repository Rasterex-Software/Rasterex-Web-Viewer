import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RXCore } from 'src/rxcore';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileCategoryService } from './file-category.service';
import { ThumbnailCacheService } from './thumbnail-cache.service';
import { FileCategory } from '../shared/enums/file-category';
declare var RxConfig: any;
export interface DemoFile {
  id: string;
  name: string;
  file: string;
  type: string;
  size: number;
  thumbnail: string;
  category: string;
}

export interface DemoFileGroup {
  name: string;
  items: DemoFile[];
}
@Injectable({
  providedIn: 'root'
})
export class FileManageService {

  
  //  private apiUrl = RXCore.Config.apiBaseURL;
  private apiUrl = 'http://localhost:8080/';
  private _demoFiles = new BehaviorSubject<DemoFileGroup[]>([]);
  demoFiles$ = this._demoFiles.asObservable();

  constructor(private http: HttpClient, private fileCategoryService: FileCategoryService, private thumbnailCacheService: ThumbnailCacheService) { }

  async fetchDemoFiles(): Promise<DemoFileGroup[]> {
    const url = RxConfig.SampleFileList;
    return new Promise((resolve, reject) => {
      this.http.get<any>(url).subscribe({
        next: async (response) => {
          const filesByCategory = new Map<string, DemoFile[]>();
          console.log("fileresponse", response)
          // Object.values(FileCategory).forEach(category => {
          //   filesByCategory.set(category, []);
          // });
          // Process each file and group by category
          for (const fileName of response.Files) {
            const category = this.fileCategoryService.getCategory(fileName);
            let thumbnail = '';

            try {
              // First try to get from cache
              const cachedThumbnail = await this.thumbnailCacheService.getCachedThumbnail(fileName);

              // If not in cache, fetch from API
              if (cachedThumbnail) {
                thumbnail = cachedThumbnail;
              } else {
                thumbnail = await this.getFileThumbnail(fileName);
              }
            } catch (error) {
              console.error(`Failed to fetch thumbnail for ${fileName}:`, error);
              thumbnail = '';
            }

            const file: DemoFile = {
              id: fileName,
              name: fileName,
              file: fileName,
              type: fileName.split('.').pop() || '',
              size: 0,
              thumbnail: thumbnail,
              category: category
            };

            if (!filesByCategory.has(category)) {
              filesByCategory.set(category, []);
            }
            filesByCategory.get(category)?.push(file);
          }

          const demoFileGroups: DemoFileGroup[] = Array.from(filesByCategory.entries())
            .map(([category, files]) => ({
              name: `${category}`,
              items: files
            }));

          console.log("Response", response);
          const categoryOrder = {
            'CAD Drawings': 1,
            '3D Models': 2,
            'Plotter Files': 3,
            'Image Files': 4,
            'Office Documents': 5
          };

          demoFileGroups.sort((a, b) => {
            const orderA = categoryOrder[a.name] || 999;
            const orderB = categoryOrder[b.name] || 999;
            return orderA - orderB;
          });
          this._demoFiles.next(demoFileGroups);
          resolve(demoFileGroups);
        },
        error: (e) => {
          console.error('Failed to fetch sample files:', e);
          reject(e);
        }
      });
    });
  }
  async getFileThumbnail(fileName: string, width: number = 300, height: number = 300): Promise<string> {
    // First try to get from cache
    const cachedThumbnail = await this.thumbnailCacheService.getCachedThumbnail(fileName);
    if (cachedThumbnail) {
      console.log('Using cached thumbnail for:', fileName);
      return cachedThumbnail;
    }

    // If not in cache, fetch from API
    const url = `${RxConfig.SampleFileThumbnail}&${fileName}&${width}&${height}`;
    return new Promise((resolve, reject) => {
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: async (blob) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const thumbnail = reader.result as string;
            // Cache the thumbnail
            await this.thumbnailCacheService.cacheThumbnail(fileName, thumbnail);
            resolve(thumbnail);
          };
          reader.readAsDataURL(blob);
        },
        error: (e) => {
          console.error('Failed to fetch thumbnail:', e);
          reject(e);
        }
      });
    });
  }
}
