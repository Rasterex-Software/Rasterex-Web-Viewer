import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageLibraryService {
  private apiUrl = 'https://localhost:7124';
  constructor(private http: HttpClient) { }
  uploadImage(imageData: string, imageName: string, imageType: string): Observable<any> {
    // Convert the image data to base64 if it's not already in base64 format
    const base64ImageData = imageData.startsWith('data:') ? imageData.split(',')[1] : imageData;
  
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      imageData: base64ImageData, // Base64-encoded image data
      imageName: imageName,
      imageType: imageType
    };
  
    return this.http.post<any>(`${this.apiUrl}/api/ImagesLibrary`, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAllImages(){
    return this.http.get<any>(`${this.apiUrl}/api/ImagesLibrary`).pipe(
      
    )
  }
  
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}
