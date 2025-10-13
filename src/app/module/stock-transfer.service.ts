// import {Injectable, isDevMode} from '@angular/core';
// import {AngularFirestore} from "@angular/fire/compat/firestore";
// import {Observable} from "rxjs";
// import {map} from "rxjs/operators";
// import {environment} from "../../environments/environment";
//
// @Injectable({
//   providedIn: 'root'
// })
// export class StockTransferService {  // Firestore collection name
//   env = isDevMode() ? environment.testCollections : environment.collections
//   constructor(private firestore: AngularFirestore) {}
//
//   getStockTransferList(startAfter?: any): Observable<any[]> {
//     return this.firestore
//       .collection(this.env.stockTransfer, (ref) => {
//         let query = ref.orderBy('createdAt', 'desc');
//         if (startAfter) query = query.startAfter(startAfter);
//         return query;
//       })
//       .snapshotChanges()
//       .pipe(
//         map((actions) =>
//           actions.map((a) => {
//             const data = a.payload.doc.data();
//             const id = a.payload.doc.id;
//             return { id, ...(data as any) };
//           })
//         )
//       );
//   }
//
//   // 📌 Add new GRN
//   addStockTransfer(grnData: any): Promise<any> {
//     const payload = {
//       ...grnData,
//       createdAt: new Date()
//     };
//     return this.firestore
//       .collection(this.env.stockTransfer)
//       .add(payload)
//       .then((result) => {
//         console.log('✅ GRN added successfully:', result);
//         return result;
//       })
//       .catch((error) => {
//         console.error('❌ Error adding GRN:', error);
//         throw error;
//       });
//   }
//
//   // 📌 Update GRN
//   updateStockTransfer(id: string, grnData: any): Promise<any> {
//     return this.firestore
//       .collection(this.env.stockTransfer)
//       .doc(id)
//       .update(grnData)
//       .then((result) => {
//         console.log('✅ Stock Transfer updated successfully:', result);
//         return result;
//       })
//       .catch((error) => {
//         console.error('❌ Error updating GRN:', error);
//         throw error;
//       });
//   }
//
//   // 📌 Delete GRN
//   deleteStockTransfer(id: string): Promise<void> {
//     return this.firestore.doc(`${this.env.stockTransfer}/${id}`).delete();
//   }
//
//
// }

// stock-transfer.service.ts
import { Injectable, isDevMode } from '@angular/core';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import firebase from "firebase/compat/app";

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {
  env = isDevMode() ? environment.testCollections : environment.collections;

  constructor(private firestore: AngularFirestore) {}

  // ✅ Get Outgoing list
  getStockTransferList(): Observable<any[]> {
    return this.firestore
      .collection(this.env.stockTransfer, ref => ref.orderBy('createdAt', 'desc'))
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

  // ✅ Get Incoming list
  getIncomingStockTransferList(): Observable<any[]> {
    return this.firestore
      .collection(this.env.incomingStockTransfer, ref => ref.orderBy('createdAt', 'desc'))
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

  // ✅ Batch Add Outgoing + Incoming
  async addStockTransferWithIncoming(data: any): Promise<void> {
    const batch = this.firestore.firestore.batch();

    const incomingRef = this.firestore.collection(this.env.incomingStockTransfer).doc();
    const outgoingRef = this.firestore.collection(this.env.stockTransfer).doc();




    const timestamp = new Date();

    const outgoingData = {
      ...data,
      createdAt: timestamp,
      status: 'Pending',
      linkedIncomingId: incomingRef.ref.id

    };

    const incomingData = {
      ...data,
      createdAt: timestamp,
      status: 'Pending',
      linkedOutgoingId: outgoingRef.ref.id,
      direction: 'Incoming'
    };

    batch.set(outgoingRef.ref, outgoingData);
    batch.set(incomingRef.ref, incomingData);



    await batch.commit();
  }

  // ✅ Update both collections safely
  async updateStockTransfer(id: string, status: string, type: 'incoming' | 'outgoing'): Promise<void> {
    const collectionName = type === 'incoming'
      ? this.env.incomingStockTransfer
      : this.env.stockTransfer;
    await this.firestore.collection(collectionName).doc(id).update({ status });
  }

  // ✅ Delete / Cancel / Approve handled separately
  deleteStockTransfer(id: string): Promise<void> {
    return this.firestore.doc(`${this.env.stockTransfer}/${id}`).delete();
  }
}
