import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { RxCoreService } from '../../../services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { Router } from '@angular/router';
import { FileGaleryService } from '../../file-galery/file-galery.service';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {

  constructor(
  ) { }

  ngOnInit() {
  }
}
