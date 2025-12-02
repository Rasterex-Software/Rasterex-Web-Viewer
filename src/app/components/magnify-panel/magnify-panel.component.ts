import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  HostBinding
} from '@angular/core';

import { MagnifyService } from '../../services/magnify.service';
import { RXCore } from 'src/rxcore';

@Component({
  selector: 'rx-magnify-panel',
  templateUrl: './magnify-panel.component.html',
  styleUrls: ['./magnify-panel.component.scss']
})
export class MagnifyPanelComponent implements OnInit {

  @ViewChild('wrapper', { static: false })
  wrapperEl!: ElementRef<HTMLDivElement>;

  @ViewChild('magnifierCanvas', { static: false })
  magnifierCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('magnifierOverlay', { static: false })
  magnifierOverlay!: ElementRef<HTMLCanvasElement>;

  @ViewChild('magnifierSnap', { static: false })
  magnifierSnap!: ElementRef<HTMLCanvasElement>;

  @HostBinding('class.precision-mode')
  precisionMode = false;

  isVisible = false;
  width = 300;
  height = 200;

  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  private lastLeft = 300;
  private lastTop = 50;


  constructor(private magnifyService: MagnifyService) {}

  ngOnInit(): void {

    /** Sync visibility with service */
    this.magnifyService.visible$.subscribe(show => {
      this.isVisible = show;

      this.precisionMode = RXCore.magnifier.precisionMode;
      RXCore.magnifier.setScale(10);


      
      setTimeout(() => {
        if (show) {

          // ⭐ Set initial position on each open
          const panel = document.querySelector('.magnify-wrapper') as HTMLElement;

          if (panel) {
              panel.style.left = this.lastLeft + "px";
              panel.style.top = this.lastTop + "px";
          }

          this.initializeCanvas();
        } else {
          RXCore.magnifier.resetContext();
        }
      });
    });

    RXCore.magnifier.onEnterPrecision = () => {

      const panel = this.wrapperEl.nativeElement;

      panel.classList.add("precision-mode");
  

      this.precisionMode = true;
    };
    
    RXCore.magnifier.onExitPrecision = () => {

      const panel = this.wrapperEl.nativeElement;

      panel.classList.remove('precision-mode');

      this.precisionMode = false;
    };

    /** When a point is selected */
    this.magnifyService.onPointSelected = (npt: number) => {
      RXCore.magnifier.enterPrecisionMode(npt);
      this.precisionMode = true;
      this.magnifyService.toggle(true);
    };
  }

  /** -------------------------
   *  DRAGGING LOGIC
   * --------------------------*/

  startMove(ev: MouseEvent | TouchEvent): void {
    ev.preventDefault();

    this.isDragging = true;

    

    let clientX = 0, clientY = 0;
    if (ev instanceof MouseEvent) {
      clientX = ev.clientX;
      clientY = ev.clientY;
    } else {
      clientX = ev.touches[0].clientX;
      clientY = ev.touches[0].clientY;
    }

    const panel = this.wrapperEl.nativeElement;

    panel.classList.add("dragging");

    const rect = panel.getBoundingClientRect();

    this.dragOffsetX = clientX - rect.left;
    this.dragOffsetY = clientY - rect.top;

    RXCore.magnifier.suspend(true);
  }

  onMove(ev: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    let clientX = 0, clientY = 0;
    if (ev instanceof MouseEvent) {
      clientX = ev.clientX;
      clientY = ev.clientY;
    } else {
      clientX = ev.touches[0].clientX;
      clientY = ev.touches[0].clientY;
    }

    const panel = this.wrapperEl.nativeElement;
    panel.style.left = `${clientX - this.dragOffsetX}px`;
    panel.style.top  = `${clientY - this.dragOffsetY}px`;
  }

  endMove(): void {
    if (!this.isDragging) return;

    const panel = this.wrapperEl.nativeElement;
    this.lastLeft = parseInt(panel.style.left, 10) || 0;
    this.lastTop = parseInt(panel.style.top, 10) || 0;


    this.isDragging = false;

    panel.classList.remove("dragging");

    RXCore.magnifier.suspend(false);
  }

  /** -------------------------
   *  CANVAS INITIALIZATION
   * --------------------------*/

  private initializeCanvas(): void {
    const baseCanvas = this.magnifierCanvas.nativeElement;
    const overlayCanvas = this.magnifierOverlay.nativeElement;
    const snapCanvas = this.magnifierSnap.nativeElement;

    const baseCtx = baseCanvas.getContext('2d')!;
    const overlayCtx = overlayCanvas.getContext('2d')!;
    const snapCtx = snapCanvas.getContext('2d')!;

    //const dpr = window.devicePixelRatio || 1;
    const dpr = 1;

    const W = this.width;
    const H = this.height;

    // Base canvas
    baseCanvas.width = W * dpr;
    baseCanvas.height = H * dpr;
    baseCtx.setTransform(1, 0, 0, 1, 0, 0);
    baseCtx.scale(dpr, dpr);
    RXCore.magnifier.setCanvas(baseCanvas, overlayCanvas, snapCanvas);
    RXCore.magnifier.setContext(baseCtx, W, H);
    RXCore.magnifier.setUseMagnifyAlign(true);

    // Overlay canvas
    overlayCanvas.width = W * dpr;
    overlayCanvas.height = H * dpr;
    overlayCtx.setTransform(1, 0, 0, 1, 0, 0);
    overlayCtx.scale(dpr, dpr);
    RXCore.magnifier.setOverlayContext(overlayCtx);

    // Snap canvas
    snapCanvas.width = W * dpr;
    snapCanvas.height = H * dpr;
    snapCtx.setTransform(1, 0, 0, 1, 0, 0);
    snapCtx.scale(dpr, dpr);
    RXCore.magnifier.setSnapContext(snapCtx);
  }

  zoomIn(): void {
    RXCore.magnifier.stepScale(true);
  }

  zoomOut(): void {
    RXCore.magnifier.stepScale(false);
  }

  close(): void {
    this.magnifyService.toggle(false);
  }
}
