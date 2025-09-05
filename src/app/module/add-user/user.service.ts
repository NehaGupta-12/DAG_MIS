import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {UserDataModel} from "./UserData.model";
import {firstValueFrom, Observable} from "rxjs";
import {AngularFireFunctions} from "@angular/fire/compat/functions";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private db: AngularFireDatabase,
              public functions: AngularFireFunctions,
              private injector : EnvironmentInjector) {}

  async addEmployee(uid: string, data: any) {
    runInInjectionContext(this.injector, () => {
      return this.db.object(`users/${uid}`).set(data);
    });
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
