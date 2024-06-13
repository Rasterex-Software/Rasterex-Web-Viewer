import { IBlock3D } from "./models/IBlock3D";
import { IGuiConfig } from "./models/IGuiConfig";
import { IMarkup } from "./models/IMarkup";
import { IPageThumb } from "./models/IPageThumb";
import { IVectorBlock } from "./models/IVectorBlock";
import { IVectorLayer } from "./models/IVectorLayer";
import { ISignatureData } from "./models/ISignatures";

declare var RxCore: any;
declare var RxConfig: any;

export class RXCore {
    public static Config: any = RxConfig;

    public static birdseyetool(): void {
        RxCore.birdseyetool();
    }

    public static changeTextColor(color: string): void {
        RxCore.changeTextColor(color);
    }

    public static disablewelcome(onoff: boolean): void {
        RxCore.disablewelcome(onoff);
    }
    

    public static overrideLinewidth(onoff:boolean , thickness: number): void {
        RxCore.overrideLinewidth(onoff, thickness);
    }

    public static scale(scale: string): void {
        RxCore.scale(scale);
    }

    public static useNoScale(onoff: boolean): void {
        RxCore.useNoScale(onoff);
    }

    public static setThumbnailSize(w:number, h:number): void {
        RxCore.setThumbnailSize(w,h);
    }
    

    public static scaleOnResize(onoff: boolean): void {
        RxCore.scaleOnResize(onoff);
    }

    public static getOpenFilesList(): Array<any> {
        return RxCore.getOpenFilesList();
    }

    public static initialize(layout: any): void {
        RxCore.initialize(layout);
    }

    public static openFile(fileUrl: any): void {
        RxCore.openFile(fileUrl);
    }

    public static closeDocument(): void {
        RxCore.closeDocument();
    }

    public static doResize(binternal: boolean , offsetWidth: number, offsetHeight: number): void {
        RxCore.doResize(binternal, offsetWidth, offsetHeight);
    }

    public static setActiveFileEx(index: number): void {
        RxCore.setActiveFileEx(index);
    }

    public static fileSelected(): void {
        RxCore.fileSelected();
    }

    public static gotoPage(pagenum: number): void {
        RxCore.gotoPage(pagenum);
    }

    public static hideTextInput(): void {
        RxCore.hideTextInput();
    }

    public static zoomIn(): void {
        RxCore.zoomIn();
    }

    public static zoomOut(): void {
        RxCore.zoomOut();
    }

    public static zoomWidth(): void {
        RxCore.zoomWidth();
    }

    public static zoomHeight(): void {
        RxCore.zoomHeight();
    }

    public static zoomWindow(onoff: boolean): void {
        RxCore.zoomWindow(onoff);
    }

    public static zoomFit(): void {
        RxCore.zoomFit();
    }

    public static rotate(cycle: boolean, szrotatetool: string): void {
        RxCore.rotate(cycle, szrotatetool);
    }

    public static magnifyGlass(onoff: boolean): void {
        RxCore.magnifyGlass(onoff);
    }

    public static hideMarkUp(): void {
        RxCore.hideMarkUp();
    }

    public static toggleBackground(): void {
        RxCore.toggleBackground();
    }

    public static setMonoChrome(onoff: boolean): void {
        RxCore.setMonoChrome(onoff);
    }

    public static select3D(onoff: boolean): void {
        RxCore.select3D(onoff);
    }

    public static select3DMarkup(onoff: boolean): void {
        RxCore.select3DMarkup(onoff);
    }

    public static walkThrough3D(onoff: boolean): void {
        RxCore.walkThrough3D(onoff);
    }

    public static toggle3DVisible(onoff: boolean): void {
        RxCore.toggle3DVisible(onoff);
    }

    public static reset3DModel(onoff: boolean): void {
        RxCore.reset3DModel(onoff);
    }

    public static explode3D(onoff: boolean): void {
        RxCore.explode3D(onoff);
    }

    public static explode3DDistance(value: number): void {
        RxCore.explode3DDistance(value);
    }

    public static transparency3D(value: number): void {
        RxCore.transparency3D(value);
    }

