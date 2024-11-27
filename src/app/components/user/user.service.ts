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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://viewserver.rasterex.com:8080/';
  //private apiUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) {
    this._permissions.subscribe((v) => {
      // currently back-end cannot make sure to return permission with unique permId,
      // let's do filter for now.
      if (Array.isArray(v)) {
        const permKeys = v.map((item) => item.permission.key).join(',');
        console.log('Permissions:', permKeys);
      }

      let canViewAnnotation = false;
      let canAddAnnotation = false;
      let canUpdateAnnotation = false;
      let canDeleteAnnotation = false;

      if (!v) {
        canViewAnnotation = true;
        canAddAnnotation = true;
        canUpdateAnnotation = true;
        canDeleteAnnotation = true;
      } else {
        for (let i = 0; i < v.length; i++) {
          const permKey = v[i].permission?.key;
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
    });
  }

  login(username: string, password: string): Observable<any> {
    // username and password shouldn't be null here
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      username,
      password
    };
    return this.http.post<any>(`${this.apiUrl}api/login`, body, { headers }).pipe();
  }

  logout() {
    this._permissions.next(null);
    return this.http.get<any>(`${this.apiUrl}api/logout`).pipe();
  }

  /** Permission-related */
  private _permissions: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private _canViewAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public canViewAnnotation$ = this._canViewAnnotation.asObservable();
  private _canAddAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public canAddAnnotation$ = this._canAddAnnotation.asObservable();
  private _canUpdateAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public canUpdateAnnotation$ = this._canUpdateAnnotation.asObservable();
  private _canDeleteAnnotation : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public canDeleteAnnotation$ = this._canDeleteAnnotation.asObservable();

  async getPermissions(projId: number, userId?: number) {
    let userIdStr = '';
    if (userId != null) {
      userIdStr = `?userId=${userId}`
    }
    const requestObv = this.http.get<any>(`${this.apiUrl}api/projects/${projId}/permissions${userIdStr}`, {
      withCredentials: true,
    });

    const result = await firstValueFrom(requestObv);

    this._permissions.next(result);
  }
}
