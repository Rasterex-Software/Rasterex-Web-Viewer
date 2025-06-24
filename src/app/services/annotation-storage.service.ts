import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '../components/user/user.service';
import { RXCore } from 'src/rxcore';

export interface Annotation {
  id: number;
  projId: number;
  docId: string;
  data: string;
  createdBy?: string;
  updatedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnotationStorageService {
  private apiUrl =  RXCore.Config.apiBaseURL;

  constructor(private http: HttpClient,
    private readonly userService: UserService
  ) { }

   /**
   * Creates an annotation.
   */
   async createAnnotation(projId: number, docId: string, data: string, roomId?: string, createdBy?: number): Promise<Annotation> {
    const url = `${this.apiUrl}api/annotation`;
    const body = { projId, docId, roomId, data, createdBy };
    const options = { headers : { 'x-access-token': `${this.userService.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.post<any>(url, body, options).subscribe({
        next: (v: Annotation) => {
          resolve(v);
        },
        error: (e) => {
          console.error('createAnnotation failed:', e.error);
          reject(e);
        }
      });
    });
  }

  /**
   * Gets an annotation by id.
   */
  async getAnnotation(id: number): Promise<Annotation> {
    const url = `${this.apiUrl}api/annotations/${id}`;
    const options = { headers : { 'x-access-token': `${this.userService.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.get<any>(url, options).subscribe({
        next: (v: Annotation) => {
          resolve(v);
        },
        error: (e) => {
          console.error('getAnnotation failed:', e.error);
          reject(e);
        }
      });
    });
  }

  /**
   * Gets annotations from back-end.
   */
  async getAnnotations(projId: number, docId: string, roomId?: string): Promise<Annotation[]> {
    let url = `${this.apiUrl}api/annotations?projId=${projId}&docId=${docId}`;
    if (roomId!== undefined && roomId !== null) {
      url += `&roomId=${roomId}`;
    }
    const options = { headers : { 'x-access-token': `${this.userService.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.get<any>(url, options).subscribe({
        next: (v: Annotation[]) => {
          resolve(v);
        },
        error: (e) => {
          console.error('getAnnotations failed:', e.error);
          reject(e);
        }
      });
    });
  }

  /**
   * Updates an annotation by id.
   */
  async updateAnnotation(id: number, data: string, updatedBy?: number): Promise<Annotation> {
    const url = `${this.apiUrl}api/annotations/${id}`;
    const body = { data, updatedBy };
    const options = { headers : { 'x-access-token': `${this.userService.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.patch<any>(url, body, options).subscribe({
        next: (v: Annotation) => {
          resolve(v);
        },
        error: (e) => {
          console.error('updateAnnotation failed:', e.error);
          reject(e);
        }
      });
    });
  }

  /**
   * Deletes an annotation by id.
   */
  async deleteAnnotation(id: number): Promise<boolean> {
    const url = `${this.apiUrl}api/annotations/${id}`;
    const options = { headers : { 'x-access-token': `${this.userService.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.delete<any>(url, options).subscribe({
        next: (v: any) => {
          resolve(true);
        },
        error: (e) => {
          console.error('deleteAnnotation failed:', e.error);
          reject(false);
        }
      });
    });
  }

  /**
 * Deletes annotations from back-end.
 */
  async deleteAnnotations(projId: number, docId: string, roomId?: string): Promise<boolean> {
    let url = `${this.apiUrl}api/annotations?projId=${projId}&docId=${docId}`;
    if (roomId!== undefined && roomId !== null) {
      url += `&roomId=${roomId}`;
    }
    const options = { headers : { 'x-access-token': `${this.userService.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.delete<any>(url, options).subscribe({
        next: (v: any) => {
          resolve(true);
        },
        error: (e) => {
          console.error('deleteAnnotations failed:', e.error);
          reject(false);
        }
      });
    });
  }
}
