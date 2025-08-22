import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DealerService {
  private collectionName = 'dealers';

  constructor(private afs: AngularFirestore) {}

  // READ all dealers (with optional pagination)
  getDealerList(startAfter?: any): Observable<any[]> {
    return this.afs
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

  // CREATE
  addDealer(dealer: any) {
    return this.afs
      .collection(this.collectionName)
      .add({ ...dealer, createdAt: new Date() });
  }

  // UPDATE
  updateDealer(id: string, dealer: any): Promise<void> {
    return this.afs.collection(this.collectionName).doc(id).update(dealer);
  }

  // DELETE
  deleteDealer(id: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(id).delete();
  }
}
