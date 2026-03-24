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

  //fileInfo: {};
  //fileFormat : string;

  guiRotatePage$ = this.rxCoreService.guiRotatePage$;
  guiRotateDocument$ = this.rxCoreService.guiRotateDocument$;

  private subscription: Subscription;
  private rotatePageSubscription: Subscription;
  private rotateDocSubscription: Subscription;
  private observer: IntersectionObserver;
  private hasRequestedThumbnail = false;

  constructor(
    private element: ElementRef,
    private readonly rxCoreService: RxCoreService
  ) {}

  

  ngOnInit(): void {

    this.syncCanvasSize();
    this.drawThumbnail();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (!this.hasRequestedThumbnail && !this.pageThumbnail?.thumbloaded) {
            this.hasRequestedThumbnail = true;
            RXCore.loadThumbnail(this.pageIndex);
          }

          if (this.pageThumbnail?.bfinalsize === true || this.pageThumbnail?.thumbloaded) {
            this.observer?.unobserve(this.element.nativeElement);
          }
        });
      },
      {
        root: null,
        rootMargin: '200px 0px',
        threshold: 0.01
      }
    );

    this.observer.observe(this.element.nativeElement);




    //RXCore.loadThumbnail(this.pageIndex);

    //RXCore.loadThumbnailPDF(this.pageIndex);

    //this.element.nativeElement.width = this.pageThumbnail.thumbnailobj.thumbnail.width;
    //this.element.nativeElement.height = this.pageThumbnail.thumbnailobj.thumbnail.height;

    //this.element.nativeElement.width = this.pageThumbnail.thumbcanvas.width;
    //this.element.nativeElement.height = this.pageThumbnail.thumbcanvas.height;


    //var ctx = this.element.nativeElement.getContext('2d');

    //RXCore.markUpRedraw();

    //this.pageThumbnail.thumbnailobj.draw(ctx);

    this.subscription = this.rxCoreService.guiPageThumb$.subscribe((data) => {
      if (data.pagenumber !== this.pageIndex) return;

      this.syncCanvasSize();
      this.drawThumbnail();

      if (this.pageThumbnail?.bfinalsize === true || this.pageThumbnail?.thumbloaded) {
        this.observer?.unobserve(this.element.nativeElement);
      }
    });

    /*this.subscription = this.rxCoreService.guiPageThumb$.subscribe(data => {
      if (data.pagenumber == this.pageIndex) {
        var ctx = this.element.nativeElement.getContext('2d');

        //this.element.nativeElement.width = this.pageThumbnail.thumbnailobj.thumbnail.width;
        //this.element.nativeElement.height = this.pageThumbnail.thumbnailobj.thumbnail.height;

        this.element.nativeElement.width = this.pageThumbnail.thumbcanvas.width;
        this.element.nativeElement.height = this.pageThumbnail.thumbcanvas.height;


        RXCore.markUpRedraw();

        this.pageThumbnail.thumbnailobj.draw(ctx);
        
        //if (this.subscription) this.subscription.unsubscribe();
      }
    });*/


    this.rotateDocSubscription = this.guiRotateDocument$.subscribe(() => {
      this.hasRequestedThumbnail = false;
      this.syncCanvasSize();
      this.drawThumbnail();
    });

    this.rotatePageSubscription = this.guiRotatePage$.subscribe(({ degree, pageIndex }) => {
      if (pageIndex !== this.pageIndex) return;

      RXCore.rotateThumbnail(pageIndex, degree);

      this.hasRequestedThumbnail = false;
      RXCore.loadThumbnail(pageIndex);

      this.syncCanvasSize();
      this.drawThumbnail();
      RXCore.markUpRedraw();
    });

    /*this.guiRotateDocument$.subscribe(({degree}) => {

      console.log("ROTATED");

    });*/

    /*this.guiRotatePage$.subscribe(({degree, pageIndex}) => {

      console.log("ROTATED")

      var ctx = this.element.nativeElement.getContext('2d');

      RXCore.rotateThumbnail(pageIndex, degree);
      RXCore.loadThumbnail(pageIndex);

      this.element.nativeElement.width = this.pageThumbnail.thumbcanvas.width;
      this.element.nativeElement.height = this.pageThumbnail.thumbcanvas.height;

      this.pageThumbnail.thumbnailobj.draw(ctx);

        
      RXCore.markUpRedraw();


      //this.pageNumber = pageIndex;
      //this.pageRotation = degree;

    });*/

    /* RXCore.onRotatePage((degree: number, pageIndex: number) => {
      console.log("ROTATED")
        var ctx = this.element.nativeElement.getContext('2d');


        RXCore.rotateThumbnail(pageIndex, degree);
        RXCore.loadThumbnail(pageIndex);

        

        this.element.nativeElement.width = this.pageThumbnail.thumbcanvas.width;
        this.element.nativeElement.height = this.pageThumbnail.thumbcanvas.height;



        this.pageThumbnail.thumbnailobj.draw(ctx);

        
        RXCore.markUpRedraw();
    }) */

    /*RXCore.onGuiFileInfo((fileInfo) => {
      this.fileInfo = fileInfo;
      this.fileFormat = fileInfo.format;

    });*/


  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    //this.guiRotatePage$.unsubscribe();
    this.rotatePageSubscription?.unsubscribe();
    //this.guiRotateDocument$.unsubscribe();
    this.rotateDocSubscription?.unsubscribe();
    this.observer?.disconnect();
  }

  private syncCanvasSize(): void {
    this.element.nativeElement.width = this.pageThumbnail.thumbcanvas.width;
    this.element.nativeElement.height = this.pageThumbnail.thumbcanvas.height;
  }

  private drawThumbnail(): void {
    const ctx = this.element.nativeElement.getContext('2d');
    RXCore.markUpRedraw();
    this.pageThumbnail.thumbnailobj.draw(ctx);
  }

}
