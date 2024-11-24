import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://viewserver.rasterex.com:8080/';

  constructor(private http: HttpClient) { }

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
    return this.http.get<any>(`${this.apiUrl}api/logout`).pipe();
  }
}
