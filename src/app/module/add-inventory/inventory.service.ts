import {EnvironmentInjector, Injectable, isDevMode, runInInjectionContext} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {combineLatest, lastValueFrom, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import firebase from "firebase/compat/app";
import {environment} from "../../../environments/environment";
import {UserService} from "../add-user/user.service";
import {UserDataModel} from "../add-user/UserData.model";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  userData :any
  filterUser :any
  users:any[] = [];
  env = isDevMode() ? environment.testCollections : environment.collections;
  constructor(private firestore: AngularFirestore,
              private injector : EnvironmentInjector,
              private userService : UserService,) {
  }

  getInventoryData(dealerId: string): Observable<any[]> {
    return this.firestore
      .collection(this.env.inventory)
      .doc(dealerId) // Use .doc() to get the specific document
      .valueChanges()
      .pipe(
        map((data: any) => {
          if (data && data.products) {
            // Convert the products map into an array of products
            return Object.values(data.products);
          }
          return [];
        })
      );
  }
  // inventory update function
  updateInventoryQuantity(
    outletId: string,
    sku: string,
    quantityChange: number
  ): Promise<void> {
    // 1. MUST return the result of runInInjectionContext
    return runInInjectionContext(this.injector, () => {
      const docRef = this.firestore.collection(this.env.inventory).doc(outletId);
      return lastValueFrom(docRef.get()).then((doc: any) => {
        if (!doc.exists) {
          return docRef.set({
            products: {
              [sku]: { quantity: quantityChange }
            }
          });
        } else {
          const currentQuantity = doc.data()?.products?.[sku]?.quantity || 0;
          return docRef.update({
            [`products.${sku}.quantity`]: currentQuantity + quantityChange
          });
        }
      });
    });
  }

  getInventoryAllData() {
    return this.firestore.collection(this.env.inventory).valueChanges().pipe(
      map((docs: any[]) => {
        const products: any[] = [];
        docs.forEach(doc => {
          if (doc.products) {
            Object.entries(doc.products).forEach(([key, value]: [string, any]) => {
              products.push({
                id: key,
                ...value
              });
            });
          }
        });
        return products;
      })
    );
  }


  getCountryWiseStock(startAfter?: any): Observable<any[]> {
    this.userData = JSON.parse(localStorage.getItem('userData')!) as UserDataModel;

    return this.userService.getUsers().pipe(
      map(users => users.map(u => u.payload.toJSON() as UserDataModel)),
      map(users => this.filterUser = users.find(u => u.email === this.userData.email)),

      switchMap(filterUser => {
        if (!filterUser?.allowedCountries) return of([]);

        let allowedCountries = Array.isArray(filterUser.allowedCountries)
          ? filterUser.allowedCountries
          : Object.values(filterUser.allowedCountries);

        if (!allowedCountries.length) return of([]);

        const chunks = this.chunkArray(allowedCountries, 10);

        const queries = chunks.map(chunk =>
          runInInjectionContext(this.injector, () =>
            this.firestore.collection(this.env.inventory, ref =>
              ref.where('country', 'in', chunk) // <-- remove orderBy
            )
              .valueChanges({ idField: 'id' })
          )
        );

        return combineLatest(queries).pipe(map(res => res.flat()));
      })
    );
  }


  // getCountryWiseStock(startAfter?: any): Observable<any[]> {
  //   this.userData = JSON.parse(localStorage.getItem('userData')!) as UserDataModel;
  //
  //   return this.userService.getUsers().pipe(
  //     map((userList: any[]) =>
  //       userList.map(u => u.payload.toJSON() as UserDataModel)
  //     ),
  //     map(users => {
  //       this.users = users;
  //       this.filterUser = users.find(u => u.email === this.userData.email);
  //
  //       return this.filterUser;
  //     }),
  //
  //     switchMap(filterUser => {
  //       if (!filterUser?.allowedCountries) return of([]);
  //
  //       let allowedCountries: string[] = [];
  //
  //       if (Array.isArray(filterUser.allowedCountries)) {
  //         allowedCountries = filterUser.allowedCountries;
  //       } else if (typeof filterUser.allowedCountries === 'object') {
  //         allowedCountries = Object.values(filterUser.allowedCountries);
  //       }
  //
  //       if (!allowedCountries.length) return of([]);
  //
  //       const chunks = this.chunkArray(allowedCountries, 10);
  //
  //       const queries = chunks.map(chunk =>
  //         runInInjectionContext(this.injector, () =>
  //           this.firestore.collection(this.env.inventory, ref => {
  //             let query: firebase.firestore.Query = ref
  //               .where('country', 'in', chunk)
  //               .orderBy('createdAt', 'asc');
  //
  //             if (startAfter) query = query.startAfter(startAfter);
  //
  //             return query;
  //           })
  //             .snapshotChanges()
  //             .pipe(
  //               map(actions =>
  //                 actions.map(a => {
  //                   const data: any = a.payload.doc.data();
  //                   const id = a.payload.doc.id;
  //                   return { id, ...data };
  //                 })
  //               )
  //             )
  //         )
  //       );
  //
  //       return combineLatest(queries).pipe(map(res => res.flat()));
  //     })
  //   );
  // }


// Utility
  private chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }



}
