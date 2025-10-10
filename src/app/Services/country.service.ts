import {Injectable, Injector, runInInjectionContext} from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserDataModel } from '../module/add-user/UserData.model';
import { UserService } from '../module/add-user/user.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  userData: any;
  filterUser: any;
  users: any[] = [];

  constructor(
    private mDatabase: AngularFireDatabase,
    private userService: UserService,
    private injector: Injector,
  ) {}


  getCountries(): Observable<string[]> {
    this.userData = JSON.parse(localStorage.getItem('userData')!) as UserDataModel;

    return this.userService.getUsers().pipe(
      map((snapshotChanges: any[]) =>
        snapshotChanges.map(snapshot => snapshot.payload.toJSON() as UserDataModel)
      ),
      map(users => {
        this.users = users;
        this.filterUser = this.users.find(u => u.email === this.userData.email);
        return this.filterUser;
      }),
      switchMap(filterUser => {
        if (!filterUser?.allowedCountries) {
          console.warn('No allowed countries found for this user');
          return of([]);
        }

        let allowedCountries: string[] = [];
        if (Array.isArray(filterUser.allowedCountries)) {
          allowedCountries = filterUser.allowedCountries;
        } else if (typeof filterUser.allowedCountries === 'object') {
          allowedCountries = Object.values(filterUser.allowedCountries);
        }

        if (!allowedCountries.length) {
          console.warn('allowedCountries is empty after conversion');
          return of([]);
        }

        return runInInjectionContext(this.injector, () =>
          this.mDatabase
            .object<{ subcategories: string[] }>('typelist/Countries')
            .valueChanges()
            .pipe(
              map(data => data?.subcategories || []),
              map(countries => {
                const filtered = countries.filter(c => allowedCountries.includes(c));
                if (!filtered.length) {
                  console.warn('No matching countries found for allowedCountries');
                }
                return filtered;
              })
            )
        );
      })
    );
  }
}
