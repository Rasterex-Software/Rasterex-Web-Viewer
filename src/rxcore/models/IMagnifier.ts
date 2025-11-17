export interface IMagnifier {
    setContext(ctx: CanvasRenderingContext2D, width: number, height: number): void;
    setOverlayContext(ctx: CanvasRenderingContext2D): void;
    setActive(state: boolean): void;
    toggle(): void;
    resetContext(): void;
    setScale(newScale: number): void;
    stepScale(bUp: boolean): void;
    clearOverlay(): void;
    drawOverlayPoint(x: number, y: number, color?: string, size?: number): void;
    drawCrosshair(color?: string, size?: number, box?: boolean): void;
    update(mousePos: { x: number; y: number }): Promise<void>;
  }
  