import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '../components/user/user.service';

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
  //private apiUrl =  RXCore.Config.apiBaseURL;
  private apiUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient,
    private readonly userService: UserService
  ) { }

   /**
   * Creates an annotation.
   */
   async createAnnotation(projId: number, docId: string, data: string, createdBy?: number): Promise<Annotation> {
    const url = `${this.apiUrl}api/annotation`;
    const body = { projId, docId, data, createdBy };
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
  async getAnnotations(projId: number, docId: string): Promise<Annotation[]> {
    const url = `${this.apiUrl}api/annotations?projId=${projId}&docId=${docId}`;
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
  async deleteAnnotation(id: number): Promise<Annotation> {
    const url = `${this.apiUrl}api/annotations/${id}`;
    const options = { headers : { 'x-access-token': `${this.userService.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.delete<any>(url, options).subscribe({
        next: (v: Annotation) => {
          resolve(v);
        },
        error: (e) => {
          console.error('deleteAnnotation failed:', e.error);
          reject(e);
        }
      });
    });
  }
}