    public static clipping3D(onoff: boolean, plane: number, value: number): void {
        RxCore.clipping3D(onoff, plane, value);
    }

    public static markUpTextRect(onoff: boolean): void {
        RxCore.markUpTextRect(onoff);
    }

    public static forceUniqueMarkup(onoff: boolean): void {
        RxCore.forceUniqueMarkup(onoff);    
    }

    

    public static getSelectedMarkup(): IMarkup {
        return RxCore.getSelectedMarkup();
    }

    public static getLineColor(): string {
        return RxCore.getLineColor();
    }

    public static getLineWidth(): number {
        return RxCore.getLineWidth();
    }

    public static setLayout(width :number, height : number, absolute : boolean): void {
        return RxCore.setLayout(width, height, absolute);
    }

    

    public static setText(text: string): void {
        RxCore.GUI_TextInput.setText(text);
    }

    public static getText(): string {
        return RxCore.GUI_TextInput.getText().text;
    }

    public static getFont(): any {
        return RxCore.getFont();
    }

    public static setFont(fontName: string): void {
        RxCore.setFont(fontName);
    }

    public static setFontHeight(size: number) {
        RxCore.setFontHeight(size);
    }

    public static setFontBold(onoff: boolean): void {
        RxCore.setFontBold(onoff);
    }

    public static setFontItalic(onoff: boolean): void {
        RxCore.setFontItalic(onoff);
    }

    public static setFontFull(font: any): void {
        RxCore.setFontFull(font);
    }


    public static getTextColor(): string {
        return RxCore.getTextColor();
    }

    public static setdisplayBackground(color: string): void {
        RxCore.setdisplayBackground(color);
    }

    public static deleteMarkUp(): void {
        RxCore.deleteMarkUp();
    }

    public static changeStrokeColor(color: string): void {
        RxCore.changeStrokeColor(color);
    }

    public static setLineWidth(width: number): void {
        RxCore.setLineWidth(width);
    }

    public static setLineStyle(lineStyle: number): void {
        RxCore.setLineStyle(lineStyle);
    }

    public static setGlobalStyle(onoff: boolean): void {
        RxCore.setGlobalStyle(onoff);
    }

    public static changeFillColor(color: string) {
        RxCore.changeFillColor(color);
    }

    public static changeTransp(opacity: number): void {
        RxCore.changeTransp(opacity);
    }

    public static getDisplayName(signature: any): string {
        return RxCore.getDisplayName(signature);
    }

    public static setBirdseyeCanvas(imagecanvas, indicatorcanvas, markupcanvas): void {
        RxCore.setBirdseyeCanvas(imagecanvas, indicatorcanvas, markupcanvas);
    }

    public static renderBirdseye(): void {
        RxCore.renderBirdseye();
    }


    public static markUpTextRectArrow(onoff: boolean): void {
        RxCore.markUpTextRectArrow(onoff);
    }

    public static endTextSearch(): void {
        RxCore.endTextSearch();
    }

    public static textSearch(text: string | undefined, direction: boolean = true, casesens: boolean = false): void {
        RxCore.textSearch(text, direction, casesens);
    }

    public static markupSearchResult(): void {
        RxCore.forcetextsearchmarker()
    }

    public static documentTextSearch(text: string | undefined, casesens: boolean = false, wholetext: boolean = false): void {
        RxCore.documentTextSearch(text, casesens, wholetext)
    }

    public static toggleShowHighlightMarkups(value: boolean): void {
        RxCore.toggleShowHighlightMarkups(value)
    }

    public static markupTextWithOrange(item) {
        RxCore.markupTextWithOrange(item)
    }

    public static onGuiDocumentSearch(callback: Function): void {
        RxCore.GUI_DocumentSearch.connect(callback);
    }

    public static vectorLayersAll(onoff: boolean): void {
        RxCore.vectorLayersAll(onoff);
    }

    public static changePDFLayer(index: number, visible : boolean): void {


        RxCore.changePDFLayer(index, visible)
    }

    public static changeVectorLayer(index: number): void {
        RxCore.changeVectorLayer(index);
    }


