import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-admin-landing',
  templateUrl: './admin-landing.component.html',
  styleUrls: ['./admin-landing.component.scss']
})
export class AdminLandingComponent {

 isSidenavOpen = true;
  onToggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }


}
