import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private collectionName = 'budget';

  constructor(private firestore: AngularFirestore) {}

  // 📌 Get all GRNs (with optional pagination)
  getBudgetList(startAfter?: any): Observable<any[]> {
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
            const docId = a.payload.doc.id;   // Firestore ID
            return { docId, ...(data as any) }; // ✅ avoid overwrite
          })
        )
      );
  }


  // 📌 Add new GRN
  addBudget(grnData: any): Promise<any> {
    const payload = {
      ...grnData,
      createdAt: new Date()
    };
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
