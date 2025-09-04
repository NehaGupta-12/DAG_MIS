import {Injectable, runInInjectionContext} from '@angular/core';
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
  // inventory update function
  updateInventoryQuantity(
    outletId: string,
    sku: string,
    quantityChange: number
  ): Promise<void> {
    const docRef = this.firestore.collection('inventory').doc(outletId);
    return docRef.get().toPromise().then((doc: any) => {
      if (!doc.exists) {
        return docRef.set({
          products: {
            [sku]: { quantity: quantityChange }
          }
        });
      } else {
        return docRef.update({
          [`products.${sku}.quantity`]:
          (doc.data()?.products?.[sku]?.quantity || 0) + quantityChange
        });
      }
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