    public static vectorBlocksAll(onoff: boolean): void {
        RxCore.vectorBlocksAll(onoff);
    }

    public static changeVectorBlock(index: number): void {
        RxCore.changeVectorBlock(index);
    }

    public static markUpShape(onoff: boolean, type: 0 | 1 | 2 | 3, subtype: 0 | 1 = 0): void {
        RxCore.markUpShape(onoff, type, subtype);
    }

    public static selectMarkUp(selected: boolean): void {
        RxCore.selectMarkUp(selected);
    }

    public static getFillColor(): string {
        return RxCore.getFillColor();
    }

    public static markUpFilled(): void {
        RxCore.markUpFilled();
    }

    public static search3dAttributes(expression: string): Array<any> {
        return RxCore.search3dAttributes(expression);
    }

    public static set3DBlockState(name: string, state: boolean): void {
        RxCore.set3DBlockState(name, state);
    }

    public static set3DBlockStateAll(state: boolean): void {
        RxCore.set3DBlockStateAll(state);
    }

    public static select3DVectorBlock(name: string): void {
        RxCore.select3DVectorBlock(name);
    }

    public static markUpUndo(): void {
        RxCore.markUpUndo();
    }

    public static markUpRedo(): void {
        RxCore.markUpRedo();
    }

    public static markUpNote(onoff: boolean): void {
        RxCore.markUpNote(onoff);
    }

    public static setNoteText(text: string) {
        RxCore.GUI_Notediag.setText(text);
    }

    public static selectMarkUpByIndex(index: number): void {
        RxCore.selectMarkUpByIndex(index);
    }

    public static unSelectAllMarkup(): void {
        RxCore.unSelectAllMarkup();
    }


    public static usePanToMarkup(onoff: boolean): void {
        RxCore.usePanToMarkup(onoff);
    }
    


    public static textSelect(onoff: boolean): void {
        RxCore.textSelect(onoff);
    }

    public static markUpErase(onoff: boolean): void {
        RxCore.markUpErase(onoff);
    }

    public static markUpArrow(onoff: boolean, subtype: 0 | 1 | 2 | 3): void {
        RxCore.markUpArrow(onoff, subtype);
    }

    public static markUpSubType(subtype: number): void {
        RxCore.markUpSubType(subtype);
    }

    public static changeSnapState(onoff: boolean): void {
        RxCore.changeSnapState(onoff);
    }

    public static getSnapState(): boolean {
        return RxCore.getSnapState();
    }

    public static printSizeEx(paperSize: any): void {
        RxCore.printSizeEx(null, paperSize);
    }

    public static fileInfoDialog(): void {
        RxCore.fileInfoDialog();
    }

    public static copyMarkUp(): void {
        RxCore.copyMarkUp();
    }

    public static pasteMarkUp(): void {
        RxCore.pasteMarkUp()
    }

    public static markUpHighlight(onoff: boolean): void {
        RxCore.markUpHighlight(onoff);
    }

    public static markUpFreePen(onoff: boolean): void {
        RxCore.markUpFreePen(onoff);
    }

    public static markUpPolyline(onoff: boolean): void {
        RxCore.markUpPolyline(onoff);
    }

    public static getFoxitIframeID(index: number): string {
        return RxCore.getFoxitIframeID(index);
    }

    public static hidedisplayCanvas(bhide: boolean): void {
        RxCore.hidedisplayCanvas(bhide);
    }

    public static loadThumbnail(pageindex: number): void {
        RxCore.loadThumbnail(pageindex);
    }

    public static lockMarkup(onoff: boolean): void {
        RxCore.lockMarkup(onoff);
    }

    public static markUpRedraw(): void {
        RxCore.markUpRedraw();
    }

    public static navigateBookmark(bookmarkitem): void {
        RxCore.navigateBookmark(bookmarkitem);
    }

    public static markUpSave(): void {
        RxCore.markUpSave();
    }

    public static markupCount(onoff: boolean, type?: number): void {
        RxCore.markupCount(onoff, type);
    }

    public static markupSymbol(onoff: boolean): void {
        RxCore.markupSymbol(onoff);
    }

    public static getSymbolLibPNGData(num,sname): void {
        RxCore.getSymbolLibPNGData(num,sname);
    }

