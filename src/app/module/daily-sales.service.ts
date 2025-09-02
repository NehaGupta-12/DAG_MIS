import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class DailySalesService {
  private collectionName = "daily-sales";  // same as GRN

  constructor(private firestore: AngularFirestore) {}

  // 📌 Get all daily sales (with optional pagination)
  getDailySalesList(startAfter?: any): Observable<any[]> {
    return this.firestore
      .collection(this.collectionName, (ref) => {
        let query = ref.orderBy("createdAt", "desc");
        if (startAfter) query = query.startAfter(startAfter);
        return query;
      })
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const docId = a.payload.doc.id;   // ✅ Firestore id
            return { docId, ...(data as any) }; // don't clash with "id" field in data
          })
        )
      );
  }


  // 📌 Add daily sales (dealer + all products)
  addDailySales(salesData: any): Promise<any> {
    const payload = {
      ...salesData,
      createdAt: new Date(),
    };
    return this.firestore
      .collection(this.collectionName)
      .add(payload)
      .then((result) => {
        console.log("✅ Daily Sale added successfully:", result);
        return result;
      })
      .catch((error) => {
        console.error("❌ Error adding Daily Sale:", error);
        throw error;
      });
  }

  // 📌 Update daily sale
  updateDailySales(id: string, salesData: any): Promise<any> {
    return this.firestore
      .collection(this.collectionName)
      .doc(id)
      .update(salesData)
      .then((result) => {
        console.log("✅ Daily Sale updated successfully:", result);
        return result;
      })
      .catch((error) => {
        console.error("❌ Error updating Daily Sale:", error);
        throw error;
      });
  }

  // 📌 Delete daily sale
  deleteDailySales(id: string): Promise<void> {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

  // 📌 Get daily sale by ID
  getDailySalesById(id: string): Observable<any> {
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

  // 📌 Get all dealers
  getDealers(): Observable<any[]> {
    return this.firestore
      .collection("dealers", (ref) => ref.orderBy("name"))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as { [key: string]: any };
            return { id: a.payload.doc.id, ...data };
          })
        )
      );
  }
}
