import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { User, UserService } from '../user.service';

@Component({
  selector: 'rx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  guiMode$ = this.rxCoreService.guiMode$;
  username = '';
  displayName = '';
  email = '';
  permissions = '';
  isLoggingIn = false;
  isLoggingOut = false;
  isLoginFailed = false;
  loginPanelOpened = false;
  userInfoPanelOpened = false;
  loginUsername = '';
  loginPassword = '';

  useBuildinUser: boolean;
  selectedBuildinUsername: string = '';

  constructor (
    private readonly rxCoreService: RxCoreService,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.rxCoreService.guiState$.subscribe((state) => {
    });
  }

  openLoginDialog() {
    this.loginPanelOpened = true;
    // Use buildin user by default, and set 'bob' the selected option, and, fill in password
    this.useBuildinUser = true;
    this.selectedBuildinUsername = 'bob';
    this.loginPassword = '123456';
  }

  closeLoginDialog() {
    this.loginPanelOpened = false;
    this.isLoggingIn = false;
  }

  toggleUserInfoPanel() {
    this.userInfoPanelOpened = !this.userInfoPanelOpened;
  }

  closeUserInfoPanel() {
    this.userInfoPanelOpened = false;
  }

  onLogin() {
    this.isLoggingIn = true;
    this.userService.login(this.loginUsername, this.loginPassword)
      .then((user: User) => {
        this.username = this.loginUsername;
        this.displayName = user.displayName || '';
        this.email = user.email;
        this.loginPanelOpened = false;
        this.closeLoginDialog();
        RXCore.setUser(user.username, user.displayName || user.username);

        console.log('Login success:', user);
        // TODO: hard code projId to 1
        this.userService.getPermissions(1, user.id).then(res => {
          this.userService.setUserPermissions(res);
          if (Array.isArray(res)) {
            const permKeys = res.map((item) => item.permission.key).join(', ');
            this.permissions = permKeys;
          }
        });
        this.userService.getAnnotations(1).then(res => {
          this.userService.setAnnotations(res);
        });
      }).catch((e) => {
        console.error('Login failed:', e.error);
        alert(e.error.message);
      }).finally(() => {
        this.isLoggingIn = false;
      });
  }

  onLogoutClick() {
    this.isLoggingOut = true;
    this.userService.logout()
      .then(() => {
        this.userService.setUserPermissions(); // clear permissions
        this.username = '';
        this.email = '';
        RXCore.setUser('', '');
      })
      .catch((e) => {
        console.error('Logout failed:', e.error);
      })
      .finally(() => {
        this.isLoggingOut = false;
        this.userInfoPanelOpened = false;
      });
  }

  onBuildinUsernameChange() {
    if (this.selectedBuildinUsername === '') {
      this.useBuildinUser = false;
      this.loginUsername = '';
    } else {
      this.useBuildinUser = true;
      this.loginUsername = this.selectedBuildinUsername;
      this.loginPassword = '123456';
    }
  }
}
