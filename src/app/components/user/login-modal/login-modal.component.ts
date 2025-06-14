import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { UserService, User } from '../user.service';
import { RXCore } from 'src/rxcore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit, OnDestroy {
  loginUsername = '';
  loginPassword = '';
  useBuildinUser = true;
  selectedBuildinUsername = 'bob';
  isLoggingIn = false;
  isLoginFailed = false;
  forceToLogInDisableCancel = false;

  private loginModalSub: Subscription | undefined;

  constructor(
    private loginService: LoginService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginModalSub = this.loginService.loginModalVisible$.subscribe((visible) => {
      if (visible) {
        this.resetForm();
      }
    });

    this.loginService.forceToLogInDisableCancel$.subscribe((forceToDisableCancel) => {
      this.forceToLogInDisableCancel = forceToDisableCancel;
    });
  }

  ngOnDestroy() {
    this.loginModalSub?.unsubscribe();
  }

  get visible() {
    return this.loginService.loginModalVisible$.value;
  }

  resetForm() {
    this.useBuildinUser = true;
    this.selectedBuildinUsername = 'bob';
    this.loginUsername = this.selectedBuildinUsername;
    this.loginPassword = '123456';
    this.isLoginFailed = false;
    this.isLoggingIn = false;
  }

  close() {
    this.loginService.hideLoginModal();
    this.isLoggingIn = false;
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

  onLogin() {
    this.isLoginFailed = false;
    this.isLoggingIn = true;
    this.userService.login(this.loginUsername, this.loginPassword)
      .then((user: User) => {

        try {
          RXCore.setUser(user.username, user.displayName || user.username);
        } catch (err) {
          console.log(err);
        }

        this.userService.getPermissions(1, user.id).then(res => {
          this.userService.setUserPermissions(res);
          console.log("user permision set", res)
          this.loginService.setPermissionsInProfilePanel(res);
          // Check for AdminAccess permission
          const adminPermission = res.find(p => p.permission?.key === 'AdminAccess');

          if (adminPermission) {
            localStorage.setItem('adminPermission', JSON.stringify(adminPermission));
            this.loginService.setAdminFlagBasedOnLocalStorage();
            this.router.navigate(['/admin']);
          } else {
            this.loginService.clearAdminPermission();
            this.router.navigate(['/']);
          }

        });
        this.loginService.hideLoginModal();
        this.loginService.setLoginInfo(user.username, user.displayName || user.username, user.email);

        this.loginService.enableLandingPageLayout(true);
      })
      .catch((e) => {
        console.error('Login failed:', e.error || e.message);
        this.isLoginFailed = true;
        // alert(e.error?.message || 'Login failed');
      })
      .finally(() => {
        this.isLoggingIn = false;
      });
  }
}
