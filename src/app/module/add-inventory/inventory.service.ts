import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import firebase from "firebase/compat/app";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private collectionName = 'inventory';

  constructor(private firestore: AngularFirestore) {
  }

  getInventoryData(dealerId: string): Observable<any[]> {
    return this.firestore
      .collection(this.collectionName)
      .doc(dealerId) // Use .doc() to get the specific document
      .valueChanges()
      .pipe(
        map((data: any) => {
          if (data && data.products) {
            // Convert the products map into an array of products
            return Object.values(data.products);
          }
          return [];
        })
      );
  }
  increaseQuantity(sku: string, quantity: number) {
    console.log(sku)
    console.log(quantity)
    // Query inventory for the matching SKU
    return this.firestore.collection(this.collectionName, ref => ref.where('sku', '==', sku))
      .get()
      .toPromise()
      .then(snapshot => {debugger
        if (snapshot?.empty) {
          throw new Error('SKU not found');
        }
        // Batch update all matching docs
        const batch = this.firestore.firestore.batch();
        snapshot?.forEach(doc => {debugger
          batch.update(doc.ref, {
            quantity: firebase.firestore.FieldValue.increment(quantity)
          });
        });
        return batch.commit();
      });
  }

  // getInventoryAllData() {
  //   return this.firestore.collection(this.collectionName).valueChanges();
  // }

  getInventoryAllData() {
    return this.firestore.collection(this.collectionName).valueChanges().pipe(
      map((docs: any[]) => {
        const products: any[] = [];
        docs.forEach(doc => {
          if (doc.products) {
            Object.entries(doc.products).forEach(([key, value]: [string, any]) => {
              products.push({
                id: key,
                ...value
              });
            });
          }
        });
        return products;
      })
    );
  }


}
