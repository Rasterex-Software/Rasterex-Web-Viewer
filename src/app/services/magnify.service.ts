import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MagnifyService {
  // BehaviorSubject to manage visibility state
  private _visible = new BehaviorSubject<boolean>(false);
  
  // Observable to be subscribed to for visibility changes
  visible$ = this._visible.asObservable();

  // Callbacks for precision mode entry and exit
  onEnterPrecision: Function | null = null;
  onExitPrecision: Function | null = null;

  // Callbacks for point selection or update (these only trigger UI updates)
  onPointSelected: Function | null = null;
  onPointUpdated: Function | null = null;

  constructor() {}

  // Set visibility of the magnifier
  toggle(show: boolean): void {
    this._visible.next(show);  // Emit the new visibility state
  }

  // Notify that precision mode has been entered
  notifyEnterPrecision(anchor: { x: number; y: number }) {
    if (this.onEnterPrecision) {
      this.onEnterPrecision(anchor);  // Trigger the callback for precision mode entry
    }
  }

  // Notify that precision mode has been exited
  notifyExitPrecision() {
    if (this.onExitPrecision) {
      this.onExitPrecision();  // Trigger the callback for precision mode exit
    }
  }

  // Notify that a point has been selected (first or second point)
  notifyPointSelected(npoint: number) {
    if (this.onPointSelected) {
      this.onPointSelected(npoint);  // Trigger the point selected callback
    }
  }

  // Notify that a point has been updated (during precision mode)
  notifyPointUpdated(npoint: number, toolState: any) {
    if (this.onPointUpdated) {
      this.onPointUpdated(npoint, toolState);  // Trigger the point updated callback
    }
  }

  

}



/*import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MagnifyService {
  private _visible$ = new BehaviorSubject<boolean>(false);
  visible$ = this._visible$.asObservable();

  show(): void {
    this._visible$.next(true);
  }

  hide(): void {
    this._visible$.next(false);
  }

  toggle(show: boolean): void {
    this._visible$.next(show);
  }
}*/
