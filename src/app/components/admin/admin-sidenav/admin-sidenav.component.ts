import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidenav',
  templateUrl: './admin-sidenav.component.html',
  styleUrls: ['./admin-sidenav.component.scss']
})
export class AdminSidenavComponent {
 constructor(private router: Router) { }

  navigateToUpload(): void {
    this.router.navigate(['/admin/upload']);
  }
 
   isSidenavOpen = true;
  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
  
}