    public static markUpDimension(onoff: boolean, type: number): void {
        RxCore.markUpDimension(onoff, type);
    }

    /*public static markUpArea(onoff: boolean): void {
        RxCore.markUpArea(onoff);
    }*/

    public static markUpArea(onoff: boolean, parentmarkupnumber = 0): void {
        RxCore.markUpArea(onoff, parentmarkupnumber);
    }

    public static markUpAreaHole(onoff: boolean): void {
        RxCore.markUpAreaHole(onoff);
    }

    public static markupMeasurePath(onoff: boolean): void {
        RxCore.markupMeasurePath(onoff);
    }

    public static getReadOnly(): boolean {
        return RxCore.getReadOnly();
    }

    public static getCanChangeSign(): boolean {
        return RxCore.GUI_Users.getCanChangeSign();
    }

    public static getTextRects(searchexpr: string, casesensitive: boolean): void {
        RxCore.getTextRects(searchexpr, casesensitive);
    }

    public static endGetTextRects(): void {
        RxCore.endGetTextRects();
    }

    public static getPageScale(pagenumber: number): number {
        return RxCore.getPageScale(pagenumber);
    }

    public static markupButtonFromMatch(rectanle, pagenumber,image, padding): Promise<any> {
        return RxCore.markupButtonFromMatch(rectanle, pagenumber, image, padding);

    }

/*     public static lockMarkup(onoff: boolean): void {
        RxCore.lockMarkup(onoff);
    }
 */
    public static singlePageScrollPan(onoff: boolean): void {
        RxCore.singlePageScrollPan(onoff);
    }

    public static getdocInfo(): any {
        return RxCore.getdocInfo();
    }

    public static foxitForceRedraw(): void {
        RxCore.foxitForceRedraw();
    }

    public static selectMarkupbyGUID(guid: string): void {
        RxCore.selectMarkupbyGUID(guid);
    }

    public static deleteMarkupbyGUID(guid: string): void {
        RxCore.deleteMarkupbyGUID(guid);
    }

    public static getmarkupGUIDs(): Array<string> {
        return RxCore.getmarkupGUIDs();
    }

    public static getmarkupobjByGUID(guid: string): -1 | IMarkup {
        return RxCore.getmarkupobjByGUID(guid);
    }

    public static getmarkupbyNumber(no: number): -1 | IMarkup {
        return RxCore.getmarkupbyNumber(no);
    }


    public static restoreDefault(): void{
        RxCore.restoreDefault();
    }
    
    public static restrictPan(onoff): void {
        RxCore.restrictPan(onoff);
    }


    public static exportPDF(paperSize: string = "A4"): void {
        RxCore.exportFile(false, "PDF", "0", paperSize, "1");
    }

    public static get markupChanged(): boolean {
        return RxCore.markupChanged();
    }

    public static markupSaveCheck(onoff: boolean): void {
        RxCore.markupSaveCheck(onoff);
    }

