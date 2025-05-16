import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProjectUserPermission } from '../components/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // Controls visibility of the global login modal
  loginModalVisible$ = new BehaviorSubject<boolean>(false);
   forceToLogInDisableCancel$ = new BehaviorSubject<boolean>(false);

private usernameSubject = new BehaviorSubject<string>('');
username$ = this.usernameSubject.asObservable();

private displayNameSubject = new BehaviorSubject<string>('');
displayName$ = this.displayNameSubject.asObservable();

private emailSubject = new BehaviorSubject<string>('');
email$ = this.emailSubject.asObservable();

groupedPermissions: { [type: string]: string[] } = {};
private permissionSubject = new BehaviorSubject<{ [type: string]: string[] }>({});
permissions$ = this.permissionSubject.asObservable();

private enableLandingPageSubject = new BehaviorSubject<boolean>(false);
enableLandingPage$ = this.enableLandingPageSubject.asObservable();

  constructor() {}

setLoginInfo(username: string, displayName: string, email: string) {
  this.usernameSubject.next(username);
  this.displayNameSubject.next(displayName);
    this.emailSubject.next(email);
}

enableLandingPageLayout(enableLandingPage: boolean){
this.enableLandingPageSubject.next(enableLandingPage);
}

setPermissionsInProfilePanel(permissions?: ProjectUserPermission[]) {
  this.groupedPermissions = {};

  if (!permissions || !Array.isArray(permissions)) return;

  permissions.forEach((permObj: any) => {
    const key: string = permObj.permission?.key || '';
    const [type, action] = key.split('.'); 

    if (!type || !action) return;

    if (!this.groupedPermissions[type]) {
      this.groupedPermissions[type] = [];
    }

    if (!this.groupedPermissions[type].includes(action)) {
      this.groupedPermissions[type].push(action);
    }
  });

  this.permissionSubject.next(this.groupedPermissions);
}

clearLoginInfo() {
  this.usernameSubject.next('');
  this.displayNameSubject.next('');
}

  showLoginModal(forceToLogin:boolean) {
    this.loginModalVisible$.next(true);
    this.forceToLogInDisableCancel$.next(forceToLogin);
  }

  hideLoginModal() {
    this.loginModalVisible$.next(false);
  }
}
