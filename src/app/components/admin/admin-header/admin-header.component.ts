import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { UserService } from '../../user/user.service';
import { RXCore } from 'src/rxcore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent {
  constructor(  private readonly rxCoreService: RxCoreService, private loginService: LoginService,
      private userService: UserService, private router:Router
  ){}
    guiConfig$ = this.rxCoreService.guiConfig$;
    guiConfig: IGuiConfig | undefined;
  @Input() isSidenavOpen: boolean = true;
  @Output() toggleSidenav = new EventEmitter<void>();
   isLoggingOut: boolean = false;
  userInfoPanelOpened: boolean = false;

  
  isMenuOpen = false;
  userName = 'Admin';
  
  username = '';
  displayName = '';
email:''
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
  onLogoutClick() {
    this.isLoggingOut = true;
    this.userService.logout()
      .then(() => {
        this.userService.setUserPermissions(); // clear permissions
        this.username = '';
        this.displayName = '';
        this.email = '';
        RXCore.setUser('', '');
        
        // Clear admin permissions from localStorage
         localStorage.removeItem('adminPermission');
      this.loginService.clearAdminPermission();
      this.router.navigate([''])
      })
      .catch((e) => {
        console.error('Logout failed:', e.error);
      })
      .finally(() => {
        this.isLoggingOut = false;
        this.userInfoPanelOpened = false;
        this.loginService.clearLoginInfo();
      });

    if(this.guiConfig?.forceLogin) {
      this.loginService.enableLandingPageLayout(false);
      this.loginService.showLoginModal(this.guiConfig?.forceLogin);
    }
  }
}
