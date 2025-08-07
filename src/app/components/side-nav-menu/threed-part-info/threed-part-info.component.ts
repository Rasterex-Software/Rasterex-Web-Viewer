import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
  selector: 'rx-threed-part-info',
  templateUrl: './threed-part-info.component.html',
  styleUrls: ['./threed-part-info.component.scss']
})
export class ThreedPartInfoComponent implements OnInit {
  infoData: any = {};
  infoPanelVisible: boolean = false;

  constructor(
    private readonly rxCoreService: RxCoreService, 
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.rxCoreService.guiState$.subscribe((state) => {
      this.infoPanelVisible = false;
      this.infoData = {};
    });

    this.rxCoreService.gui3DPartInfo$.subscribe(info => {
      this.infoData = info;
      this.infoPanelVisible = Object.keys(info).length > 0;
    });
  }

  copyText(value: string | unknown) {
    if (typeof value !== 'string') return;
    navigator.clipboard.writeText(value)
      .then(() => { this.notificationService.notification({message: 'Attribute successfully copied.', type: 'info'}); })
      .catch((err) => { this.notificationService.notification({message: 'Something went wrong.', type: 'error'}); });
  }
}
