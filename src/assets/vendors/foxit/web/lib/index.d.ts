import * as EventEmitter from 'eventemitter3';
import * as i18next from 'i18next';

declare type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Uint8ClampedArray
  | Int8Array
  | Int16Array
  | Int32Array;
declare type Optional<T> = T | undefined | null;
declare type Or<A, B, C = B, D = C, E = D, F = E> = A | B | C | D | E | F;

interface Class<T> {
  readonly prototype: T;
  new (...args: any[]): T;
}

type PromisifyFunction<F> = F extends (...args: infer P) => infer R
  ? (...args: P) => Promise<R extends Promise<infer P> ? P : R>
  : F;

type PromisifyObject<
  T,
  Exc extends keyof T = never,
  Skip extends keyof T = never
> = {
  [K in Exclude<Exclude<keyof T, Exc>, Skip>]: PromisifyFunction<T[K]>;
} & { [EK in Exclude<Skip, Exc>]: T[EK] };

type PromisifyClass<
  T,
  Exc extends keyof T = never,
  Skip extends keyof T = never
> = Class<PromisifyObject<T, Exc, Skip>>;

declare module __internal__ {
  export interface DevicePoint {
    x: number;
    y: number;
  }

  class DeviceRect {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }

  export interface PDFPoint {
    x: number;
    y: number;
  }

  export interface PDFRect {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }

  class FontMap {
    glyphs: Array<Glyphs>;
    nameMatches: Array<RegExp | String>;
  }

  class Glyphs {
    bold: number;
    flags: number;
    isBrotli: boolean;
    url: string;
  }

  class PageRange {
    end: number;
    filter: number;
    start: number;
  }

  class Unit {
    convertAreaTo(value: number, targetUnit: Unit): number;
    convertTo(value: number, targetUnit: Unit): number;
  }

