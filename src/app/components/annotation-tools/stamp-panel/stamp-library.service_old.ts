import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StampLibraryService {
  private apiUrl = 'https://localhost:7124';

  constructor(private http: HttpClient) { }

  uploadStamp(stampData: string, stampName: string, stampType: string): Observable<any> {
    // Convert the stamp data to base64 if it's not already in base64 format
    const base64stampData = stampData.startsWith('data:') ? stampData.split(',')[1] : stampData;

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      stampData: base64stampData, // Base64-encoded stamp data
      stampName: stampName,
      stampType: stampType
    };

    return this.http.post<any>(`${this.apiUrl}/api/StampsLibrary`, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAllStamps(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/StampsLibrary`).pipe();
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}
