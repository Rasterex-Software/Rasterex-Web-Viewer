import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

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

  private insertModalChanged: Subject<boolean> = new Subject<boolean>();
  public insertModalChanged$: Observable<boolean> = this.insertModalChanged.asObservable();

  toggleInsertModal(visible: boolean): void {
    this.insertModalChanged.next(visible);
  }

  private replaceModalChanged: Subject<boolean> = new Subject<boolean>();
  public replaceModalChanged$: Observable<boolean> = this.replaceModalChanged.asObservable();

  toggleReplaceModal(visible: boolean): void {
    this.replaceModalChanged.next(visible);
  }

  private rightClickedPage: Subject<number> = new Subject<number>();
  public rightClickedPage$: Observable<number> = this.rightClickedPage.asObservable();

  setRightClickedPage(pageIndex: number) {
    this.rightClickedPage.next(pageIndex)
  }
}
