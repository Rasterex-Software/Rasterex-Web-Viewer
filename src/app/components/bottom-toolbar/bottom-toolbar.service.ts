import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

export interface IBottomToolbarState {
  fileIndex?: number;
  isActionSelected: { [action: string]: boolean },
}

@Injectable({
  providedIn: 'root'
})
export class BottomToolbarService {
  constructor() { }

  private _states: Map<number, IBottomToolbarState> = new Map<number, IBottomToolbarState>();

  private get _defaultState(): IBottomToolbarState {
    return {
      fileIndex: undefined,
      isActionSelected: {
        "BLOCKINFO": false,
        "VECTORINFO": false,
        "MAGNIFY": false,
        "ZOOM_WINDOW": false,
        "HIDE_MARKUPS": false,
        "MONOCHROME": false,
        "3D_SELECT": false,
        "3D_SELECT_MARKUP": false,
        "WALKTHROUGH": false,
        "HIDE_3D_PARTS": false,
        "RESET_3D_MODEL": false,
        "EXPLODE_3D_MODEL": false,
        "TRANSPARENT_3D_MODEL": false,
        "CLIPPING_3D_MODEL": false,
        "BIRDSEYE": false,
        "SEARCH_TEXT": false,
        "SELECT_TEXT": false,
        "GRAYSCALE": false,
      }
    }
  }

  private _state: BehaviorSubject<IBottomToolbarState> = new BehaviorSubject<IBottomToolbarState>(this._defaultState);
  public state$: Observable<IBottomToolbarState> = this._state.asObservable();

  public setState(state: IBottomToolbarState): void {
    if (state.fileIndex === undefined) return;
    this._states.set(state.fileIndex, state);
  }

  public addToStates(fileIndex: number): void {
    const state = { ...this._defaultState, fileIndex };
    this._states.set(fileIndex, state);
    this._state.next(state);
  }

  public removeFromStates(fileIndex: number): void {
    this._states.delete(fileIndex);
  }

  public nextState(fileIndex: number = -1): void {
    const state = this._states.get(fileIndex);
    if (state === undefined) {
      this._state.next(this._defaultState);
      return;
    }
    this._state.next(state);
  }

}
