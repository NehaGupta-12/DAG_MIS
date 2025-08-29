import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class OutletProductService {
  private collectionName = 'outletProduct';   // Firestore collection name

  constructor(private firestore: AngularFirestore) {}

  getOutletProductList(startAfter?: any): Observable<any[]> {
    return this.firestore
      .collection(this.collectionName, (ref) => {
        let query = ref.orderBy('createdAt', 'desc');
        if (startAfter) query = query.startAfter(startAfter);
        return query;
      })
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...(data as any) };
          })
        )
      );
  }

  // 📌 Add new GRN
  addOutletProduct(grnData: any): Promise<any> {
    const payload = {
      ...grnData,
      createdAt: new Date()
    };
    return this.firestore
      .collection(this.collectionName)
      .add(payload)
      .then((result) => {
        console.log('✅ Outlet Product added successfully:', result);
        return result;
      })
      .catch((error) => {
        console.error('❌ Error adding GRN:', error);
        throw error;
      });
  }

  // 📌 Update GRN
  updateOutletProduct(id: string, grnData: any): Promise<any> {
    return this.firestore
      .collection(this.collectionName)
      .doc(id)
      .update(grnData)
      .then((result) => {
        console.log('✅ Outlet Product updated successfully:', result);
        return result;
      })
      .catch((error) => {
        console.error('❌ Error updating GRN:', error);
        throw error;
      });
  }

  // 📌 Delete GRN
  deleteOutletProduct(id: string): Promise<void> {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

  // 📌 Get GRN by ID
  getOutletProductById(id: string): Observable<any> {
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
