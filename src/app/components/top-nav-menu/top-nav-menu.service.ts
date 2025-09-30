import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CustomButton } from 'src/app/models/custom-button.model';


@Injectable({
  providedIn: 'root'
})
export class TopNavMenuService {
  constructor() { }

  private activeFile: Subject<any> = new Subject<any>();
  public activeFile$: Observable<any> = this.activeFile.asObservable();
  setActiveFile(file: any) {
    this.activeFile.next(file);
  }

  public selectTab: Subject<any> = new Subject<any>();
  public selectTab$: Observable<any> = this.selectTab.asObservable();

  public closeTab: Subject<any> = new Subject<any>();
  public closeTab$: Observable<any> = this.closeTab.asObservable();

  public closeSideNav: Subject<boolean> = new Subject<boolean>();
  public closeSideNav$: Observable<boolean> = this.closeSideNav.asObservable();

  public openModalPrint: Subject<void> = new Subject<void>();
  public openModalPrint$: Observable<void> = this.openModalPrint.asObservable();

  private fileLength: Subject<number> = new Subject<number>();
  public fileLength$: Observable<number> = this.fileLength.asObservable();
  setFileLength(length: number) {
    this.fileLength.next(length);
  }

  // --- new code for custom buttons ---
  private customButtonsSubject = new BehaviorSubject<CustomButton[]>([]);
  public customButtons$ = this.customButtonsSubject.asObservable();

  addButton(button: CustomButton) {
    const current = this.customButtonsSubject.getValue();
    if (!current.find(b => b.id === button.id)) {
      this.customButtonsSubject.next([...current, button]);
    }
  }

  removeButton(id: string) {
    const current = this.customButtonsSubject.getValue();
    this.customButtonsSubject.next(current.filter(b => b.id !== id));
  }  

  updateButtonState(id: string, active: boolean): CustomButton | undefined {
    const current = this.customButtonsSubject.getValue();
    let updatedBtn: CustomButton | undefined;
  
    const updated = current.map(b => {
      if (b.id === id) {
        updatedBtn = { ...b, active };
        return updatedBtn;
      }
      return b;
    });
  
    this.customButtonsSubject.next(updated);
    return updatedBtn;
  }
  
  // exclusive toggle: activates one, deactivates all others
  toggleExclusiveButton(id: string): CustomButton | undefined {
    const current = this.customButtonsSubject.getValue();
    let updatedBtn: CustomButton | undefined;
  
    const updated = current.map(b => {
      if (b.id === id) {
        updatedBtn = { ...b, active: !b.active };
        updatedBtn = updatedBtn;
        return updatedBtn;
      }
      return { ...b, active: false };
    });
  
    this.customButtonsSubject.next(updated);
    return updatedBtn;
  }
  
  setButtonState(id: string, forceToggle: boolean = true): CustomButton | undefined {
    const current = this.customButtonsSubject.getValue();
    let updatedBtn: CustomButton | undefined;

    const updated = current.map(b => {
      if (b.id === id) {
        updatedBtn = { ...b, active: forceToggle ? !b.active : false };
        return updatedBtn;
      }
      return { ...b, active: false }; // reset others
    });

    this.customButtonsSubject.next(updated);
    return updatedBtn;
  }

  getButtonById(id: string): CustomButton | undefined {
    return this.customButtonsSubject.getValue().find(b => b.id === id);
  }
  

}
