import {EnvironmentInjector, Injectable, isDevMode, runInInjectionContext} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {lastValueFrom, Observable} from "rxjs";
import {map} from "rxjs/operators";
import firebase from "firebase/compat/app";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  env = isDevMode() ? environment.testCollections : environment.collections;
  constructor(private firestore: AngularFirestore,
              private injector : EnvironmentInjector) {
  }

  getInventoryData(dealerId: string): Observable<any[]> {
    return this.firestore
      .collection(this.env.inventory)
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
    // 1. MUST return the result of runInInjectionContext
    return runInInjectionContext(this.injector, () => {
      const docRef = this.firestore.collection(this.env.inventory).doc(outletId);
      return lastValueFrom(docRef.get()).then((doc: any) => {
        if (!doc.exists) {
          return docRef.set({
            products: {
              [sku]: { quantity: quantityChange }
            }
          });
        } else {
          const currentQuantity = doc.data()?.products?.[sku]?.quantity || 0;
          return docRef.update({
            [`products.${sku}.quantity`]: currentQuantity + quantityChange
          });
        }
      });
    });
  }

  getInventoryAllData() {
    return this.firestore.collection(this.env.inventory).valueChanges().pipe(
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
