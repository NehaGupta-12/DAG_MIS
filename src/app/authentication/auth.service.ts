import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AngularFireDatabase} from '@angular/fire/compat/database';
import {UserDataModel} from '../module/add-user/UserData.model';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Permission} from "../interfaces/products.interface";
import {RoleService} from "../Services/role.service";
import {User} from "@core";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { ActivityLogService } from "../module/activity-log/activity-log.service";
import {ActivityLog} from "../module/activity-log/activity-log.component"; // adjust path

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userRolePermissions: Permission[] = [];
  private currentUserSubject: BehaviorSubject<User> | undefined;
  private permissionsLoadedSubject = new BehaviorSubject<boolean>(false);
  public permissionsLoaded$ = this.permissionsLoadedSubject.asObservable();
  public currentUser: Observable<User> | undefined;
  constructor(
    public mAuth: AngularFireAuth,
    private router: Router,
    public functions: AngularFireFunctions,
    private mDatabase: AngularFireDatabase,
    private _snackBar: MatSnackBar,
    private injector: EnvironmentInjector,
    private roleService: RoleService,
    private firestore : AngularFirestore,
    private mLogService: ActivityLogService   // ✅ inject ActivityLogService
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
    const cachedPermissions = localStorage.getItem('userRolePermissions');
    if (cachedPermissions) {
      this.userRolePermissions = JSON.parse(cachedPermissions);
      this.permissionsLoadedSubject.next(true);
    }

    console.log('userRoelPermissions', this.userRolePermissions);
  }
  public get currentUserValue(): User {
    return <User>this.currentUserSubject?.value;
  }

  async loadUserRole(roleName: string | undefined) {
    console.log(roleName)
    try {
      const snapshot = await runInInjectionContext(this.injector, async () => {
        return await firstValueFrom(
          this.firestore
            .collection('roles', ref => ref.where('roleName', '==', roleName))
            .get()
        );
      });

      if (!snapshot.empty) {
        const role: any = snapshot.docs[0].data();
        this.userRolePermissions = role.permissions || [];
        console.log('Loaded role permissions:', this.userRolePermissions);

        // 🔹 Mark permissions as loaded
        this.permissionsLoadedSubject.next(true);

        // 🔹 Optional: cache permissions in localStorage
        localStorage.setItem('userRolePermissions', JSON.stringify(this.userRolePermissions));
      }
    } catch (error) {
      console.error('Error loading role:', error);
    }
  }

  hasPermission(title: string, action: 'list' | 'create' | 'edit' | 'delete' | 'print' | 'export' | 'approved' | 'disapproved'): boolean {
    const menuPerm = this.userRolePermissions.find(p => p.menu_name === title);
    return menuPerm?.permissions?.[action] === true;
  }


  canShowMenu(menuName: string): boolean {
    const menu = this.userRolePermissions.find((p: any) => p.menu_name === menuName);
    // console.log(this.userRolePermissions.find((p: any) => p.menu_name === menuName))
    // console.log(menuName + 'in canShowMenu: ' + JSON.stringify(menu?.permissions?.showMenu));
    return !!menu?.permissions?.showMenu; // show only if this menu.permission.list exists in permissions


  }
  // canShowMenu(menuName: string): boolean {
  //   const translatedName = this.translate.instant(menuName); // convert key to real label
  //   const menu = this.userRolePermissions.find((p: any) => p.menu_name === translatedName);
  //   return !!menu;
  // }



  // async login(email: string, password: string) {
  //   localStorage.clear();
  //   try {
  //     const userCredential = await this.mAuth.signInWithEmailAndPassword(email, password).catch(() => {
  //       this._snackBar.open('Invalid Username Or Password', 'Close', {
  //         duration: 3000,
  //       });
  //       return null;
  //     });
  //     if (userCredential && userCredential.user) {debugger
  //       const user = userCredential.user;
  //       console.log('Login successful:', JSON.stringify(user));
  //
  //       localStorage.setItem('user', JSON.stringify(user));
  //       localStorage.setItem('uid', user.uid);
  //       if (user.email) {
  //         localStorage.setItem('userEmail', user.email);
  //       }
  //       runInInjectionContext(this.injector, async () => {
  //         const currentIp = localStorage.getItem('currentip') || '';
  //         let activity : ActivityLog = {
  //           date: new Date().getTime(),
  //           section: 'Login',
  //           action: 'Login',
  //           user: user.email || 'N/A',
  //           description: 'Login by user ',
  //           currentIp: currentIp,
  //           changes: [], // empty array by default
  //         };
  //         await this.mLogService.addLog(activity);
  //         await this.setUserData(user.uid);
  //         console.log('Login activity logged and user data set.');
  //       });
  //     }
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       this._snackBar.open('Login failed: ' + err.message, 'Close', {
  //         duration: 3000,
  //       });
  //     }
  //   }
  // }
  async login(email: string, password: string) {
    localStorage.clear();
    try {
      const userCredential = await this.mAuth.signInWithEmailAndPassword(email, password);
      if (userCredential && userCredential.user) {
        const user = userCredential.user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('uid', user.uid);
        if (user.email) {
          localStorage.setItem('userEmail', user.email);
        }

        // Log activity
        runInInjectionContext(this.injector, async () => {
          const currentIp = localStorage.getItem('currentip') || '';
          let activity: ActivityLog = {
            date: new Date().getTime(),
            section: 'Login',
            action: 'Login',
            user: user.email || 'N/A',
            description: 'Login by user ',
            currentIp: currentIp,
            changes: [],
          };
          await this.mLogService.addLog(activity);
          await this.setUserData(user.uid);
        });
        return user;
      }
      throw new Error('Invalid user'); // fallback
    } catch (err: any) {
      let message = 'Username and Password not valid!';
      if (err.code === 'auth/user-disabled') {
        message = 'Your ID is deactivated. Please contact admin.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Invalid Username or Password';
      }
      this._snackBar.open(message, 'Close', { duration: 4000 });
      throw err;
    }
  }



  async logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userRolePermissions');
    this.router.navigate(['/authentication/signin']).then(() => {
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = function () {
        window.history.go(1);
      };
    });
    runInInjectionContext(this.injector, async () => {
      let activity = {
        date: new Date().getTime(),
        section: 'Logout',
        action: 'Logout',
        description: 'Logout by user ',
        currentIp: localStorage.getItem('currentip')!,
      };
      await this.mLogService.addLog(activity);
    })
  }




  async setUserData(uid: string) {
    try {
      runInInjectionContext(this.injector, () => {
        this.mDatabase
          .object<UserDataModel>('users/' + uid)
          .valueChanges()
          .subscribe((userData:any) => {
            if (userData) {
              console.log('USERDATA ===>>>', userData);
              localStorage.setItem('userData', JSON.stringify(userData));
              this.loadUserRole(userData?.role)
            }

            this.router.navigate(['dashboard/main']).then(() => {
              console.log('Redirected to dashboard');
            });
          });
      });
    } catch (error) {
      console.error('Error in setUserData', error);
    }
  }

  async changePasswordOfAnotherUser(uid: string, password: string) {
    const changePassword = this.functions.httpsCallable('changePassword');
    try {
      const res = await firstValueFrom(changePassword({uid, newPassword: password}));
      console.log(res);
      this._snackBar.open('Password changed successfully', 'Close', {duration: 3000});
    } catch (error) {
      console.error('Error changing password', error);
      this._snackBar.open('Error changing password', 'Close', {duration: 3000});
    }
  }

}
