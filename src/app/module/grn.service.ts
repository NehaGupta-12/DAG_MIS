import {EnvironmentInjector, Injectable, isDevMode, runInInjectionContext} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {combineLatest, Observable, of, switchMap} from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from "firebase/compat/app";
import {UserDataModel} from "./add-user/UserData.model";
import {UserService} from "./add-user/user.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GrnService {
 env = isDevMode() ? environment.testCollections : environment.collections;
  userData :any
  filterUser :any
  users:any[] = [];

  constructor(private firestore: AngularFirestore,
              private userService : UserService,
              private injector: EnvironmentInjector) {}

  // 📌 Get all GRNs (with optional pagination)
  getGrnList(startAfter?: any): Observable<any[]> {
    this.userData = JSON.parse(localStorage.getItem('userData')!) as UserDataModel;

    return this.userService.getUsers().pipe(
      map((snapshotChanges: any[]) =>
        snapshotChanges.map(snapshot => snapshot.payload.toJSON() as UserDataModel)
      ),
      map(users => {
        this.users = users;
        this.filterUser = this.users.find(u => u.email === this.userData.email);
        console.log('filterUser:', this.filterUser);
        return this.filterUser;
      }),
      switchMap(filterUser => {
        if (!filterUser?.allowedCountries) {
          console.warn('No allowed countries found for this user');
          return of([]); // empty observable
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

        // Firestore supports max 10 items in an "in" query
        const chunks = this.chunkArray(allowedCountries, 10);

        const queries = chunks.map(chunk =>
          runInInjectionContext(this.injector, () =>
            this.firestore
              .collection(this.env.grn, ref => {
                let query: firebase.firestore.Query = ref
                  .where('country', 'in', chunk)
                  .orderBy('createdAt', 'desc');

                if (startAfter) {
                  query = query.startAfter(startAfter);
                }
                return query;
              })
              .snapshotChanges()
              .pipe(
                map(actions =>
                  actions.map(a => {
                    const data: any = a.payload.doc.data();
                    const docId = a.payload.doc.id;
                    return { docId, ...(data as any) };
                  })
                )
              )
          )
        );

        return combineLatest(queries).pipe(map(res => res.flat()));
      })
    );
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr?.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }


  // 📌 Add new GRN
  addGrn(grnData: any): Promise<any> {
    const payload = {
      ...grnData,
      createdAt: new Date()
    };
    return this.firestore
      .collection(this.env.grn)
      .add(payload)
      .then((result) => {
        console.log('✅ GRN added successfully:', result);
        return result;
      })
      .catch((error) => {
        console.error('❌ Error adding GRN:', error);
        throw error;
      });
  }

  // 📌 Update GRN
  updateGrn(id: string, grnData: any): Promise<any> {
    return this.firestore
      .collection(this.env.grn)
      .doc(id)
      .update(grnData)
      .then((result) => {
        console.log('✅ GRN updated successfully:', result);
        return result;
      })
      .catch((error) => {
        console.error('❌ Error updating GRN:', error);
        throw error;
      });
  }

  // 📌 Delete GRN
  deleteGrn(id: string): Promise<void> {
    return this.firestore.doc(`${this.env.grn}/${id}`).delete();
  }

  // 📌 Get GRN by ID
  getGrnById(id: string): Observable<any> {
    return this.firestore
      .collection(this.env.grn)
      .doc(id)
      .snapshotChanges()
      .pipe(
        map((action) => {
          const data = action.payload.data();
          return { id, ...(data as any) };
        })
      );
  }
}
