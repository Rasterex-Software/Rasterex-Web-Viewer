import { Injectable } from '@angular/core';
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
}
