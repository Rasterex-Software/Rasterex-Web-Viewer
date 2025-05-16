import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { User, UserService } from '../user.service';
import { LoginService } from 'src/app/services/login.service';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';

@Component({
  selector: 'rx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  guiConfig$ = this.rxCoreService.guiConfig$;
  guiConfig: IGuiConfig | undefined;
  username = '';
  displayName = '';
  email = '';
  groupedPermissions: { [type: string]: string[] } = {};
  isLoggingIn = false;
  isLoggingOut = false;
  userInfoPanelOpened = false;
  objectKeys = Object.keys;

  @ViewChild('userInfoPanel', { static: false }) userInfoPanelRef!: ElementRef;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly userService: UserService,
    public loginService: LoginService
  ) {}

  ngOnInit(): void {

    this.guiConfig$.subscribe(config => {
      this.guiConfig = config;
    });
       
       this.loginService.username$.subscribe(username => {
    this.username = username;
  });

  this.loginService.displayName$.subscribe(name => {
    this.displayName = name;
  });

 this.loginService.email$.subscribe(name => {
    this.email = name;
  });

   this.loginService.permissions$.subscribe(permission => {
    this.groupedPermissions = permission;
  });
    
  }

  openLoginDialog() {
    this.loginService.showLoginModal(false);
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
      })
      .catch((e) => {
        console.error('Logout failed:', e.error);
      })
      .finally(() => {
        this.isLoggingOut = false;
        this.userInfoPanelOpened = false;
        this.loginService.clearLoginInfo();
      });

      if(this.guiConfig?.forceLogin){
       this.loginService.enableLandingPageLayout(false);
       this.loginService.showLoginModal(this.guiConfig?.forceLogin);
      }
  }

  toggleUserInfoPanel() {
    this.userInfoPanelOpened = !this.userInfoPanelOpened;
  }

@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const clickedInsidePanel = this.userInfoPanelRef?.nativeElement.contains(target);
  const clickedUserButton = target.closest('#userInfoButton');
  if (!clickedInsidePanel && !clickedUserButton && this.userInfoPanelOpened) {
    this.userInfoPanelOpened = false;
  }
}
}