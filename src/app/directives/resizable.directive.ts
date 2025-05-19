import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[rxResizable]'
})
export class ResizableDirective implements OnInit, OnDestroy {
  @Input('rxResizable') targetEl!: HTMLElement;
  @Input() resizerWidth = 15;
  @Input() minWidth = 100;
  @Input() maxWidth?: number;

  private dragging = false;
  private startX = 0;
  private startWidth = 0;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  public ngOnInit() {
    this.renderer.setStyle(this.host.nativeElement, 'cursor', 'ew-resize');
  }

  public ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(evt: MouseEvent) {
    evt.preventDefault();
    this.dragging = true;
    this.startX = evt.clientX;
    this.startWidth = this.targetEl.getBoundingClientRect().width;
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (evt: MouseEvent) => {
    if (!this.dragging) return;

    const delta = evt.clientX - this.startX;
    let newW = this.startWidth + delta;

    const limit = this.maxWidth ?? (window.innerWidth - this.resizerWidth);
    newW = Math.max(this.minWidth, Math.min(limit, newW));

    this.renderer.setStyle(this.targetEl, 'width', `${newW}px`);
  };

  private onMouseUp = () => {
    this.dragging = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  };
}
