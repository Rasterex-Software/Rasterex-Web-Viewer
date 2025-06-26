import { Injectable } from '@angular/core';
import { RXCore } from 'src/rxcore';
//import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject, Subject, Observable } from "rxjs";
import { GuiMode } from 'src/rxcore/enums/GuiMode';
import { IBlock3D } from 'src/rxcore/models/IBlock3D';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { IMarkup } from 'src/rxcore/models/IMarkup';
import { IPageThumb } from 'src/rxcore/models/IPageThumb';
import { IVectorBlock } from 'src/rxcore/models/IVectorBlock';
import { IVectorLayer } from 'src/rxcore/models/IVectorLayer';
//import UIConfigData from 'src/assets/config/config.json';


@Injectable({
  providedIn: 'root'
})
export class RxCoreService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();

  constructor() {


    this._defaultGuiConfig = {
      canFileOpen: true,
      canSaveFile: true,
      canGetFileInfo: true,
      canPrint: true,
      canExport: true,
      canAnnotate: true,
      canCompare: true,
      canSignature: true,
      canConsolidate: true,
      logoUrl: "/assets/images/logo.svg"
    };


    //import { RXCore } from 'src/rxcore';

    //this._defaultGuiConfig = UIConfigData.UIConfig;

    this._defaultGuiConfig = RXCore.ViewUIConfig.UIConfig;

    this.setGuiConfig(this._defaultGuiConfig);

    this.setUIStyles(RXCore.ViewUIConfig.UIStyles);

    this.setguidemofiles(RXCore.ViewUIConfig.demofiles);



  }



  private _defaultGuiConfig: IGuiConfig;

  private _guiConfig: BehaviorSubject<IGuiConfig> = new BehaviorSubject<IGuiConfig>({});
  public guiConfig$: Observable<IGuiConfig> = this._guiConfig.asObservable();
  public setGuiConfig(config: IGuiConfig, replaceDefault: boolean = false): void {
    const newConfig = { ...this._defaultGuiConfig, ...config };
    if (replaceDefault) {
      this._defaultGuiConfig = newConfig;
    }
    this._guiConfig.next(newConfig);
  }
  public resetGuiConfig(): void {
    this._guiConfig.next(this._defaultGuiConfig);
  }

  public setUIStyles(styledata : any){

    styledata.forEach(data => {
      document.documentElement.style.setProperty(`--${data.name}`, data.value);
    });

  }


  public guiFoxitReady: Subject<void> = new Subject<void>();
  public guiFoxitReady$: Observable<void> = this.guiFoxitReady.asObservable();

  private _numOpenedFiles: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  numOpenedFiles$: Observable<number> = this._numOpenedFiles.asObservable();
  public setNumOpenFiles(num): void {
    this._numOpenedFiles.next(num);
  }

  public guiFileLoadComplete: Subject<void> = new Subject<void>();
  public guiFileLoadComplete$: Observable<void> = this.guiFileLoadComplete.asObservable();

  private _guiState: BehaviorSubject<any> = new BehaviorSubject<any>({});
  guiState$: Observable<any> = this._guiState.asObservable();
  public setGuiState(state: any): void {
    this._guiState.next(state);
  }


  private _guidemofiles: Subject<{demofiles: any}> = new Subject<{demofiles: any}>();
  guidemofiles$: Observable<{demofiles: any}> = this._guidemofiles.asObservable();
  public setguidemofiles(demofiles: any): void {
    this._guidemofiles.next({demofiles});
  }

  /*  private _guiRotateDocument: Subject<{degree: number}> = new Subject<{degree: number}>();
  guiRotateDocument$: Observable<{degree : number}> = this._guiRotateDocument.asObservable();
  public setGuiRotateDocument(degree :number): void {
    this._guiRotateDocument.next({degree});
  }

  }*/


  public guiPage: Subject<any> = new Subject<any>();
  public guiPage$: Observable<any> = this.guiPage.asObservable();

  private _guiMarkup: Subject<{markup: IMarkup | -1, operation: any}> = new Subject<{markup: IMarkup | -1, operation: any}>();
  guiMarkup$: Observable<{markup: IMarkup | -1, operation}> = this._guiMarkup.asObservable();
  public setGuiMarkup(markup, operation): void {
    this._lastGuiMarkup = {markup, operation};
    this._guiMarkup.next({markup, operation});
  }
  private _lastGuiMarkup: {markup: IMarkup | -1, operation: any} = { markup: -1, operation: { created: false, deleted: false, modified: false} };
  public get lastGuiMarkup(): {markup: IMarkup | -1, operation: any} {
    return this._lastGuiMarkup;
  }


  private _guiMarkupIndex: Subject<{markup: IMarkup | -1, operation: any}> = new Subject<{markup: IMarkup | -1, operation: any}>();
  guiMarkupIndex$: Observable<{markup: IMarkup | -1, operation}> = this._guiMarkupIndex.asObservable();
  public setGuiMarkupIndex(markup, operation): void {
    this._lastGuiMarkup = {markup, operation};
    this._guiMarkupIndex.next({markup, operation});
  }



  private _guiMarkupUnselect: Subject<IMarkup> = new Subject<IMarkup>();
  guiMarkupUnselect$: Observable<IMarkup> = this._guiMarkupUnselect.asObservable();
  public setGuiMarkupUnselect(markup: IMarkup): void {
    this._guiMarkupUnselect.next(markup);
  }


  /*private _guiRotatePage: Subject<{degree: number, pageIndex: number}> = new Subject<{degree: number, pageIndex: number}>();
  guiRotatePage$: Observable<{degree: number, pageIndex: number}> = this._guiRotatePage.asObservable();
  public setGuiRotatePage(degree: number, pageIndex: number): void {
    this._guiRotatePage.next({degree, pageIndex});
  }*/

  private _guiRotatePage: Subject<{degree: number, pageIndex: number}> = new Subject<{degree: number, pageIndex: number}>();
  guiRotatePage$: Observable<{degree : number, pageIndex : number}> = this._guiRotatePage.asObservable();
  public setGuiRotatePage(degree :number, pageIndex : number): void {
    this._guiRotatePage.next({degree, pageIndex});
  }

    //GUI_RotateDocument
  private _guiRotateDocument: Subject<{degree: number}> = new Subject<{degree: number}>();
  guiRotateDocument$: Observable<{degree : number}> = this._guiRotateDocument.asObservable();
  public setGuiRotateDocument(degree :number): void {
    this._guiRotateDocument.next({degree});
  }

  //zoom update
  private _guiZoomUpdated: Subject<{params: any, zoomtype: number}> = new Subject<{params: any, zoomtype: number}>();
  guiZoomUpdated$: Observable<{params: any, zoomtype: number}> = this._guiZoomUpdated.asObservable();
  public setGuiZoomUpdated(params: any, zoomtype: number): void {
    this._guiZoomUpdated.next({params, zoomtype});
  }


  private _guiMarkupHover: Subject<{markup: IMarkup, x: number, y: number}> = new Subject<any>();
  guiMarkupHover$: Observable<{markup: IMarkup, x: number, y: number}> = this._guiMarkupHover.asObservable();
  public setGuiMarkupHover(markup, x, y): void {
    this._guiMarkupHover.next({markup, x, y });
  }

  private _guiMarkupList: BehaviorSubject<Array<IMarkup>> = new BehaviorSubject<Array<IMarkup>>([]);
  guiMarkupList$: Observable<Array<IMarkup>> = this._guiMarkupList.asObservable();
  public setGuiMarkupList(list: Array<IMarkup>): void {
    this._guiMarkupList.next(list);
  }
  public getGuiMarkupList(): Array<IMarkup> {
    return this._guiMarkupList.getValue();
  }

  private _guiAnnotList: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>([]);
  guiAnnotList$: Observable<Array<any>> = this._guiAnnotList.asObservable();
  public setGuiAnnotList(list: Array<any>): void {
    this._guiAnnotList.next(list);
  }
  public getGuiAnnotList(): Array<any> {
    return this._guiAnnotList.getValue();
  }


  private _guiTextInput: Subject<{rectangle: any, operation: any}> = new Subject<{rectangle: any, operation: any}>();
  guiTextInput$: Observable<{rectangle, operation}> = this._guiTextInput.asObservable();
  public setGuiTextInput(rectangle, operation): void {
    this._guiTextInput.next({rectangle, operation});
  }

  private _guiVectorLayers: BehaviorSubject<Array<IVectorLayer>> = new BehaviorSubject<Array<IVectorLayer>>([]);
  guiVectorLayers$: Observable<Array<IVectorLayer>> = this._guiVectorLayers.asObservable();
  public setGuiVectorLayers(list: Array<IVectorLayer>): void {
    this._guiVectorLayers.next(list);
  }
  public getGuiVectorLayers(): Array<IVectorLayer> {
    return this._guiVectorLayers.getValue();
  }

  private _guiVectorBlocks: BehaviorSubject<Array<IVectorBlock>> = new BehaviorSubject<Array<IVectorBlock>>([]);
  guiVectorBlocks$: Observable<Array<IVectorBlock>> = this._guiVectorBlocks.asObservable();
  public setGuiVectorBlocks(list: Array<IVectorBlock>): void {
    this._guiVectorBlocks.next(list);
  }



  public getGuiVectorBlocks(): Array<IVectorBlock> {
    return this._guiVectorBlocks.getValue();
  }

  private _guiSelectedVectorBlock: BehaviorSubject<IVectorBlock | undefined> = new BehaviorSubject<IVectorBlock | undefined>(undefined);
  guiSelectedVectorBlock$: Observable<IVectorBlock | undefined> = this._guiSelectedVectorBlock.asObservable();
  public setSelectedVectorBlock(value: IVectorBlock | undefined): void {
    this._guiSelectedVectorBlock.next(value);
  }
  public getSelectedVectorBlock(): IVectorBlock | undefined {
    return this._guiSelectedVectorBlock.getValue();
  }


  private _gui3DParts: BehaviorSubject<Array<IBlock3D>> = new BehaviorSubject<Array<IBlock3D>>([]);
  gui3DParts$: Observable<Array<IBlock3D>> = this._gui3DParts.asObservable();
  public setGui3DParts(list: Array<IBlock3D>): void {
    this._gui3DParts.next(list);
  }
  public getGui3DParts(): Array<IBlock3D> {
    return this._gui3DParts.getValue();
  }

  private _gui3DPartInfo: BehaviorSubject<any> = new BehaviorSubject<any>({});
  gui3DPartInfo$: Observable<any> = this._gui3DPartInfo.asObservable();
  public setGui3DPartInfo(info: any): void {
    this._gui3DPartInfo.next(info);
  }
  public getGui3DPartInfo(): any {
    return this._gui3DPartInfo.getValue();
  }

  private _guiPageThumbs: BehaviorSubject<Array<IPageThumb>> = new BehaviorSubject<Array<IPageThumb>>([]);
  guiPageThumbs$: Observable<Array<IPageThumb>> = this._guiPageThumbs.asObservable();
  public setGuiPageThumbs(thumbs: Array<IPageThumb>): void {
    this._guiPageThumbs.next(thumbs);
  }
  public getGuiPageThumbs(): Array<IPageThumb> {
    return this._guiPageThumbs.getValue();
  }

  private _guiPageThumb: BehaviorSubject<any> = new BehaviorSubject<any>({});
  guiPageThumb$: Observable<any> = this._guiPageThumb.asObservable();
  public setGuiPageThumb(thumb: any): void {
    this._guiPageThumb.next(thumb);
  }
  public getGuiPageThumb(): any {
    return this._guiPageThumb.getValue();
  }

  private _guiPdfBookmarks: BehaviorSubject<any> = new BehaviorSubject<any>({});
  guiPdfBookmarks$: Observable<any> = this._guiPdfBookmarks.asObservable();
  public setGuiPdfBookmarks(thumb: any): void {
    this._guiPdfBookmarks.next(thumb);
  }
  public getGuiPdfBookmarks(): any {
    return this._guiPdfBookmarks.getValue();
  }

  public guiOnResize: Subject<void> = new Subject<void>();
  public guiOnResize$: Observable<void> = this.guiOnResize.asObservable();

  private _guiMode: BehaviorSubject<GuiMode> = new BehaviorSubject<GuiMode>(GuiMode.View);
  guiMode$: Observable<GuiMode> = this._guiMode.asObservable();
  public setGuiMode(mode: GuiMode): void {
    this._guiMode.next(mode);
  }

  public guiOnExportComplete: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  guiOnExportComplete$: Observable<string | null> = this.guiOnExportComplete.asObservable();

  public guiOnCompareMeasure: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  guiOnCompareMeasure$: Observable<any> = this.guiOnCompareMeasure.asObservable();

  public guiOnMarkupChanged: Subject<any> = new Subject<any>();
  guiOnMarkupChanged$: Observable<any> = this.guiOnMarkupChanged.asObservable();

  public guiOnPanUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
  guiOnPanUpdated$: Observable<any> = this.guiOnPanUpdated.asObservable();

