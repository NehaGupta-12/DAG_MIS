import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {combineLatest, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import firebase from "firebase/compat/app";
import {UserDataModel} from "./add-user/UserData.model";
import {UserService} from "./add-user/user.service";

@Injectable({
  providedIn: 'root'
})
export class MonthlyBudgetService {
  private collectionName = "monthlyBudget";
  userData :any
  filterUser :any
  users:any[] = [];

  constructor(private firestore: AngularFirestore,
              private userService : UserService,
              private injector: EnvironmentInjector) {}

  // 📌 Get all GRNs (with optional pagination)
  getBudgetList(startAfter?: any): Observable<any[]> {
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

        const chunks = this.chunkArray(allowedCountries, 10);

        const queries = chunks.map(chunk =>
          runInInjectionContext(this.injector, () =>
            this.firestore
              .collection(this.collectionName, ref => {
                let query: firebase.firestore.Query = ref
                  .where('country', 'in', chunk);
                  // .orderBy('createdAt', 'desc');

                if (startAfter) query = query.startAfter(startAfter);
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
  addBudget(grnData: any): Promise<any> {
    const payload = {
      ...grnData,
      createdAt: new Date()
    };
    console.log("📌 Saving to Firestore:", payload);  // 👈 Debug
    return this.firestore
      .collection(this.collectionName)
      .add(payload)
      .then((result) => {
        console.log('✅ Budget added successfully:', result);
        return result;
      })
      .catch((error) => {
        console.error('❌ Error adding Budget:', error);
        throw error;
      });
  }


  // 📌 Update GRN
  updateBudget(id: string, grnData: any): Promise<any> {
    return this.firestore
      .collection(this.collectionName)
      .doc(id)
      .update(grnData)
      .then((result) => {
        console.log('✅ Budget updated successfully:', result);
        return result;
      })
      .catch((error) => {
        console.error('❌ Error updating Budget:', error);
        throw error;
      });
  }

  // 📌 Delete GRN
  deleteBudget(id: string): Promise<void> {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

  // 📌 Get GRN by ID
  getBudgetById(id: string): Observable<any> {
    return this.firestore
      .collection(this.collectionName)
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