  class Action {
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class EmbeddedGotoAction extends Action {
    getDestination(): object;
    getNewWindowFlag(): number;
    getTargetFileInfo(): Promise<object>;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class GoToAction extends Action {
    getDestination(): object;
    setDestination(destination: {
      zoomMode: string;
      zoomFactor: number;
      pageIndex: string;
      left: string;
      top: string;
      right: string;
      bottom: string;
    }): Promise<object>;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class HideAction extends Action {
    getFieldNames(): string[];
    getHideState(): boolean;
    setFieldNames(fieldNames: string[]): Promise<object>;
    setHideState(hideState: boolean): Promise<object>;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class JavaScriptAction extends Action {
    getScript(): string;
    setScript(script: string): Promise<object>;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class LaunchAction extends Action {
    getFileSpec(): FileSpec;
    setFileSpec(fileSpec: FileSpec): void;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class ResetFormAction extends Action {
    getFieldNames(): string[];
    getFlags(): number;
    setFieldNames(fieldNames: string[]): Promise<Action>;
    setFlags(flags: 0 | 1): Promise<Action>;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class SubmitFormAction extends Action {
    getFieldNames(): string[];
    getFlags(): number;
    getURL(): string;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  class URIAction extends Action {
    getURI(): string;
    setURI(uri: string): Promise<Action>;
    getSubAction(index: number): Action;
    getSubActionCount(): number;
    getType(): string;
    insertSubAction(index: number, action: Action): Promise<object>;
    removeAllSubActions(): Promise<void>;
    removeSubAction(index: number): Promise<void>;
    setSubAction(index: number, action: Action): Promise<object>;
  }

  enum Annot_Flags {
    invisible = 1,
    hidden = 2,
    print = 4,
    noZoom = 8,

    noRotate = 16,
    noView = 32,
    readOnly = 64,
    locked = 128,

    toggleNoView = 256,
    lockedContents = 512,
  }
  enum Annot_Type {
    unKnownType = 'unknowntype',
    text = 'text',
    link = 'link',
    freeText = 'freetext',

    line = 'line',
    square = 'square',
    circle = 'circle',
    polygon = 'polygon',
    polyline = 'polyline',
    highlight = 'highlight',
    underline = 'underline',
    squiggly = 'squiggly',

    strikeOut = 'strikeout',
    stamp = 'stamp',
    caret = 'caret',
    ink = 'ink',

    psInk = 'psink',
    fileAttachment = 'fileattachment',
    widget = 'widget',
    screen = 'screen',
    popup = 'popup',
    redact = 'redact',
  }
  enum Annot_Unit_Type {
    inch = 'inch',
    custom = 'custom',
    mi = 'mi',
    pt = 'pt',

    ft = 'ft',
    yd = 'yd',
    km = 'km',
    m = 'm',

    cm = 'cm',
    mm = 'mm',
    pica = 'pica',
  }
  enum MARKUP_ANNOTATION_STATE {
    MARKED = 'marked',
    UNMARKED = 'unmarked',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',

    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    DEFERRED = 'deferred',
    FUTURE = 'future',

    NONE = 'none',
  }

  export interface IAnnotationSummary {
    color: string;
    contents: string;
    customEntries: Record<string, any>;
    dashes: string;
    dashPhase: number;
    date: string;
    flags: string;
    indensity: number;
    objectNumber: number;
    page: number;
    rect: string;
    style: string;
    type: Annot_Type;
    width: number;
  }

  export interface ICaretAnnotationSummary extends IMarkupAnnotationSummary {
    fringe: string;
  }

  export interface ICircleAnnotationSummary extends IMarkupAnnotationSummary {
    fringe: string;
    interiorColor: string;
  }

  export interface IFileAttachmentAnnotationSummary
    extends IMarkupAnnotationSummary {}

  export interface IFreeTextAnnotationSummary extends IMarkupAnnotationSummary {
    defaultappearance: string;
    fontColor: string;
    interiorColor: string;
  }

  export interface IFreeTextCalloutAnnotationSummary
    extends IFreeTextAnnotationSummary {
    callout: string;
    fringe: string;
    head: string;
  }

  export interface IFreeTextTextBoxAnnotationSummary
    extends IFreeTextAnnotationSummary {}

  export interface IFreeTextTypewriterAnnotationSummary
    extends IFreeTextAnnotationSummary {}

  export interface IHighlightAnnotationSummary
    extends ITextMarkupAnnotationSummary {}

  export interface IInkAnnotationSummary extends ITextMarkupAnnotationSummary {
    inkList: string;
  }

  export interface ILineAnnotationSummary extends IMarkupAnnotationSummary {
    caption: string;
    end: string;
    head: string;
    leaderExtend: number;
    leaderLength: number;
    start: string;
    tail: string;
  }

  export interface ILinkAnnotationSummary extends IAnnotationSummary {}

  export interface IMarkupAnnotationSummary extends IAnnotationSummary {
    creationdate: string;
    inreplyto: string;
    intent: string;
    opacity: number;
    popup: IPopupAnnotationSummary;
    replyType: string;
    rotation: number;
    subject: string;
    title: string;
  }

  export interface INoteAnnotationSummary extends IMarkupAnnotationSummary {
    statemodel: string;
  }

  export interface IPolygonAnnotationSummary extends IMarkupAnnotationSummary {
    interiorColor: string;
    vertices: string;
  }

  export interface IPolylineAnnotationSummary extends IMarkupAnnotationSummary {
    head: string;
    interiorColor: string;
    tail: string;
    vertices: string;
  }

  export interface IPopupAnnotationSummary {
    flags: string;
    name: string;
    page: number;
    rect: string;
    type: string;
  }

  export interface IRedactAnnotationSummary extends IMarkupAnnotationSummary {
    coords: string;
    defaultappearance: string;
    fontColor: string;
    interiorColor: string;
    justification: number;
    overlayText: string;
  }

  export interface ISquareAnnotationSummary extends IMarkupAnnotationSummary {
    fringe: string;
    interiorColor: string;
  }

  export interface ISquigglyAnnotationSummary
    extends ITextMarkupAnnotationSummary {}

  export interface IStrikeoutAnnotationSummary
    extends ITextMarkupAnnotationSummary {}

  export interface ITextMarkupAnnotationSummary
    extends IMarkupAnnotationSummary {
    coords: string;
  }

  export interface IUnderlineAnnotationSummary
    extends ITextMarkupAnnotationSummary {}

  class Annot {
    exportToJSON(): object;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getTitle(): string;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setContent(content: string): Promise<Annot[] | Annot>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class AnnotFlag {
    check(flag: number): boolean;
    checkHidden(): boolean;
    checkInvisible(): boolean;
    checkLocked(): boolean;
    checkLockedContents(): boolean;
    checkNoRotate(): boolean;
    checkNoView(): boolean;
    checkNoZoom(): boolean;
    checkPrint(): boolean;
    checkReadOnly(): boolean;
    checkToggleNoView(): boolean;
    getValue(): number;
    or(flag: number): AnnotFlag;
  }

  class Caret extends Markup {
    exportToJSON(): object;
    getInnerRect(): PDFRect;
    moveRectByCharIndex(charIndex: number): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Circle extends Markup {
    enableCaption(enable: boolean): Promise<void>;
    exportToJSON(): object;
    getCaptionColor(): number;
    getFillColor(): number;
    getInnerRect(): PDFRect;
    getMeasureConversionFactor(): number;
    getMeasureRatio(): string;
    getMeasureUnit(): string;
    hasCaption(): boolean;
    setCaptionColor(
      captionColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setFillColor(
      fillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<boolean>;
    setMeasureConversionFactor(factor: number): Promise<void>;
    setMeasureRatio(measurementRatio: {
      userSpaceValue: number;
      userSpaceUnit: string;
      realValue: string;
      realUnit: string;
    }): void;
    setMeasureUnit(unit: string): Promise<void>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class FileAttachment extends Markup {
    exportToJSON(): object;
    getIconName(): string;
    setIconName(iconName: string): Promise<void>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class FreeText extends Markup {
    exportToJSON(): object;
    getAlignment(): number;
    getCalloutLineEndingStyle(): number;
    getCalloutLinePoints(): Array<{ x: number; y: number }>;
    getDefaultAppearance(): object;
    getFillColor(): number;
    getInnerRect(): PDFRect;
    getRotation(): number;
    setAlignment(value: number): void;
    setCalloutLineEndingStyle(endingStyle: number): Promise<void>;
    setCalloutLinePoints(
      calloutLinePoints: Array<{ x: number; y: number }>
    ): Promise<void>;
    setDefaultAppearance(defaultAppearance: {
      textColor: number;
      textSize: number;
      font: {
        name: string;
        styles: number;
        charset: number;
      };
    }): Promise<void>;
    setFillColor(
      fillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<boolean>;
    setInnerRect(rect: PDFRect): void;
    setRotation(rotation: number): Promise<void>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Highlight extends TextMarkup {
    exportToJSON(): Record<string, any>;
    getContinuousText(): string;
    getEndCharIndex(): number;
    getQuadPoints(): Array<Array<{ x: number; y: number }>>;
    getStartCharIndex(): number;
    getText(): string;
    updateQuadPointsByCharIndex(
      startCharIndex: number,
      endCharIndex: number
    ): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Ink extends Markup {
    exportToJSON(): object;
    getInkList(): Array<{ x: number; y: number; type: number }>;
    setInkList(
      inkList: Array<{ x: number; y: number; type: number }>
    ): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Line extends Markup {
    enableCaption(enable: boolean): Promise<void>;
    exportToJSON(): object;
    getCaptionColor(): number;
    getCaptionOffset(): { x: number; y: number };
    getEndingStyle(): number;
    getEndPoint(): { x: number; y: number };
    getLeaderLineExtend(): number;
    getLeaderLineLength(): number;
    getLeaderLineOffset(): number;
    getLeaderLinePoints(): {
      start: { x: number; y: number };
      end: { x: number; y: number };
    };
    getMeasureRatio(): string;
    getMeasureUnit(): string;
    getStartPoint(): { x: number; y: number };
    getStartStyle(): number;
    getStyleFillColor(): number;
    hasCaption(): boolean;
    setCaptionColor(
      captionColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setCaptionOffset(x: number, y: number): Promise<void>;
    setEndingStyle(isBeginning: boolean, endingStyle: number): Promise<void>;
    setEndPoint(point: { x: number; y: number }): Promise<void>;
    setLeaderLineExtend(length: number): Promise<void>;
    setLeaderLineLength(length: number): Promise<void>;
    setLeaderLineOffset(offset: number): Promise<void>;
    setMeasureRatio(measurementRatio: {
      userSpaceValue: number;
      userSpaceUnit: string;
      realValue: string;
      realUnit: string;
    }): void;
    setMeasureUnit(unit: string): void;
    setStartPoint(point: { x: number; y: number }): Promise<void>;
    setStyleFillColor(
      styleFillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Link extends Annot {
    getAction(): Action;
    getHighlightingMode(): number;
    removeAction(): Promise<boolean>;
    setAction(action: Action): Promise<boolean>;
    setHighlightingMode(highlightingMode: number): Promise<void>;
    exportToJSON(): object;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getTitle(): string;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setContent(content: string): Promise<Annot[] | Annot>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Markup extends Annot {
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    exportToJSON(): object;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Note extends Markup {
    exportToJSON(): Record<string, any>;
    getIconName(): string;
    setIconName(iconName: string): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Polygon extends Markup {
    enableCaption(enable: boolean): Promise<void>;
    exportToJSON(): Record<string, any>;
    getCaptionColor(): number;
    getFillColor(): number;
    getMeasureRatio(): string;
    getMeasureUnit(): string;
    getVertexes(): Array<{ x: number; y: number }>;
    hasCaption(): boolean;
    setCaptionColor(
      captionColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setFillColor(
      fillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<boolean>;
    setMeasureRatio(measurementRatio: {
      userSpaceValue: number;
      userSpaceUnit: string;
      realValue: string;
      realUnit: string;
    }): void;
    setMeasureUnit(unit: string): Promise<void>;
    setVertexes(vertexes: Array<{ x: number; y: number }>): Promise<void>;
    updateVertexes(
      index: number,
      point: { x: number; y: number }
    ): Promise<void>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class PolyLine extends Markup {
    enableCaption(enable: boolean): Promise<void>;
    exportToJSON(): Record<string, any>;
    getCaptionColor(): number;
    getEndingStyle(): number;
    getMeasureRatio(): string;
    getMeasureUnit(): string;
    getStartStyle(): number;
    getStyleFillColor(): number;
    getVertexes(): Array<{ x: number; y: number }>;
    hasCaption(): boolean;
    setCaptionColor(
      captionColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setEndingStyle(isBeginning: boolean, endingStyle: number): Promise<void>;
    setMeasureRatio(measurementRatio: {
      userSpaceValue: number;
      userSpaceUnit: string;
      realValue: string;
      realUnit: string;
    }): void;
    setMeasureUnit(unit: string): Promise<void>;
    setStyleFillColor(
      styleFillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<boolean>;
    setVertexes(vertexes: Array<{ x: number; y: number }>): Promise<void>;
    updateVertexes(index: number, point: { x: number; y: number }): void;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Redact extends Markup {
    apply(): Promise<Array<{ pageIndex: number; removedAnnots: number[] }>>;
    getDefaultAppearance(): { textColor: number; textSize: number };
    getFillColor(): number;
    getOverlayText(): string;
    getOverlayTextAlignment(): '0' | '1' | '2';
    getRepeat(): boolean;
    removeOverlayText(): Promise<boolean>;
    setAutoFontSize(isAutoFontSize: boolean): Promise<boolean>;
    setDefaultAppearance(appearance: {
      fontName: string;
      textSize: number;
      textColor: number;
    }): Promise<boolean>;
    setFillColor(fillColor: number): Promise<boolean>;
    setOpacity(opacity: number, onlyForFill?: boolean): Promise<boolean>;
    setOverlayText(overlayText: string): Promise<boolean>;
    setOverlayTextAlignment(alignment: 0 | 1 | 2): Promise<boolean>;
    setRedactApplyFillColor(
      applyFillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<boolean>;
    setRepeat(isRepeat: boolean): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    exportToJSON(): object;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Screen extends Annot {
    getAction(): Action;
    getImage(
      type?: 'canvas' | 'image' | 'buffer'
    ): Promise<ArrayBuffer | HTMLImageElement | HTMLCanvasElement>;
    getOpacity(): number;
    getRotation(): number;
    removeAction(): Promise<boolean>;
    setImage(buffer: ArrayBuffer): Promise<boolean>;
    setOpacity(opacity: number): Promise<Annot[]>;
    setRotation(rotation: 0 | 90 | 180 | 270): void;
    exportToJSON(): object;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getTitle(): string;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setContent(content: string): Promise<Annot[] | Annot>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Sound extends Markup {
    getIconName(): string;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    exportToJSON(): object;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Square extends Markup {
    exportToJSON(): Record<string, any>;
    getFillColor(): number;
    getInnerRect(): PDFRect;
    getMeasureConversionFactor(): number;
    getMeasureRatio(): string;
    getMeasureUnit(): string;
    setFillColor(
      fillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<boolean>;
    setMeasureConversionFactor(factor: number): void;
    setMeasureRatio(measurementRatio: {
      userSpaceValue: number;
      userSpaceUnit: string;
      realValue: string;
      realUnit: string;
    }): void;
    setMeasureUnit(unit: string): void;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Squiggly extends TextMarkup {
    exportToJSON(): Record<string, any>;
    getContinuousText(): string;
    getEndCharIndex(): number;
    getQuadPoints(): Array<Array<{ x: number; y: number }>>;
    getStartCharIndex(): number;
    getText(): string;
    updateQuadPointsByCharIndex(
      startCharIndex: number,
      endCharIndex: number
    ): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Stamp extends Markup {
    exportToJSON(): Record<string, any>;
    getImage(
      type?: 'canvas' | 'image' | 'buffer'
    ): Promise<HTMLCanvasElement | HTMLImageElement | ArrayBuffer>;
    getRotation(): number;
    setImage(url: string): void;
    setRotation(rotation: number): void;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class StrikeOut extends TextMarkup {
    exportToJSON(): Record<string, any>;
    getContinuousText(): string;
    getEndCharIndex(): number;
    getQuadPoints(): Array<Array<{ x: number; y: number }>>;
    getStartCharIndex(): number;
    getText(): string;
    updateQuadPointsByCharIndex(
      startCharIndex: number,
      endCharIndex: number
    ): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class TextMarkup extends Markup {
    constructor(info: object, page: PDFPage);

    exportToJSON(): Record<string, any>;
    getContinuousText(): string;
    getEndCharIndex(): number;
    getQuadPoints(): Array<Array<{ x: number; y: number }>>;
    getStartCharIndex(): number;
    getText(): string;
    updateQuadPointsByCharIndex(
      startCharIndex: number,
      endCharIndex: number
    ): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Underline extends TextMarkup {
    exportToJSON(): Record<string, any>;
    getContinuousText(): string;
    getEndCharIndex(): number;
    getQuadPoints(): Array<Array<{ x: number; y: number }>>;
    getStartCharIndex(): number;
    getText(): string;
    updateQuadPointsByCharIndex(
      startCharIndex: number,
      endCharIndex: number
    ): Promise<boolean>;
    addMarkedState(stateName: string): Promise<Note>;
    addReply(content: string): Promise<Note>;
    addReviewState(stateName: string): Promise<Note>;
    addRichText(
      datas: Array<{
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    getCreateDateTime(): Date;
    getGroupElements(): Annot[];
    getGroupHeader(): Markup;
    getIntent(): string;
    getMarkedState(index: number): Note;
    getMarkedStateCount(): number;
    getMarkedStates(): Note[];
    getOpacity(): number;
    getPopup(): Annot;
    getReplies(): Note[];
    getReply(index: number): Note;
    getReplyCount(): number;
    getReviewState(index: number): Note;
    getReviewStateCount(): number;
    getReviewStates(): Note[];
    getRichText(): Promise<Array<any>>;
    getSubject(): string;
    getTitle(): string;
    insertRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    isGrouped(): boolean;
    isGroupHeader(): Markup[];
    removeAllStateAnnots(): Promise<boolean>;
    removeRichText(indexes: number[]): void;
    setContent(content: string): Promise<Annot[]>;
    setCreateDateTime(date: number): Promise<Annot[]>;
    setIntent(intent: string): Promise<Annot[]>;
    setOpacity(opacity: number): Promise<Annot[] | boolean>;
    setRichText(
      datas: Array<{
        index: number;
        content: string;
        richTextStyle: {
          font: {
            name: string;
            styles: number;
            charset: number;
          };
          textSize: number;
          textAlignment: number;
          textColor: number;
          isBold: boolean;
          isItalic: boolean;
          isUnderline: boolean;
          isStrikethrough: boolean;
          cornerMarkStyle: number;
        };
      }>
    ): void;
    setSubject(subject: string): Promise<Annot[]>;
    setTitle(title: string): Promise<Annot[]>;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class Widget extends Annot {
    getAction(): Action;
    getAdditionalAction(type: number): Action;
    getControl(): PDFControl;
    getField(): PDFField;
    getMKProperty(key: string): number | string;
    setAdditionalAction(trigger: number, action: Action): Promise<void>;
    setMKProperty(key: string, value: number | string): void;
    exportToJSON(): object;
    getBorderColor(): number;
    getBorderInfo(): {
      cloudIntensity: number;
      dashPhase: number;
      dashes: number[];
      style: number;
      width: number;
    };
    getContent(): string;
    getDictionaryEntry(key: string): Promise<string>;
    getFlags(): number;
    getModifiedDateTime(): Date | null;
    getObjectNumber(): number;
    getPage(): PDFPage;
    getRect(): PDFRect;
    getTitle(): string;
    getType(): string;
    getUniqueID(): string;
    isEmpty(): boolean;
    isMarkup(): boolean;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderInfo(borderInfo: {
      cloudIntensity?: number;
      dashPhase?: number;
      dashes?: number[];
      style: Border_Style;
      width: number;
    }): Promise<void>;
    setContent(content: string): Promise<Annot[] | Annot>;
    setCustomAPStream(appearanceType: string, appearanceStream: string): void;
    setDictionaryEntry(key: string, value: string): Promise<boolean>;
    setFlags(flag: number): Promise<boolean>;
    setModifiedDateTime(date: Date | number): Promise<boolean>;
    setRect(rect: PDFRect): Promise<boolean>;
  }

  class FileSpec {
    constructor(fileSpec: { fileName: String });

    getFileName(): string;
    setFileName(name: string): void;
  }

  export interface BookmarkDestination {
    bottom?: number;
    left?: number;
    pageIndex?: number;
    right?: number;
    top?: number;
    zoomFactor?: number;
    zoomMode?: BookmarkZoomMode;
  }

  export interface BookmarkFontStyle {
    bold: boolean;
    italic: boolean;
  }

  enum BookmarkRelationship {
    FIRST_CHILD = 0,
    LAST_CHILD = 1,
    PREVIOUS_SIBLING = 2,
    NEXT_SIBLING = 3,

    FIRST_SIBLING = 4,
    LAST_SIBLING = 5,
  }
  enum BookmarkZoomMode {
    ZoomFitBBox,
    ZoomFitBHorz,
    ZoomFitBVert,
    ZoomFitHorz,

    ZoomFitVert,
    ZoomFitPage,
    ZoomFitRect,
    ZoomXYZ,
  }

  export interface ComparePageRange {
    end: number;
    from: number;
  }

  export interface LineThicknessValues {
    delete: number;
    insert: number;
    replace: number;
  }

  export interface MarkingColorValues {
    delete: number;
    insert: number;
    replace: number;
  }

  export interface OpacityValues {
    delete: number;
    insert: number;
    replace: number;
  }

  enum Line_Type {
    straightLine = 0,
    thinDashedLine = 1,
    normalDashedLine = 2,
    thickDashedLine = 3,

    thinDashedDotLine = 4,
    normalDashedDotLine = 5,
    thickDashedDotLine = 6,
  }

  enum Action_Trigger {
    click = -1,
    keyStroke = 7,
    format = 8,
    validate = 9,

    calculate = 10,
    mouseEnter = 11,
    mouseExit = 12,
    mouseDown = 13,

    mouseUp = 14,
    onFocus = 15,
    onBlur = 16,
  }
  enum Action_Type {
    goto = 'TypeGoto',
    launch = 'TypeLaunch',
    uri = 'TypeURI',
    named = 'TypeNamed',
    submitForm = 'TypeSubmitForm',
    resetForm = 'TypeResetForm',
    javaScript = 'TypeJavaScript',
    importData = 'TypeImportData',

    hide = 'TypeHide',
    gotoE = 'TypeGoToE',
  }
  enum Additional_Permission {
    download = 1,
  }
  enum Alignment {
    left,
    center,
    right,
  }
  enum AnnotUpdatedType {
    contentUpdated = 'content-updated',
    borderInfoUpdated = 'borderInfo-updated',
    borderStyleUpdated = 'borderStyle-updated',
    borderWidthUpdated = 'borderWidth-updated',

    borderColorUpdated = 'borderColor-updated',
    captionColorUpdated = 'captionColor-updated',
    modifiedDateTimeUpdated = 'modifiedDateTime-updated',
    uniqueIDUpdated = 'uniqueID-updated',

    flagsUpdated = 'flags-updated',
    rectUpdated = 'rect-updated',
    innerRectUpdated = 'innerRect-updated',
    iconNameUpdated = 'iconName-updated',

    rotationUpdated = 'rotation-updated',
    defaultAppearanceUpdated = 'defaultAppearance-updated',
    calloutLineEndingStyleUpdated = 'calloutLineEndingStyle-updated',
    calloutLinePointsUpdated = 'calloutLinePoints-updated',

    fillColorUpdated = 'fillColor-updated',
    textColorUpdated = 'textColor-updated',
    alignmentUpdated = 'alignment-updated',
    inkListUpdated = 'inkList-updated',

    endPointUpdated = 'endPoint-updated',
    startPointUpdated = 'startPoint-updated',
    endingStyleUpdated = 'endingStyle-updated',
    enableCaptionUpdated = 'enableCaption-updated',

    leaderCaptionOffsetUpdated = 'leaderCaptionOffset-updated',
    styleFillColorUpdated = 'styleFillColor-updated',
    leaderLineLengthUpdated = 'leaderLineLength-updated',
    leaderLineExtendUpdated = 'leaderLineExtend-updated',

    leaderLineOffsetUpdated = 'leaderLineOffset-updated',
    measureRatioUpdated = 'measureRatio-updated',
    measureUnitUpdated = 'measureUnit-updated',
    measureConversionFactorUpdated = 'measureConversionFactor-updated',

    removeAction = 'remove-action',
    actionDataUpdated = 'actionData-updated',
    addAction = 'add-action',
    moveAction = 'move-action',

    highlightingModeUpdated = 'highlightingMode-updated',
    subjectUpdated = 'subject-updated',
    titleUpdated = 'title-updated',
    createDateTimeUpdated = 'createDateTime-updated',

    opacityUpdated = 'opacity-updated',
    intentUpdated = 'intent-updated',
    vertexesUpdated = 'vertexes-updated',
    applyFillColorUpdated = 'applyFillColor-updated',

    overlayTextUpdated = 'overlayText-updated',
    overlayTexAlignmentUpdated = 'overlayTextAlignment-updated',
    repeatUpdated = 'repeat-updated',
    autoFontSizeUpdated = 'autoFontSize-updated',

    redactDefaultAppearanceUpdated = 'redactDefaultAppearance-update',
    redactOpacityUpdated = 'redactOpacity-updated',
    quadPointsUpdated = 'quadPoints-updated',
    reviewStateUpdated = 'review-state-updated',

    markedStateUpdated = 'marked-state-updated',
    statesCleared = 'state-cleared',
    replyAdded = 'add-replies',
    richTextUpdated = 'rich-text-updated',

    richTextRemoved = 'rich-text-removed',
    addDictionary = 'add-dictionary',
    imageUpdated = 'image-updated',
    formFieldValueUpdated = 'form-field-value',

    formFieldsMaxLengthUpdated = 'maxLength',
    formFieldItemsUpdated = 'setItems',
    formFieldIconUpdated = 'icon',
    formFieldInsertedItem = 'insertItemAt',

    formFieldExportValueUpdated = 'form-field-export-value',
    formFieldMKPropertyUpdated = 'form-field-mk-property',
    formFieldAlternateName = 'form-field-alternate-name',
    formFieldMappingName = 'form-field-mapping-name',

    formFieldActionUpdated = 'form-field-action',
  }
  enum Border_Style {
    solid = 0,
    dashed = 1,
    underline = 2,
    beveled = 3,

    inset = 4,
    cloudy = 5,
    noBorder = 6,
  }
  enum Box_Type {
    MediaBox = 0,
    CropBox = 1,
    TrimBox = 2,
    ArtBox = 3,

    BleedBox = 4,
  }
  enum Calc_Margin_Mode {
    CalcContentsBox = 0,
    CalcDetection = 1,
  }
  enum Cipher_Type {
    cipherNone = 0,
    cipherRC4 = 1,
    cipherAES = 2,
  }
  enum DataEvents {
    annotationUpdated = 'annotation-updated',
    annotationAppearanceUpdated = 'annotation-appearance-updated',
    annotationReplyAdded = 'annotation-reply-add',
    annotationReviewStateAnnotAdded = 'annotation-review-state-annot-add',
    annotationMarkedStateAnnotAdded = 'annotation-marked-state-annot-add',
    annotationStatesCleared = 'annotation-states-cleared',
    annotationRemoved = 'annotation-removed',
    annotationPositionMoved = 'annotation-moved-position',

    annotationOrderChanged = 'annotation-order-changed',
    annotationAdded = 'annotation-add',
    annotationImported = 'annotation-imported',
    actionUpdated = 'action-updated',
    actionAdded = 'action-add',
    layerVisibleChanged = 'layer-visible-change',
    stateAnnotNameUpdated = 'state-annot-name-updated',
    pageInfoChanged = 'page-info-change',
    pageRotationChanged = 'page-rotation-change',
    imageAdded = 'image-added',
    watermarkAdded = 'watermark-added',
    watermarkRemoved = 'watermark-removed',

    graphicsUpdated = 'graphics-updated',
    docPasswordChanged = 'doc-password-changed',
    drmEncryptSucceeded = 'drm-encrypt-success',
    drmEncryptFailed = 'drm-encrypt-failed',
    pwdAndPermRemoved = 'remove-password-and-permission',
    pageMoved = 'page-moved',
    pageRemoved = 'page-removed',
    pageAdded = 'page-added',
    pagesInserted = 'import-pages',
    redactionApplied = 'apply-redaction',
    reviewStateRemoved = 'remove-review-state',
    formValueChanged = 'form-value-changed',

    metaDataChanged = 'meta-data-changed',
    docModified = 'doc-modified',
    flattened = 'flattened',
    headerFooterUpdated = 'headerFooterUpdated',

    headerFooterAdded = 'headerFooterAdded',
    pagesMoved = 'pages-moved',
    pagesRemoved = 'pages-removed',
    pagesRotated = 'pages-rotated',

    pageMeasureScaleRatioChanged = ' page-measure-scale-ratio-changed',
    pagesBoxChanged = 'pages-box-changed',
    objectStartEdit = 'object-start-edit',
    objectEndEdit = 'object-end-edit',

    objectSelectionChanged = 'object-selection-changed',
    objectAdded = 'object-added',
    objectPropertyChanged = 'object-property-changed',
    paragraphTextOnActivate = 'paragraph-text-on-activate',

    paragraphTextOnDeactivate = 'paragraph-text-on-deactivate',
    paragraphTextEnterEdit = 'paragraph-text-enter-edit',
    paragraphTextExitEdit = 'paragraph-text-exit-edit',
    paragraphTextOnChar = 'paragraph-text-on-char',

    findSuccess = 'find-success',
    replaceSuccess = 'replace-success',
    replaceAllSuccess = 'replace-all-success',
    formFieldImported = 'form-field-imported',
  }
  enum date_Format {
    MSlashD = 0,
    MSlashDSlashYY = 1,
    MSlashDSlashYYYY = 2,
    MMSlashDDSlashYY = 3,

    MMSlashDDSlashYYYY = 4,
    DSlashMSlashYY = 5,
    DSlashMSlashYYYY = 6,
    DDSlashMMSlashYY = 7,

    DDSlashMMSlashYYYY = 8,
    MMSlashYY = 9,
    MMSlashYYYY = 10,
    MDotDDotYY = 11,

    MDotDDotYYYY = 12,
    MMDotDDDotYY = 13,
    MMDotDDDotYYYY = 14,
    MMDotYY = 15,

    DDotMDotYYYY = 16,
    DDDotMMDotYY = 17,
    DDDotMMDotYYYY = 18,
    YYHyphenMMHyphenDD = 19,

    YYYYHyphenMMHyphenDD = 20,
  }
  enum Ending_Style {
    None,
    Square,
    Circle,
    Diamond,

    OpenArrow,
    ClosedArrow,
    Butt,
    ReverseOpenArrow,

    ReverseClosedArrow,
    Slash,
  }
  enum Error_Code {
    success = 0,
    file = 1,
    format = 2,
    password = 3,

    handle = 4,
    certificate = 5,
    unknown = 6,
    invalidLicense = 7,

    param = 8,
    unsupported = 9,
    outOfMemory = 10,
    securityHandler = 11,

    notParsed = 12,
    notFound = 13,
    invalidType = 14,
    conflict = 15,

    unknownState = 16,
    dataNotReady = 17,
    invalidData = 18,
    xFALoadError = 19,

    notLoaded = 20,
    invalidState = 21,
    notCDRM = 22,
    canNotConnectToServer = 23,

    invalidUserToken = 24,
    noRights = 25,
    rightsExpired = 26,
    deviceLimitation = 27,

    canNotRemoveSecurityFromServer = 28,
    canNotGetACL = 29,
    canNotSetACL = 30,
    isAlreadyCPDF = 31,

    isAlreadyCDRM = 32,
    canNotUploadDocInfo = 33,
    canNotUploadCDRMInfo = 34,
    invalidWrapper = 35,

    canNotGetClientID = 36,
    canNotGetUserToken = 37,
    invalidACL = 38,
    invalidClientID = 39,

    OCREngineNotInit = 40,
    diskFull = 41,
    OCRTrialIsEnd = 42,
    filePathNotExist = 43,

    complianceEngineNotInit = 44,
    complianceEngineInvalidUnlockCode = 45,
    complianceEngineInitFailed = 46,
    timeStampServerMgrNotInit = 47,

    LTVVerifyModeNotSet = 48,
    LTVRevocationCallbackNotSet = 49,
    LTVCannotSwitchVersion = 50,
    LTVCannotCheckDTS = 51,

    LTVCannotLoadDSS = 52,
    LTVCannotLoadDTS = 53,
    needSigned = 54,
    complianceResourceFile = 55,

    timeStampServerMgrNoDefaltServer = 56,
    defaultTimeStampServer = 57,
    noConnectedPDFModuleRight = 58,
    noXFAModuleRight = 59,

    noRedactionModuleRight = 60,
    noRMSModuleRight = 61,
    noOCRModuleRight = 62,
    noComparisonModuleRight = 63,

    noComplianceModuleRight = 64,
    noOptimizerModuleRight = 65,
    noConversionModuleRight = 66,
  }
  enum File_Type {
    fdf = 0,
    xfdf = 1,
    xml = 2,
    csv = 3,

    txt = 4,
    json = 5,
  }
  enum FileAttachment_Icon {
    graph = 'Graph',
    pushPin = 'PushPin',
    paperclip = 'Paperclip',
    tag = 'Tag',
  }
  enum Flatten_Option {
    all = 0x0000,
    field = 0x0001,
    annot = 0x0002,
  }
  enum Font_Charset {
    ANSI = 0,
    Default = 1,
    Symbol = 12,
    Shift_JIS = 128,

    Hangeul = 129,
    GB2312 = 134,
    ChineseBig5 = 136,
    Thai = 222,

    EastEurope = 238,
    Russian = 204,
    Greek = 161,
    Turkish = 162,

    Hebrew = 177,
    Arabic = 178,
    Baltic = 186,
  }
  enum Font_CIDCharset {
    Unknown = 0,
    GB1 = 1,
    CNS1 = 2,
    JAPAN1 = 3,

    KOREA1 = 4,
    UNICODE = 5,
  }
  enum Font_Descriptor_Flags {
    FixedPitch = 1,
    Serif = 2,
    Symbolic = 4,
    Script = 8,

    Nonsymbolic = 32,
    Italic = 64,
    AllCap = 65536,
    SmallCap = 131072,

    ForceBold = 262144,
  }
  enum Font_StandardID {
    Courier = 0,
    CourierB = 1,
    CourierBI = 2,
    CourierI = 3,

    Helvetica = 4,
    HelveticaB = 5,
    HelveticaBI = 6,
    HelveticaI = 7,

    Times = 8,
    TimesB = 9,
    TimesBI = 10,
    TimesI = 11,

    Symbol = 12,
    ZapfDingbats = 13,
  }
  enum Font_Style {
    normal = 0,
    italic = 1,
    bold = 2,
  }
  enum Font_Styles {
    FixedPitch = 1,
    Serif = 2,
    Symbolic = 4,
    Script = 8,

    NonSymbolic = 0x0020,
    Italic = 64,
    AllCap = 65536,
    SmallCap = 131072,

    Bold = 0x40000,
  }
  enum Graphics_FillMode {
    None = 0,
    Alternate = 1,
    Winding = 2,
  }
  enum Graphics_ObjectType {
    All = 0,
    Text = 1,
    Path = 2,
    Image = 3,

    Shading = 4,
    FormXObject = 5,
  }
  enum Highlight_Mode {
    none = 0,
    invert = 1,
    outline = 2,
    push = 3,

    toggle = 4,
  }
  enum MK_Properties {
    borderColor = 'borderColor',
    fillColor = 'fillColor',
    normalCaption = 'normalCaption',
  }
  enum NewWindowFlag {
    NewWindowFlagFalse = 0,
    NewWindowFlagTrue = 1,
    NewWindowFlagNone = 2,
  }
  enum Note_Icon {
    Check = 'Check',
    Circle = 'Circle',
    Comment = 'Comment',
    Cross = 'Cross',

    Help = 'Help',
    Insert = 'Insert',
    Key = 'Key',
    NewParagraph = 'NewParagraph',

    Note = 'Note',
    Paragraph = 'Paragraph',
    RightArrow = 'RightArrow',
    RightPointer = 'RightPointer',

    Star = 'Star',
    UpArrow = 'UpArrow',
    UpLeftArrow = 'UpLeftArrow',
  }
  enum page_Number_Format {
    default = 0,
    numberOfCount = 1,
    numberSlashCount = 2,
    pageNumber = 3,

    pageNumberOfCount = 4,
  }
  enum Point_Type {
    moveTo = 1,
    lineTo = 2,
    lineToCloseFigure = 3,
    bezierTo = 4,

    bezierToCloseFigure = 5,
  }
  enum POS_TYPE {
    FIRST = 0,
    LAST = 1,
    AFTER = 2,
    BEFORE = 3,

    NEXT = 2,
    PREV = 3,
  }
  enum Position {
    topLeft = 'TopLeft',
    topCenter = 'TopCenter',
    topRight = 'TopRight',
    centerLeft = 'CenterLeft',

    center = 'Center',
    centerRight = 'CenterRight',
    bottomLeft = 'BottomLeft',
    bottomCenter = 'BottomCenter',

    bottomRight = 'BottomRight',
  }
  enum PosType {
    first = 0,
    last = 1,
    after = 2,
    before = 3,

    next = 2,
    prev = 3,
  }
  enum Range_Filter {
    all,
    even,
    odd,
  }
  enum Relationship {
    firstChild = 0,
    lastChild = 1,
    previousSibling = 2,
    nextSibling = 3,

    firstSibling = 4,
    lastSibling = 5,
  }
  enum Rendering_Content {
    page,
    annot,
    form,
  }
  enum Rendering_Usage {
    print = 'print',
    view = 'view',
  }
  enum Rotation {
    rotation0 = 0,
    rotation1 = 1,
    rotation2 = 2,
    rotation3 = 3,
  }
  enum Rotation_Degree {
    rotation0 = 0,
    rotation90 = 90,
    rotation180 = 180,
    rotation270 = 270,
  }
  enum Saving_Flag {
    normal = 0,
    incremental = 0x0001,
    noOriginal = 0x0002,
    XRefStream = 0x0008,

    linearized = 0x1000,
    removeRedundantObjects = 0x0010,
  }
  enum Search_Flag {
    caseSensitive = 1,
    wholeWord = 2,
    consecutively = 4,
  }
  enum Signature_Ap_Flags {
    showTagImage = 1,
    showLabel = 2,
    showReason = 4,
    showDate = 8,

    showDistinguishName = 16,
    showLocation = 32,
    showSigner = 64,
    showBitmap = 128,

    showText = 256,
  }
  enum Signature_State {
    VerifyErrorByteRange = 64,
    verifyChange = 128,
    verifyIncredible = 256,
    verifyNoChange = 1024,

    stateVerifyIssueUnknown = 2048,
    verifyIssueValid = 4096,
    verifyIssueUnknown = 8192,
    verifyIssueRevoke = 16384,

    verifyIssueExpire = 32768,
    verifyIssueUncheck = 65536,
    verifyIssueCurrent = 131072,
    verifyTimestampNone = 262144,

    verifyTimestampDoc = 524288,
    verifyTimestampValid = 1048576,
    verifyTimestampInvalid = 2097152,
    verifyTimestampExpire = 4194304,

    verifyTimestampIssueUnknown = 8388608,
    verifyTimestampIssueValid = 16777216,
    verifyTimestampTimeBefore = 33554432,
    verifyChangeLegal = 134217728,

    verifyChangeIllegal = 268435456,
  }
  enum Sound_Icon {
    speaker = 'Speaker',
    mic = 'Mic',
    ear = 'Ear',
  }
  enum STAMP_TEXT_TYPE {
    CUSTOM_TEXT = 'type here to insert text',
    NAME = 'author name',
    NAME_DATE_TIME = 'author name, date and time',
    DATE_TIME = 'date and time',

    DATE = 'date',
  }
  enum Standard_Font {
    courier = 0,
    courierBold = 1,
    courierBoldOblique = 2,
    courierOblique = 3,

    helvetica = 4,
    helveticaBold = 5,
    helveticaBoldOblique = 6,
    helveticaOblique = 7,

    timesRoman = 8,
    timesBold = 9,
    timesBoldItalic = 10,
    timesItalic = 11,

    symbol = 12,
    zapfDingbats = 13,
  }
  enum Text_Mode {
    Fill = 0,
    Stroke = 1,
    FillStroke = 2,
    Invisible = 3,

    FillClip = 4,
    StrokeClip = 5,
    FillStrokeClip = 6,
    Clip = 7,
  }
  enum User_Permissions {
    print = 0b100,
    modify = 0b1000,
    extract = 0b10000,
    annotForm = 0b100000,

    fillForm = 0b100000000,
    extractAccess = 0b1000000000,
    assemble = 0b10000000000,
    printHigh = 0b100000000000,
  }
  enum Watermark_Flag {
    asContent = 0,
    asAnnot = 1,
    onTop = 2,
    unprintable = 4,

    display = 8,
  }
  enum ZoomMode {
    ZoomXYZ = 'ZoomXYZ',
    ZoomFitPage = 'ZoomFitPage',
    ZoomFitHorz = 'ZoomFitHorz',
    ZoomFitRect = 'ZoomFitRect',
  }

  enum Field_Flag {
    ReadOnly = 1,
    Required = 2,
    NoExport = 4,
    ButtonNoToggleToOff = 16384,

    ButtonRadiosInUnison = 33554432,
    TextMultiline = 4096,
    TextPassword = 8192,
    TextDoNotSpellCheck = 4194304,

    TextDoNotScroll = 8388608,
    TextComb = 16777216,
    ComboEdit = 262144,
    ChoiceMultiSelect = 2097152,

    CommitOnSelChange = 67108864,
  }
  enum Field_Type {
    Unknown = 0,
    PushButton = 1,
    CheckBox = 2,
    RadioButton = 3,

    Text = 6,
    ListBox = 5,
    ComboBox = 4,
    Sign = 7,

    Barcode = 8,
  }

  class PDFControl {
    getDefaultAppearance(): {
      textColor: number;
      textSize: number;
      fontName: string;
    };
    getField(): PDFField;
    getIndex(): Promise<number>;
    getWidgetAnnot(): Promise<Widget>;
    setDefaultAppearance(defaultAppearance: {
      fontName: string;
      textColor: number;
      textSize: number;
    }): Promise<void>;
  }

  class PDFField {
    getAlignment(): number;
    getAlternateName(): string;
    getBorderColor(): number;
    getBorderStyle(): string;
    getControlByIndex(index: number): PDFControl;
    getControlsCount(): number;
    getDAFontSize(): number;
    getFillColor(): number;
    getFlags(): number;
    getMappingName(): string;
    getMaxLength(): number;
    getName(): string;
    getOptions(): Array<{ label: string; value: string }>;
    getType(): number;
    getValue(): string;
    setAction(trigger: number, action: string | Action): Promise<void>;
    setAlignment(alignment: number): Promise<void>;
    setAlternateName(alternateName: string): void;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderStyle(style: string): Promise<void>;
    setFillColor(
      fillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<void>;
    setFlags(flags: number): void;
    setMappingName(mappingName: string): void;
    setMaxLength(maxLength: number): void;
    setOptions(
      options: Array<{
        label: string;
        value: string;
        selected: boolean;
        defaultSelected: boolean;
      }>
    ): Promise<void>;
    setValue(value: string, control: Annot): void;
  }

  class PDFForm {
    addControl(
      pageIndex: number,
      fieldName: string,
      fieldType: number,
      rect: PDFRect
    ): Promise<{ success: boolean; newFieldName: string }>;
    addSignature(
      pageIndex: number,
      rect: PDFRect,
      fieldName: string
    ): Promise<PDFField>;
    calculate(field: PDFField): void;
    getField(title: string): PDFField[];
    getFieldByIndex(index: number): PDFField;
    getFieldCount(): number;
    removeField(fieldName: string): Promise<boolean>;
    resetForm(fieldNames: string[], flags: number, source: PDFField): void;
  }

  class PDFSignature extends PDFField {
    getByteRange(): number[];
    getFilter(): string;
    getImage(): Promise<string | void>;
    getSignInfo(): Record<string, any>;
    getSubfilter(): string;
    isLast(): Promise<boolean>;
    isSigned(): boolean;
    getAlignment(): number;
    getAlternateName(): string;
    getBorderColor(): number;
    getBorderStyle(): string;
    getControlByIndex(index: number): PDFControl;
    getControlsCount(): number;
    getDAFontSize(): number;
    getFillColor(): number;
    getFlags(): number;
    getMappingName(): string;
    getMaxLength(): number;
    getName(): string;
    getOptions(): Array<{ label: string; value: string }>;
    getType(): number;
    getValue(): string;
    setAction(trigger: number, action: string | Action): Promise<void>;
    setAlignment(alignment: number): Promise<void>;
    setAlternateName(alternateName: string): void;
    setBorderColor(
      borderColor: number | [string, number, number, number] | string
    ): Promise<boolean>;
    setBorderStyle(style: string): Promise<void>;
    setFillColor(
      fillColor: number | ['T'] | [string, number, number, number] | string
    ): Promise<void>;
    setFlags(flags: number): void;
    setMappingName(mappingName: string): void;
    setMaxLength(maxLength: number): void;
    setOptions(
      options: Array<{
        label: string;
        value: string;
        selected: boolean;
        defaultSelected: boolean;
      }>
    ): Promise<void>;
    setValue(value: string, control: Annot): void;
  }

  class DocTextSearch {
    destroy(): void;
    findNext(): Promise<TextSearchMatch | null>;
    findPrev(): Promise<TextSearchMatch | null>;
    getId(): string;
    setCurrentPageIndex(index: number): void;
    setEndPageIndex(index: number): void;
    setStartPageIndex(index: number): void;
  }

  class PageTextSearch {
    destroy(): Promise<void>;
    findNext(): Promise<TextSearchMatch | null>;
    findPrev(): Promise<TextSearchMatch | null>;
  }

  class TextSearchMatch {
    getEndCharIndex(): number;
    getPageIndex(): number;
    getRects(): Array<{
      left: number;
      right: number;
      bottom: number;
      top: number;
    }>;
    getSentence(): string;
    getSentenceStartIndex(): number;
    getStartCharIndex(): number;
  }

  export interface TaskProgress<T extends TaskProgressData> {
    cancel(): void;
    getCurrentProgress(): number;
    onProgress(callback: (this: TaskProgress<T>, data: T) => void): () => void;
  }

  export interface TaskProgressData {
    percent: number;
  }

  class GraphicsObject {
    getBitmap(
      scale: number,
      rotation: number,
      type?: 'canvas' | 'image' | 'buffer'
    ): Promise<HTMLCanvasElement | HTMLImageElement | ArrayBuffer>;
    getBorderColor(): number;
    getBorderDashes(): number[];
    getBorderStyle(): number;
    getBorderWidth(): number;
    getDeviceMatrix(): Matrix;
    getFillColor(): number;
    getId(): string;
    getMatrix(): Matrix;
    getOpacity(): number;
    getPDFPage(): PDFPage;
    getRect(): PDFRect;
    getType(): number;
    moveToPosition(type: PosType, graphicObject: object): Promise<void>;
    setBorderColor(value: number): Promise<void>;
    setBorderStyle(value: number, dashes: number[]): Promise<void>;
    setBorderWidth(value: number): Promise<void>;
    setFillColor(value: number): Promise<void>;
    setMatrix(): Matrix;
    setOpacity(value: number): Promise<void>;
    setRect(rect: PDFRect): void;
  }

  class HeaderFooter {
    constructor(json?: object);

    enableFixedSizedForPrint(enable: boolean): void;
    enableTextShrinked(enable: boolean): void;
    getContent(position: string): void;
    getUnderline(): boolean;
    isEmpty(): boolean;
    setContentFormat(
      position: string,
      format: Array<{ type: string; value: any }>
    ): void;
    setFont(fontId: number): void;
    setMargin(rect: PDFRect): void;
    setRange(range: PageRange): void;
    setStartDisplayingPage(index: number): void;
    setTextColor(color: number): void;
    setTextSize(size: number): void;
    setUnderline(underline: boolean): void;
  }

  export interface ILayerNode {
    children: ILayerNode | [];
    hasLayer: boolean;
    id: string;
    isLocked: boolean;
    name: string;
    visible: boolean;
  }

  class ImageObject extends GraphicsObject {
    setRotation(rotation: number): Record<string, any>;
    getBitmap(
      scale: number,
      rotation: number,
      type?: 'canvas' | 'image' | 'buffer'
    ): Promise<HTMLCanvasElement | HTMLImageElement | ArrayBuffer>;
    getBorderColor(): number;
    getBorderDashes(): number[];
    getBorderStyle(): number;
    getBorderWidth(): number;
    getDeviceMatrix(): Matrix;
    getFillColor(): number;
    getId(): string;
    getMatrix(): Matrix;
    getOpacity(): number;
    getPDFPage(): PDFPage;
    getRect(): PDFRect;
    getType(): number;
    moveToPosition(type: PosType, graphicObject: object): Promise<void>;
    setBorderColor(value: number): Promise<void>;
    setBorderStyle(value: number, dashes: number[]): Promise<void>;
    setBorderWidth(value: number): Promise<void>;
    setFillColor(value: number): Promise<void>;
    setMatrix(): Matrix;
    setOpacity(value: number): Promise<void>;
    setRect(rect: PDFRect): void;
  }

  class Matrix {
    constructor(
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number
    );

    concat(
      a: number | Matrix | [number, number, number, number, number, number],
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
      bPrepended: boolean
    ): void;
    getA(): number;
    getAngle(): number;
    getB(): number;
    getC(): number;
    getD(): number;
    getE(): number;
    getF(): number;
    getUnitRect(): number[];
    getXUnit(): number;
    getYUnit(): number;
    is90Rotated(): void;
    isScaled(): void;
    matchRect(dest: number[], src: number[]): void;
    reset(): void;
    reverse(matrix: Matrix): Matrix;
    rotate(fRadian: number, bPrepended: boolean): void;
    rotateAt(
      dx: number,
      dy: number,
      fRadian: number,
      bPrepended: boolean
    ): void;
    scale(sx: number, sy: number, bPrepended: boolean): void;
    set(a: number, b: number, c: number, d: number, e: number, f: number): void;
    setReverse(matrix: Matrix): void;
    transformDistance(dx: number, dy: number): number;
    transformPoint(dx: number, dy: number): number[];
    transformRect(
      left: number,
      top: number,
      right: number,
      bottom: number
    ): number[];
    transformXDistance(dx: number): number;
    transformYDistance(dy: number): number;
    translate(x: number, y: number, bPrepended: boolean): void;
    static Concat2mt(matrix1: Matrix, matrix2: Matrix): Matrix;
  }

  class PathObject extends GraphicsObject {
    getFillMode(): number;
    getPathPoints(): Array<{ x: number; y: number }>;
    needStroke(): boolean;
    getBitmap(
      scale: number,
      rotation: number,
      type?: 'canvas' | 'image' | 'buffer'
    ): Promise<HTMLCanvasElement | HTMLImageElement | ArrayBuffer>;
    getBorderColor(): number;
    getBorderDashes(): number[];
    getBorderStyle(): number;
    getBorderWidth(): number;
    getDeviceMatrix(): Matrix;
    getFillColor(): number;
    getId(): string;
    getMatrix(): Matrix;
    getOpacity(): number;
    getPDFPage(): PDFPage;
    getRect(): PDFRect;
    getType(): number;
    moveToPosition(type: PosType, graphicObject: object): Promise<void>;
    setBorderColor(value: number): Promise<void>;
    setBorderStyle(value: number, dashes: number[]): Promise<void>;
    setBorderWidth(value: number): Promise<void>;
    setFillColor(value: number): Promise<void>;
    setMatrix(): Matrix;
    setOpacity(value: number): Promise<void>;
    setRect(rect: PDFRect): void;
  }

  class PDFDictionary {
    getAt(key: string): Promise<number | boolean | string>;
    hasKey(key: string): Promise<boolean>;
    setAt(key: string, value: number | boolean | string): Promise<boolean>;
  }

  class PDFDoc extends Disposable {
    addAnnot(pageIndex: number, annotJson: object): Promise<Annot[]>;
    addAnnotGroup(
      pageIndex: number,
      annotJsons: object,
      headerIndex: number
    ): Promise<Annot[]>;
    addAnnots(
      annotJsonArray: Array<{
        page: number;
        replies?: object[] | string[];
        states?: object[] | string[];
        groupElements?: object[];
        type?: Annot_Type;
        rect?: {
          left?: number;
          bottom?: number;
          right?: number;
          top?: number;
        };
        borderInfo?: {
          width?: number;
          style?: number;
          cloudIntensity?: number;
          dashPhase?: number;
          dashes?: number[];
        };
        alignment?: number;
        buffer?: Uint8Array;
        calloutLinePoints?: number[];
        calloutLineEndingStyle?: number;
        color?: string;
        contents?: string;
        coords?: Array<{
          left: number;
          top: number;
          right: number;
          bottom: number;
        }>;
        creationTimestamp?: number;
        date?: number;
        dicts?: object;
        defaultAppearance?: {
          textColor?: number;
          textSize?: number;
        };
        endCharIndex?: number;
        endPoint?: {
          x?: number;
          y?: number;
        };
        flags?: number;
        measure?: {
          unit?: string;
          ratio?: {
            userSpaceValue?: number;
            userSpaceUnit?: string;
            realValue?: number;
            realUnit?: string;
          };
        };
        endStyle?: Ending_Style;
        fileName?: string;
        contentType?: string;
        fillColor?: string;
        iconInfo?: {
          annotType?: string;
          category?: string;
          name?: string;
          fileType?: string;
          url?: string;
        };
        icon?: string;
        iconCategory?: string;
        inkList?: Array<{ x: number; y: number; type: 1 | 2 | 3 }>;
        intent?: string;
        multiBuffer?: Uint8Array;
        name?: string;
        noPopup?: boolean;
        opacity?: number;
        startCharIndex?: number;
        startStyle?: number;
        startPoint?: {
          x?: number;
          y?: number;
        };
        length?: number;
        styleFillColor?: string;
        subject?: string;
        title?: string;
        vertexes?: Array<{ x: number; y: number }>;
        rotation?: number;
        richText?: object[];
      }>
    ): Promise<Annot[]>;
    addEmbeddedFile(
      key: string,
      fileSpec: {
        name?: string;
        data: File | Blob | ArrayBuffer | TypedArray | DataView;
        description?: string;
        creationDate?: number;
        modificationDate?: number;
      }
    ): Promise<boolean>;
    addHeaderFooter(headerfooter: HeaderFooter): Promise<object>;
    addLayerGraphicObject(
      layerNodeId: string,
      pageIndex: number,
      graphicObjectIndex: number
    ): Promise<boolean>;
    addLayerNode(
      parentLayerId: string,
      options: {
        index: number;
        name: string;
        hasLayer: boolean;
      }
    ): Promise<ILayerNode>;
    addPagingSealSignature(info: Object): Promise<number>;
    addWatermark(watermarkConfig: {
      pageStart: number;
      pageEnd: number;
      type: 'text' | 'bitmap';
      text?: string;
      bitmap?: Uint8Array;
      absScale?: number;
      useRelativeScale?: boolean;
      isMultiline?: boolean;
      rowSpace?: number;
      columnSpace?: number;
      watermarkSettings: {
        position?: Position;
        offsetX?: number;
        offsetY?: number;
        flags: Watermark_Flag;
        scale?: number;
        rotation?: number;
        opacity?: number;
      };
      watermarkTextProperties?: {
        font?: Standard_Font | number;
        fontSize?: number;
        color?: number;
        fontStyle?: 'normal' | 'underline';
      };
    }): void;
    applyRedaction(): Promise<false | Array<Array<Annot>>>;
    checkPassword(password: string): Promise<number>;
    drmEncrypt(drmOptions: {
      isEncryptMetadata?: boolean;
      subFilter: string;
      cipher: number;
      keyLength: number;
      isOwner: boolean;
      userPermissions: number;
      fileId: string;
      initialKey: string;
      values?: object;
    }): void;
    exportAnnotsToFDF(fileType: number, annots?: Annot[]): Promise<Blob>;
    exportAnnotsToJSON(annots: Array<Annot>): Promise<IAnnotationSummary[]>;
    exportFormToFile(fileType: number): Promise<Blob>;
    extractPages(pageRange: number[][]): Promise<ArrayBuffer[]>;
    flatten(option: number): Promise<boolean[]>;
    getAllBoxesByPageIndex(index: number): Promise<{
      mediaBox: PDFRect; // Media Box for page boundary
      cropBox: PDFRect; // Crop Box for page boundary
      trimBox: PDFRect; // Trim Box for page boundary
      artBox: PDFRect; // Art Box for page boundary
      bleedBox: PDFRect; // Bleed Box for page boundary
      calcBox: PDFRect; // Content area of PDF page
      minWidth: number; // Minimum media box width of all pages
      minHeight: number; // Minimum media box height of all pages
      width: number; // Media box height of current page
      height: number; // Media box height of current page
    }>;
    getAllPagingSealSignatures(
      pagingSigObjNum?: number
    ): Promise<Array<number>>;
    getAnnots(): Promise<Annot[]>;
    getComparisonFilterCountSummary(): {
      Images: number;
      Formatting: number;
      Text: number;
      Annotation: number;
    };
    getEmbeddedFile(
      key: string
    ): Promise<{
      name: string;
      data: Blob;
      description: string;
      creationDate: number;
      modificationDate: number;
    }>;
    getEmbeddedFileNames(): string[];
    getFile(options?: { flags?: number; fileName?: string }): Promise<File>;
    getFontsInfo(): Promise<Array<Record<string, any>>>;
    getHeaderFooter(): Promise<HeaderFooter>;
    getId(): string;
    getInfo(): Promise<PDFDictionary>;
    getLayerNodesJson(): Promise<ILayerNode>;
    getMetadata(): Promise<object>;
    getPageAnnots(index: number): Promise<Annot[]>;
    getPageByIndex(index: number): Promise<PDFPage>;
    getPageCount(): number;
    getPageLabels(pageIndexes: number[]): Promise<string[]>;
    getPasswordType(): Promise<number>;
    getPDFForm(): PDFForm;
    getPermissions(): number;
    getStream(
      writeChunk: (options: {
        arrayBuffer: ArrayBuffer;
        offset: number;
        size: number;
      }) => void,
      flag: number
    ): Promise<number>;
    getText(pages: number[][]): TaskProgress<TaskProgressData>;
    getTextSearch(pattern: string, flags: number): DocTextSearch;
    getUserPermissions(): number;
    getWordCount(): Promise<number>;
    has3DAnnots(): Promise<boolean>;
    hasForm(): Promise<boolean>;
    hasOwnerPassword(): boolean;
    importAnnotsFromFDF(
      fdf: File | Blob | ArrayBuffer | TypedArray | DataView,
      escape?: boolean
    ): Promise<void>;
    importAnnotsFromJSON(annotsJson: IAnnotationSummary[]): Promise<void>;
    importFormFromFile(
      file: File | Blob | ArrayBuffer | TypedArray | DataView,
      format: File_Type,
      encoding?: string
    ): Promise<void>;
    insertBlankPages(
      pageRange: number[][],
      width: number,
      height: number
    ): Promise<PDFPage[]>;
    insertPage(
      pageIndex: number,
      width: number,
      height: number
    ): Promise<PDFPage>;
    insertPages(insertOptions: {
      destIndex: number;
      file: File | Blob | ArrayBuffer | TypedArray | DataView;
      password?: string;
      flags?: number;
      layerName?: string;
      startIndex: number;
      endIndex: number;
    }): Promise<PDFPage[]>;
    isCompareDoc(): boolean;
    isDocModified(): boolean;
    isLinearized(): Promise<boolean>;
    loadPDFForm(): Promise<PDFForm>;
    loadThumbnail(options: {
      pageIndex: number;
      scale?: number;
      rotation?: number;
      type?: 'canvas' | 'image' | 'buffer';
      width?: number;
      height?: number;
    }): Promise<HTMLCanvasElement | HTMLImageElement | ArrayBuffer>;
    makeRedactByPages(pages: number[]): Promise<Array<Annot>>;
    mergePDFDoc(options: {
      doc: PDFDoc;
      insertIndex?: number;
      pages?: number[];
      layerName?: string;
    }): Promise<void>;
    movePagesTo(pageRange: number[][], destIndex: number): Promise<string[]>;
    movePageTo(pageIndex: number, destIndex: number): Promise<boolean>;
    removeAllEmbeddedFiles(): Promise<boolean>;
    removeAllWatermarks(): Promise<boolean>;
    removeEmbeddedFileByName(name: string): Promise<boolean>;
    removeHeaderFooter(): Promise<void>;
    removeLayerGraphicObject(
      layerNodeId: string,
      pageIndex: number,
      graphicObjectIndex: number
    ): Promise<boolean>;
    removeLayerNode(layerNodeId: { string }): Promise<boolean>;
    removePage(pageIndex: number): Promise<boolean>;
    removePages(pageRange: string[][]): Promise<boolean>;
    removePagingSealSignature(info: Object): Promise<void>;
    removeSignature(fieldName: string): Promise<boolean>;
    rotatePages(pageRange: number[][], rotation: number): Promise<void>;
    searchText(
      pages: number[],
      words: string[],
      options?: { wholeWordsOnly?: boolean; caseSensitive?: boolean }
    ): object;
    setEmbeddedFile(
      key: string,
      fileSpec: {
        name?: string;
        data?: File | Blob | ArrayBuffer | TypedArray | DataView;
        description?: string;
        creationDate?: number;
        modificationDate?: number;
      }
    ): Promise<boolean>;
    setLayerNodeVisible(
      layerId: string | number,
      visiable: boolean
    ): Promise<boolean>;
    setMetadataValue(key: string, value: string): void;
    setPagesBox(options: {
      indexes: number[];
      width?: number;
      height?: number;
      offsetX?: number;
      offsetY?: number;
      boxes?: {
        cropBox?: PDFRect;
        artBox?: PDFRect;
        trimBox?: PDFRect;
        bleedBox?: PDFRect;
      };
      removeWhiteMargin?: boolean;
    }): Promise<void>;
    setPasswordAndPermission(
      userPassword: string,
      ownerPassword: string,
      permission?: number,
      cipher?: 'none' | 'rc4' | 'aes128' | 'aes256',
      isEncryptMetadata?: boolean
    ): Promise<boolean>;
    sign(
      signInfo: {
        filter: object;
        subfilter: object;
        pageIndex?: number | number[];
        rect?: PDFRect | PDFRect[];
        shareVDictType?: number | string;
        pagingSigConfig?: object;
        rotation?: 0 | 90 | 180 | 270;
        flag?: number;
        signer?: string;
        reason?: string;
        email?: string;
        distinguishName?: string;
        location?: string;
        text?: string;
        image?: string;
        defaultContentsLength?: number;
        fieldName?: string;
        signTime?: number;
        timeFormat?: {
          format?: string;
          timeZoneOptions?: {
            separator?: string;
            prefix?: string;
            showSpace?: boolean;
          };
        };
      },
      DigestSignHandler: (
        signInfo: Record<string, any>,
        plainContent: Blob
      ) => Promise<ArrayBuffer>
    ): Promise<ArrayBuffer>;
    updateHeaderFooter(headerFooter: HeaderFooter): Promise<void>;
    updatePagingSealSignature(info: Object): Promise<number>;
    verifySignature(
      field: PDFField,
      VerifyHandler: (
        signatureField: any,
        plainBuffer: any,
        signedData: any,
        hasDataOutOfScope: any
      ) => Promise<number>
    ): Signature_State;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class PDFPage {
    addAnnot(annotJson: {
      type: Annot_Type;
      rect: {
        left: number;
        bottom: number;
        right: number;
        top: number;
      };
      borderInfo?: {
        width?: number;
        style?: number;
        cloudIntensity?: number;
        dashPhase?: number;
        dashes?: number[];
      };
      alignment?: number;
      buffer?: Uint8Array;
      calloutLinePoints?: number[];
      calloutLineEndingStyle?: number;
      color?: string;
      contents?: string;
      coords?: Array<{
        left: number;
        top: number;
        right: number;
        bottom: number;
      }>;
      creationTimestamp?: number;
      date?: number;
      dicts?: object;
      defaultAppearance?: {
        textColor?: number;
        textSize?: number;
      };
      endCharIndex?: number;
      endPoint?: {
        x?: number;
        y?: number;
      };
      flags?: number;
      measure?: {
        unit?: string;
        ratio?: {
          userSpaceValue?: number;
          userSpaceUnit?: string;
          realValue?: number;
          realUnit?: string;
        };
      };
      endStyle?: Ending_Style;
      fileName?: string;
      contentType?: string;
      fillColor?: string;
      iconInfo?: {
        annotType?: string;
        category?: string;
        name?: string;
        fileType?: string;
        url?: string;
      };
      icon?: string;
      iconCategory?: string;
      inkList?: Array<{ x: number; y: number; type: 1 | 2 | 3 }>;
      intent?: string;
      multiBuffer?: Uint8Array;
      name?: string;
      noPopup?: boolean;
      opacity?: number;
      startCharIndex?: number;
      startStyle?: number;
      startPoint?: {
        x?: number;
        y?: number;
      };
      length?: number;
      styleFillColor?: string;
      subject?: string;
      title?: string;
      vertexes?: Array<{ x: number; y: number }>;
      rotation?: number;
      richText?: object[];
    }): Promise<Annot[]>;
    addAnnotGroup(
      annotJsons: Array<object>,
      headerIndex: number
    ): Promise<Annot[]>;
    addGraphicsObject(info: {
      type: Graphics_ObjectType;
      buffer?: ArrayBuffer;
      rect?: PDFRect;
      points?: Array<[string, number, number]>;
      borderWidth?: number;
      originPosition?: PDFPoint;
      charspace?: number;
      wordspace?: number;
      textmatrix?: [number, number, number, number];
      textmode?: number;
      font?: {
        standardId?: Font_StandardID;
        name?: string;
        styles?: Font_Styles;
        charset?: Font_Charset | Font_CIDCharset;
        weight?: number;
      };
      matrix?: [number, number, number, number, number, number];
      text?: string;
      fillColor?: number;
    }): Promise<void>;
    addImage(
      imageBuffer: ArrayBuffer,
      rect: PDFRect,
      rotation?: number
    ): Promise<ImageObject | undefined | null>;
    addWatermark(watermarkConfig: {
      type: 'text' | 'bitmap';
      text?: string;
      bitmap?: Uint8Array;
      useRelativeScale?: boolean;
      watermarkSettings: {
        position?: Position;
        offsetX?: number;
        offsetY?: number;
        flags: Watermark_Flag;
        scale?: number;
        rotation?: number;
        opacity?: number;
      };
      watermarkTextProperties?: {
        font?: Standard_Font;
        fontSize?: number;
        color?: number;
        fontStyle?: 'normal' | 'underline';
      };
    }): void;
    changeAnnotOrder(orderType: number, annot: Annot): Promise<void>;
    flatten(option: number): Promise<boolean>;
    getAllBoxes(): Promise<{
      mediaBox: PDFRect; // Media Box for page boundary
      cropBox: PDFRect; // Crop Box for page boundary
      trimBox: PDFRect; // Trim Box for page boundary
      artBox: PDFRect; // Art Box for page boundary
      bleedBox: PDFRect; // Bleed Box for page boundary
      calcBox: PDFRect; // Content area of PDF page, refer to
      minWidth: number; // Min width of all boxes
      minHeight: number; // Min height of all boxes
    }>;
    getAnnotCount(): number;
    getAnnotIdAtDevicePoint(
      point: [number, number],
      tolerance: number,
      matrix: Matrix
    ): Promise<string>;
    getAnnotObjectNumAtDevicePoint(
      point: [number, number],
      tolerance: number,
      matrix: Matrix
    ): Promise<number>;
    getAnnots(): Promise<Annot[]>;
    getAnnotsByIdArray(ids: string[]): Promise<Annot[]>;
    getAnnotsByObjectNumArray(objNums: number[]): Promise<Annot[]>;
    getAnnotTree(): Promise<Annot[]>;
    getBatchProcessor(): PDFPageBatchProcessor;
    getCharInfoAtPoint(
      point: [number, number],
      tolerance: number
    ): Promise<{
      charIndex: number;
      left: number;
      right: number;
      top: number;
      bottom: number;
    }>;
    getDeviceMatrix(rotate?: number): Matrix;
    getDevicePoint(
      point: [number, number],
      scale?: number,
      rotate?: number
    ): [number, number];
    getDeviceRect(
      pdfRect: PDFRect,
      scale?: number,
      rotate?: number
    ): DeviceRect;
    getDict(): Promise<PDFDictionary>;
    getGraphicsObjectAtPoint(
      point: [number, number],
      tolerance: number,
      type: Graphics_ObjectType
    ): Promise<GraphicsObject>;
    getGraphicsObjectByIndex(index: number): Promise<GraphicsObject>;
    getGraphicsObjectsByRect(options: {
      rect: PDFRect;
      tolerance: number;
      type: Graphics_ObjectType;
      isInRect?: boolean;
    }): Promise<GraphicsObject[]>;
    getGraphicsObjectsCount(): Promise<number>;
    getGraphicsObjectsInRect(
      rect: PDFRect,
      tolerance: number,
      type: Graphics_ObjectType
    ): Promise<GraphicsObject[]>;
    getHeight(): number;
    getIndex(): number;
    getMarkupAnnots(): Promise<Markup[]>;
    getMeasureScaleRatio(): Promise<{
      scale: number;
      ratio: number;
      ratioMap: Array<{ value: number; unit: string }>;
      unitName: string;
    }>;
    getPageBox(boxType: Box_Type): Promise<PDFRect>;
    getPDFDoc(): PDFDoc;
    getPDFMatrix(): Matrix;
    getRotation(): number;
    getRotationAngle(): number;
    getSnappedPoint(
      point: {
        x: number;
        y: number;
      },
      mode: SNAP_MODE
    ): Promise<{ x: number; y: number; type: SNAP_MODE }>;
    getTextContinuousRectsAtPoints(
      point1: [number, number],
      point2: [number, number],
      tolerance: number,
      start: number,
      end: number
    ): Promise<PDFRect[]>;
    getTextInRect(rect: PDFRect, type?: 0 | 1 | 2): Promise<object>;
    getTextRectsAtRect(rect: PDFRect): Promise<PDFRect[]>;
    getTextSearch(pattern: String, flags: Search_Flag): Promise<PageTextSearch>;
    getThumb(
      rotate: number
    ): Promise<{ buffer: Uint8Array; width: number; height: number }>;
    getViewportRect(): PDFRect;
    getWidth(): number;
    getWordCount(): Promise<number>;
    isCropped(): boolean;
    isVirtual(): boolean;
    markRedactAnnot(
      rects: Array<{ left: number; right: number; top: number; bottom: number }>
    ): Promise<Annot[]>;
    pasteAnnot(
      srcAnnot: Annot,
      position: { x: number; y: number }
    ): Promise<Annot[]>;
    removeAllAnnot(): Promise<Annot[]>;
    removeAnnotById(id: string): Promise<Array<Annot>>;
    removeAnnotByObjectNumber(objNum: number): Promise<Annot[]>;
    removeGraphicsObject(obj: GraphicsObject): Promise<void>;
    render(
      scale?: number,
      rotate?: number,
      area?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
      },
      contentsFlags?: string[],
      usage?: string
    ): Promise<{ width: number; height: number; buffer: ArrayBuffer }>;
    reverseDeviceOffset(
      offset: number[],
      scale?: number,
      rotate?: number
    ): number[];
    reverseDevicePoint(
      point: number[],
      scale?: number,
      rotate?: number
    ): number[];
    reverseDeviceRect(
      pdfRect: DeviceRect,
      scale?: number,
      rotate?: number
    ): PDFRect;
    setMeasureScaleRatio(
      storeInPage: boolean,
      unitName: string,
      ratio: string,
      scale: number
    ): Promise<Annot[]>;
    setPageSize(width: number, height: number): Promise<void>;
    setRotation(rotation: number): void;
  }

  class PDFPageBatchProcessor {
    end(): Promise<void>;
    flush(): Promise<void>;
    start(): Promise<void>;
  }

  class TextObject extends GraphicsObject {
    getFontInfo(): Record<string, any>;
    getFontSize(): number;
    getText(): string;
    isBold(): boolean;
    isItalic(): boolean;
    setBold(bold: boolean): void;
    setFontByName(
      name: string,
      styles: Font_Styles,
      charset: Font_Charset | Font_CIDCharset
    ): void;
    setFontSize(): number;
    setItalic(italic: boolean): void;
    setStandardFont(id: number): void;
    setText(char: string): void;
    getBitmap(
      scale: number,
      rotation: number,
      type?: 'canvas' | 'image' | 'buffer'
    ): Promise<HTMLCanvasElement | HTMLImageElement | ArrayBuffer>;
    getBorderColor(): number;
    getBorderDashes(): number[];
    getBorderStyle(): number;
    getBorderWidth(): number;
    getDeviceMatrix(): Matrix;
    getFillColor(): number;
    getId(): string;
    getMatrix(): Matrix;
    getOpacity(): number;
    getPDFPage(): PDFPage;
    getRect(): PDFRect;
    getType(): number;
    moveToPosition(type: PosType, graphicObject: object): Promise<void>;
    setBorderColor(value: number): Promise<void>;
    setBorderStyle(value: number, dashes: number[]): Promise<void>;
    setBorderWidth(value: number): Promise<void>;
    setFillColor(value: number): Promise<void>;
    setMatrix(): Matrix;
    setOpacity(value: number): Promise<void>;
    setRect(rect: PDFRect): void;
  }

  const isDesktop: boolean;
  const isMobile: boolean;
  const isTablet: boolean;

  class LoggerFactory {
    static setLogLevel(level: string): void;
    static toggleLogger(logOff: boolean): void;
  }
  enum Log_Levels {
    LEVEL_DEBUG,
    LEVEL_INFO,
    LEVEL_WARN,
    LEVEL_ERROR,
  }

  class Color {
    asArray(): [number, number, number, number];
    clone(): Color;
    isSameAs(other: Color): boolean;
    toCMYK(): { c: number; m: number; y: number; k: number };
    toHSL(): { h: number; s: number; l: number };
    toHSV(): { h: number; s: number; v: number };
    static fromARGB(argb: number): Color;
    static fromHSLA(h: number, s: number, l: number, a: number): Color;
    static fromRGB(rgb: number): Color;
    static fromRGBA(rgb: number, a: number): Color;
  }

  function getRanges(intervals: Array<[number, number] | number>): number[];

  function getUnitByName(unitName: string): Unit;

  function setThemeColor(
    colorInfo: Array<{
      dom: HTMLElement | string;
      colors: Object;
    }>
  ): void;

  export interface StampInfo {
    category: string;
    fileType: string;
    height: number;
    iconName: string;
    width: number;
  }

  export interface StampService {
    getCurrentStampInfo(): StampInfo | undefined;
    onSelectStampInfo(
      callback: (stampInfo: StampInfo | undefined) => void
    ): () => void;
  }

  class CreateAnnotAddon {
    constructor(pdfViewer: PDFViewer);

    init(options?: {
      showReplyDialog?: () => void;
      hideReplyDialog?: () => void;
      showPopup?: () => void;
      hidePopup?: () => void;
      showPropertiesDialog?: () => void;
      hidePropertiesDialog?: () => void;
      contextMenuIsEnable?: () => void;
    }): void;
  }

  class AddBookmarkEvent {
    bookmarkId: number;
    data: BookmarkData;
    options: AddBookmarkOptions;
  }

  export interface AddBookmarkOptions {
    color?: BookmarkTextColor;
    destId?: number;
    destination?: BookmarkDestination;
    relationship: BookmarkRelationship;
    style?: BookmarkFontStyle;
    title?: string;
  }

  export interface BookmarkData {
    children?: BookmarkData | [];
    color?: string;
    deep: number;
    hasChild: boolean;
    id: number;
    isBold: boolean;
    isItalic: boolean;
    left: number;
    page?: number;
    title: string;
    top: number;
    zoomFactor?: number;
    zoomMode?: BookmarkZoomMode;
  }

  class BookmarkDataService {
    addBookmark(options: AddBookmarkOptions): Promise<number | undefined>;
    cutBookmark(
      bookmarkNodeId: number,
      parentBookmarkNodeId: number | undefined
    ): void;
    deleteBookmark(destBookmarkNodeId: number): Promise<void>;
    getBookmarkChildren(
      bookmarkNodeId: number | undefined
    ): Promise<BookmarkData[]>;
    getBookmarkData(bookmarkNodeId: number): Promise<BookmarkData>;
    getDestination(): Promise<BookmarkDestination>;
    getFirstLevelBookmarks(): Promise<BookmarkData[]>;
    getParentBookmarkId(bookmarkNodeId: number): number | undefined;
    moveBookmark(
      srcBookmarkNodeId: number,
      srcParentBookmarkNodeId: number | undefined,
      destBookmarkNodeId: number | undefined,
      destParentBookmarkNodeId: number | undefined,
      relationship: BookmarkRelationship
    ): void;
    onBookmarkAdded(callback: (event: AddBookmarkEvent) => void): () => void;
    onBookmarkChildrenReloaded(
      callback: (
        parentBookmarkNodeId: number | undefined,
        children: BookmarkData[]
      ) => void
    ): () => void;
    onBookmarkDeleted(
      callback: (event: DeleteBookmarkEvent) => void
    ): () => void;
    onBookmarkMoved(callback: (event: MoveBookmarkEvent) => void): () => void;
    onBookmarkPropertiesUpdated(
      callback: (event: UpdateBookmarkPropertiesEvent) => void
    ): () => void;
    onPasteCutBookmark(
      callback: (info: PasteCutBookmarkInfo) => void
    ): () => void;
    pasteCutBookmark(
      destBookmarkId: number,
      destParentBookmarkId: number | undefined,
      relationship: BookmarkRelationship
    ): Promise<void>;
    performAction(bookmarkNodeId: number): Promise<void>;
    reloadBookmarkChildren(
      parentBookmarkNodeId: number | undefined
    ): Promise<void>;
    renameBookmark(bookmarkNodeId: number, newTitle: string): Promise<void>;
    setColor(bookmarkNodeId: number, newColor: BookmarkTextColor): void;
    setDestination(
      bookmarkNodeId: number,
      newDestination: BookmarkDestination | undefined
    ): Promise<void>;
    setFontStyle(bookmarkNodeId: number, style: BookmarkFontStyle): void;
  }

  export interface BookmarkProperties {
    color: BookmarkTextColor;
    destination: BookmarkDestination;
    style: BookmarkFontStyle;
    title: string;
  }

  class DeleteBookmarkEvent {
    bookmarkId: number;
    data: BookmarkData;
  }

  class MoveBookmarkEvent {
    destId: number;
    destParentId?: number;
    relationship: BookmarkRelationship;
    srcId: number;
    srcParentId?: number;
  }

  export interface PasteCutBookmarkInfo {
    destId: number;
    destParentId?: number;
    relationship: BookmarkRelationship;
    srcId: number;
    srcParentId?: number;
  }

  class UpdateBookmarkPropertiesEvent {
    bookmarkId: number;
    newProperties: BookmarkProperties;
    oldProperties: BookmarkProperties;
  }
  type BookmarkTextColor = number | [string, number, number | number] | string;

  export interface AddMarkedStateCollaborationData {
    action: COLLABORATION_ACTION;
    data: AddMarkedStateOperationData;
    fileId: string | [];
    version: number;
  }

  export interface AddMarkedStateOperationData {
    annotId: string;
    pageIndex: number;
    stateAnnotJSON: Object;
  }

  export interface AddReplyCollaborationData {
    action: COLLABORATION_ACTION;
    data: AddReplyOperationData;
    fileId: string | [];
    version: number;
  }

  export interface AddReplyOperationData {
    annotId: string;
    pageIndex: number;
    reply: Object;
  }

  export interface AddReviewStateCollaborationData {
    action: COLLABORATION_ACTION;
    data: AddReviewStateOperationData;
    fileId: string | [];
    version: number;
  }

  export interface AddReviewStateOperationData {
    annotId: string;
    pageIndex: number;
    stateAnnotJSON: Object;
  }

  export interface CollaborationCommunicator {
    connect(shareId: string): Promise<boolean>;
    createSession(doc: PDFDoc): Promise<string>;
    destroy(): void;
    disconnect(): Promise<boolean>;
    getLostData(
      shareId: string,
      fromVersion: number
    ): Promise<CollaborationData[]>;
    getSessionInfo(
      shareId: string
    ): Promise<CollaborationSessionInfo | undefined>;
    isConnected(): Promise<boolean>;
    registerLostConnectionListener(receiver: () => void): void;
    registerMessageReceiver(receiver: (data: string) => void): void;
    send(shareId: string, data: string): Promise<void>;
  }

  export interface CollaborationData {}

  export interface CollaborationDataHandler<CollaborationData> {
    accept(data: CollaborationData): Promise<boolean>;
    receive(
      data: CollaborationData,
      nextHandler: CollaborationDataHandler<CollaborationData>
    ): Promise<void>;
  }

  export interface CollaborationSessionInfo {
    openFileParams: Object;
    shareId: string;
  }

  export interface CreateAnnotationCollaborationData {
    action: COLLABORATION_ACTION;
    data: CreateAnnotationOperationData;
    fileId: string | [];
    version: number;
    string(): void;
  }

  export interface CreateAnnotationOperationData {
    annots: Object | [];
  }

  export interface ImportAnnotationsFileCollaborationData {
    action: COLLABORATION_ACTION;
    data: ImportAnnotationsFileOperationData;
    fileId: string | [];
    version: number;
  }

  export interface ImportAnnotationsFileOperationData {
    file: string;
  }

  export interface MoveAnnotsBetweenPageCollaborationData {
    action: COLLABORATION_ACTION;
    data: MoveAnnotsBetweenPageOperationData;
    fileId: string | [];
    version: number;
  }

  export interface MoveAnnotsBetweenPageOperationData {
    annots: Object;
    fromPageIndex: number;
    toPageIndex: number;
  }

  export interface PPOInsertPageCollaborationData {
    action: COLLABORATION_ACTION;
    data: PPOInsertPageOperationData;
    fileId: string | [];
    version: number;
  }

  export interface PPOInsertPageOperationData {
    height: number;
    pageIndex: number;
    width: number;
  }

  export interface PPOMovePageCollaborationData {
    action: COLLABORATION_ACTION;
    data: PPOMovePageOperationData;
    fileId: string | [];
    version: number;
  }

  export interface PPOMovePageOperationData {
    destIndex: number;
    sourceIndex: number;
  }

  export interface PPORemovePageCollaborationData {
    action: COLLABORATION_ACTION;
    data: PPORemovePageOperationData;
    fileId: string | [];
    version: number;
  }

  export interface PPORemovePageOperationData {
    pageIndex: number;
  }

  export interface PPORemovePagesCollaborationData {
    action: COLLABORATION_ACTION;
    data: PPORemovePagesOperationData;
  }

  export interface PPORemovePagesOperationData {
    pageRange: number | [][];
  }

  export interface PPORotatePageCollaborationData {
    action: COLLABORATION_ACTION;
    data: COLLABORATION_ACTION;
    fileId: string | [];
    version: number;
  }

  export interface PPORotatePageOperationData {
    angle: number;
    pageIndex: number;
  }

  export interface RemoveAnnotationCollaborationData {
    action: COLLABORATION_ACTION;
    data: Array<RemoveAnnotationOperationData>;
    fileId: string | [];
    version: number;
  }

  export interface RemoveAnnotationOperationData {
    annotId: string;
    pageIndex: number;
  }

  export interface RemoveReplyCollaborationData {
    action: COLLABORATION_ACTION;
    data: RemoveReplyOperationData;
    fileId: string | [];
    version: number;
  }

  export interface RemoveReplyOperationData {
    pageIndex: number;
    replyId: string;
  }

  export interface UpdateAnnotationCollaborationData {
    action: COLLABORATION_ACTION;
    data: UpdateAnnotationOperationData;
    version: number;
  }

  class UpdateAnnotationOperationData {
    annots: Object | [];
  }

  export interface UpdateAnnotContentCollaborationData {
    action: COLLABORATION_ACTION;
    data: UpdateAnnotContentOperationData;
    fileId: string | [];
    version: number;
  }

  export interface UpdateAnnotContentOperationData {
    annotId: string;
    content: string;
    pageIndex: number;
  }

  export interface UserCustomizeCollaborationData {
    action: string;
    data: Object;
    fileId: string | [];
    version: number;
  }

  class WebSocketCommunicator implements CollaborationCommunicator {
    connect(shareId: string): Promise<boolean>;
    disconnect(): Promise<boolean>;
    getLostData(
      shareId: string,
      fromVersion: number
    ): Promise<CollaborationData[]>;
    getSessionInfo(
      shareId: string
    ): Promise<CollaborationSessionInfo | undefined>;
    isConnected(): Promise<boolean>;
    send(shareId: string, data: string): Promise<void>;
    createSession(doc: PDFDoc): Promise<string>;
    destroy(): void;
    registerLostConnectionListener(receiver: () => void): void;
    registerMessageReceiver(receiver: (data: string) => void): void;
  }
  enum COLLABORATION_ACTION {
    CREATE_ANNOT = 'create-annots',
    REMOVE_ANNOT = 'remove-annots',
    UPDATE_ANNOT = 'update-annots',
    ADD_REPLY = 'add-reply',

    REMOVE_REPLY = 'remove-reply',
    ADD_REVIEW_STATE = 'add-review-state',
    ADD_MARKED_STATE = 'add-marked-state',
    UPDATE_ANNOT_CONTENT = 'update-comment-content',

    PPO_REMOVE_PAGE = 'ppo-remove-page',
    PPO_REMOVE_PAGES = 'ppo-remove-pages',
    PPO_INSERT_PAGE = 'ppo-insert-page',
    PPO_ROTATE_PAGE = 'ppo-rotate-page',

    PPO_MOVE_PAGE = 'ppo-move-page',
    MOVE_ANNOTS_BETWEEN_PAGES = 'move-annotations-between-pages',
    IMPORT_ANNOTATIONS_FILE = 'import-annotations-file',
  }

  class AnnotRender {
    getAnnot(): Annot;
    getComponent(): AnnotComponent;
  }

  class ViewerAnnotManager {
    getAnnotFlag(annot: Annot): AnnotFlag;
    registerMatchRule(
      matchRule: (
        pdfAnnot: Annot,
        annotComponent: AnnotComponent
      ) => undefined | (new <T extends AnnotComponent>() => Class<T>)
    ): Function;
    setViewerAnnotFlag(getAnnotFlagValue: (annot: Annot) => number): void;
    unRegisterMatchRule(
      matchRule: (
        pdfAnnot: Annot,
        annotComponent: AnnotComponent
      ) => undefined | (new <T extends AnnotComponent>() => Class<T>)
    ): void;
  }

  class PDFDocRender {
    disableDragToScroll(): void;
    enableDragToScroll(): void;
    getBoundingClientRects(): object[];
    getCurrentPageIndex(): number;
    getCurrentViewMode(): IViewMode | null;
    getHandlerDOM(): HTMLElement;
    getOffsetInfo(): Promise<{
      index: number;
      left: number;
      top: number;
      scale: number;
    }>;
    getPDFDoc(): PDFDoc;
    getRotation(): number;
    getScale(): Promise<number | 'fitWidth' | 'fitHeight'>;
    getUserPermission(): UserPermission;
    getViewMode(): IViewMode | undefined;
    getWatermarkConfig(): object | object[];
    goToPage(
      index: number,
      offset?: {
        x: number;
        y: number;
      },
      isPDFPoint?: boolean
    ): Promise<void>;
    renderPages(
      pageIndexes: number[],
      scale: number | 'fitWidth' | 'fitHeight'
    ): Promise<void>;
    setWatermarkConfig(
      watermarkConfig:
        | {
            type: 'text' | 'image';
            content: string;
            pageStart: number;
            pageEnd: number;
            isMultiline?: boolean;
            rowSpace?: number;
            columnSpace?: number;
            watermarkSettings?: {
              position?: Position;
              offsetX?: number;
              offsetY?: number;
              scaleX?: number;
              scaleY?: number;
              rotation?: number;
              opacity?: number;
            };
            watermarkTextProperties?: {
              font?: string;
              fontSize?: number;
              color?: string;
              fontStyle?: 'normal' | 'underline';
              lineSpace?: number;
              alignment?: 'left' | 'center' | 'right';
            };
          }
        | Array<{
            type: 'text' | 'image';
            content: string;
            pageStart: number;
            pageEnd: number;
            isMultiline?: boolean;
            rowSpace?: number;
            columnSpace?: number;
            watermarkSettings?: {
              position?: Position;
              offsetX?: number;
              offsetY?: number;
              scaleX?: number;
              scaleY?: number;
              rotation?: number;
              opacity?: number;
            };
            watermarkTextProperties?: {
              font?: string;
              fontSize?: number;
              color?: string;
              fontStyle?: 'normal' | 'underline';
              lineSpace?: number;
              alignment?: 'left' | 'center' | 'right';
            };
          }>
    ): void;
  }

  class PDFPageRender {
    getAnnotRender(name: string | number): AnnotRender | null;
    getHandlerDOM(): HTMLElement;
    getPDFDoc(): PDFDoc;
    getPDFPage(): Promise<PDFPage>;
    getScale(): number;
    getSnapshot(
      left: number,
      top: number,
      width: number,
      height: number
    ): Promise<Blob>;
    getWatermarkConfig(): object | object[];
    reverseDeviceRect(deviceRect: DeviceRect): Promise<PDFRect>;
    setWatermarkConfig(
      watermarkConfig: Record<string, any> | Array<Record<string, any>>
    ): void;
    transformPoint(options: {
      point: {
        x: number;
        y: number;
      };
      srcType: PagePointType;
      destType: PagePointType;
    }): Promise<{ x: number; y: number }>;
  }

  export interface HandStateHandlerConfig {
    enableAnnotationSelectionTool?: boolean;
    enablePasting?: boolean;
    enableTextSelectionTool?: boolean;
  }

  class IStateHandler {
    constructor(pdfViewer: PDFViewer);

    destroyDocHandler(): void;
    destroyPageHandler(): void;
    docHandler(pdfDocRender: PDFDocRender): void;
    out(): void;
    pageHandler(pdfPageRender: PDFPageRender): void;
    static getStateName(): string;
    static setParams(params: object, pdfViewer: PDFViewer): void;
  }

  export interface StampStateHandlerParams {
    category: string;
    fileType: string;
    height: number;
    name: string;
    showUrl: string;
    url: string;
    width: number;
  }

  class StateHandlerManager {
    get(name: string): new <T extends IStateHandler>(pdfViewer: PDFViewer) => T;
    getCurrentStates(): new <T extends IStateHandler>(
      pdfViewer: PDFViewer
    ) => T;
    getStateHandlerConfig(
      stateHandlerName: STATE_HANDLER_NAMES
    ): StateHandlerConfig | undefined;
    mergeStateHandlerConfig(
      stateHandlerName: STATE_HANDLER_NAMES,
      stateHandlerConfig: Partial<StateHandlerConfig>
    ): void;
    register(
      StateHandler: new <T extends IStateHandler>(pdfViewer: PDFViewer) => T
    ): void;
    setStateHandlerConfig(
      stateHandlerName: STATE_HANDLER_NAMES,
      stateHandlerConfig: StateHandlerConfig
    ): void;
    switchTo(
      name: string,
      params: StampStateHandlerParams | Record<string, string> | undefined
    ): void;
  }
  type StateHandlerConfig = HandStateHandlerConfig;

  export interface ActionCallback {
    alert(options: AlertOptions): number;
  }

  export interface AlertOptions {
    cMsg: string;
    cTitle: string;
    nIcon: number;
    nType: number;
  }

  export interface BlendColorResolverOptions {
    callBuiltin: BlendColorResolver;
    combinePixelsOptions: CombinePixelsOptions;
    pos: Object;
    sourceColor: Color;
    targetColor: Color;
  }

  export interface CombinePixelsOptions {
    backgroundColor: number;
    blendColorResolver: BlendColorResolver;
    showDiffColor: boolean;
    sourceDiffColor: DiffColor;
    sourceOpacity: number;
    targetDiffColor: DiffColor;
    targetOpacity: number;
  }

  export interface ImageData {
    buffer: Optional<ArrayBuffer>;
    data: Optional<Uint8ClampedArray>;
    height: number;
    width: number;
  }

  export interface OverlayComparisonOptions {
    combinePixelsOptions: Partial<CombinePixelsOptions>;
    sourceBitmap: ImageData;
    targetBitmap: ImageData;
    transformation: Partial<OverlayComparisonTransformationOptions>;
  }

  class OverlayComparisonOptionsService {
    extractAllOptions(): CombinePixelsOptions;
    onChange(
      type: CombinePixelsOptionsKey,
      callback: OnOptionChangeCallback
    ): () => void;
    setBlendColorResolver(blendColorResolver: BlendColorResolver): void;
    setShowDiffColor(showDiffColor: boolean): void;
    setSourceDiffColor(sourceDiffColor: DiffColor): void;
    setSourceOpacity(sourceOpacity: number): void;
    setTargetDiffColor(targetDiffColor: DiffColor): void;
    setTargetOpacity(targetOpacity: number): void;
  }

  class OverlayComparisonService {
    compareImageData(options: OverlayComparisonOptions): HTMLCanvasElement;
  }

  export interface OverlayComparisonTransformationOptions {
    rotate: number;
    translateX: number;
    translateY: number;
  }

  enum DiffColor {
    RED = 0xff0000,
    GREEN = 0x00ff00,
    BLUE = 0x0000ff,
    MAGENTA = 0xff00ff,

    YELLOW = 0xffff00,
    CYAN = 0x00ffff,
  }
  type BlendColorResolver = (
    options: BlendColorResolverOptions
  ) => number | Color;
  type CombinePixelsOptionsKey = keyof CombinePixelsOptions;
  type OnOptionChangeCallback = (
    newValue: CombinePixelsOptions[CombinePixelsOptionsKey]
  ) => void;

  enum ANNOTATION_PERMISSION {
    fully = 'fully',
    playable = 'playable',
    adjustable = 'adjustable',
    deletable = 'deletable',

    modifiable = 'modifiable',
    attachmentDownloadable = 'attachmentDownloadable',
    replyable = 'replyable',
    editable = 'editable',
  }
  enum MouseEventObjectType {
    annotation = 'annotation',
  }
  enum OPEN_FILE_TYPE {
    FROM_FILE = 'from-file',
    FROM_URL = 'from-url',
  }
  enum PagePointType {
    viewport = 'viewport',
    page = 'offset-page',
    pdf = 'pdf',
  }
  enum PROGRESS_STATUS {
    PROGRESSING = 'Progressing',
    SUCCESS = 'Success',
    FAIL = 'Fail',
  }
  enum SNAP_MODE {
    EndPoint = 'end-point',
    MidPoint = 'mid-point',
    IntersectionPoint = 'intersection-point',
    NearestPoint = 'nearest-point',
  }
  enum STATE_HANDLER_NAMES {
    STATE_HANDLER_HAND = 'hand',
    STATE_HANDLER_CREATE_CARET = 'createCaret',
    STATE_HANDLER_CREATE_ARROW = 'createArrow',
    STATE_HANDLER_CREATE_AREA_HIGHLIGHT = 'createAreaHighlight',
    STATE_HANDLER_CREATE_CIRCLE = 'createCircle',
    STATE_HANDLER_CREATE_FILE_ATTACHMENT = 'createFileAttachment',
    STATE_HANDLER_CREATE_HIGHLIGHT = 'createHighlight',
    STATE_HANDLER_CREATE_IMAGE = 'createImage',

    STATE_HANDLER_CREATE_LINK = 'createLink',
    STATE_HANDLER_CREATE_LINE = 'createLine',
    STATE_HANDLER_CREATE_DISTANCE = 'createDistance',
    STATE_HANDLER_CREATE_PERIMETER = 'createPerimeter',

    STATE_HANDLER_CREATE_AREA = 'createArea',
    STATE_HANDLER_CREATE_CIRCLE_AREA = 'createCircleArea',
    STATE_HANDLER_CREATE_PENCIL = 'createPencil',
    STATE_HANDLER_CREATE_POLYGON_CLOUD = 'createPolygonCloud',

    STATE_HANDLER_CREATE_POLYGON = 'createPolygon',
    STATE_HANDLER_CREATE_POLYLINE = 'createPolyline',
    STATE_HANDLER_CREATE_REPLACE = 'createReplace',
    STATE_HANDLER_CREATE_SQUARE = 'createSquare',

    STATE_HANDLER_CREATE_SQUIGGLY = 'createSquiggly',
    STATE_HANDLER_CREATE_STAMP = 'createStamp',
    STATE_HANDLER_CREATE_STRIKE_OUT = 'createStrikeOut',
    STATE_HANDLER_CREATE_TEXT = 'createText',

    STATE_HANDLER_CREATE_UNDERLINE = 'createUnderline',
    STATE_HANDLER_MARQUEE = 'marquee',
    STATE_HANDLER_ERASER = 'eraser',
    STATE_HANDLER_LOUPE = 'loupe',

    STATE_HANDLER_SELECT_TEXT_ANNOTATION = 'select-text-annotation',
    STATE_HANDLER_SELECT_TEXT_IMAGE = 'select-text-image',
    STATE_HANDLER_SELECT_ANNOTATION = 'select-annotation',
    STATE_HANDLER_CREATE_FREETEXT_BOX = 'createFreeTextBox',

    STATE_HANDLER_CREATE_FREETEXT_CALLOUT = 'createFreeTextCallout',
    STATE_HANDLER_CREATE_FREETEXT_TYPEWRITER = 'createFreeTextTypewriter',
    STATE_HANDLER_CREATE_FIELD_TEXT = 'CreateTextStateHandler',
    STATE_HANDLER_CREATE_FIELD_SIGNATURE = 'CreateSignStateHandler',

    STATE_HANDLER_CREATE_FIELD_PUSH_BUTTON = 'CreatePushButtonStateHandler',
    STATE_HANDLER_CREATE_FIELD_CHECK_BOX = 'CreateCheckBoxStateHandler',
    STATE_HANDLER_CREATE_RADIO_BUTTON = 'CreateRadioButtonStateHandler',
    STATE_HANDLER_CREATE_FIELD_COMBO_BOX = 'CreateComboBoxStateHandler',

    STATE_HANDLER_CREATE_FIELD_LIST_BOX = 'CreateListBoxStateHandler',
    STATE_HANDLER_CREATE_FIELD_DATE = 'CreateDateStateHandler',
    STATE_HANDLER_CREATE_FIELD_IMAGE = 'CreateImageStateHandler',
    STATE_HANDLER_SNAPSHOT_TOOL = 'snapshot-tool',
  }
  enum ViewerEvents {
    jrLicenseSuccess = 'jr-license-success',
    beforeOpenFile = 'before-open-file',
    beforeLoadPDFDoc = 'before-load-pdf-document',
    openFileSuccess = 'open-file-success',

    openFileFailed = 'open-file-failed',
    willCloseDocument = 'will-close-document',
    renderFileSuccess = 'render-file-success',
    renderFileFailed = 'render-file-error',

    beforeRenderPage = 'before-render-page',
    renderPageSuccess = 'render-page-success',
    zoomToSuccess = 'zoom-to-success',
    zoomToFailed = 'zoom-to-failed',

    startChangeViewMode = 'start-change-view-mode',
    changeViewModeSuccess = 'change-view-mode-success',
    changeViewModeFailed = 'change-view-mode-failed',
    pageLayoutRedraw = 'page-layout-redraw',
    copyTextSuccess = 'copy-text-success',
    copyTextFailed = 'copy-text-failed',
    tapPage = 'tap-page',
    tapAnnotation = 'tap-annotation',

    pressPage = 'press-page',
    pressAnnotation = 'press-annotation',
    rightClickPage = 'right-click-page',
    rightClickAnnotation = 'right-click-annotation',

    doubleTapPage = 'double-tap-page',
    doubleTapAnnotation = 'double-tap-annotation',
    activeAnnotationBefore = 'active-annotation-before',
    activeAnnotation = 'active-annotation',

    activeAnnotationAfter = 'active-annotation-after',
    activeMultipleAnnotations = 'active-multiple-annotations',
    unActiveAnnotation = 'unactive-annotation',
    updateActiveAnnotation = 'update-action-annotation',
    removeActiveAnnotationBefore = 'remove-action-annotation-before',
    removeActiveAnnotationSuccess = 'remove-action-annotation-success',
    removeActiveAnnotationFailed = 'remove-action-annotation-failed',
    switchStateHandler = 'switch-state-handler',
    pageNumberChange = 'page-number-change',
    afterDocumentRotation = 'after-document-rotation',
    snapModeChanged = 'snap-mode-changed',
    distanceAnnotCreationStart = 'distance-creation-start',
    updateDistanceAnnot = 'update-distance-annot',
    distanceAnnotCreationEnd = 'distance-creation-end',
    selectText = 'select-text',
    annotationPermissionChanged = 'annotation-premission-changed',
    mouseEnter = 'mouse-enter',
    mouseLeave = 'mouse-leave',
    focusOnControl = 'focus-on-control',
    eSignCnShowAuthPromote = 'eSignCnShowAuthPromote',
    tapField = 'tap-field',
    tapGraphicsObject = 'tap-graphics-object',
  }

  class Activatable {
    isActive: boolean;
    active(): void;
    unActive(): void;
    protected doActive(): void;
    protected doDeactive(): void;
  }

  export interface AnnotComponentConfig {
    enableDiagonally: boolean;
    enableFrame: boolean;
    moveable: boolean;
    resizable: boolean;
    rotatable: boolean;
  }

  export interface AnnotTooltip {
    hide(): void;
    show(clientX: number, clientY: number): void;
  }

  class CustomOptionsUpdater extends Disposable {
    updateGetAnnotComponentConfig(
      getAnnotComponentConfigCallback: (
        annotComponent: AnnotComponent,
        props: Array<String>
      ) => AnnotComponentConfig
    ): void;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  export interface MultimediaPlayer {
    destroy(): void;
    download(): void;
    init(data: Object): Promise<void>;
    isSupport(
      data: Object,
      fileName: string,
      buffer: ArrayBuffer
    ): Promise<boolean>;
    on(type: string, listener: (annot) => void): () => void;
    pause(): void;
    play(): void;
  }

  export interface OpenFileParameter {
    file: Blob;
    options: object;
    type: OPEN_FILE_TYPE;
  }

  class PDFDocRendering {
    destroy(): void;
    rendered(): void;
    rendering(): void;
  }

  class PDFPageRendering {
    destroy(): void;
    rendered(): void;
    rendering(): void;
  }

  class PDFViewerRendering {
    rendered(): void;
    rendering(): void;
  }

  export interface ProgressComponent {
    hide(): void;
    show(coverOn?: HTMLElement | Component): void;
    updateProgress(progress: number | Object, status: string): void;
  }

  export interface RegisterPrintHandlerCallback {}

  class ScrollWrap extends Disposable {
    getHeight(): number;
    getScrollHost(): Window | Document | HTMLElement | Element;
    getScrollLeft(): number;
    getScrollOffsetLeft(): number;
    getScrollOffsetTop(): number;
    getScrollTop(): number;
    getScrollX(): number;
    getScrollY(): number;
    getWidth(): number;
    scrollBy(x: number, y: number): void;
    scrollTo(x: number, y: number): void;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  export interface SubmitFormActionCallback {}

  class TextSelectionTool extends Disposable {
    copy(): Promise<void>;
    getSelectionInfo(): Promise<{
      text: string; // selected text
      page: PDFPage; // The page where the selected text is located
      rectArray: Array<{
        left: number;
        top: number;
        right: number;
        bottom: number;
        text: number;
      }>;
    }>;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class AnnotComponent extends Activatable {
    element: HTMLElement;
    isActive: boolean;
    getModel(): Annot;
    protected doActive(): void;
    protected doDeactive(): void;
    protected tapAnnot(): void;
    active(): void;
    unActive(): void;
  }

  class MarkupAnnotComponent extends AnnotComponent {
    element: HTMLElement;
    isActive: boolean;
    hideReplyDialog(): void;
    static getDefaultContextMenuConfig(): Record<string, any>;
    protected getContextMenuConfig(): void;
    protected hidePopup(): void;
    protected hidePropertiesDialog(): void;
    protected onDoubleTap(e: Object): boolean;
    protected showContextMenu(): void;
    protected showPopup(): void;
    protected showPropertiesDialog(): void;
    protected showReplyDialog(): void;
    getModel(): Annot;
    protected doActive(): void;
    protected doDeactive(): void;
    protected tapAnnot(): void;
    active(): void;
    unActive(): void;
  }

  abstract class AbstractPDFTextToSpeechSynthesis
    extends PDFTextToSpeechSynthesisTemplate
    implements PDFTextToSpeechSynthesis
  {
    status: PDFTextToSpeechSynthesisStatus;
    static extend(
      implementation: PDFTextToSpeechSynthesisTemplate
    ): PDFTextToSpeechSynthesis;
    pause(): void;
    play(
      utterances: IterableIterator<Promise<PDFTextToSpeechUtterance>>,
      options: ReadAloudOptions | undefined
    ): void;
    resume(): void;
    stop(): void;
    updateOptions(options: Partial<ReadAloudOptions>): void;
    protected doPause(): void;
    protected doResume(): void;
    protected doStop(): void;
    protected init(): void;
    protected onCurrentPlayingOptionsUpdated(): void;
    protected speakText(
      text: string,
      options: ReadAloudOptions | undefined
    ): Promise<void>;
  }

  export interface PDFTextToSpeechSynthesis {
    status: PDFTextToSpeechSynthesisStatus;
    pause(): void;
    play(
      utterances: IterableIterator<Promise<PDFTextToSpeechUtterance>>,
      options: ReadAloudOptions | undefined
    ): void;
    resume(): void;
    stop(): void;
    updateOptions(options: Partial<ReadAloudOptions>): void;
  }

  class PDFTextToSpeechSynthesisTemplate {
    protected doPause(): void;
    protected doResume(): void;
    protected doStop(): void;
    protected init(): void;
    protected onCurrentPlayingOptionsUpdated(): void;
    protected speakText(
      text: string,
      options: ReadAloudOptions | undefined
    ): Promise<void>;
  }

  export interface PDFTextToSpeechUtterance {
    pageIndex: number;
    rect: PDFRect;
    text: string;
  }

  export interface ReadAloudOptions {
    external: Record<string, any>;
    lang: string;
    pitch: number;
    rate: number;
    voice: string | SpeechSynthesisVoice;
    volume: number;
  }

  class ReadAloudService {
    onReadPageEnd(callback: (pageIndex: number) => void): () => void;
    onReadPageStart(callback: (pageIndex: number) => void): () => void;
    onStatusChange(
      callback: (status: PDFTextToSpeechSynthesisStatus) => void
    ): () => void;
    pause(): void;
    readPages(
      pageIndexes: number[],
      options: Partial<ReadAloudOptions>
    ): Promise<void>;
    readText(
      info: ReadAloudTextInformation,
      options: Partial<ReadAloudOptions>
    ): Promise<void>;
    resume(): void;
    setRate(rate: number): void;
    setSpeechSynthesis(speechSynthesis: PDFTextToSpeechSynthesis): void;
    setVolume(volume: number): void;
    get status(): void;
    stop(): void;
    supported(): boolean;
    updatePlayingOptions(options: Partial<ReadAloudOptions>): boolean;
  }

  export interface ReadAloudTextInformation {
    pageIndex: number;
    rect: PDFRect;
    text: string;
  }

  enum PDFTextToSpeechSynthesisStatus {
    playing = 'playing',
    paused = 'paused',
    stopped = 'stopped',
  }

  export interface CreateAnnotationService extends Disposable {
    prepare(pageRender: PDFPageRender): void;
  }

  class CreateFreeTextCalloutService
    extends Disposable
    implements CreateAnnotationService
  {
    complete(): Promise<Annot[]>;
    prepare(pageRender: PDFPageRender): void;
    start(point: DevicePoint): void;
    update(point: DevicePoint, options?: Record<string, any>): void;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class IndexedDBStorageDriver implements StorageDriver {
    isClosed: boolean;
    get<T>(context: StorageContext, key: string): Promise<T | null>;
    getAll(context: StorageContext): Promise<Record<string, any>>;
    onChange<T>(
      callback: (event: StorageDriverChangeEvent<T>) => void
    ): () => void;
    onRemove(callback: (event: StorageDriverRemoveEvent) => void): () => void;
    removeAll(context: StorageContext): Promise<void>;
    set<T>(context: StorageContext, key: string, value: T): Promise<void>;
    close(): Promise<void>;
    remove(context: StorageContext, key: string): Promise<void>;
  }

  class LocalStorageDriver implements StorageDriver {
    isClosed: boolean;
    get<T>(context: StorageContext, key: string): Promise<T | null>;
    onChange<T>(
      callback: (event: StorageDriverChangeEvent<T>) => void
    ): () => void;
    remove(context: StorageContext, key: string): Promise<void>;
    removeAll(context: StorageContext): Promise<void>;
    set<T>(context: StorageContext, key: string, value: T): Promise<void>;
    close(): Promise<void>;
    getAll(context: StorageContext): Promise<Record<string, any>>;
    onRemove(callback: (event: StorageDriverRemoveEvent) => void): () => void;
  }

  export interface PDFViewerStorageContext extends StorageContext {
    pdfViewer: PDFViewer;
  }

  export interface StorageContext {
    feature: string;
    id: String;
  }

  export interface StorageDriver {
    isClosed: boolean;
    close(): Promise<void>;
    get<T>(context: StorageContext, key: string): Promise<T | null>;
    getAll(context: StorageContext): Promise<Record<string, any>>;
    onChange<T>(
      callback: (event: StorageDriverChangeEvent<T>) => void
    ): () => void;
    onRemove(callback: (event: StorageDriverRemoveEvent) => void): () => void;
    remove(context: StorageContext, key: string): Promise<void>;
    removeAll(context: StorageContext): Promise<void>;
    set<T>(context: StorageContext, key: string, value: T): Promise<void>;
  }

  export interface StorageDriverChangeEvent<T> {
    context: StorageContext;
    key: string;
    newValue?: T;
    oldValue?: T;
  }

  export interface StorageDriverRemoveEvent {
    context: StorageContext;
    key?: string;
  }

  enum StorageFeature {
    MEASUREMENT = 'measurement',
    STAMP = 'stamp',
  }

  class IContextMenu {
    destroy(): void;
    disable(): void;
    enable(): void;
    getCurrentTarget(): any;
    setCurrentTarget(target: any): void;
    showAt(pageX: number, pageY: number): boolean;
  }

  class IFloatingTooltip extends Disposable {
    destroy(): void;
    disable(): void;
    enable(): void;
    hide(): void;
    showAt(
      pageX: number,
      pageY: number,
      text: string,
      rects: Array<{ left: number; right: number; top: number; bottom: number }>
    ): void;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class IViewerUI {
    alert(message: string): Promise<void>;
    confirm(message: string): Promise<void>;
    createContextMenu(
      key: any,
      anchor: HTMLElement,
      config: {
        selector: string;
        items: Array<{ nameI18nKey: string }>;
      }
    ): IContextMenu | undefined;
    createTextSelectionTooltip(pageRender: PDFPageRender): IFloatingTooltip;
    destroy(): void;
    loading(coverOn: HTMLElement): Function;
    prompt(
      defaultValue: string,
      message: string,
      title: string
    ): Promise<string>;
    promptPassword(
      defaultValue: string,
      message: string,
      title: string
    ): Promise<string>;
  }

  class TinyViewerUI extends IViewerUI {
    alert(message: string): Promise<void>;
    confirm(message: string): Promise<void>;
    createContextMenu(
      key: any,
      anchor: HTMLElement,
      config: {
        selector: string;
        items: Array<{ nameI18nKey: string }>;
      }
    ): IContextMenu | undefined;
    createTextSelectionTooltip(pageRender: PDFPageRender): IFloatingTooltip;
    destroy(): void;
    loading(coverOn: HTMLElement): Function;
    prompt(
      defaultValue: string,
      message: string,
      title: string
    ): Promise<string>;
    promptPassword(
      defaultValue: string,
      message: string,
      title: string
    ): Promise<string>;
  }

  class IViewMode {
    constructor(docRender: PDFDocRender);

    getCurrentPageIndex(): number;
    getFitHeight(index: number): number | Promise<number>;
    getFitWidth(index: number): number | Promise<number>;
    getNextPageIndex(): number;
    getPrevPageIndex(): number;
    getVisibleIndexes(): number[];
    into(pageContainer: HTMLElement, pageDOMs: Array<HTMLElement>): void;
    jumpToPage(
      index: number,
      offset: {
        x: number;
        y: number;
      }
    ): void;
    out(): void;
    renderViewMode(
      pageRender: PDFPageRender,
      scale: number,
      rotate: number,
      width: number,
      height: number
    ): void;
    static getName(): string;
  }

  class ViewModeManager {
    get(name: string): new <T extends IViewMode>(pdfViewer: PDFViewer) => T;
    getAll(): object;
    getCurrentViewMode(): new <T extends IViewMode>(pdfViewer: PDFViewer) => T;
    register(
      ViewMode: IViewMode
    ): new <T extends IViewMode>(pdfViewer: PDFViewer) => T;
    set(): void;
    switchTo(name: string): void;
  }

  class ActionCallbackManager {
    setEmbeddedGotoCallback(
      callback: (EmbeddedGotoAction) => Promise<void>
    ): void;
  }

  class ActivationGroup {
    add(): void;
    clear(): void;
    contains(): boolean;
    remove(): void;
  }

  class AnnotationAuthorityManager extends Disposable {
    getPermission(annot: Annot): Promise<AnnotationPermission>;
    setAnnotPermissionCallback(
      getAnnotPermissionsCallback: GetAnnotPermissionsCallback
    ): void;
    subscribe(
      annot: Annot,
      callback: (permission: AnnotationPermission, annot: Annot) => void
    ): () => void;
    update(annot: Annot): Promise<void>;
    updateAll(): Promise<void>;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class AnnotationPermission {
    has(permissionType: ANNOTATION_PERMISSION | string): boolean;
    ignorable(): boolean;
    isAdjustable(): boolean;
    isAttachmentDownloadable(): boolean;
    isDeletable(): boolean;
    isEditable(): boolean;
    isModifiable(): boolean;
    isPlayable(): boolean;
    isRedactionApplicable(): boolean;
    isReplyable(): boolean;
  }

  class Disposable {
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class DivScrollWrap extends ScrollWrap {
    static create(
      wrapperElement: HTMLElement
    ): new (viewerRender: any, scrollHost: HTMLElement) => DivScrollWrap;
    getHeight(): number;
    getScrollHost(): Window | Document | HTMLElement | Element;
    getScrollLeft(): number;
    getScrollOffsetLeft(): number;
    getScrollOffsetTop(): number;
    getScrollTop(): number;
    getScrollX(): number;
    getScrollY(): number;
    getWidth(): number;
    scrollBy(x: number, y: number): void;
    scrollTo(x: number, y: number): void;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class PDFViewer extends Disposable {
    constructor(options: {
      jr: {
        licenseKey?: string;
        licenseSN?: string;
        l?: string;
        workerPath?: string;
        enginePath?: string;
        fontPath?: string;
        fontInfoPath?: string;
        readBlock?: number;
        brotli?: {
          core?: boolean;
        };
      };
      preloadJR?: boolean;
      libPath?: string;
      minScale?: number;
      maxScale?: number;
      defaultScale?: number | string;
      scaleFrequency?: number;
      tileSize?: number;
      tileCache?: boolean | number;
      getTileSize?: Function;
      annotRenderingMode?: object;
      i18n?: typeof i18next;
      i18nOptions?: {
        initOption?: object;
        path?: string;
      };
      eventEmitter?: EventEmitter;
      Viewmodes?: Array<new (pdfDocRender: PDFDocRender) => IViewMode>;
      defaultViewMode?: string;
      defaultAnnotConfig?: Function;
      customs?: {
        closeDocBefore?: Function;
        closeDocAfter?: Function;
        getDocPermissions?: Function;
        getAdditionalPerm?: Function;
        getAnnotPermissions?: Function;
        ScrollWrap?: new (...args: any[]) => ScrollWrap;
        PDFViewerRendering?: PDFViewerRendering;
        PDFDocRendering?: PDFDocRendering;
        PDFPageRendering?: PDFPageRendering;
        AnnotTooltip?: AnnotTooltip;
        beforeRenderPDFDoc?: (pdfDoc: PDFDoc) => Promise<void>;
        getAnnotComponentConfig?: (
          annotComponent: AnnotComponent,
          props: Array<String>
        ) => object;
        storageDriver?: StorageDriver;
        syncTextScaling?: boolean;
      };
      StateHandlers?: IStateHandler[];
      enableShortcutKey?: boolean;
      noJSFrame?: boolean;
      showCommentList?: boolean;
      showAnnotTooltip?: boolean;
      showFormFieldTooltip?: boolean;
      collaboration?: {
        enable?: boolean;
        communicator?: CollaborationCommunicator;
        continueToConnect?: (retryTimes: number, shareId: string) => boolean;
      };
      viewerUI?: IViewerUI;
      snapshotServer?: SnapshotServer;
      showMeasurementInfoPanel?: boolean;
      instanceId?: String;
      messageSyncServiceWorker?: {
        registration?: Promise<ServiceWorkerRegistration>;
        url?: string;
        options?: RegistrationOptions;
      };
    });

    element: HTMLElement;
    i18n: typeof i18next;
    activateAnnotation(options: Object): void;
    activateElement(element: Activatable): void;
    addAnnotationIcon(icon: {
      fileType?: string;
      url?: string;
      annotType?: string;
      category?: string;
      name?: string;
      width?: number;
      height?: number;
    }): Promise<void>;
    addFontMaps(
      fontMaps: Array<object>,
      fontMap: {
        name: string;
        style: number;
        charset: number;
      }
    ): void;
    close(before?: Function, after?: Function): Promise<void>;
    compareDocuments(
      baseDocId: string,
      otherDocId: string,
      params: {
        basePageRange: ComparePageRange;
        otherPageRange: ComparePageRange;
        baseFileName?: string;
        otherFileName?: string;
        resultFileName?: string;
        options?: {
          textOnly?: boolean;
          detectPage?: boolean;
          compareTable?: boolean;
          markingColor?: MarkingColorValues;
          lineThickness?: LineThicknessValues;
          opacity?: OpacityValues;
        };
      },
      onprogress: (currentRate: number) => void
    ): Promise<PDFDoc>;
    convertClientCoordToPDFCoord(
      clientX: number,
      clientY: number
    ): Promise<{
      index: number;
      left: number;
      top: number;
      scale: number;
      rotation: number;
    } | null>;
    convertImageToPDFDoc(
      file: File | Blob | ArrayBuffer,
      url: string,
      title: string,
      author: string,
      options?: object,
      pdfEngine?: any
    ): Promise<PDFDoc>;
    copyAnnots(annots: Array<Annot>): object[];
    copySnapshot(dataURL: string): Promise<boolean>;
    createNewDoc(
      title: string,
      author: string,
      pageSize?: { height: number; width: number },
      options?: {
        isRenderOnDocLoaded?: boolean;
      },
      pdfEngine?: any
    ): Promise<PDFDoc>;
    deactivateElement(element: Activatable): void;
    getActionCallbackManager(): ActionCallbackManager;
    getAllActivatedElements(): Activatable[];
    getAnnotAuthorityManager(): AnnotationAuthorityManager;
    getAnnotManager(): ViewerAnnotManager;
    getAnnotRender(
      pageIndex: number,
      name: string | number
    ): AnnotRender | null;
    getBookmarkDataService(): BookmarkDataService;
    getCurrentPDFDoc(): PDFDoc | null;
    getCustomOptionsUpdater(): CustomOptionsUpdater;
    getDefaultAnnotConfig(): (type: string, intent: string) => object;
    getEnableJS(): boolean;
    getEventEmitter(): EventEmitter;
    getFormHighlightColor(): { color: number; colorRequired: number };
    getInkSignList(type: string): object[];
    getInstanceId(): string | undefined;
    getOverlayComparisonOptionsService(): OverlayComparisonOptionsService;
    getOverlayComparisonService(): OverlayComparisonService;
    getPDFDocFromImageFile(): void;
    getPDFDocRender(): PDFDocRender | null;
    getPDFPageRender(index: number): PDFPageRender | null;
    getReadAloudService(): ReadAloudService;
    getRotation(): number;
    getScrollWrap(): ScrollWrap;
    getSnapMode(stateHandlerName: string): SNAP_MODE[];
    getStateHandlerManager(): StateHandlerManager;
    getViewModeManager(): ViewModeManager;
    highlightForm(highlight: boolean): void;
    init(selector: string | HTMLElement): void;
    initAnnotationIcons(
      icons: Array<{
        annotType?: string;
        category: string;
        name: string;
        fileType: string;
        url: string;
        width?: number;
        height?: number;
      }>
    ): Promise<void>;
    isLoad3DModuleEnabled(): boolean;
    isShortcutKeyEnabled(): boolean;
    killFocus(): Promise<boolean>;
    loadPDFDocByFile(
      file: File | Blob | ArrayBuffer | TypedArray | DataView,
      options: {
        password?: string;
        encryptPassword?: string;
        fileName?: string;
        readBlock?: number;
        errorHandler?: (
          doc: PDFDoc,
          options: object,
          error: any | undefined,
          retry: (options: object) => Promise<PDFDoc | undefined>
        ) => Promise<PDFDoc | undefined>;
        drm?: {
          isEncryptMetadata?: boolean;
          subFilter?: string;
          cipher?: number;
          keyLength?: number;
          isOwner?: boolean;
          userPermissions?: number;
          fileId?: string;
          initialKey?: string;
        };
        fileOpen?: {
          encryptKey?: string[];
          cipher?: Cipher_Type[];
        };
        jwt?: Function;
      }
    ): Promise<PDFDoc | undefined>;
    loadPDFDocByHttpRangeRequest(
      request: {
        range: {
          url: string;
          type?: number;
          user?: number;
          password?: number;
          headers?: object;
          chunkSize?: number;
          extendOptions?: string;
        };
        size?: number;
      },
      options: {
        password?: string;
        encryptPassword?: string;
        fileName?: string;
        readBlock?: number;
        errorHandler?: (
          doc: PDFDoc,
          options: object,
          error: any | undefined,
          retry: (options: object) => Promise<PDFDoc | undefined>
        ) => Promise<PDFDoc | undefined>;
        drm?: {
          isEncryptMetadata?: boolean;
          subFilter?: string;
          cipher?: number;
          keyLength?: number;
          isOwner?: boolean;
          userPermissions?: number;
          fileId?: string;
          initialKey?: string;
        };
        fileOpen?: {
          encryptKey?: string[];
          cipher?: Cipher_Type[];
        };
        jwt?: Function;
      }
    ): Promise<PDFDoc | undefined>;
    offShortcutKey(shortcut: string, handler?: Function | object): void;
    onShortcutKey(
      shortcut: string,
      handler: Function | object,
      preventDefaultImplementation?: boolean
    ): void;
    openPDFByFile(
      file: File | Blob | ArrayBuffer | TypedArray | DataView,
      options?: {
        isRenderOnDocLoaded?: boolean;
        beforeRenderPDFDoc?: (pdfDoc: PDFDoc) => Promise<void>;
        password?: string;
        encryptPassword?: string;
        fileName?: string;
        readBlock?: number;
        annotsJson?: Record<string, any>;
        fdf?: {
          file?: File | Blob | ArrayBuffer | TypedArray | DataView;
          type?: number;
        };
        drm?: {
          isEncryptMetadata?: boolean;
          subFilter?: string;
          cipher?: number;
          keyLength?: number;
          isOwner?: boolean;
          userPermissions?: number;
          fileId?: string;
          initialKey?: string;
        };
        fileOpen?: {
          encryptKey?: string[];
          cipher?: Cipher_Type[];
        };
        jwt?: Function;
      }
    ): Promise<PDFDoc>;
    openPDFByHttpRangeRequest(
      request: {
        range: {
          url: string;
          type?: number;
          user?: number;
          password?: number;
          headers?: object;
          chunkSize?: number;
          extendOptions?: string;
        };
        size?: number;
      },
      options?: {
        isRenderOnDocLoaded?: boolean;
        beforeRenderPDFDoc?: (pdfDoc: PDFDoc) => Promise<void>;
        password?: string;
        encryptPassword?: string;
        fileName?: string;
        readBlock?: number;
        annotsJson?: object;
        fdf?: {
          file?: File | Blob | ArrayBuffer | TypedArray | DataView;
          type?: number;
        };
        drm?: {
          isEncryptMetadata?: boolean;
          subFilter?: string;
          cipher?: number;
          keyLength?: number;
          isOwner?: boolean;
          userPermissions?: number;
          fileId?: string;
          initialKey?: string;
        };
        fileOpen?: {
          encryptKey?: number[];
          cipher?: string[];
        };
        jwt?: Function;
      }
    ): Promise<PDFDoc>;
    openPDFById(
      id: string,
      options: {
        isRenderOnDocLoaded?: boolean;
        password?: string;
        fileName?: string;
        jwt?: Function;
      }
    ): Promise<PDFDoc>;
    pasteAnnots(datas: object[]): Promise<Array<Annot>>;
    print(
      options: {
        pages: Array<
          | number
          | {
              pageIndex: number;
              rect?: { x: number; y: number; width: number; height: number };
            }
        >;
        printType: string[];
        progress: ProgressComponent | boolean;
        quality: number;
        showHeaderFooter: boolean;
      },
      callback: (
        data:
          | { state: 'start' }
          | {
              state: 'progress';
              pageIndex: number;
              total: number;
              imageURI: string;
            }
          | { state: 'end'; result: { [pageIndex: number]: string } }
      ) => void
    ): Promise<void>;
    printCurrentView(): Promise<void>;
    printEx(
      options: {
        type: number;
        pageRange: string;
        progress: ProgressComponent | boolean;
      },
      callback: (
        data:
          | { state: 'start' }
          | { state: 'progress'; progress: number }
          | { state: 'end' }
      ) => void
    ): Promise<void>;
    redraw(force?: boolean): Promise<void>;
    registerMultimediaPlayers(multimediaPlayers: Array<MultimediaPlayer>): void;
    registerPrintHandler(handler: RegisterPrintHandlerCallback): void;
    registerProgressHandler(
      callback: (taskType, progress, status) => void
    ): void;
    registerSignatureHandler(
      filter: string,
      subfilter: string,
      handler: {
        sign?: string;
        verify?: string;
      }
    ): void;
    removeAnnotationIcon(
      type: string,
      category: string,
      name: string
    ): Promise<void>;
    renderDoc(pdfDoc: PDFDoc, scale: number | string): Promise<boolean>;
    reopenPDFDoc(
      pdfDoc: PDFDoc,
      options?: {
        isRenderOnDocLoaded?: boolean;
        beforeRenderPDFDoc?: (pdfDoc: PDFDoc) => Promise<void>;
        password?: string;
        encryptPassword?: string;
        fileName?: string;
        annotsJson?: object;
        fdf?: {
          file?: File | Blob | ArrayBuffer | TypedArray | DataView;
          type?: number;
        };
        jwt?: Function;
        drm?: {
          isEncryptMetadata?: boolean;
          subFilter?: string;
          cipher?: number;
          keyLength?: number;
          isOwner?: boolean;
          userPermissions?: number;
          fileId?: string;
          initialKey?: string;
        };
        fileOpen?: {
          encryptKey?: number[];
          cipher?: string[];
        };
      }
    ): Promise<PDFDoc>;
    rotateTo(
      degree: number,
      options?: {
        pageIndex: number;
        offsetX: number;
        offsetY: number;
      }
    ): Promise<void>;
    setActionCallback(
      ActionCallbackClass: new (app: any) => ActionCallback
    ): void;
    setAutoCalculateFieldsFlag(autoCalculate: boolean): void;
    setDefaultAnnotConfig(fn: (type: string, intent: string) => object): void;
    setDefaultPrintSetting(printSetting?: {
      showHeaderFooter?: boolean;
      quality?: number;
    }): void;
    setDocReadColors(colors: object): void;
    setEnableJS(enable: boolean): void;
    setEnableLoad3DModule(enable: boolean): void;
    setEnableShortcutKey(enable: boolean): void;
    setEraserSize(width: number): void;
    setFormatOfDynamicStamp(sperator: string, timeFormat: string): void;
    setFormCreationContinuously(isContinuous: boolean): void;
    setFormFieldFocusRectangleVisible(isVisible: boolean): void;
    setFormHighlightColor(color: number, requiredColor?: number): void;
    setInkSignList(inkSignList: object[]): void;
    setJRFontMap(fontMaps: FontMap[]): void;
    setPencilDrawingTimeOut(millseconds: number): void;
    setSnapMode(stateHandlerName: string, mode: SNAP_MODE): void;
    setUserName(userName: string): Promise<void>;
    takeSnapshot(
      pageIndex: number,
      left: number,
      top: number,
      width: number,
      height: number
    ): Promise<Blob>;
    uploadImage(blob: Blob): Promise<string>;
    zoomAtPosition(
      scale: number,
      fixedPosition: {
        pageIndex?: number;
        x: number;
        y: number;
      }
    ): Promise<void>;
    zoomTo(
      scale: number | 'fitWidth' | 'fitHeight',
      position?: {
        pageIndex: number;
        x: number;
        y: number;
      }
    ): Promise<void>;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class SnapshotServer {
    constructor(
      render: (responseText: string) => string,
      payloadFieldName: string,
      origin: string,
      uploadSnapshotAPIPath: string,
      method?: string
    );

    uploadImage(blob: Blob): Promise<string>;
  }

  class UserPermission {
    constructor(permissions: number);

    checkAnnotForm(): number;
    checkAssemble(): number;
    checkCannotModifyAny(): boolean;
    checkCannotModifyExcludeAssemble(): boolean;
    checkExtract(): number;
    checkExtractAccess(): number;
    checkFillForm(): number;
    checkModify(): number;
    checkPrint(): number;
    checkPrintHigh(): number;
    getValue(): number;
    or(permissions: number): UserPermission;
    putCannotModifyAny(): UserPermission;
    putCannotModifyExcludeAssemble(): UserPermission;
  }
  type GetAnnotPermissionsCallback = (
    annot: Annot
  ) => Promise<string[] | null | undefined>;

  class FindReplaceAddon {
    activate(): Promise<void>;
    clearCache(): void;
    deactivate(): Promise<void>;
    find(
      find: string,
      options?: Object
    ): Promise<{
      isFound: boolean;
      pageIndex: number;
      rectArray: Array<{
        left: number;
        right: number;
        top: number;
        bottom: number;
      }>;
    }>;
    replace(find: string, replace: string, options?: Object): Promise<void>;
    replaceAll(
      find: string,
      replace: string,
      options?: Object
    ): Promise<number>;
    setNeedToReplace(
      callback: (
        find: string,
        replace: string,
        pageIndex: number,
        rectArray: Array<{
          left: number;
          right: number;
          top: number;
          bottom: number;
        }>
      ) => Promise<boolean>
    ): void;
  }

  class FindReplaceController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AddImageAdvController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AddShapesController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AddTextController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class EditObjectController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class EditTextController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  export interface ImageGraphicObject extends PageGraphicsObject {
    type: string;
    setProperties(
      properties: Partial<ImageGraphicObjectProperties>
    ): Promise<void>;
  }

  export interface ImageGraphicObjectProperties
    extends PageGraphicsObjectProperties {}

  class JoinSplitController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  export interface PageGraphicsObject {
    type: string;
    setProperties(
      properties: Partial<
        | TextGraphicObjectProperties
        | PathGraphicObjectProperties
        | ImageGraphicObjectProperties
        | ShadingGraphicObjectProperties
      >
    ): void;
  }

  export interface PageGraphicsObjectProperties {}

  export interface PathGraphicObject extends PageGraphicsObject {
    type: string;
    setProperties(
      properties: Partial<PathGraphicObjectProperties>
    ): Promise<void>;
  }

  export interface PathGraphicObjectProperties
    extends PageGraphicsObjectProperties {
    shapeStyleDashType: number;
    shapeStyleFillColor: string;
    shapeStyleLineCap: number;
    shapeStyleLineColor: string;
    shapeStyleLineJoin: number;
    shapeStyleLineWidth: number;
    shapeStyleMiterLimit: number;
  }

  export interface ShadingGraphicObject extends PageGraphicsObject {
    type: string;
    setProperties(
      properties: Partial<ShadingGraphicObjectProperties>
    ): Promise<void>;
  }

  export interface ShadingGraphicObjectProperties
    extends PageGraphicsObjectProperties {
    shadingStyleColor: Array<{ color: string; offset: number }>;
  }

  export interface TextGraphicObject extends PageGraphicsObject {
    type: string;
    setProperties(
      properties: Partial<TextGraphicObjectProperties>
    ): Promise<void>;
  }

  export interface TextGraphicObjectProperties
    extends PageGraphicsObjectProperties {
    fontBold: boolean;
    fontCharacterSpacing: number;
    fontColor: string;
    fontFamily: string;
    fontItalic: boolean;
    fontSize: number;
  }

  class PageEditorAddon {
    activate(type: string): Promise<void>;
    deactivate(): Promise<void>;
    getActiveObject(): Promise<PageGraphicsObject | undefined>;
    onClick(
      pageIndex: number,
      point: Object,
      isPDFPoint: boolean
    ): Promise<void>;
    setEditingObjectToolStyle(style: {
      editObjectBox: {
        color: number;
        lineType: number;
      };
      addShapeBox: {
        color: number;
        lineType: number;
      };
    }): Boolean;
    setTextToolStyle(style: {
      cursor: {
        color: number;
        lineType: number;
      };
      editTextBox: {
        color: number;
        lineType: number;
      };
      addTextBox: {
        color: number;
        lineType: number;
      };
    }): Boolean;
  }

  export interface DigitalStampSize {
    height: number;
    width: number;
  }

  export interface DigitalStampTemplate {
    height: number;
    name: string;
    pdfPath: string;
    width: number;
  }

  export interface IdentityInfo {
    associationName: string;
    name: string;
    organizationName: string;
    surname: string;
    title: string;
  }

  class AddCirclePathObjectController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AddLinePathObjectController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AddRoundRectPathObjectController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AddSquarePathObjectController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class EditAllObjectsController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AddTextStateController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class BoldStyleController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ItalicStyleController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CustomDynamicStampAddon extends UIXAddon {
    getDynamicStamp(): Promise<object[]>;
    removeDynamicStamp(arr: object[]): void;
    setDynamicStamp(stampInfo: object[]): void;
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    destroy(): Promise<void> | void;
    fragments(): UIFragmentOptions[];
    getI18NResources(): object;
    getName(): string;
    init(pdfui: PDFUI): void;
    pdfViewerCreated(pdfviewer: PDFUI): void;
    protected receiveAction(actionName: string, args: any[]): void;
    protected static initOnLoad(): void;
  }

  class DigitalStampUIXAddon extends UIXAddon {
    getDigitalStampTemplate(): DigitalStampTemplate[];
    getIdentityInfo(): IdentityInfo;
    removeDigitalStampTemplates(names: string[]): Promise<void>;
    resetIdentityInfo(): Promise<void>;
    setDefaultSize(size: DigitalStampSize): void;
    setDigitalStampTemplates(templates: DigitalStampTemplate[]): Promise<void>;
    setIdentityInfo(info: IdentityInfo): Promise<void>;
    setTimeFormatOfDigitalStamp(timeFormat: string): Promise<void>;
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    destroy(): Promise<void> | void;
    fragments(): UIFragmentOptions[];
    getI18NResources(): object;
    getName(): string;
    init(pdfui: PDFUI): void;
    pdfViewerCreated(pdfviewer: PDFUI): void;
    protected receiveAction(actionName: string, args: any[]): void;
    protected static initOnLoad(): void;
  }

  class PrintUIXAddon {
    showPrintDialog(): Promise<void>;
  }

  class ReadAloudAddon {
    onActivationChange(callback: (isActivated: boolean) => void): () => void;
  }

  class Thumbnail extends UIXAddon {
    getZoomScale(): number;
    onSelectThumbnail(
      callback: (
        selectedPageIndexes: number[],
        lastSelectedPageIndexes: number[]
      ) => void
    ): () => void;
    zoomTo(scale: number): boolean;
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    destroy(): Promise<void> | void;
    fragments(): UIFragmentOptions[];
    getI18NResources(): object;
    getName(): string;
    init(pdfui: PDFUI): void;
    pdfViewerCreated(pdfviewer: PDFUI): void;
    protected receiveAction(actionName: string, args: any[]): void;
    protected static initOnLoad(): void;
  }

  class UndoRedoAddon {
    invoke(callback: (pdfDoc: PDFDoc) => void): void;
    redo(): Promise<void>;
    undo(): Promise<void>;
    undoAll(): Promise<void>;
  }

  class BookmarkTreeComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getTree(): TreeComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class BookmarkUIService {
    addBookmark(options: AddBookmarkOptions): Promise<number>;
    cutBookmark(bookmarkId: number): void;
    deleteBookmark(bookmarkId: number): Promise<void>;
    getCurrentActiveBookmarkId(): number | undefined;
    onSwitchCurrentBookmarkNode(
      callback: (last: BookmarkData, current: BookmarkData) => void
    ): void;
    pasteCutBookmark(
      destBookmarkId: number,
      destParentBookmarkId: number | undefined,
      relationship: BookmarkRelationship
    ): Promise<void>;
    renameBookmark(bookmarkId: number, newTitle: string): Promise<void>;
    setColor(bookmarkId: number, newColor: string): Promise<void>;
    setDestination(
      bookmarkId: number,
      newDestination: BookmarkDestination
    ): Promise<void>;
    setFontStyle(
      bookmarkId: number,
      newFontStye: BookmarkFontStyle
    ): Promise<void>;
  }

  class ButtonComponent extends Component {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    setIconCls(iconCls: string): void;
    setText(newText: string): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class ContextMenuComponent extends LayerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    showAt(x: number, y: number): void;
    close(): void;
    open(appendTo: HTMLElement | ContainerComponent): void;
    show(appendTo?: HTMLElement | ContainerComponent): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class ContextMenuItemComponent extends ButtonComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    setIconCls(iconCls: string): void;
    setText(newText: string): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class DropdownButtonComponent extends Component {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class DropdownComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getEditValue(): number | string;
    select(child: Component): void;
    setEditValue(value: string | number): void;
    setIconCls(iconCls: string): void;
    setText(text: string): void;
    unselect(): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class DropdownItemComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class FileSelectorComponent extends ButtonComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    setIconCls(iconCls: string): void;
    setText(newText: string): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class FormFieldComponent extends Component {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getFieldName(): string;
    getValue(): any;
    setValue(newValue: any): void;
    protected getDOMValue(): string;
    protected triggerChangeEvent(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class FormGroupComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    setDelimiter(delimiter?: string): void;
    setDescription(description: string): void;
    setDirection(direction?: 'ltr' | 'rtl' | 'ttb'): void;
    setLabel(label: string): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class GroupComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    setRetainCount(retainCount: number): void;
    setShrinkTitle(title: string): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class GroupListComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class GTabComponent extends Component {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    close(): void;
    getTabBodyComponent(): Promise<ContainerComponent>;
    open(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class InlineColorPickerComponent {}

  class LayerComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    close(): void;
    open(appendTo: HTMLElement | ContainerComponent): void;
    show(appendTo?: HTMLElement | ContainerComponent): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class LayerHeaderComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    setTitle(title: string): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class LayerToolbarComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class LayerViewComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class NumberComponent extends FormFieldComponent {
    max: number;
    min: number;
    prefix: string;
    step: number;
    suffix: string;
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getFieldName(): string;
    getValue(): any;
    setValue(newValue: any): void;
    protected getDOMValue(): string;
    protected triggerChangeEvent(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class OptionGroupComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class PaddleComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class SidebarComponent extends ContainerComponent {
    status: string;
    static STATUS_COLLAPSED: string;
    static STATUS_COLLAPSED_TOTALLY: string;
    static STATUS_EXPANDED: string;
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    collapse(): void;
    collapseTotally(): void;
    expand(): void;
    isCollapsed(): boolean;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class SlotComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class TabItemComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class TabsComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class TextComponent extends Component {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    setText(text: string): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class ToolbarComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class TooltipLayerComponent extends LayerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getCurrentSelectionTool(): TextSelectionTool | undefined;
    showAt(x: number, y: number, appendTo: string | HTMLElement): void;
    close(): void;
    open(appendTo: HTMLElement | ContainerComponent): void;
    show(appendTo?: HTMLElement | ContainerComponent): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class TreeComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getNodeById(id: string): TreeNodeComponent | undefined;
    getSelectedNode(): TreeNodeComponent;
    isDragging(): boolean;
    select(treeNode: TreeNodeComponent): void;
    setData(data: TreeNodeData[]): void;
    setDraggable(draggable: boolean): void;
    setEditable(editable: boolean): void;
    setLazyMode(lazyMode: 'none' | 'passive'): void;
    setSelectable(selectable: boolean): void;
    unselect(treeNode: TreeNodeComponent): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class TreeNodeComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getData(): TreeNodeData;
    getNodeId(): string;
    getParentNode(): TreeNodeComponent | undefined;
    getTree(): TreeComponent;
    setData(nodeData: TreeNodeData): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  export interface TreeNodeData {
    activated?: boolean;
    checkable?: boolean;
    checked?: boolean;
    children?: TreeNodeData | [];
    color?: string;
    disabled?: boolean;
    editable?: boolean;
    editing?: boolean;
    icon?: string;
    id: string;
    isBold?: boolean;
    isItalic?: boolean;
    isLeaf?: boolean;
    selectable?: boolean;
    selected?: boolean;
    title: string;
  }

  class CommentCardComponent extends CommentListCardComponent {
    menuComponent: DropdownComponent;
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    clearReplyEditor(): void;
    focusOnReplyEditor(): void;
    setModifyTime(datetime: Date): void;
    getTitleElement(): HTMLElement;
    getTimeElement(): HTMLElement;
    getToolsElement(): HTMLElement;
    applyState(): void;
    deselect(): void;
    select(): void;
    switchToEdit(): void;
    switchToView(): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class CommentListCardComponent extends ContainerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    applyState(): void;
    deselect(): void;
    select(): void;
    switchToEdit(): void;
    switchToView(): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class ReplyCardComponent extends CommentListCardComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    getTimeElement(): HTMLElement;
    getTitleElement(): HTMLElement;
    getToolsElement(): HTMLElement;
    setContent(content: string): void;
    setTime(time: number | Date): void;
    setTitle(title: string): void;
    applyState(): void;
    deselect(): void;
    select(): void;
    switchToEdit(): void;
    switchToView(): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  export interface ButtonComponentOptions extends ComponentOptions {
    iconCls?: string;
    text?: string;
  }

  export interface ComponentOptions {
    active?: boolean;
    canBeDisabled?: boolean;
    cls?: string;
    disabled?: boolean;
    visible?: boolean;
  }

  export interface DropdownComponentOptions extends ComponentOptions {
    iconCls?: string;
    text?: string;
  }

  export interface FormFieldComponentOptions extends ComponentOptions {
    fieldName?: string;
  }

  export interface FragmentComponentOptions extends ComponentOptions {
    attrs?: object;
    target?: string;
  }

  export interface GroupComponentOptions extends ComponentOptions {
    retainCount?: number;
    shrinkTitle?: string;
  }

  export interface LayerComponentOptions extends ComponentOptions {
    appendTo?: string | HTMLElement;
    backdrop?: boolean;
    modal?: boolean;
  }

  export interface LayerHeaderComponentOptions extends ComponentOptions {
    iconCls?: string;
    title?: string;
  }

  export interface NumberComponentOptions extends FormFieldComponentOptions {
    max?: number;
    min?: number;
    prefix?: string;
    step?: number;
    suffix?: string;
  }

  export interface PreConfiguredComponent {
    config?: Or<FragmentComponentOptions, FragmentComponentOptions[]>;
    template: string;
  }

  export interface SeniorComponentSuperclassOptions {
    fragments?: Array<UIFragmentOptions>;
    template?: string;
  }

  export interface SidebarPanelComponentOptions extends ComponentOptions {
    iconCls?: string;
    title?: string;
  }

  export interface TabItemComponentOptions extends ComponentOptions {
    title?: string;
  }

  export interface UIFragmentOptions {
    action?: FRAGMENT_ACTION;
    config?: Or<FragmentComponentOptions, FragmentComponentOptions[]>;
    target: Or<string, string[]>;
    template?: string;
  }

  class Component {
    constructor(
      options: ComponentOptions,
      module: UIXModule,
      localizer: Object
    );

    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class ContainerComponent extends Component {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    show(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class LoadingComponent extends LayerComponent {
    canBeDisabled: boolean;
    controller: Controller;
    disabled: boolean;
    element: HTMLElement;
    isActive: boolean;
    isVisible: boolean;
    name: string;
    parent: ContainerComponent;
    close(): void;
    open(appendTo: HTMLElement | ContainerComponent): void;
    show(appendTo?: HTMLElement | ContainerComponent): void;
    append(child: Component | string, fragments?: UIFragmentOptions[]): void;
    childAt(index: number): Component;
    children(): Component[];
    empty(): void;
    first(): Component;
    indexOf(child: Component): number;
    insert(
      child: Component | string | Node,
      index: number,
      fragments: UIFragmentOptions[]
    ): void;
    insertAll(children: Component[], index: number): void;
    last(): Component;
    prepend(child: Component | string, fragments: UIFragmentOptions[]): void;
    removeChild(child: Component): void;
    size(): number;
    protected doInsert(component: Component, index: number): void;
    protected doInsertAll(children: Component[], index: number): void;
    protected getContainerElement(): HTMLElement;
    protected rerenderChildren(): void;
    active(): void;
    addDestroyHook(...hooks: Array<() => void>): void;
    after(component: Component | string, fragments: UIFragmentOptions[]): void;
    attachEventToElement(
      element: EventTarget,
      types: string,
      listener: EventListenerOrEventListenerObject,
      options: AddEventListenerOptions
    ): void;
    before(component: Component | string, fragments: UIFragmentOptions[]): void;
    deactive(): void;
    destroy(): void;
    disable(): boolean;
    enable(): boolean;
    findClosestComponent(
      callback: (component: Component) => boolean
    ): Component | undefined;
    getClosestComponentByName(name: string): Component | undefined;
    getClosestComponentByType(type: string): Component | undefined;
    getComponentByName(): Component;
    getPDFUI(): PDFUI;
    getRoot(): Component;
    hide(): void;
    index(): number;
    isContainer(): boolean;
    isStateKept(): boolean;
    keepState(): void;
    localize(): Promise<void>;
    nextSiblings(): Component;
    off(eventName: string, listener?: { (...args: any[]): void }): void;
    on(eventName: string, listener: () => void): void;
    once(eventName: string, listener: () => void): void;
    postlink(): void;
    prelink(): void;
    previousSiblings(): Component;
    querySelector(selector: string): Component | undefined;
    querySelectorAll(selector: string): Component[];
    remove(): void;
    removeElement(): void;
    revokeKeepState(): void;
    trigger(eventName: string, data: any[]): void;
    static extend(name: string, def: object, statics: object): void;
    static getName(): string;
    protected createDOMElement(): HTMLElement;
    protected doActive(): void;
    protected doDeactive(): void;
    protected doDestroy(): void;
    protected doDisable(): void;
    protected doEnable(): void;
    protected doHidden(): void;
    protected doShown(): void;
    protected mounted(): void;
    protected render(): void;
  }

  class AddImageController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class AnnotOperationController extends Controller {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ApplyAllRedactController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ApplyRedactController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CancelCreatingDrawingController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CancelCreatingMeasurementController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CompleteCreatingDrawingController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CompleteCreatingMeasurementController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ContinuousFacingPageModeController extends ViewModeController {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ContinuousPageModeController extends ViewModeController {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class Controller extends Disposable {
    constructor(component: Component);

    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CopyAnnotTextController extends AnnotOperationController {
    protected component: Component;
    protected visibility(annot: Annot): boolean;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateAreaController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateAreaHighlightController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateArrowController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateCalloutController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateCaretController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateCircleAreaController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateCircleController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateDistanceController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateFileAttachmentController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateHighlightController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateImageController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateLineController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateLinkController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreatePencilController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreatePerimeterController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreatePolygonCloudController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreatePolygonController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreatePolylineController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateReplaceController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateSquareController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateSquigglyController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateStrikeoutController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateTextboxController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateTextController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateTypewriterController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class CreateUnderlineController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class DeleteAnnotController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class DownloadFileController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class FacingPageModeController extends ViewModeController {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class GotoFirstPageController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class GotoLastPageController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class GotoNextPageController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class GotoPageController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class GotoPrevPageController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class HandController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class LoupeController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class MarqueeToolController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class MediaDownloadController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class MediaPauseController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class MediaPlayController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class OpenLocalFileController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class OpenRemoteFileController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class SelectTextAnnotationController extends StatefulController {
    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ShowActionsController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ShowAnnotFormPropertiesController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ShowAnnotPropertiesController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ShowAnnotReplyController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ShowRedactPlaceDialogController extends AnnotOperationController {
    protected component: Component;
    protected usable(annot: Annot): Promise<boolean> | boolean;
    protected visibility(annot: Annot): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ShowSearchPanelController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class SignPropertyController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class SinglePageModeController extends ViewModeController {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class StatefulController extends Controller {
    constructor(
      component: Component,
      ExpectedStateHandlerClass: string | (new () => IStateHandler)
    );

    protected component: Component;
    protected stateIn(): void;
    protected stateOut(): void;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class TotalPageTextController extends Controller {
    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  class ViewModeController extends Controller {
    constructor(component: Component, viewModeName: string);

    protected component: Component;
    destroy(): void;
    getComponentByName(name: string): void;
    handle(): void;
    static extend(prototype: object, statics: object): void;
    static getName(): string;
    protected mounted(): void;
    protected postlink(): void;
    protected prelink(): void;
    protected static services(): Record<
      string,
      new <T>(...args: unknown[]) => T
    >;
    addDestroyHook(hooks: Disposable | Function): Function;
  }

  enum COMPONENT_EVENTS {
    DISABLE,
    ENABLE,
    ACTIVE,
    DEACTIVE,

    SHOWN,
    HIDDEN,
    DESTROYED,
    REMOVED,

    INSERTED,
    MOUNTED,
    CLOSED,
    EXPAND,

    RESIZESTART,
    RESIZE,
    COLLAPSE,
  }
  enum FRAGMENT_ACTION {
    BEFORE,
    AFTER,
    APPEND,
    PREPEND,

    INSERT,
    FILL,
    REPLACE,
    EXT,

    REMOVE,
  }
  enum Loading_Mode {
    fromFileObject,
    fromMemory,
  }
  const WEBPDF_VIEWER_COMPONENT_NAME = 'pdf-viewer';

  class AdaptiveAppearance extends Appearance {
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    static extend(prototype: object, statics?: object): Class<Appearance>;
    protected disableAll(): void;
    protected enableAll(): void;
    protected getDefaultFragments(): UIFragmentOptions[];
    protected getLayoutTemplate(): string;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class Appearance extends Disposable {
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    static extend(prototype: object, statics?: object): Class<Appearance>;
    protected disableAll(): void;
    protected enableAll(): void;
    protected getDefaultFragments(): UIFragmentOptions[];
    protected getLayoutTemplate(): string;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class MobileAppearance extends UIAppearance {
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    static extend(prototype: object, statics?: object): Class<Appearance>;
    protected disableAll(): void;
    protected enableAll(): void;
    protected getDefaultFragments(): UIFragmentOptions[];
    protected getLayoutTemplate(): string;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class RibbonAppearance extends UIAppearance {
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    static extend(prototype: object, statics?: object): Class<Appearance>;
    protected disableAll(): void;
    protected enableAll(): void;
    protected getDefaultFragments(): UIFragmentOptions[];
    protected getLayoutTemplate(): string;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class UIAppearance extends Appearance {
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    static extend(prototype: object, statics?: object): Class<Appearance>;
    protected disableAll(): void;
    protected enableAll(): void;
    protected getDefaultFragments(): UIFragmentOptions[];
    protected getLayoutTemplate(): string;
    addDestroyHook(hooks: Disposable | Function): Function;
    destroy(): void;
  }

  class Modular {
    module(name: string, deps?: Array<string | UIXModule>): UIXModule;
    root(): UIXModule;
  }

  class PDFUI extends (PDFViewer as unknown as PromisifyClass<
    PDFViewer,
    'destroy'
  >) {
    constructor(options: {
      viewerOptions: object;
      renderTo: HTMLElement | string;
      appearance?: new (pdfUI: PDFUI) => Appearance;
      addons?: string | Array<string | UIXAddon>;
      i18n?: {
        absolutePath?: string;
      };
      customs?: {
        getLoadingMode?: (fileOrUrl: File | string) => number;
        defaultStateHandler?: STATE_HANDLER_NAMES;
        handlerParams?: object;
        defaultExportCommentsFormat?: string;
        scalingValues?: number[];
        autoDownloadAfterSign?: boolean;
        getSignedDocument?: (pdfBlob: Blob) => Blob;
        loading?: (
          coverOn: HTMLElement,
          text: string,
          animation: boolean
        ) =>
          | string
          | Component
          | HTMLElement
          | Promise<string | Component | HTMLElement>;
        progress?: ProgressComponent;
      };
    });

    element: HTMLElement;
    i18n: typeof i18next;
    addCssFonts(fonts: string[]): void;
    addUIEventListener(
      type: string | string[] | { [type: string]: () => void },
      listener: (...args: any[]) => void
    ): () => void;
    addViewerEventListener(
      type: string | string[] | { [type: string]: () => void },
      listener: (...args: any[]) => void
    ): () => void;
    callAddonAPI(
      addonLibrary: string,
      action: string,
      args: any[]
    ): Promise<any>;
    changeLanguage(language: string): Promise<void>;
    destroy(): Promise<void>;
    getAddonInstance(addonLibrary: string): UIXAddon | undefined;
    getAllComponentsByName(name: string): Promise<Component[]>;
    getAnnotationIcons(
      annotType: string,
      onlyCustomized: boolean
    ): Promise<object>;
    getBookmarkUIService(): BookmarkUIService;
    getComponentByName(name: string): Promise<Component>;
    getCurrentLanguage(): string;
    getPDFViewer(): Promise<PDFViewer>;
    getRootComponent(): Promise<Component>;
    getSelectedTextInfo(): Promise<{
      page: PDFPage;
      rectArray: Array<{
        left: number;
        right: number;
        top: number;
        bottom: number;
      }>;
    }>;
    getStampService(): StampService;
    loading(
      coverOn?: HTMLElement | Component,
      text?: string,
      animation?: boolean | string
    ): Promise<LoadingComponent>;
    openFormPropertyBoxAfterCreated(isOpen: boolean): void;
    registerSignatureFlowHandler(signatureHandler: SignatureFlowOptions): void;
    registerSignaturePropertyHandler(
      handler: (signatureInfo: object) => object
    ): void;
    registerSignHandler(handler: {
      filter: string;
      subfilter: string;
      signer: string;
      distinguishName: number;
      location: number;
      reason: number;
      defaultContentsLength: number;
      flag: Signature_Ap_Flags;
      sign: (
        signInfo: object,
        plainBuffer: ArrayBuffer
      ) => Promise<ArrayBuffer>;
      timeFormat: {
        format: string;
        timeZoneOptions: {
          separator: string;
          prefix: string;
          showSpace: boolean;
        };
      };
    }): void;
    removeUIEventListener(
      type: string | string[],
      listener: (...args: any[]) => void
    ): void;
    removeViewerEventListener(
      type: string | string[],
      listener: (...args: any[]) => void
    ): Promise<void>;
    setDefaultMeasurementRatio(options: {
      userSpaceScaleValue: number;
      userSpaceUnit: string;
      realScaleValue: number;
      realUnit: string;
    }): void;
    setSnapshotInteractionClass(
      interactionClass: new (
        pdfViewer: PDFViewer,
        snapshot: Snapshot
      ) => SnapshotInteraction
    ): void;
    setVerifyHandler(
      handler: (
        field: PDFField,
        plainBuffer: Uint8Array,
        signedData: Uint8Array
      ) => Promise<number>
    ): void;
    waitForInitialization(): Promise<void>;
    static module(name: string, deps: Array<string | UIXModule>): UIXModule;
  }

  class SeniorComponentFactory {
    static createSuperClass(
      options: SeniorComponentSuperclassOptions
    ): Class<Component>;
  }

  export interface SignatureFlowOptions {
    getSigner(callback: (signField: PDFField) => Promise<void>): void;
    showSignatureProperty(
      callback: (signField: PDFField) => Promise<void>
    ): void;
    showVerificationInfo(
      callback: (signField: PDFField) => Promise<void>
    ): void;
    sign(callback: (signField: PDFField) => Promise<SignatureInfomation>): void;
    verify(callback: (signField: PDFField) => Promise<void>): void;
  }

  export interface SignatureInfomation {
    defaultContentsLength: number;
    distinguishName: string;
    email: string;
    filter: string;
    flag: number;
    image: string;
    location: string;
    reason: string;
    signer: string;
    subfilter: string;
    text: string;
    sign(setting: object, plainBuffer: ArrayBuffer): Promise<ArrayBuffer>;
  }

  export interface Snapshot {
    area: DeviceRect;
    data: Blob;
    pageRender: PDFPageRender;
  }

  class SnapshotInteraction {
    protected pdfViewer: PDFViewer;
    protected snapshot: Snapshot;
    onCancel(prepareData: string | Blob): void;
    onDownload(prepareData: string | Blob): void;
    onOk(prepareData: string | Blob): void;
    prepare(): void;
    protected copyToClipboard(): Promise<void>;
  }

  class UIXAddon {
    afterMounted(root: Component): void;
    beforeMounted(root: Component): void;
    destroy(): Promise<void> | void;
    fragments(): UIFragmentOptions[];
    getI18NResources(): object;
    getName(): string;
    init(pdfui: PDFUI): void;
    pdfViewerCreated(pdfviewer: PDFUI): void;
    protected receiveAction(actionName: string, args: any[]): void;
    protected static initOnLoad(): void;
  }

  class UIXModule {
    controller(name: string, controllerDef: object): UIXModule;
    getPreConfiguredComponent(name: string): PreConfiguredComponent;
    registerComponent(componentClass: Component): UIXModule;
    registerController(ControllerClass: Controller): UIXModule;
    registerPreConfiguredComponent(
      name: string,
      component: PreConfiguredComponent
    ): UIXModule;
  }

  class XViewerUI extends TinyViewerUI {
    alert(message: string, title?: string): Promise<void>;
    confirm(message: string, title?: string): Promise<void>;
    createContextMenu(
      owner: string | AnnotComponent,
      anchor: HTMLElement,
      config: {
        selector: string;
      }
    ): IContextMenu;
    prompt(
      defaultValue: string,
      message: string,
      title?: string
    ): Promise<string>;
    protected getAnnotsContextMenuName(owner: AnnotComponent): string;
    protected getContextMenuNameByOwner(
      owner: string | AnnotComponent
    ): string | undefined;
    createTextSelectionTooltip(pageRender: PDFPageRender): IFloatingTooltip;
    destroy(): void;
    loading(coverOn: HTMLElement): Function;
    promptPassword(
      defaultValue: string,
      message: string,
      title: string
    ): Promise<string>;
  }
  enum UIEvents {
    fullscreenchange = 'fullscreenchange',
    appendCommentListComment = 'append-commentlist-comment',
    appendCommentListReply = 'append-commentlist-reply',
    destroyCommentListComment = 'destroy-commentlist-comment',

    destroyCommentListReply = 'destroy-commentlist-reply',
    InkImageSelected = 'ink-image-selected',
    addContentSuccess = 'add-content-success',
    initializationCompleted = 'pdfui-intialization-completed',
    bookmarkSelected = 'bookmark-selected',
  }
  const modular: Modular;
}
