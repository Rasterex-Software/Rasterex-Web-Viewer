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
  isLoggingIn = false;
  isLoggingOut = false;
  isLoginFailed = false;
  loginPanelOpened = false;
  loginUsername = '';
  loginPassword = '';

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
  }

  closeLoginDialog() {
    this.loginPanelOpened = false;
    this.isLoggingIn = false;
  }

  onLogin() {
    this.isLoggingIn = true;
    this.userService.login(this.loginUsername, this.loginPassword)
      .then((user: User) => {
        this.username = this.loginUsername;
        this.displayName = user.displayName || '';
        this.loginPanelOpened = false;
        this.closeLoginDialog();
        RXCore.setUser(user.username, user.displayName || user.username);

        console.log('Login success:', user);
        // TODO: hard code projId to 1
        this.userService.getPermissions(1, user.id).then(res => this.userService.setUserPermissions(res));
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
        RXCore.setUser('', '');
      })
      .catch((e) => {
        console.error('Logout failed:', e.error);
      })
      .finally(() => {
        this.isLoggingOut = false;
      });
  }
}
