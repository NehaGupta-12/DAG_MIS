import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OutletProductService {
  constructor(private firestore: AngularFirestore) {}
  private collectionName = "outlet/dealer-products";
  getOutletProductList() {
    return this.firestore
      .collection('outlet-dealer-products')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...(data as any) }; // Add ID field to result
          })
        )
      );
  }

  addOutletProduct(callSheet: any): Promise<any> {
    console.log('Calling Firestore addCallSheet with data:', callSheet);
    const sku = this.generateUniqueSku();
    callSheet.sku = sku;
    return this.firestore.collection("outlet-dealer-products").doc(sku).set(callSheet)
      .then((result) => {
        console.log('Firestore successfully added Call Sheet Log:', result);
        return result;
      })
      .catch((error) => {
        console.error('Firestore failed to add Call Sheet Log:', error);
        throw error;
      });
  }
  private generateUniqueSku(): string {
    return Math.floor(100 + Math.random() * 900).toString(); // returns a number between 100–999
  }



  updateOutletProduct(id: string, callSheet: any): Promise<any> {
    console.log('Calling Firestore updateCallSheet with ID:', id, ' and data:', callSheet);
    return this.firestore.collection(this.collectionName).doc(id).update(callSheet)
      .then((result) => {
        console.log('Firestore successfully updated Call Sheet Log:', result);
        return result;
      })
      .catch((error) => {
        console.error('Firestore failed to update Call Sheet Log:', error);
        throw error;
      });
  }



  deleteOutletProduct(id: string) {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

}
