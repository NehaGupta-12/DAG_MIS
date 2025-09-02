import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

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

}
