import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RXCore } from 'src/rxcore';

@Injectable({
  providedIn: 'root'
})
export class SymbolsLibraryService {

  private readonly baseUrl = RXCore.Config.apiBaseURL + 'api/symbol/folders';

  constructor(private http: HttpClient) { }

  getFolders(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getSymbols(folderId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${folderId}/symbols`);
  }
} 