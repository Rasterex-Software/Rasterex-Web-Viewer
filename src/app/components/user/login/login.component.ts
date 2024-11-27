import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { UserService } from '../user.service';

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
    this.userService.login(this.loginUsername, this.loginPassword).subscribe({
      next: (v) => {
        this.username = this.loginUsername;
        this.displayName = v.displayName;
        this.isLoggingIn = false;
        this.loginPanelOpened = false;
        // TODO: hard code projId to 1
        this.userService.getPermissions(1, v.id);

        this.closeLoginDialog();

        RXCore.setUser(v.username, v.displayName);
        console.log('Login success:', v);
      },
      error: (e) => {
        console.error('Login failed:', e.error);
        alert(e.error.message);
        this.isLoggingIn = false;
      },
      complete: () => {
      }
    });
  }

  onLogoutClick() {
    this.isLoggingOut = true;
    this.userService.logout().subscribe({
      next: (v) => console.log(v),
      error: (e) => console.error(e),
      complete: () => {
        this.username = '';
        this.isLoggingOut = false;
      }
    });
  }
}
