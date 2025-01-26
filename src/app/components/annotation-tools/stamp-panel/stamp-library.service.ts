import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { StampStoreData, StampType } from './StampData';

@Injectable({
  providedIn: 'root'
})
export class StampLibraryService {
  private apiUrl = 'http://viewserver.rasterex.com:8080/';
  //private apiUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) { }

  addStamp(stampType: StampType, stamp: StampStoreData): Observable<any> {   
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      name: stamp.name,
      type: stampType,
      data: JSON.stringify(stamp),
    };

    return this.http.post<any>(`${this.apiUrl}api/stamp/template`, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteStamp(stampType: StampType, stampId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}api/stamp/templates/${stampId}`).pipe();
  }

  getAllStamps(stampType: StampType): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/stamp/templates?type=${stampType}`).pipe();
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}
