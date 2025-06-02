import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { AnnotationToolsService } from '../annotation-tools.service';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { NotificationService } from '../../notification/notification.service';
import { UserService } from '../../user/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'rx-quick-actions-menu',
  templateUrl: './quick-actions-menu.component.html',
  styleUrls: ['./quick-actions-menu.component.scss']
})
export class QuickActionsMenuComponent implements OnInit, OnDestroy {
  guiMode$ = this.rxCoreService.guiMode$;

  private guiMarkupSubscription: Subscription;
  private guiMarkupHoverSubscription: Subscription;
  private quickActionsMenuVisibleSubscription: Subscription;
  private guiOnResizeSubscription: Subscription;
  private guiZoomUpdatedSubscription: Subscription;

  private x: number;
  private y: number;

  visible = false;
  pageRotation : number = 0;
  annotation: any = -1;
  havepointdelete: boolean = false;
  havepointinsert: boolean = false;
  moveLabelEnabled: boolean = false;
  operation: any = undefined;
  rectangle: any;
  confirmDeleteOpened: boolean = false;
  menuwidth: number = 126;
  menucenter : number = 0;
  buttongap : number = 10;
  buttonsize : number = 28;
  menuheight : number = 48;
  numbuttons : number = 4;
  topgap : number = 16;
  addLink: boolean = false;
  followLink: boolean = false;
  message: string = 'Add link';
  snap: boolean = false;

  //quick buttons
  editButton: boolean = false; 
  deleteButton : boolean = false;
  copyMarkupButton : boolean = false;
  linkButton : boolean = false;
  editlinkButton : boolean = false;
  snapButton : boolean = false;
  infoButton : boolean = false;
  redirectButton : boolean = false;
  insertPointButton : boolean = false;
  deletePointButton : boolean = false;
  addHoleButton : boolean = false;
  hideLabelButton : boolean = false;
  moveLabelButton : boolean = false;

  movetoFrontButton : boolean = false;
  movetoBackButton : boolean = false;