    public static uploadFile(file: File): Promise<any> {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolve(xhr.response);
                } else {
                  reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                  });
                }
            }, false);
            xhr.addEventListener("error", () => {
                reject({
                status: xhr.status,
                statusText: xhr.statusText
              });
            }, false);
            xhr.open("POST", RxConfig.FileuploadURL + "&" + RxConfig.UploadServerfolder + "&" + file.name + "&" + file.lastModified + "&" + file.size, true);
            xhr.send(file);
        });
    }

    public static compareMeasure(): void {
        RxCore.compareMeasure();
    }

    public static exicompareMeasure(): void {
        RxCore.exicompareMeasure();
    }

    public static async compareOverlayServerJSON(
        backFileName: string,
        frontFileName: string,
        alignarray: Array<any> | undefined,
        backRgbColor: string = 'rgb(255,0,0)',
        frontRgbColor: string = 'rgb(0,0,255)',
        equalRgbColor: string = 'rgb(128,128,128)',
        outputName?: string,
        dpi: number = 200
        ): Promise<string> {
            if (backFileName?.toLowerCase().endsWith("dwg")
                || frontFileName?.toLowerCase().endsWith("dwg")
                || backFileName?.toLowerCase().endsWith("dgn")
                || frontFileName?.toLowerCase().endsWith("dgn")) {
                dpi = 400;
            }

            const payload = [{
                "Command": "Compare",
                "LicenseID": localStorage.getItem("RxLic"),
                "BackURL": `${RXCore.Config.UploadServerfolder.replaceAll('\\', '/')}${backFileName}`,
                "FrontURL": `${RXCore.Config.UploadServerfolder.replaceAll('\\', '/')}${frontFileName}`,
                "CompareDPI": dpi,
                "BackColor": backRgbColor,
                "FrontColor": frontRgbColor,
                "EqualColor": equalRgbColor,
                "ReturnData": "text",
                //"DestFolder": "C:/Rasterex/Upload",
                "DestFolder":`${RXCore.Config.UploadServerfolder.replaceAll('\\', '/')}`,
                "OutputName": outputName,
            }];

            if (alignarray?.length) {
                payload.push({
                    ...alignarray[0]
                });
                payload.push({
                    ...alignarray[1]
                });
            }

            const response = await fetch(`${RXCore.Config.xmlurldirect}?CommandJSON`, {
                method: 'post',
                headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            return `${RXCore.Config.baseFileURL}${await response.text()}`;
    }

    public static setrxprintdiv(divelement: HTMLElement | null): void {
        RxCore.setrxprintdiv(divelement);
    }

    public static setJSONConfiguration(userobj: any): void {
        RxCore.setJSONConfiguration(userobj);
    }


    public static redrawPage(pagenum: number): void {
        RxCore.redrawPage(pagenum);
    }

    public static uploadSignature(PNGImage: any, username: string, binitial: boolean = false): void {
        RxCore.uploadSignature(PNGImage, username, binitial);
    }

    public static downloadSignature(username: string, binitial: boolean = false): void {
        RxCore.downloadSignature(username, binitial);
    }

    /* listeners */
    public static onGuiReady(callback: Function) {
        RxCore.GUI_Ready.connect(callback);
    }

    public static onGuiState(callback: Function) {
        RxCore.GUI_State.connect(callback);
    }

    public static onGuiFileLoadComplete(callback: Function): void {
        RxCore.GUI_FileLoadComplete.connect(callback);
    }

    public static onGuiActivateFile(callback: (fileindex: number) => void) {
        RxCore.GUI_ActivateFile.connect(callback);
    }

    public static onGuiPage(callback: Function): void {
        RxCore.GUI_Page.connect(callback);
    }

    public static onGuiMarkup(callback: Function): void {
        RxCore.GUI_Markup.connect(callback);
    }

    public static onGuiMarkupIndex(callback: Function): void {
        RxCore.GUI_MarkupIndex.connect(callback);
    }
    public static onGuiMarkupList(callback: (list: Array<IMarkup>) => void): void {
        RxCore.GUI_Markuplist.connect(callback);
    }

    public static onGuiMarkupHover(callback: (markup: IMarkup, x: number, y: number) => void): void {
        RxCore.GUI_MarkupHover.connect(callback);
    }

    public static onGuiMarkupUnselect(callback: (markup: IMarkup) => void): void {
        RxCore.GUI_MarkupUnselect.connect(callback);
    }

    public static onGuiTextInput(callback: Function): void {
        RxCore.GUI_TextInput.connect(callback);
    }

    public static onGuiBirdseye(callback: Function): void {
        RxCore.GUI_birdseye.connect(callback);
    }

    public static onGuiNumMathces(callback: Function): void {
        RxCore.GUI_NumMathces.connect(callback);
    }

    public static onGuiVectorLayers(callback: (layers: Array<IVectorLayer>) => void): void {
        RxCore.GUI_VectorLayers.connect(callback);
    }

    public static onGuiVectorBlocks(callback: (layers: Array<IVectorBlock>) => void): void {
        RxCore.GUI_VectorBlocks.connect(callback);
    }

    public static onGui3DParts(callback: (parts: Array<IBlock3D>) => void): void {
        RxCore.GUI_3DParts.connect(callback);
    }

    public static onGui3DPartInfo(callback: Function): void {
        RxCore.GUI_3DPartInfo.connect(callback);
    }

    public static onGuiNotediag(callback: Function): void {
        RxCore.GUI_Notediag.connect(callback);
    }

    public static onGuiFileInfo(callback: Function): void {
        RxCore.GUI_FileInfo.connect(callback);
    }

    public static onGuiPagethumbs(callback: (thumbnails: Array<IPageThumb>) => void): void {
        RxCore.GUI_pagethumbs.connect(callback);
    }

    public static onGuiPagethumb(callback: (thumbnail: any) => void): void {
        RxCore.GUI_pagethumb.connect(callback);
    }

    public static onGuiPDFBookmarks(callback: Function): void {
        RxCore.GUI_PDFBookmarks.connect(callback);
    }

    public static onGuiMarkupSave(callback: Function): void {
        RxCore.GUI_MarkupSave.connect(callback);
    }

    public static onGuiSymbols(callback: Function): void {
        RxCore.GUI_Symbols.connect(callback);
    }

    public static onGuiResize(callback: Function): void {
        RxCore.GUI_Resize.connect(callback);
    }

    public static onGuiTextCopied(callback: Function): void {
        RxCore.GUI_TextCopied.connect(callback);
    }

    public static onGuiMathcesRectsPage(callback: Function): void {
        RxCore.GUI_MathcesRectsPage.connect(callback);
    }

    public static onGuiMarkupLink(callback: Function): void {
        RxCore.GUI_MarkupLink.connect(callback);
    }

    public static onGuiExportComplete(callback: Function): void {
        RxCore.GUI_exportComplete.connect(callback);
    }

    public static onGuiCompareMeasure(callback: Function): void {
        RxCore.GUI_CompareMeasure.connect(callback);
    }

    public static onGuiFoxitReady(callback: Function): void {
        RxCore.GUI_FoxitReady.connect(callback);
    }

    public static onGuiMarkupChanged(callback: Function): void {
        RxCore.GUI_MarkupChanged.connect(callback);
    }

    public static onGuiPutSignatureComplete(callback: (username: string) => void): void {
        RxCore.GUI_putsignatureComplete.connect(callback);
    }

    public static onGuiGetSignatureComplete(callback: (signature: ISignatureData) => void): void {
        RxCore.GUI_getsignatureComplete.connect(callback);
    }
    
    public static onGuiPanUpdated(callback: (sx: number, sy: number, pagerect: any) => void): void {
        RxCore.GUI_PanUpdated.connect(callback);
    }

    public static onGuiZoomUpdate(callback: (zoomparams : any, type : number) => void): void {
        RxCore.GUI_ZoomUpdate.connect(callback);
    }

    public static onGuiMarkupMeasureRealTimeData(callback: Function): void {
        RxCore.GUI_MarkupMeasureRealTimeData.connect(callback);
    }
    
    public static setUnit(unit: number): void {
        RxCore.setUnit(unit);
    }

    public static getUnit(): any {
        return RxCore.getUnit();
    }


    

    public static metricUnit(val: string): void {
        RxCore.metricUnit(val)
    }

    public static imperialUnit(unit: string): void {
        RxCore.imperialUnit(unit);
    }

    public static calibrate(selected: boolean): void {
        RxCore.calibrate(selected);
    }
    
    public static onGuiCalibratediag(callback: Function): void {
        // RxCore.GUI_MarkupIndex.connect(callback);
        RxCore.GUI_Calibratediag.connect(callback);
    }

    public static getCalibrateGUI(): any {        
        return RxCore.GUI_Calibratediag;
    }

    public static setdimPrecision(value): any {        
        RxCore.setdimPrecision(value);
    }

    public static markupAreaRect(onoff: boolean): void {
        RxCore.markupAreaRect(onoff);
    }
 
    public static insertPoint(): void {
        RxCore.insertPoint();
    }
 
    public static deletePoint(): void {
        RxCore.deletePoint();
    } 
    public static markupRectToAreaSwitch(markup: IMarkup): void {
        RxCore.markupRectToAreaSwitch(markup);
    } 



}