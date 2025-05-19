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

    // Initialize component with current user data if available
    this.initializeFromStoredUser();

    // Subscribe to any changes in the user state
    this.userService.currentUser$.subscribe(user => {
      console.log('User state changed:', user);
      if (user) {
        this.username = user.username;
        this.displayName = user.displayName || '';
        this.email = user.email;

        // Load permissions for the current user
        this.loadUserPermissions(user);
      } else {
        this.username = '';
        this.displayName = '';
        this.email = '';
        this.permissions = '';
      }
    });

    this.rxCoreService.guiState$.subscribe((state) => {
    });
  }

  private initializeFromStoredUser(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      console.log('Login component initialized with stored user:', currentUser.username);
      this.username = currentUser.username;
      this.displayName = currentUser.displayName || '';
      this.email = currentUser.email;

      // Load permissions for the stored user
      this.loadUserPermissions(currentUser);
    } else {
      console.log('No stored user found during login component initialization');
    }
  }

  private loadUserPermissions(user: User): void {
    console.log('Loading permissions for user:', user.username);
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
    this.loginPanelOpened = true;
    // Use buildin user by default, and set 'bob' the selected option, and, fill in password
    this.useBuildinUser = true;
    this.selectedBuildinUsername = 'bob';
    this.loginUsername = this.selectedBuildinUsername;
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

        try {
          RXCore.setUser(user.username, user.displayName || user.username);
        } catch (err) {
          console.log(err);
        }

        console.log('Login success:', user);

        


        // TODO: hard code projId to 1

        // Permissions will be loaded via the currentUser$ subscription


        /*this.userService.getPermissions(1, user.id).then(res => {
          this.userService.setUserPermissions(res);
          if (Array.isArray(res)) {
            const permKeys = res.map((item) => item.permission.key).join(', ');
            this.permissions = permKeys;
          }
        });*/
        /*this.userService.getAnnotations(1).then(res => {
          this.userService.setAnnotations(res);
        });*/
      }).catch((e) => {
        console.error('Login failed:', e.error || e.message);
        alert(e.error?.message || 'Login failed');
      }).finally(() => {
        this.isLoggingIn = false;
      });
  }

  onLogoutClick() {
    this.isLoggingOut = true;
    this.userService.logout()
      .then(() => {
        this.userService.setUserPermissions(); // clear permissions
        // User data will be cleared via the currentUser$ subscription
        //this.username = '';
        //this.email = '';
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
