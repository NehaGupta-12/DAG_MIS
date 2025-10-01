import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {combineLatest, firstValueFrom, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import firebase from "firebase/compat/app";
import {UserDataModel} from "./add-user/UserData.model";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {UserService} from "./add-user/user.service";
import {MatTableDataSource} from "@angular/material/table";

@Injectable({
  providedIn: 'root'
})
export class AddDealerService {
  userData :any
  filterUser :any
  users:any[] = [];
  constructor(private firestore: AngularFirestore,
              private userService : UserService,
              private injector: EnvironmentInjector) {
  }
  private collectionName = "dealer";

  // // Fetch all callSheet with pagination
  // getDealerList(startAfter?: any): Observable<any> {
  //   return this.firestore
  //     .collection(this.collectionName, (ref) => {
  //       let query = ref.orderBy('createdAt','desc');
  //       if (startAfter) query = query.startAfter(startAfter);
  //       return query;
  //     })
  //     .snapshotChanges()
  //     .pipe(map((actions) => actions.map((a) => {
  //       const data = a.payload.doc.data();
  //       const id = a.payload.doc.id;
  //       return { id, ...(data as any) };
  //     })));
  // }



  getDealerList(startAfter?: any): Observable<any[]> {
    this.userData = JSON.parse(localStorage.getItem('userData')!) as UserDataModel;
    return this.userService.getUsers().pipe(
      map((snapshotChanges: any[]) =>
        snapshotChanges.map(snapshot => snapshot.payload.toJSON() as UserDataModel)
      ),
      map(users => {
        this.users = users;
        this.filterUser = this.users.find(u => u.email === this.userData.email);
        console.log('filterUser:', this.filterUser);
        console.log('allowedCountries typeof:', typeof this.filterUser?.allowedCountries);
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
        const chunks = this.chunkArray(allowedCountries, 10);
        const queries = chunks.map(chunk =>
          runInInjectionContext(this.injector, () =>
            this.firestore
              .collection(this.collectionName, ref => {
                let query: firebase.firestore.Query = ref
                  .where('country', 'in', chunk)
                  .orderBy('createdAt', 'asc');

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
                    const id = a.payload.doc.id;
                    return { id, ...(data as any) };
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

  getAllDealerList(startAfter?: any): Observable<any[]> {
    return this.firestore
      .collection(this.collectionName, ref => {
        let query: firebase.firestore.Query = ref.orderBy('createdAt', 'asc');
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
            const id = a.payload.doc.id;
            return { id, ...(data as any) };
          })
        )
      );
  }


  addDealer(callSheet: any): Promise<any> {
    const dealerId = callSheet.name.replace(/\s+/g, "");
    const payload = { ...callSheet, dealerId: dealerId };
    return this.firestore
      .collection(this.collectionName)   // e.g. "dealers"
      .doc(dealerId)                     // docId = dealer name without spaces
      .set(payload)
      .then(() => {
        console.log("Firestore successfully added Dealer:", dealerId);
        return dealerId;
      })
      .catch((error) => {
        console.error("Firestore failed to add Dealer:", error);
        throw error;
      });
  }



  updateDealer(id: string, callSheet: any): Promise<any> {
    console.log('Calling Firestore updateCallSheet with ID:', id, ' and data:', callSheet);
    return this.firestore.collection(this.collectionName).doc(id).update(callSheet)
      .then((result) => {
        console.log('Firestore successfully updated Call Sheet Log:', result);
        return result;
      })
      .catch((error) => {
        console.error('Firestore failed to update Call Sheet Log:', error);
        throw error;
      });
  }

  deleteDealer(id: string) {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }



}
