import { Injectable, isDevMode } from '@angular/core';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {
  env = isDevMode() ? environment.testCollections : environment.collections;

  constructor(private firestore: AngularFirestore) {}

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

  async updateLinkedStockTransfer(
    id: string,
    status: string,
    type: 'incoming' | 'outgoing',
    linkedId?: string
  ): Promise<void> {
    const mainCollection = type === 'incoming' ? 'dev-incomingStockTransfer' : 'dev-stockTransfer';
    const linkedCollection = type === 'incoming' ? 'dev-stockTransfer' : 'dev-incomingStockTransfer';

    const batch = this.firestore.firestore.batch();

    const mainRef = this.firestore.collection('dev-stockTransfer').doc(id).ref;
    batch.update(mainRef, { status });

    if (linkedId) {
      const linkedRef = this.firestore.collection('dev-incomingStockTransfer').doc(linkedId).ref;
      batch.update(linkedRef, { status });
    }

    await batch.commit();
  }

  deleteStockTransfer(id: string): Promise<void> {
    return this.firestore.doc(`${this.env.stockTransfer}/${id}`).delete();
  }
}
