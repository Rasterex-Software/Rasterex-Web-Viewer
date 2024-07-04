import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StampPanelService {
  constructor() { }

  private _modalOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public modalOpened$: Observable<boolean> = this._modalOpened.asObservable();

  private _eventUploadFile = new Subject<boolean>();
  private _statusActiveDocument = new BehaviorSubject<string>('');

  public openModal(): void {
    this._modalOpened.next(true);
  }

  public closeModal(): void {
    this._modalOpened.next(false);
  }

  public sendEventUploadFile(): void {
    this._eventUploadFile.next(true);
  }

  public getEventUploadFile(): Observable<boolean> {
    return this._eventUploadFile.asObservable();
  }

  public sendStatusActiveDocument(status: string): void {
    this._statusActiveDocument.next(status);
  }

  public getStatusActiveDocument(): Observable<string> {
    return this._statusActiveDocument.asObservable();
  }

}
