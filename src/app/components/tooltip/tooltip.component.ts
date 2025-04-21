import { Component, ElementRef, OnInit } from '@angular/core';
import { TooltipService } from './tooltip.service';

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
  duration:number = 500;
  isShowTooltip: boolean = false;
  iconSrc = "";
  title = "Information";
  message = "content";
  position = [0, 0];

  timer: any = null;

  constructor(private tooltipService: TooltipService, private el: ElementRef) {}

  ngOnInit() {
    this.tooltipService.tooltip$.subscribe(data => {
      this.iconSrc = data.iconSrc;
      this.title = data.title || this.title;
      this.message = data.message;
      this.duration = data.duration || this.duration;
      this.position = data.position || this.position;

      if (!data.message) { 
        this.closeNotification();
      } else {
        this.isShowTooltip = true;
      }
      
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.closeNotification();
      }, this.duration);
    });
  }

  closeNotification() {
    this.isShowTooltip = false;
  }
}
