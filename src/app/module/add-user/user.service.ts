import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {UserDataModel} from "./UserData.model";
import {firstValueFrom, Observable} from "rxjs";
import {AngularFireFunctions} from "@angular/fire/compat/functions";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public myUserPermissions: any[] = [];
  constructor(private db: AngularFireDatabase,
              public functions: AngularFireFunctions,
              private afAuth: AngularFireAuth,
              private injector : EnvironmentInjector) {}

  async addEmployee(uid: string, data: any) {
    runInInjectionContext(this.injector, () => {
      return this.db.object(`users/${uid}`).set(data);
    });
  }
  hasPermission(title: string, action: 'list' | 'create' | 'edit' | 'delete' | 'print' | 'export' | 'approved' | 'disapproved'): boolean {
    const menuPerm = this.myUserPermissions.find(p => p.menu_name === title);
    return menuPerm?.permissions?.[action] === true;
  }

getUserId(): Observable<string | null> {
  return this.afAuth.authState.pipe(
    map(user => (user ? user.uid : null)) // If user is logged in, return their UID
  );
}

  getUsers(): Observable<any | undefined> {
    return runInInjectionContext(this.injector, () => {
      return this.db.list<UserDataModel>('users').snapshotChanges();
    });
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

  getUserById(uid: string | null): Observable<UserDataModel | null> {
    return runInInjectionContext(this.injector, () => {
      return this.db.object<UserDataModel>('users/' + uid).valueChanges();
    });
  }

  async updateUser(uid: string, data: Partial<UserDataModel>) {
    try {
      await runInInjectionContext(this.injector, () => {
        return this.db.object(`users/${uid}`).update(data);
      });
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }


}
