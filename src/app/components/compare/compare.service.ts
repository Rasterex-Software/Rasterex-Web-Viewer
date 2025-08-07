import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { DomSanitizer } from '@angular/platform-browser';
import { IComparison } from 'src/rxcore/models/IComparison';
import { RXCore } from 'src/rxcore';

@Injectable({
  providedIn: 'root'
})
export class CompareService {
  constructor(private readonly domSanitizer: DomSanitizer) { }

  public readonly colorOptions: Array<{value: string, label: any}> = [
    {
      value: "#010101",
      label: this.domSanitizer.bypassSecurityTrustHtml(`<span style="display: flex;align-items: center; gap: 10px;"><span style="background-color: #010101; width: 10px; height: 10px; border-radius: 50%;"></span> Black</span>`),
    },
    {
      value: "#E86767",
      label: this.domSanitizer.bypassSecurityTrustHtml(`<span style="display: flex;align-items: center; gap: 10px;"><span style="background-color: #E86767; width: 10px; height: 10px; border-radius: 50%;"></span> Red</span>`),
    },
    {
      value: "#0FA943",
      label: this.domSanitizer.bypassSecurityTrustHtml(`<span style="display: flex;align-items: center; gap: 10px;"><span style="background-color: #0FA943; width: 10px; height: 10px; border-radius: 50%;"></span> Green</span>`),
    },
    {
      value: "#0E3BD8",
      label: this.domSanitizer.bypassSecurityTrustHtml(`<span style="display: flex;align-items: center; gap: 10px;"><span style="background-color: #0E3BD8; width: 10px; height: 10px; border-radius: 50%;"></span> Blue</span>`),
    }
  ];

  public readonly setAsOptions: Array<{value: string, title: string}> = [
    { value: "overlay", title: "Overlay" },
    { value: "background", title: "Background" },
  ];

  private _comparisons: Array<IComparison> = [];

  public findComparisonByFileName(fileName: string): IComparison | undefined {
    return this.comparisons.find(c => c.relativePath.endsWith(fileName));
  }

  public get isComparisonActive(): boolean {
    const file = RXCore.getOpenFilesList().find(f => f.isActive);
    return file && this.findComparisonByFileName(file.name);
  }

  public addComparison(comparison: IComparison): IComparison {
    const index = this._comparisons.length ? Number(this._comparisons[this._comparisons.length - 1].index) + 1 : 0;
    const c: IComparison = {
      ...comparison,
      index,
      name: `Comparison ${index + 1}`
    };
    this._comparisons.push(c);
    this.onComparisonAdded.next(c);

    return c;
  }

  public deleteComparison(comparison: IComparison): void {
    this._comparisons = this.comparisons.filter(c => c != comparison);
  }

  public get comparisons(): Array<IComparison> {
    return this._comparisons;
  }

  public updateComparison(comparison: IComparison): void {
    const index = this._comparisons.findIndex(c => c.index == comparison.index);
    if (index != -1) {
      this._comparisons[index] = comparison;
    }
  }

  public decIndexesAfter(index: number): void {
    this._comparisons.forEach(c => {
      if (c.activeFile.index > index) {
        c.activeFile.index--;
      }
      if (c.otherFile.index > index) {
        c.otherFile.index--;
      }
    });
  }

  private _createCompareModalOpened: BehaviorSubject<{opened: boolean, payload?: any}> = new BehaviorSubject<{opened: boolean, payload?: any}>({opened: false});
    public createCompareModalOpened$: Observable<{opened: boolean, payload?: any}> = this._createCompareModalOpened.asObservable();
  
  public showCreateCompareModal(payload: any = undefined): void {
    this._createCompareModalOpened.next({ opened: true, payload });
  }
  public hideCreateCompareModal(): void {
    this._createCompareModalOpened.next({ opened: false });
  }

  private _onGrayScaleChange: Subject<number> = new Subject<number>();
  public onGrayScaleChange$ = this._onGrayScaleChange.asObservable();
  public changeGrayScale(value: number): void {
    this._onGrayScaleChange.next(value);
  }

  public onUnsavedChanges: Subject<void> = new Subject<void>();
  public onUnsavedChanges$ = this.onUnsavedChanges.asObservable();

  public onComparisonAdded: BehaviorSubject<IComparison | undefined> = new BehaviorSubject<IComparison | undefined>(undefined);
  public onComparisonAdded$ = this.onComparisonAdded.asObservable();

}
