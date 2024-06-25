import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[pageThumbnail]'
})
export class PageThumbnailDirective implements OnInit {
  @Input() pageThumbnail: any;
  @Input() pageIndex: number;

  constructor(
    private element: ElementRef,
    private readonly rxCoreService: RxCoreService) {}

  private subscription: Subscription;

  ngOnInit(): void {
    RXCore.loadThumbnail(this.pageIndex);

    this.element.nativeElement.width = this.pageThumbnail.thumbnailobj.thumbnail.width;
    this.element.nativeElement.height = this.pageThumbnail.thumbnailobj.thumbnail.height;

    this.subscription = this.rxCoreService.guiPageThumb$.subscribe(data => {
      if (data == this.pageIndex) {
        var ctx = this.element.nativeElement.getContext('2d');

        this.element.nativeElement.width = this.pageThumbnail.thumbnailobj.thumbnail.width;
        this.element.nativeElement.height = this.pageThumbnail.thumbnailobj.thumbnail.height;

        this.pageThumbnail.thumbnailobj.draw(ctx);
        RXCore.markUpRedraw();
      }
    });

    RXCore.onRotatePage((degree: number, pageIndex: number) => {
      console.log("ROTATED")
        var ctx = this.element.nativeElement.getContext('2d');

        this.element.nativeElement.width = this.pageThumbnail.thumbnailobj.thumbnail.width;
        this.element.nativeElement.height = this.pageThumbnail.thumbnailobj.thumbnail.height;

        this.pageThumbnail.thumbnailobj.draw(ctx);
        RXCore.markUpRedraw();
    })
  }
}
