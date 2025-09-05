import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { UserDataModel } from '../module/add-user/UserData.model';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { firstValueFrom } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    public mAuth: AngularFireAuth,
    private router: Router,
    public functions: AngularFireFunctions,
    private mDatabase: AngularFireDatabase,
    private _snackBar: MatSnackBar,
    private injector : EnvironmentInjector
  ) {}

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
        console.log('Login successful:', user);

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('uid', user.uid);
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

    this.router.navigateByUrl('/authentication/signin', { replaceUrl: true });
  }

  async setUserData(uid: string) {
    try {
      runInInjectionContext(this.injector, () => {
      this.mDatabase
        .object<UserDataModel>('users/' + uid)
        .valueChanges()
        .subscribe((userData) => {
          if (userData) {
            console.log('USERDATA ===>>>', userData);
            localStorage.setItem('userData', JSON.stringify(userData));
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

  async createUser(email: string, password: string): Promise<any> {
    const callable = this.functions.httpsCallable<
      { email: string; password: string },
      UserDataModel
    >('createUserCallable');

    try {
      return await firstValueFrom(callable({ email, password }));
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error creating user:', err.message);
      } else {
        console.error(String(err));
      }
      throw err;
    }
  }
}
