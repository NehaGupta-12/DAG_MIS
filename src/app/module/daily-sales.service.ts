// import { Injectable } from "@angular/core";
// import { AngularFirestore } from "@angular/fire/compat/firestore";
// import { Observable } from "rxjs";
// import { map } from "rxjs/operators";
//
// @Injectable({ providedIn: "root" })
// export class DailySalesService {
//   private dailySalesCollection = "daily-sales";
//
//   constructor(private firestore: AngularFirestore) {}
//
//   // 🔹 Add product row permanently
//   addProductToDailySales(product: any): Promise<any> {
//     product.createdAt = Date.now();
//     return this.firestore.collection("dailySalesProducts").add(product);
//   }
//
//   // 🔹 Get saved product rows
//   getSavedProducts(): Observable<any[]> {
//     return this.firestore
//       .collection("dailySalesProducts", ref => ref.orderBy("createdAt", "desc"))
//       .snapshotChanges()
//       .pipe(
//         map(actions =>
//           actions.map(a => {
//             const data = a.payload.doc.data() as { [key: string]: any };
//             return { id: a.payload.doc.id, ...data };
//           })
//         )
//       );
//   }
//
//   // 🔹 Delete saved product row
//   deleteSavedProduct(id: string): Promise<any> {
//     return this.firestore.collection("dailySalesProducts").doc(id).delete();
//   }
//
//   // 🔹 Add daily sales
//   addDailySales(data: any): Promise<any> {
//     data.createdAt = Date.now();
//     return this.firestore.collection(this.dailySalesCollection).add(data);
//   }
//
//   // 🔹 Delete daily sales
//   deleteDailySales(id: string): Promise<any> {
//     return this.firestore.collection(this.dailySalesCollection).doc(id).delete();
//   }
//
//   // 🔹 Get all daily sales (ordered by createdAt descending)
//   getDailySalesList(): Observable<any[]> {
//     return this.firestore
//       .collection(this.dailySalesCollection, ref => ref.orderBy("createdAt", "desc"))
//       .snapshotChanges()
//       .pipe(
//         map(actions =>
//           actions.map(a => {
//             const data = a.payload.doc.data() as { [key: string]: any };
//             return { id: a.payload.doc.id, ...data };
//           })
//         )
//       );
//   }
//
//   // 🔹 Get all dealers
//   getDealers(): Observable<any[]> {
//     return this.firestore
//       .collection("dealers", ref => ref.orderBy("name"))
//       .snapshotChanges()
//       .pipe(
//         map(actions =>
//           actions.map(a => {
//             const data = a.payload.doc.data() as { [key: string]: any };
//             return { id: a.payload.doc.id, ...data };
//           })
//         )
//       );
//   }
// }

import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class DailySalesService {
  private dailySalesCollection = "daily-sales";
  private db: any;

  constructor(private firestore: AngularFirestore) {}

  // 🔹 Add daily sales entry (with products array)
  addDailySales(sale: any) {
    return this.db.list('/dailySales').push(sale);
  }



  // 🔹 Delete daily sales entry
  deleteDailySales(id: string): Promise<any> {
    return this.firestore.collection(this.dailySalesCollection).doc(id).delete();
  }

  // 🔹 Get all daily sales (ordered by createdAt descending)
  getDailySalesList(): Observable<any[]> {
    return this.firestore
      .collection(this.dailySalesCollection, ref => ref.orderBy("createdAt", "desc"))
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as { [key: string]: any };
            return { id: a.payload.doc.id, ...data };
          })
        )
      );
  }

  // 🔹 Get all dealers
  getDealers(): Observable<any[]> {
    return this.firestore
      .collection("dealers", ref => ref.orderBy("name"))
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as { [key: string]: any };
            return { id: a.payload.doc.id, ...data };
          })
        )
      );
  }
}

