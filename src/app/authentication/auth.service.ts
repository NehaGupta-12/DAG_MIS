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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userRolePermissions: Permission[] = [];
  private currentUserSubject: BehaviorSubject<User> | undefined;
  public currentUser: Observable<User> | undefined;
  constructor(
    public mAuth: AngularFireAuth,
    private router: Router,
    public functions: AngularFireFunctions,
    private mDatabase: AngularFireDatabase,
    private _snackBar: MatSnackBar,
    private injector: EnvironmentInjector,
    private roleService: RoleService,
    private firestore : AngularFirestore
  ) {
  }
  public get currentUserValue(): User {
    return <User>this.currentUserSubject?.value;
  }

  async loadUserRole(roleName: string | undefined) {
    console.log(roleName)
    try {
      const snapshot = await runInInjectionContext(this.injector, async () => {
        // Firestore .get() returns an Observable, so wrap in firstValueFrom
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
      }
    } catch (error) {
      console.error('Error loading role:', error);
    }
  }


  hasPermission(menuName: string, action: keyof Permission['permissions']): boolean {
    const menu = this.userRolePermissions.find((p: Permission) => p.menu_name === menuName);
    return menu ? !!menu.permissions[action] : false;
  }



  async login(email: string, password: string) {
    localStorage.clear();
    try {
      const userCredential = await this.mAuth.signInWithEmailAndPassword(
        email,
        password
      ).catch(() => {
        this._snackBar.open('Invalid Username Or Password', 'Close', {
          duration: 3000,
        });
        return null;
      });

      if (userCredential && userCredential.user) {
        const user = userCredential.user;
        console.log('Login successful:', JSON.stringify(user));

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('uid', user.uid);
        this.loadUserRole(user.uid)
        if (user.email) {
          localStorage.setItem('userEmail', user.email);
        }

        await this.setUserData(user.uid);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this._snackBar.open('Login failed: ' + err.message, 'Close', {
          duration: 3000,
        });
      }
    }
  }

  logout(): void {
    console.log('Inside logout service');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('uid');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    sessionStorage.clear();

    this.router.navigateByUrl('/authentication/signin', {replaceUrl: true});
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
