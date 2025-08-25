// import { Injectable } from '@angular/core';
// import {AngularFirestore} from "@angular/fire/compat/firestore";
// import {Observable} from "rxjs";
// import {map} from "rxjs/operators";
//
// @Injectable({
//   providedIn: 'root'
// })
// export class DailySalesService {
//   constructor(private firestore: AngularFirestore) {}
//   private collectionName = "daily-sales";
//
//   // Fetch all callSheet with pagination
//   getDailySalesList(startAfter?: any): Observable<any> {
//     return this.firestore
//       .collection(this.collectionName, (ref) => {
//         let query = ref.orderBy('createdAt','desc');
//         if (startAfter) query = query.startAfter(startAfter);
//         return query;
//       })
//       .snapshotChanges()
//       .pipe(map((actions) => actions.map((a) => {
//         const data = a.payload.doc.data();
//         const id = a.payload.doc.id;
//         return { id, ...(data as any) };
//       })));
//   }
//
//   addDailySales(callSheet: any): Promise<any> {
//     console.log('Calling Firestore addCallSheet with data:', callSheet);
//     return this.firestore.collection(this.collectionName).add(callSheet)
//       .then((result) => {
//         console.log('Firestore successfully added Call Sheet Log:', result);
//         return result;
//       })
//       .catch((error) => {
//         console.error('Firestore failed to add Call Sheet Log:', error);
//         throw error;
//       });
//   }
//
//   updateDailySales(id: string, callSheet: any): Promise<any> {
//     console.log('Calling Firestore updateCallSheet with ID:', id, ' and data:', callSheet);
//     return this.firestore.collection(this.collectionName).doc(id).update(callSheet)
//       .then((result) => {
//         console.log('Firestore successfully updated Call Sheet Log:', result);
//         return result;
//       })
//       .catch((error) => {
//         console.error('Firestore failed to update Call Sheet Log:', error);
//         throw error;
//       });
//   }
//
//   deleteDailySales(id: string) {
//     return this.firestore.doc(`${this.collectionName}/${id}`).delete();
//   }
//
//   getDealerByName(name: string): Observable<any> {
//     return this.firestore
//       .collection('dealers', ref => ref.where('name', '==', name).limit(1))
//       .valueChanges()
//       .pipe(
//         map(dealers => dealers[0] || null)
//       );
//   }
//
//
// }

import {Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DailySalesService {
  private collectionName = "daily-sales";

  constructor(private firestore: AngularFirestore) {}

  // 🔹 Fetch all Daily Sales with pagination
  getDailySalesList(startAfter?: any): Observable<any[]> {
    return this.firestore.collection(this.collectionName, (ref) => {
        let query = ref.orderBy('createdAt', 'desc');
        if (startAfter) query = query.startAfter(startAfter);
        return query;
      })
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...(data as any) };
          })
        )
      );
  }

  addDailySales(data: any): Promise<any> {
    data.createdAt = Date.now();
    return this.firestore.collection(this.collectionName).add(data);
  }

  updateDailySales(id: string, data: any): Promise<any> {
    data.updatedAt = Date.now();
    return this.firestore.collection(this.collectionName).doc(id).update(data);
  }

  deleteDailySales(id: string) {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

  // 🔹 Dealer APIs
  // getDealers(): Observable<any[]> {
  //   return this.firestore
  //     .collection('dealers', ref => ref.orderBy('name'))
  //     .snapshotChanges()
  //     .pipe(
  //       map(actions =>
  //         actions.map(a => {
  //           const data = a.payload.doc.data();
  //           const id = a.payload.doc.id;
  //           return { id, ...(data as any) };
  //         })
  //       )
  //     );
  // }

  // Dealers
  getDealers(): Observable<any[]> {
    // return this.firestore.collection('dealers').snapshotChanges().pipe(
    //   map(actions => actions.map(a => {
    //     const data = a.payload.doc.data();
    //     const id = a.payload.doc.id;
    //     return { id, ...(data as any) };
    //   }))
    // );
 return of([])
  }

  getDealerById(dealerId: string): Observable<any> {
    return this.firestore
      .collection('dealers')
      .doc(dealerId)
      .valueChanges();
  }

  getDealerByName(name: string): Observable<any> {
    return this.firestore
      .collection('dealers', ref => ref.where('name', '==', name).limit(1))
      .valueChanges()
      .pipe(map(dealers => dealers[0] || null));
  }

  // 🔹 Product APIs
  // Products
  getProducts(): Observable<any[]> {
    return this.firestore.collection('products').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...(data as any) };
      }))
    );
  }
}
