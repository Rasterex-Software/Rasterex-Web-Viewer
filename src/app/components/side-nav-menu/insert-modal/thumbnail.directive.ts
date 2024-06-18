import { Directive, ElementRef, Input, OnInit } from '@angular/core';
@Directive({
  selector: '[thumbnail]'
})
export class ThumbnailDirective implements OnInit {
  @Input() thumbnail: ImageData;
  @Input() pageIndex: number;

  constructor(
    private element: ElementRef) {}


  ngOnInit(): void {
    this.element.nativeElement.width = this.thumbnail.width;
    this.element.nativeElement.height = this.thumbnail.height;
    var ctx = this.element.nativeElement.getContext('2d');
    ctx.putImageData(this.thumbnail, 0, 0)
  }
}