//onGuiZoomUpdate

  public guiOnZoomUpdate: BehaviorSubject<any> = new BehaviorSubject<any>({});
  guiOnZoomUpdate$: Observable<any> = this.guiOnZoomUpdate.asObservable();


  /*bugfix 2 commentlist*/

  private _guiOnCommentSelect: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  guiOnCommentSelect$: Observable<boolean> = this._guiOnCommentSelect.asObservable();
  public setCommentSelected(isselected: boolean): void {
    this._guiOnCommentSelect.next(isselected);
  }

  private _resetLeaderLine: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  resetLeaderLine$: Observable<boolean> = this._resetLeaderLine.asObservable();
  public resetLeaderLine(isReset: boolean): void {
    this._resetLeaderLine.next(isReset);
  }


  public getCommentSelected(): boolean {
    return this._guiOnCommentSelect.getValue();
  }
  /*bugfix 2 commentlist*/

  private _guiMarkupMeasureRealTimeData: Subject<{markup: IMarkup | -1}> = new Subject<{markup: IMarkup | -1}>();
  guiMarkupMeasureRealTimeData$: Observable<{markup: IMarkup | -1}> = this._guiMarkupMeasureRealTimeData.asObservable();
  public setGuiMarkupMeasureRealTimeData(markup): void {
    this._lastGuiMarkupMeasureRealTimeData = {markup};
    this._guiMarkupMeasureRealTimeData.next({markup});
  }
  private _lastGuiMarkupMeasureRealTimeData: {markup: IMarkup | -1} = { markup: -1 };
  public getMarkupMeasureRealTimeData(): {markup: IMarkup | -1} {
    return this._lastGuiMarkupMeasureRealTimeData;
  }


  private _guiOnCalibrateFinished: BehaviorSubject<{isFinished: boolean, data: string}> = new BehaviorSubject<{isFinished: boolean, data: string}>({isFinished:false, data:''});
  guiCalibrateFinished$: Observable<{isFinished: boolean, data: string}> = this._guiOnCalibrateFinished.asObservable();
  public setCalibrateFinished(isFinished: boolean, data: string): void {
    this._guiOnCalibrateFinished.next({isFinished: isFinished, data: data});
  }

  public guiScaleListLoadComplete: Subject<void> = new Subject<void>();
  public guiScaleListLoadComplete$: Observable<void> = this.guiScaleListLoadComplete.asObservable();

  private readonly guiCalibrateSubject = new Subject<any>();
  readonly guiCalibrate$ = this.guiCalibrateSubject.asObservable();

  setGuiCalibrate(data: any) {
    this.guiCalibrateSubject.next(data);
  }


    setSidebarState(state: boolean) {
    // console.log('SidebarStateService: Setting state to:', state);
    this.sidebarState.next(state);
  }

  getSidebarState(): boolean {
    return this.sidebarState.value;
  }


}
