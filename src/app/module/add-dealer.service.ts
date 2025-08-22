import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DealerService {
  private collectionName = 'dealers';

  constructor(private afs: AngularFirestore) {}

  // READ all dealers
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
            const data = a.payload.doc.data() as Record<string, any>;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  // CREATE with duplicate check
  async addDealer(dealer: any) {
    const existing = await this.afs
      .collection(this.collectionName, ref =>
        ref.where('name', '==', dealer.name).limit(1)
      )
      .get()
      .pipe(take(1))
      .toPromise();

    if (!existing?.empty) {
      console.warn(`⚠️ Dealer with name "${dealer.name}" already exists!`);
      return Promise.reject(`Dealer "${dealer.name}" already exists`);
    }

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
