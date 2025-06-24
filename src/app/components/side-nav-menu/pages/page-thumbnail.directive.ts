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

  constructor(
    private element: ElementRef,
    private readonly rxCoreService: RxCoreService) {}

  private subscription: Subscription;

  ngOnInit(): void {


    RXCore.loadThumbnail(this.pageIndex);

    //RXCore.loadThumbnailPDF(this.pageIndex);

    //this.element.nativeElement.width = this.pageThumbnail.thumbnailobj.thumbnail.width;
    //this.element.nativeElement.height = this.pageThumbnail.thumbnailobj.thumbnail.height;

    this.element.nativeElement.width = this.pageThumbnail.thumbcanvas.width;
    this.element.nativeElement.height = this.pageThumbnail.thumbcanvas.height;


    var ctx = this.element.nativeElement.getContext('2d');

    RXCore.markUpRedraw();

    this.pageThumbnail.thumbnailobj.draw(ctx);

    

    this.subscription = this.rxCoreService.guiPageThumb$.subscribe(data => {
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
    });

    this.guiRotateDocument$.subscribe(({degree}) => {

      // console.log("ROTATED");

    });

    this.guiRotatePage$.subscribe(({degree, pageIndex}) => {

      // console.log("ROTATED")

      var ctx = this.element.nativeElement.getContext('2d');

      RXCore.rotateThumbnail(pageIndex, degree);
      RXCore.loadThumbnail(pageIndex);

      this.element.nativeElement.width = this.pageThumbnail.thumbcanvas.width;
      this.element.nativeElement.height = this.pageThumbnail.thumbcanvas.height;

      this.pageThumbnail.thumbnailobj.draw(ctx);

        
      RXCore.markUpRedraw();


      //this.pageNumber = pageIndex;
      //this.pageRotation = degree;

    });

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
}
