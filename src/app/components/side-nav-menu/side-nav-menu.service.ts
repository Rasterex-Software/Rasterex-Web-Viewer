import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type ModalType = 'INSERT' | 'REPLACE' | 'NONE'

@Injectable({
  providedIn: 'root'
})
export class SideNavMenuService {

  constructor() { }

  private sidebarChanged: Subject<any> = new Subject<any>();
  public sidebarChanged$: Observable<any> = this.sidebarChanged.asObservable();
  toggleSidebar(index: number) {
    this.sidebarChanged.next(index);
  }

  private extractModalChanged: Subject<boolean> = new Subject<boolean>();
  public extractModalChanged$: Observable<boolean> = this.extractModalChanged.asObservable();

  toggleExtractModal(visible: boolean): void {
    this.extractModalChanged.next(visible);
  }

  private insertModalChanged: Subject<ModalType> = new Subject<ModalType>();
  public insertModalChanged$: Observable<ModalType> = this.insertModalChanged.asObservable();

  toggleInsertModal(type: ModalType): void {
    this.insertModalChanged.next(type);
  }

  private rightClickedPage: Subject<number> = new Subject<number>();
  public rightClickedPage$: Observable<number> = this.rightClickedPage.asObservable();

  setRightClickedPage(pageIndex: number) {
    this.rightClickedPage.next(pageIndex)
  }

  private copiedPage: Subject<any> = new Subject<any>();
  public copiedPage$: Observable<any> = this.copiedPage.asObservable();
  setCopy(value: boolean) {
    this.copiedPage.next(value)
  }
}
