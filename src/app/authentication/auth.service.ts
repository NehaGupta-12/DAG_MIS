import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {UserDataModel} from "../module/add-user/UserData.model";
import firebase from "firebase/compat/app";
import Auth = firebase.auth.Auth;
import {AngularFireFunctions} from "@angular/fire/compat/functions";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public mAuth: AngularFireAuth,
              private router: Router,
              private auth: Auth,
              public functions : AngularFireFunctions,
              private mDatabase : AngularFireDatabase,
              private _snackBar : MatSnackBar) {}


  // LOGIN: validate from localStorage
  // login(email: string , password: string): Observable<any> {
  //   const registeredUser = JSON.parse(localStorage.getItem('registeredUser') || '{}');
  //
  //   if (registeredUser.email === email && registeredUser.password === password) {
  //     const user = { email, token: 'mock-token' };
  //     localStorage.setItem('currentUser', JSON.stringify(user));
  //     this.currentUserSubject.next(user);
  //     return of(user); // success
  //   } else {
  //     return throwError(() => new Error('Username or password is incorrect'));
  //   }
  // }
  async login(email: string, password: string) {
    localStorage.clear()
    try {
      const userCredential = await this.mAuth.signInWithEmailAndPassword(
        email,
        password
      ).catch(() => {
        this._snackBar.open('Invalid Username Or Password')._dismissAfter(3000)
      });
      if (userCredential && userCredential.user) {
        console.log('Login is Successful')
        const user = userCredential.user;
        console.log('user in login',JSON.stringify(user))
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('uid', user.uid);
        localStorage.setItem('userEmail', user.email!);
        await this.setUserData(user.uid)
        console.log('flow complete')
      }

    }catch (err: unknown) {
      if (err instanceof Error) {
        this._snackBar.open('Invalid password')._dismissAfter(3000)
      }
    }
  }

  logout(): void {
    console.log('Inside logout service');

    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    // this.currentUserSubject.next(null);

    this.router.navigateByUrl('/authentication/signin', { replaceUrl: true });
  }

  async setUserData(uid: string
  ) {
    console.log('into setUserData')
    console.log(uid)
    try {
      this.mDatabase
        .object<UserDataModel>('users/' + uid)
        .valueChanges().subscribe(res => {
        const userData = res
        // console.log(res)
        console.log('USERDATA===>>>', userData);
        localStorage.setItem('userData', JSON.stringify(userData));

        // const resdata = userData as UserDataModel;
        // if (resdata.role) {
        //   localStorage.setItem('ROLE', resdata.role);
        //   console.log(2);
        // }
        //
        // if (resdata.permissions) {
        //   localStorage.setItem('permissions', JSON.stringify(resdata.permissions));
        //   console.log(3);
        // }

        // console.log('JSON PERMISSIONS', JSON.parse(localStorage.getItem('permissions') || ''));
        console.log(4);

        this.router.navigate(['home/dashboard']).then(() => {
          console.log('sending to dashboard');
        })


      })
    } catch (error) {
      console.error(error);
    }

  }


  async createUser(email: string, password: string): Promise<any> {
    const callable = this.functions.httpsCallable<
      { email: string; password: string },
      UserDataModel
    >('createUserCallable');

    try {
      const result = await firstValueFrom(callable({email, password}));
      return result;
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    }
  }
}
