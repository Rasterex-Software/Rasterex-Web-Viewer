export interface IMagnifier {
    setContext(ctx: CanvasRenderingContext2D, width: number, height: number): void;
    setCanvas(baseCanvas: HTMLCanvasElement, overlayCanvas : HTMLCanvasElement, snapCanvas : HTMLCanvasElement): void;
    setOverlayContext(ctx: CanvasRenderingContext2D): void;
    setSnapContext(ctx: CanvasRenderingContext2D): void;
    setActive(state: boolean): void;
    toggle(): void;
    resetContext(): void;
    setScale(newScale: number): void;
    stepScale(bUp: boolean): void;
    clearOverlay(): void;
    drawOverlayPoint(x: number, y: number, color?: string, size?: number): void;
    drawCrosshair(color?: string, size?: number, box?: boolean): void;
    update(mousePos: { x: number; y: number }): Promise<void>;
    suspend(state: boolean): void;
    setUseMagnifyAlign(enable : boolean) : void;
    enterPrecisionMode(anchor: number) : void;
    exitPrecisionMode() : void;
    precisionMode : boolean;
    onEnterPrecision() : void;
    onExitPrecision() : void;
    

  }
  