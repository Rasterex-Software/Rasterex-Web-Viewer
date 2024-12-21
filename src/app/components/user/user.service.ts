import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';

// TODO: may move it to constants
export const PERMISSION_KEYS = {
  // These values should match keys stored in db
  ViewAnnotation: 'Annotation.View',
  AddAnnotation: 'Annotation.Add',
  UpdateAnnotation: 'Annotation.Update',
  DeleteAnnotation: 'Annotation.Delete',
}

export interface ResponseMessage {
  message: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
}

export interface ProjectUserPermission {
  id: number;
  projId: number;
  userId: number;
  permId: number;
  permission: {
    key: string;
  }
}

export interface Annotation {
  id: number;
  projId: number;
  data: string;
  createdBy?: string;
  updatedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://viewserver.rasterex.com:8080/';
  //private apiUrl = 'http://localhost:8080/';

  private accessToken = '';

  /** Permission-related */
  private _canViewAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _canAddAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _canUpdateAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _canDeleteAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public canViewAnnotation$ = this._canViewAnnotation.asObservable();
  public canAddAnnotation$ = this._canAddAnnotation.asObservable();
  public canUpdateAnnotation$ = this._canUpdateAnnotation.asObservable();
  public canDeleteAnnotation$ = this._canDeleteAnnotation.asObservable();

  constructor(private http: HttpClient) {
    // when a user is not logged in, he can do everything
    this._canViewAnnotation.next(true);
    this._canAddAnnotation.next(true);
    this._canUpdateAnnotation.next(true);
    this._canDeleteAnnotation.next(true);
  }

  async login(username: string, password: string): Promise<User> {
    // username and password shouldn't be null here
    const url = `${this.apiUrl}api/login`;
    const body = { username, password };
    const options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

    return new Promise((resolve, reject) => {
      this.http.post<any>(url, body, options).subscribe({
        next: (v: any) => {
          this.accessToken = v.accessToken;
          resolve(v.user);
        },
        error: (e: ResponseMessage) => {
          reject(e);
        }
      });
    });
  }

  async logout(): Promise<void> {
    const url = `${this.apiUrl}api/logout`;
    const options = { headers : { 'x-access-token': `${this.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.get<any>(url, options).subscribe({
        next: (v: ResponseMessage) => {
          this.accessToken = '';
          console.log('logout result:', v);
          resolve();
        },
        error: (e) => {
          console.error('login failed:', e.error);
          reject(e);
        }
      });
    });
  }

  /**
   * Gets permissions from back-end.
   */
  async getPermissions(projId: number, userId?: number): Promise<ProjectUserPermission[]> {
    let userIdStr = '';
    if (userId != null) {
      userIdStr = `?userId=${userId}`
    }
    const url = `${this.apiUrl}api/projects/${projId}/permissions${userIdStr}`;
    const options = { headers : { 'x-access-token': `${this.accessToken}` } };

    return new Promise((resolve, reject) => {
      this.http.get<any>(url, options).subscribe({
        next: (v: ProjectUserPermission[]) => {
          resolve(v);
        },
        error: (e) => {
          console.error('getPermissions failed:', e.error);
          reject(e);
        }
      });
    });
  }

  /**
   * Creates an annotation.
   */
  async createAnnotation(projId: number, data: string, createdBy?: number): Promise<Annotation> {
    const url = `${this.apiUrl}api/annotation`;
    const body = { projId, data, createdBy };
    const options = { headers : { 'x-access-token': `${this.accessToken}` } };

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
    const options = { headers : { 'x-access-token': `${this.accessToken}` } };

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
  async getAnnotations(projId: number): Promise<Annotation[]> {
    const url = `${this.apiUrl}api/annotations?projId=${projId}`;
    const options = { headers : { 'x-access-token': `${this.accessToken}` } };

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
  async updateAnnotation(id: number, projId: number, data: string, updatedBy?: number): Promise<Annotation> {
    const url = `${this.apiUrl}api/annotations/${id}`;
    const body = { projId, data, updatedBy };
    const options = { headers : { 'x-access-token': `${this.accessToken}` } };

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
    const options = { headers : { 'x-access-token': `${this.accessToken}` } };

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

  /**
   * Update UI according to user permissions.
   * TODO: move this function out of user.service
   */
  setUserPermissions(perms?: ProjectUserPermission[]) {
    let canViewAnnotation = false;
    let canAddAnnotation = false;
    let canUpdateAnnotation = false;
    let canDeleteAnnotation = false;

    // if a user doesn't set any permission, then he has all permissions!
    if (!perms) {
      canViewAnnotation = true;
      canAddAnnotation = true;
      canUpdateAnnotation = true;
      canDeleteAnnotation = true;
    } else {
      for (let i = 0; i < perms.length; i++) {
        const permKey = perms[i].permission?.key;
        switch (permKey) {
          case PERMISSION_KEYS.ViewAnnotation:
            canViewAnnotation = true;
            break;
          case PERMISSION_KEYS.AddAnnotation:
            canAddAnnotation = true;
            break;
          case PERMISSION_KEYS.UpdateAnnotation:
            canUpdateAnnotation = true;
            break;
          case PERMISSION_KEYS.DeleteAnnotation:
            canDeleteAnnotation = true;
            break;
        }
      }
    }

    // View permission is grantted if a user has either add, update, or delete permission
    canViewAnnotation ||= ( canAddAnnotation || canUpdateAnnotation ||  canDeleteAnnotation);
    this._canViewAnnotation.next(canViewAnnotation);
    this._canAddAnnotation.next(canAddAnnotation);
    this._canUpdateAnnotation.next(canUpdateAnnotation);
    this._canDeleteAnnotation.next(canDeleteAnnotation);
  }

  /**
   * Updates UI according to annotations.
   */
  setAnnotations(annos?: Annotation[]) {
    console.log('Annotations:', annos);
    // TODO: implement it
  }
}
