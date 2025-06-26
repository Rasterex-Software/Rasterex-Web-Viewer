import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AnnotationToolsService {
  

  constructor() { }

  private _opened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public opened$: Observable<boolean> = this._opened.asObservable();
  public show(): void {
    this._opened.next(true);
  }
  public hide(): void {
    this._opened.next(false);
  }

  private _quickActionsMenuVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public quickActionsMenuVisible$: Observable<boolean> = this._quickActionsMenuVisible.asObservable();
  public showQuickActionsMenu(): void {
    this._quickActionsMenuVisible.next(true);
  }
  public hideQuickActionsMenu(): void {
    this._quickActionsMenuVisible.next(false);
  }

  private _propertiesPanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public propertiesPanelState$: Observable<any> = this._propertiesPanelState.asObservable();
  public setPropertiesPanelState(any): void {
    this._propertiesPanelState.next(any);
  }

  /* note */
  private _notePanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public notePanelState$: Observable<any> = this._notePanelState.asObservable();
  public setNotePanelState(any): void {

    this._notePanelState.next(any);
  }

  private _searchPanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public searchPanelState$: Observable<any> = this._searchPanelState.asObservable();
  public setSearchPanelState(any): void {
    this._searchPanelState.next(any);
  }


  private _notePopoverState: Subject<any> = new Subject<any>();
  public notePopoverState$: Observable<any> = this._notePopoverState.asObservable();
  public setNotePopoverState(any): void {
    this._notePopoverState.next(any);
  }

  private _erasePanelState: Subject<any> = new Subject<any>();
  public erasePanelState$: Observable<any> = this._erasePanelState.asObservable();
  public setErasePanelState(any): void {
    this._erasePanelState.next(any);
  }

  private _contextPopoverState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public contextPopoverState$: Observable<any> = this._contextPopoverState.asObservable();
  public setContextPopoverState(any): void {
    this._contextPopoverState.next(any);
  }

  private _measurePanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public measurePanelState$: Observable<any> = this._measurePanelState.asObservable();
  public setMeasurePanelState(any): void {
    this._measurePanelState.next(any);
  }

  private _measurePanelDetailState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public measurePanelDetailState$: Observable<any> = this._measurePanelDetailState.asObservable();
  public setMeasurePanelDetailState(any): void {
    this._measurePanelDetailState.next(any);
  }

  private _snapState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public snapState$: Observable<boolean> = this._snapState.asObservable();
  public setSnapState(any): void {
    this._snapState.next(any);
  }

  private _imagePanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public imagePanelState$: Observable<any> = this._imagePanelState.asObservable();
  public setImagePanelState(any): void {
    this._imagePanelState.next(any);
  }
  private _symbolPanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public symbolPanelState$: Observable<any> = this._symbolPanelState.asObservable();
  public setSymbolPanelState(any): void {
    this._symbolPanelState.next(any);
  }

  private _qrCodePanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public qrCodePanelState$: Observable<any> = this._qrCodePanelState.asObservable();
  public setQRCodePanelState(any): void {
    this._qrCodePanelState.next(any);
  }

  private _linkPanelState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public linkPanelState$: Observable<any> = this._linkPanelState.asObservable();
  public setLinksPanelState(any): void {
    this._linkPanelState.next(any);
  }

  private _selectedOption: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public selectedOption$: Observable<any> = this._selectedOption.asObservable();
  public setSelectedOption(any): void {
    this._selectedOption.next(any);
  }

}
