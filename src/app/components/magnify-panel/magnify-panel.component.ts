import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MagnifyService } from '../../services/magnify.service';
import { RXCore } from 'src/rxcore';



@Component({
  selector: 'rx-magnify-panel',
  templateUrl: './magnify-panel.component.html',
  styleUrls: ['./magnify-panel.component.scss']
})
export class MagnifyPanelComponent implements OnInit {
  @ViewChild('magnifierCanvas', { static: false }) magnifierCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('magnifierOverlay', { static: false }) magnifierOverlay!: ElementRef<HTMLCanvasElement>;

  isVisible = false;
  width = 300;
  height = 200;

  constructor(private magnifyService: MagnifyService) {}

  ngOnInit(): void {
    // Subscribe to visibility changes from the service
    this.magnifyService.visible$.subscribe(show => {
      this.isVisible = show;

      // Wait for Angular to render DOM when toggling visibility
      setTimeout(() => {
        if (show) {
          const baseCanvas = this.magnifierCanvas?.nativeElement;
          const overlayCanvas = this.magnifierOverlay?.nativeElement;

          const baseCtx = baseCanvas?.getContext('2d');
          const overlayCtx = overlayCanvas?.getContext('2d');


          const dpr = window.devicePixelRatio || 1;

          // Match internal buffer size to CSS size * DPR
          const displayWidth = this.width;
          const displayHeight = this.height;


          if (baseCtx) {


              // Match internal buffer size to CSS size * DPR
            baseCanvas.width = displayWidth * dpr;
            baseCanvas.height = displayHeight * dpr;

            // Scale context so drawing operations use CSS pixels
            baseCtx.setTransform(1, 0, 0, 1, 0, 0); // reset any old transform
            baseCtx.scale(dpr, dpr);

            RXCore.magnifier.setContext(baseCtx, displayWidth, displayHeight);



          }

          if (overlayCtx) {

            overlayCanvas.width = displayWidth * dpr;
            overlayCanvas.height = displayHeight * dpr;

            overlayCtx.setTransform(1, 0, 0, 1, 0, 0); // reset any old transform
            overlayCtx.scale(dpr, dpr);

            RXCore.magnifier.setOverlayContext(overlayCtx);

          }
        } else {
          RXCore.magnifier.resetContext();
        }
      });
    });
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
