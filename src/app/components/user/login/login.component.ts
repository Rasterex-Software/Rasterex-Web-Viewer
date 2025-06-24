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
  //guiMode$ = this.rxCoreService.guiMode$;
  guiConfig$ = this.rxCoreService.guiConfig$;
  guiConfig: IGuiConfig | undefined;


  username = '';
  displayName = '';
  email = '';
  groupedPermissions: { [type: string]: string[] } = {};
  permissions = '';
  isLoggingIn = false;
  isLoggingOut = false;
  //isLoginFailed = false;
  //loginPanelOpened = false;

  userInfoPanelOpened = false;
  objectKeys = Object.keys;

  //loginUsername = '';
  //loginPassword = '';

  //useBuildinUser: boolean;
  //selectedBuildinUsername: string = '';

  @ViewChild('userInfoPanel', { static: false }) userInfoPanelRef!: ElementRef;

  constructor (
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
  

    /*this.rxCoreService.guiState$.subscribe((state) => {
    });*/

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

  private initializeFromStoredUser(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      // console.log('Login component initialized with stored user:', currentUser.username);
      this.username = currentUser.username;
      this.displayName = currentUser.displayName || '';
      this.email = currentUser.email;

      // Load permissions for the stored user
      this.loadUserPermissions(currentUser);
    } else {
      // console.log('No stored user found during login component initialization');
    }
  }

  private loadUserPermissions(user: User): void {
    // console.log('Loading permissions for user:', user.username);
    this.userService.getPermissions(1, user.id).then(res => {
      this.userService.setUserPermissions(res);
      if (Array.isArray(res)) {
        const permKeys = res.map((item) => item.permission.key).join(', ');
        this.permissions = permKeys;
      }
    }).catch(error => {
      console.error('Error loading permissions:', error);
    });
  }

  openLoginDialog() {
    this.loginService.showLoginModal(false);

  }


  /*openLoginDialog() {
    this.loginPanelOpened = true;
    // Use buildin user by default, and set 'bob' the selected option, and, fill in password
    this.useBuildinUser = true;
    this.selectedBuildinUsername = 'bob';
    this.loginUsername = this.selectedBuildinUsername;
    this.loginPassword = '123456';
    
  }*/

  /*closeLoginDialog() {
    this.loginPanelOpened = false;
    this.isLoggingIn = false;
  }*/

  /*toggleUserInfoPanel() {
    this.userInfoPanelOpened = !this.userInfoPanelOpened;
  }*/

  /*closeUserInfoPanel() {
    this.userInfoPanelOpened = false;
  }*/

 

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


  /*onBuildinUsernameChange() {
    if (this.selectedBuildinUsername === '') {
      this.useBuildinUser = false;
      this.loginUsername = '';
    } else {
      this.useBuildinUser = true;
      this.loginUsername = this.selectedBuildinUsername;
      this.loginPassword = '123456';
    }
  }*/


}
