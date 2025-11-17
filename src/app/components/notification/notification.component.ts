import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  type: string = '';
  message: string = '';
  duration:number = 3000;
  isNotification: boolean = false;

  typeInfo = {
    'info': {
      title: 'Information',
      src: 'assets/images/inform-ico.svg'
    },
    'error': {
      title: 'Error',
      src: 'assets/images/error-ico.svg'
    },
    'warning': {
      title: 'Warning',
      src: 'assets/images/warning-ico.svg'
    },
    'success': {
      title: 'Success',
      src: 'assets/images/success-ico.svg'
    }
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe(data => {
      if (data.type) {
        this.isNotification = false;
        this.type = data.type;
        this.message = data.message;
        this.isNotification = true;
        if(data.duration){
          this.duration = data.duration;
        }
        setTimeout(() => {
          this.closeNotification();
        }, this.duration);
      }
    });
  }

  closeNotification() {
    this.isNotification = false;
  }
}