  canUpdateAnnotation = this.userService.canUpdateAnnotation$;
  canDeleteAnnotation = this.userService.canDeleteAnnotation$;


  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService) {}

  private _setButtons() : void {

    this.editButton = false; 
    this.deleteButton = false;
    this.copyMarkupButton = false;
    this.linkButton  = false;
    this.editlinkButton  = false;
    this.snapButton = false;
    this.infoButton = false;
    this.redirectButton = false;
    this.insertPointButton = false;
    this.deletePointButton = false;
    this.addHoleButton = false;
    this.hideLabelButton = false;
    this.moveLabelButton = false;
    this.movetoFrontButton = false;
    this.movetoBackButton = false;

    let numbuttons = 0;
  

    //new method to set which button should be visible on menu
    //move logic from html template here and set the button state
    //in html template use the button state only.
    //calculate number of buttons here also.

    //*ngIf="(annotation.type != 11 && annotation.type != 20) && (canUpdateAnnotation | async)"

    if((this.annotation.type != 11 && this.annotation.type != 20) && this.canUpdateAnnotation){
      this.editButton = true;
      numbuttons += 1;
    }
        
    //<li *ngIf="(canDeleteAnnotation | async)" 
    if(this.canDeleteAnnotation){
      this.deleteButton = true;
      numbuttons += 1;
    }

    //<li *ngIf="(annotation.type != 20) && (canUpdateAnnotation | async)">
    //this.copyMarkupButton = true;

    if(this.annotation.type != 20 && this.canUpdateAnnotation){
      this.copyMarkupButton = true;
      numbuttons += 1;
    }

    //*ngIf="(annotation.bCanHaveLink && !annotation.bhaveLink) && (canUpdateAnnotation | async)"
    //(click)="addLink = true;"

    if(this.annotation.bCanHaveLink && this.annotation.bhaveLink && this.canUpdateAnnotation){
     this.linkButton = true;
     numbuttons += 1;
    }

    //<li *ngIf="annotation.type == 20 && (canUpdateAnnotation | async)" (click)="onRedirectClick()">
    //<img src="/assets/images/link.svg"  />

    if(this.annotation.type == 20 && this.canUpdateAnnotation){
      this.redirectButton = true;
      numbuttons += 1;
    }

    
    //*ngIf="annotation.bhaveLink && (canUpdateAnnotation | async)"
    //(click)="addLink = true; message = 'Edit link'">

    if(this.annotation.bhaveLink && this.canUpdateAnnotation){
      this.editlinkButton = true;
      numbuttons += 1;
    }

    
    //*ngIf="(annotation.type == 6 && annotation.subtype < 4) && (canUpdateAnnotation | async)"
    //(click)="onSnapClick()"

    if((this.annotation.type == 6 && this.annotation.subtype < 4) && this.canUpdateAnnotation){
      this.snapButton = true;
      numbuttons += 1;

    }

    //*ngIf="annotation.type == 11"
    //(click)="onInfoClick()">

    if(this.annotation.type == 11){
      this.infoButton = true;
      numbuttons += 1;
    }

    //*ngIf="((guiMode$ | async) == 'annotate' || (guiMode$ | async) == 'measure') && (havepointinsert)"
    //(click)="onInsertClick()">

    if(this.havepointinsert){
      this.insertPointButton = true;
      numbuttons += 1;
    }
    
    //*ngIf="((guiMode$ | async) == 'annotate' || (guiMode$ | async) == 'measure') && (havepointdelete)"
    //(click)="onDeletePointClick()">

    if(this.havepointdelete){
      this.deletePointButton = true;
      numbuttons += 1;
    }
    
    //*ngIf="(guiMode$ | async) == 'measure' && (annotation.type === 8 || (annotation.type === 3 && annotation.subtype === 6)) && annotation.parentmarkupnumber === 0"
    //(click)="onHoleClick()">


    if((this.annotation.type === 8 || (this.annotation.type === 3 && this.annotation.subtype === 6)) && this.annotation.parentmarkupnumber === 0){
      this.addHoleButton = true;
      numbuttons += 1;
    }

    //*ngIf="(guiMode$ | async) == 'measure' && ((annotation.type === 1 && annotation.subtype === 3) || (annotation.type === 3 && annotation.subtype === 6) || annotation.type === 7 || annotation.type === 8)"
    //(click)="onShowHideLabelClick()">

    if(((this.annotation.type === 1 && this.annotation.subtype === 3) || (this.annotation.type === 3 && this.annotation.subtype === 6) || this.annotation.type === 7 || this.annotation.type === 8)){
      this.hideLabelButton = true;
      numbuttons += 1;
    }

    //<li *ngIf="(guiMode$ | async) == 'measure' && ((annotation.type === 8))"
    //(click)="onMoveLabelClick()">

    if(this.annotation.type === 8){
      this.moveLabelButton = true;
      numbuttons += 1;
    }

    this.movetoFrontButton = true;
    this.movetoBackButton = true;
    numbuttons += 1;
    numbuttons += 1;

    this.numbuttons = numbuttons;

    //*ngIf="(guiMode$ | async) === 'annotate'"
    //(click)="onMoveToBackClick()">


    //*ngIf="(guiMode$ | async) === 'annotate'"
    //(click)="onMoveToFrontClick()">


  

  }  
  private _setPosition(): void {
    const markup = this.annotation;

    if (markup == -1){
      return;
    }

    const yoffset = 20;
    const rotoffset = -30;
    const offsetTop = 40;


    const wscaled = (markup.wscaled || markup.w) / window.devicePixelRatio;
    const hscaled = (markup.hscaled || markup.h) / window.devicePixelRatio;
    const xscaled = (markup.xscaled || markup.x) / window.devicePixelRatio;
    const yscaled = (markup.yscaled || markup.y) / window.devicePixelRatio;

    const wscaledus = (markup.wscaled || markup.w);
    const hscaledus = (markup.hscaled || markup.h);
    const xscaledus = (markup.xscaled || markup.x);
    const yscaledus = (markup.yscaled || markup.y);


    
    let absy = yscaled + ((hscaled - yscaled) * 0.5);
    let absx = xscaled + ((wscaled - xscaled) * 0.5);


    let _dx = window == top ? - 82 : 0;

    //let _dx = window == top ? 0 : 0;
    let _dy = window == top ? -0 : -48;

    let dx = 0 + _dx;
    let dy = -10 + _dy;

    //let xval = xscaled + dx + (wscaled / 2) + 20;
    //let yval = yscaled + dy + (hscaled / 2) + 10;

    let xval = xscaled;
    let yval = yscaled;


    let isLeft = xscaled < window.innerWidth * 0.5;
    let isTop = yscaled < window.innerHeight * 0.5;


    if(this.pageRotation != 0){

      let lefttop = markup.getrotatedPoint(xscaledus, yscaledus);


      isLeft = (lefttop.x / window.devicePixelRatio) < window.innerWidth * 0.5;
      isTop = (lefttop.y / window.devicePixelRatio) < window.innerHeight * 0.5;


    }


    /*if(this.pageRotation != 0){
      let rotpoint1 = markup.getrotatedPoint(xscaled, yscaled);
      let rotpoint2 = markup.getrotatedPoint(absx, hscaled);
      let rotpoint3 = markup.getrotatedPoint(absx, yscaled);
      let rotpoint4 = markup.getrotatedPoint(xscaled, absy);
      let rotpoint5 = markup.getrotatedPoint(absx, absy);

      if (this.pageRotation == 90){
        xval = rotpoint3.x;
        yval = rotpoint3.y;
      }

      if (this.pageRotation == 180){
        xval = rotpoint4.x;
        yval = rotpoint4.y;
      }

      if (this.pageRotation == 270){
        xval = rotpoint2.x;
        yval = rotpoint2.y;
      }

      isLeft = rotpoint1.x < window.innerWidth * 0.5;
      isTop = rotpoint1.y < window.innerHeight * 0.5;
  

    }*/

    console.log(isLeft, isTop);



    switch (markup.type) {
      case MARKUP_TYPES.COUNT.type: {

        let rotpointorig = { x: this.x, y: this.y };

        let p = this.operation.created ? markup.countshapes[markup.countshapes.length - 1] : rotpointorig;
        for (let point of markup.countshapes) {
          if (Math.abs(point.x- rotpointorig.x) + Math.abs(point.y - rotpointorig.y) <= 20) {
            p = point;
          }
        }


        if(this.pageRotation != 0){
          rotpointorig = markup.getrotatedPoint(this.x, this.y);


          let p = this.operation.created ? markup.countshapes[markup.countshapes.length - 1] : rotpointorig;
          for (let opoint of markup.countshapes) {

            let point = markup.getrotatedPoint(opoint.x,opoint.y);

            if (Math.abs(point.x- rotpointorig.x) + Math.abs(point.y - rotpointorig.y) <= 20) {
              p = point;
            }
          }
  

        }


        xval = p.x / window.devicePixelRatio;
        yval = p.y / window.devicePixelRatio;


        this.rectangle = {
          x: xval - 5,
          y: yval - 20,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
      }
      
      case MARKUP_TYPES.MEASURE.MEASUREARC.type:
      case MARKUP_TYPES.ERASE.type:
      case MARKUP_TYPES.SHAPE.POLYGON.type:
      case MARKUP_TYPES.PAINT.POLYLINE.type:
      case MARKUP_TYPES.MEASURE.PATH.type:
      case MARKUP_TYPES.MEASURE.ANGLECLOCKWISE.type:
      case MARKUP_TYPES.MEASURE.ANGLECCLOCKWISE.type:
      
      case MARKUP_TYPES.MEASURE.AREA.type: {




        /*let p = markup.points[0];
        for (let point of markup.points) {
          if (point.y < p.y) {
            p = point;
          }
        }*/

        let topcenterx = xscaled + ((wscaled - xscaled) * 0.5);
        let topcentery = yscaled;

        let topgapcalc = this.topgap;

        if(isTop){
          
          topcentery = hscaled;
          topgapcalc = -this.topgap - this.menuheight;

        }else{
          
          topcentery = yscaled;
          
  

        }



        if(this.pageRotation != 0){

           

          let rotpointpoly = markup.getrotatedPoint(topcenterx,topcentery);


          if (this.pageRotation == 90){

            if(isTop){
              
              rotpointpoly = markup.getrotatedPoint(wscaledus, yscaledus + (hscaledus - yscaledus) * 0.5);
              
   
            }else{
              rotpointpoly = markup.getrotatedPoint(xscaledus, yscaledus + (hscaledus - yscaledus) * 0.5);
   
            }

          }

          if (this.pageRotation == 180){

            if(isTop){
              
              rotpointpoly = markup.getrotatedPoint(xscaledus + ((wscaledus - xscaledus) * 0.5), yscaledus);
              //topcentery = yscaled;
              
   
            }else{
              
              rotpointpoly = markup.getrotatedPoint(xscaledus + ((wscaledus - xscaledus) * 0.5), hscaledus);
              
   
            }

          }

          if (this.pageRotation == 270){

            if(isTop){
              
              rotpointpoly = markup.getrotatedPoint(xscaledus, yscaledus + (hscaledus - yscaledus) * 0.5);
              //topcentery = yscaled;
              
   
            }else{
              
              rotpointpoly = markup.getrotatedPoint(wscaledus, yscaledus + (hscaledus - yscaledus) * 0.5);
              
   
            }

          }



          topcenterx = rotpointpoly.x / window.devicePixelRatio;
          topcentery = rotpointpoly.y / window.devicePixelRatio;

  

        }

        //topcenterx = topcenterx / window.devicePixelRatio;
        //topcentery = topcentery / window.devicePixelRatio;

        
        //this.numbuttons = (markup.subtype == MARKUP_TYPES.SHAPE.POLYGON.subType ? 4 : 3);

        /*if (markup.type == MARKUP_TYPES.MEASURE.AREA.type){
          this.numbuttons = 6;
        }*/

        /*if (markup.type == MARKUP_TYPES.ERASE.type){
          this.numbuttons = 3;
        }*/
        

        this.menuwidth = (this.buttonsize * this.numbuttons) + (this.buttongap * (this.numbuttons + 1));
        this.menucenter = this.menuwidth * 0.5; 


        //buttongap : number = 10;
        //buttonsize : number = 28;

        this.rectangle = {
          //x: (p.x / window.devicePixelRatio) - (markup.subtype == MARKUP_TYPES.SHAPE.POLYGON.subType ? 26 : 4),
          x : topcenterx - this.menucenter,
          //y: (p.y / window.devicePixelRatio) - 16,
          y: topcentery - topgapcalc,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
      }
    /*case MARKUP_TYPES.NOTE.type:

      this.numbuttons = 3;
      this.menuwidth = (this.buttonsize * this.numbuttons) + (this.buttongap * (this.numbuttons + 1));
      this.menucenter = this.menuwidth * 0.5; 

        //dx = (wscaled / 2) - 5 + _dx;

        dx = (wscaled / 2) - this.menucenter;

        dy = -10 + _dy;
        this.rectangle = {
          x: xscaled + dx,
          y: yscaled + dy,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;*/
    
        /*dx = ((wscaled - xscaled) / 2) - 5 + _dx;
        this.rectangle = {
          x: xscaled + dx,
          y: yscaled + dy,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;*/
      case MARKUP_TYPES.ARROW.type:
      case MARKUP_TYPES.MEASURE.LENGTH.type:


      //this.numbuttons = 4;
      this.menuwidth = (this.buttonsize * this.numbuttons) + (this.buttongap * (this.numbuttons + 1));
      this.menucenter = this.menuwidth * 0.5; 


      let startx = xscaled;
      let starty = yscaled;
      
      if(this.pageRotation != 0){
        let rotpointarrow = markup.getrotatedPoint(xscaledus,yscaledus);


        /*if (this.pageRotation == 90){

          if(isTop){
            
            rotpointpoly = markup.getrotatedPoint(wscaled, yscaled + (hscaled - yscaled) * 0.5);
            
 
          }else{
            rotpointpoly = markup.getrotatedPoint(xscaled, yscaled + (hscaled - yscaled) * 0.5);
 
          }

        }*/

        /*if (this.pageRotation == 180){

          if(isTop){
            
            rotpointpoly = markup.getrotatedPoint(xscaled + ((wscaled - xscaled) * 0.5), yscaled);
            //topcentery = yscaled;
            
 
          }else{
            
            rotpointpoly = markup.getrotatedPoint(xscaled + ((wscaled - xscaled) * 0.5), hscaled);
            
 
          }

        }*/

        /*if (this.pageRotation == 270){

          if(isTop){
            
            rotpointpoly = markup.getrotatedPoint(xscaled, yscaled + (hscaled - yscaled) * 0.5);
            //topcentery = yscaled;
            
 
          }else{
            
            rotpointpoly = markup.getrotatedPoint(wscaled, yscaled + (hscaled - yscaled) * 0.5);
            
 
          }

        }*/



        startx = rotpointarrow.x / window.devicePixelRatio;
        starty = rotpointarrow.y / window.devicePixelRatio;



      }

      //startx = startx / window.devicePixelRatio;
      //starty = starty / window.devicePixelRatio;


        dx = -26 + _dx;


        this.rectangle = {
          x: startx + dx,
          y: starty + dy,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };


        break;
      /*case MARKUP_TYPES.MEASURE.LENGTH.type:



        this.rectangle = {
          x: xscaled - 5,
          y: yscaled - 5,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };
        break;
        /* case MARKUP_TYPES.LINK:
          this.numbuttons = 2;
          this.rectangle = {
            x: xscaled - 5,
            y: yscaled - 5,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - yoffset,
          };
          break; */

      default:

      //this.numbuttons = 4;

      /*if(markup.type == 3 && markup.subtype == 6){
        this.numbuttons = 8;
      }*/

      /*if(markup.type == 10){
        this.numbuttons = 3;
      }*/


      this.menuwidth = (this.buttonsize * this.numbuttons) + (this.buttongap * (this.numbuttons + 1));
      this.menucenter = this.menuwidth * 0.5;

      dx = -this.menucenter;

      if(isTop){
        //this.rectangle.y = yscaled + hscaled + this.menuheight + offsetTop;

        xval = xscaled + (wscaled * 0.5);
        //yval = yscaled + hscaled;
        
        yval = Math.max(yscaled + hscaled, yscaled);
        
        dy = this.menuheight + offsetTop;
      }else{
        
        xval = xscaled + (wscaled * 0.5);
        //yval = yscaled;

        yval = Math.min(yscaled + hscaled, yscaled);
        

        dy = -this.menuheight + offsetTop;

      }



      if(this.pageRotation != 0){

        //const wscaledus = (markup.wscaled || markup.w);
        //const hscaledus = (markup.hscaled || markup.h);
        //const xscaledus = (markup.xscaled || markup.x);
        //const yscaledus = (markup.yscaled || markup.y);
    
        let maxy = Math.max(yscaledus + hscaledus, yscaledus);
        let miny = Math.min(yscaledus + hscaledus, yscaledus);

        let maxx = Math.max(xscaledus + wscaledus, xscaledus);
        let minx = Math.min(xscaledus + wscaledus, xscaledus);

        let boxheight = Math.abs(hscaledus);
        let boxwidth = Math.abs(wscaledus);


        let rotpoint1 = markup.getrotatedPoint(minx, miny);
        let rotpoint2 = markup.getrotatedPoint(minx + (boxwidth * 0.5), maxy);
        let rotpoint3 = markup.getrotatedPoint(minx + (boxwidth * 0.5), miny);
        let rotpoint4 = markup.getrotatedPoint(minx, miny + (boxheight * 0.5));
        let rotpoint5 = markup.getrotatedPoint(maxx, miny + (boxheight * 0.5));
        let rotpoint6 = markup.getrotatedPoint(minx, miny + (boxheight * 0.5));
        let rotpoint7 = markup.getrotatedPoint(maxx, maxy);
        let rotpoint8 = markup.getrotatedPoint(maxx, miny);

        if (this.pageRotation == 90){

          if(isTop){
            xval = rotpoint5.x / window.devicePixelRatio;
            yval = rotpoint5.y / window.devicePixelRatio;
          }else{
            xval = rotpoint6.x / window.devicePixelRatio;
            yval = rotpoint6.y / window.devicePixelRatio;

          }

          dx = -this.menucenter;
        }

        if (this.pageRotation == 180){

          
          if(isTop){
            xval = rotpoint3.x / window.devicePixelRatio;
            yval = rotpoint3.y / window.devicePixelRatio;

            dy = this.menuheight + offsetTop + 20; //this.menuheight + offsetTop + offsetTop;            

          }else{
            xval = rotpoint2.x / window.devicePixelRatio;
            yval = rotpoint2.y / window.devicePixelRatio;
            
            dy = -(this.menuheight - offsetTop - 20); //
            
            
            
          }

          dx = -this.menucenter;



          //xval = rotpoint4.x;
          //yval = rotpoint4.y;
        }

        if (this.pageRotation == 270){
          if(isTop){
            xval = rotpoint6.x / window.devicePixelRatio;
            yval = rotpoint6.y / window.devicePixelRatio;
            

          }else{

            xval = rotpoint5.x / window.devicePixelRatio;
            yval = rotpoint5.y / window.devicePixelRatio;


          }

          dx = -this.menucenter;
        }
   

      }


        //dx = (wscaled / 2) - 24 + _dx;
        
        this.rectangle = {
          x: xval + dx,
          y: (yval + dy) + rotoffset,
          x_1: xscaled + wscaled - 20,
          y_1: yscaled - yoffset,
        };

        if(isTop){
          this.rectangle.position = "bottom";
        }else{
          this.rectangle.position = "top";
        }
    

        break;
    }


    /*if (this.rectangle.y < 0) {
      this.rectangle.y += hscaled + 72;
      this.rectangle.position = "bottom";
    } else {
      this.rectangle.position = "top";
    }*/

    if (this.rectangle.x < 0) {
      this.rectangle.x = 0;
    }

    if (this.rectangle.x > document.body.offsetWidth - 200) {
      this.rectangle.x = document.body.offsetWidth - 200;
    }
  }

  ngOnInit(): void {
    this.guiMarkupSubscription = this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
      this.visible = false;
      this.annotation = markup;
      //*ngIf="((guiMode$ | async) == 'annotate' || (guiMode$ | async) == 'measure') && ((annotation.type === 1 && [1, 2, 3].includes(annotation.subtype)) || annotation.type === 13 || annotation.type === 8 || (annotation.type === 3 && annotation.subtype === 6)))"

      this.havepointinsert = (this.annotation.type == 1 && (this.annotation.subtype == 1 || this.annotation.subtype == 2 || this.annotation.subtype == 3) || this.annotation.type === 13 || this.annotation.type === 8 || (this.annotation.type === 3 && this.annotation.subtype === 6));
      this.havepointdelete = (this.annotation.type == 1 && (this.annotation.subtype == 1 || this.annotation.subtype == 2 || this.annotation.subtype == 3) || this.annotation.type === 13 || this.annotation.type === 8);
      
      
      //this.moveLabelEnabled = (this.annotation.type === 8);
  

      this.operation = operation;
      this.snap = RXCore.getSnapState();

      if (operation.deleted) return;

      if (
        markup === -1
        || markup.type == MARKUP_TYPES.CALLOUT.type && markup.subtype == MARKUP_TYPES.CALLOUT.subType
        || markup.type == MARKUP_TYPES.SIGNATURE.type && markup.subtype == MARKUP_TYPES.SIGNATURE.subType
        || markup.GetAttribute("Signature")?.value
        ) return;

      this._setButtons();        
      this._setPosition();
      

      this.visible = true;
    });

    this.quickActionsMenuVisibleSubscription = this.annotationToolsService.quickActionsMenuVisible$.subscribe((visibility: boolean) => {
      this.visible = visibility;
      this._setButtons();        
      this._setPosition();
    });

    this.guiOnResizeSubscription = this.rxCoreService.guiOnResize$.subscribe(() => {
      if (this.visible) {
        this._setButtons();        
        this._setPosition();
      }
    });

    this.guiZoomUpdatedSubscription = this.rxCoreService.guiZoomUpdated$.subscribe(({params, zoomtype}) => {
      if(zoomtype == 0 || zoomtype == 1){
        this.visible = false;
      }

    });




    this.guiMarkupHoverSubscription = this.rxCoreService.guiMarkupHover$.subscribe(({markup, x, y}) => {
      if (markup?.type == MARKUP_TYPES.COUNT.type) {
        this.x = x;
        this.y = y;
      } else {
        this.x = this.y = 0;
      }
    });

    this.rxCoreService.guiOnMarkupChanged.subscribe(({annotation, operation}) => {
      this.visible = false;
    });

    this.userService.canDeleteAnnotation$.subscribe((hasPermission) => {
      this.visible = false;
    });

    this.rxCoreService.guiRotatePage$.subscribe(({degree, pageIndex}) => {

      //this.pageNumber = pageIndex;
      this.pageRotation = degree;

    });


  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (this.annotation !== -1) {
      //this._setPosition();
      //this.visible = true;
    }
  }

  ngOnDestroy(): void {
    if (this.guiMarkupSubscription) this.guiMarkupSubscription.unsubscribe();
    if (this.quickActionsMenuVisibleSubscription) this.quickActionsMenuVisibleSubscription.unsubscribe();
    if (this.guiOnResizeSubscription) this.guiOnResizeSubscription.unsubscribe();
    if (this.guiMarkupHoverSubscription) this.guiMarkupHoverSubscription.unsubscribe();
    if (this.guiZoomUpdatedSubscription) this.guiZoomUpdatedSubscription.unsubscribe();

  }

  onEditClick(): void {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }

    switch(this.annotation.type) {
      case MARKUP_TYPES.NOTE.type:
        this.annotationToolsService.setNotePopoverState({ visible : true, markup: this.annotation });
        break;
      case MARKUP_TYPES.ERASE.type:
        if (this.annotation.subtype == MARKUP_TYPES.ERASE.subType) {
          this.annotationToolsService.setErasePanelState({ visible: true });
        } else {
          this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        }
        break;
      case MARKUP_TYPES.ARROW.type:
        if(this.annotation.subType != MARKUP_TYPES.CALLOUT.subType) {
          //this.annotationToolsService.setContextPopoverState({ visible : true });
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }
        break;
      case MARKUP_TYPES.MEASURE.LENGTH.type:
        this.annotationToolsService.setPropertiesPanelState({ visible : true });
        break;
      case MARKUP_TYPES.MEASURE.AREA.type:
        if (this.annotation.subtype == MARKUP_TYPES.MEASURE.AREA.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }
        break;
      case MARKUP_TYPES.MEASURE.PATH.type:
      case MARKUP_TYPES.MEASURE.ANGLECLOCKWISE.type:
      case MARKUP_TYPES.MEASURE.ANGLECCLOCKWISE.type:
      case MARKUP_TYPES.PAINT.POLYLINE.type:
        if (this.annotation.subtype == MARKUP_TYPES.MEASURE.PATH.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }
        if (this.annotation.subtype == MARKUP_TYPES.PAINT.POLYLINE.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        }
        if (this.annotation.subtype == MARKUP_TYPES.SHAPE.POLYGON.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        }

        if (this.annotation.subtype == MARKUP_TYPES.MEASURE.ANGLECLOCKWISE.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }
        if (this.annotation.subtype == MARKUP_TYPES.MEASURE.ANGLECCLOCKWISE.subType) {
          this.annotationToolsService.setPropertiesPanelState({ visible : true });
        }


        break;
      
      default:
        this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
        break;
    }

    this.visible = false;
  }

  saveLink(): void {
    this.addLink = false;
    this.annotation.setLink(this.annotation.linkURL === '' ? ' ' : this.annotation.linkURL, this.annotation.linkURL !== '');
    RXCore.markUpSave();

  }

  onSnapClick(): void {
    this.snap = !this.snap;
    RXCore.changeSnapState(this.snap);
  }

  copyMarkUp(): void  {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.notificationService.notification({message: 'Markup successfully copied.', type: 'info'});
    RXCore.copyMarkUp();
  }

  onInfoClick(): void {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.annotationToolsService.setPropertiesPanelState({ visible: true, readonly: false });
    this.visible = false;
  }

  onNoteClick(): void {
    RXCore.markUpNote(true);
    //this.annotationToolsService.setNotePanelState({ visible: true, markupnumber: this.annotation.markupnumber });
    /*setTimeout(() => {
      RXCore.doResize(0, 0);
    }, 100);*/

    this.visible = false;
  }

  onDeleteClick(): void {
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.confirmDeleteOpened = true;
    this.visible = false;
  }
  onInsertClick(): void {
    if(this.annotation.type === MARKUP_TYPES.SHAPE.RECTANGLE.type) {
      RXCore.markupRectToAreaSwitch(this.annotation);
    }    
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
 
    RXCore.insertPoint();
    this.visible = false;
  }

  onDeletePointClick(): void {
    if (this.annotation.type === MARKUP_TYPES.SHAPE.RECTANGLE.type) {
      RXCore.markupRectToAreaSwitch(this.annotation);
    }
    if (this.operation?.created) {
      RXCore.selectMarkUp(true);
    }
  
    RXCore.deletePoint();
    this.visible = false;
  }

  onShowHideLabelClick(): void {    
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    if(!this.annotation.hidevaluelabel) {
      this.annotation.hidelabelmarkupobj();
    }
    else {
      this.annotation.showlabelmarkupobj();
    }
    RXCore.markUpRedraw();
    this.visible = false;
  }

  onMoveLabelClick(): void {
    this.moveLabelEnabled = !this.moveLabelEnabled;
    if(this.moveLabelEnabled) {

      if(this.annotation.type == 3){
        RXCore.markupRectToAreaSwitch(this.annotation);
      }
      RXCore.moveLabelEnable(this.moveLabelEnabled);
    }
  }
 
  onHoleClick(): void { 
    if(this.annotation.type === MARKUP_TYPES.SHAPE.RECTANGLE.type) {
      RXCore.markupRectToAreaSwitch(this.annotation);
    }   
    if (this.operation?.created) { RXCore.selectMarkUp(true); }
    this.annotationToolsService.setMeasurePanelDetailState({ visible: true, type: MARKUP_TYPES.MEASURE.AREA.type, created: true });
    //RXCore.markUpArea(true, this.annotation.markupnumber);
    RXCore.markUpAreaHole(true);

    this.visible = false;
  }

  onRedirectClick(): void {
    if (this.annotation.linkURL !== '') {
      window.open(this.annotation.linkURL, '_blank');
    }
  }

  onMoveToBackClick(): void {
    RXCore.movetoBack();
    //RXCore.markUpRedraw();
  }


  onMoveToFrontClick(): void {
    RXCore.movetoFront();
    //RXCore.markUpRedraw();
  }



}
