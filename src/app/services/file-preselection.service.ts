import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilePreselectionService {

private selectedFileSubject = new Subject<any>();
  selectedFile$ = this.selectedFileSubject.asObservable();

  emitSelectedFile(file: any) {
    this.selectedFileSubject.next(file);
  }
 
}