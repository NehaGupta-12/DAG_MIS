import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class OutletProductService {
  private collectionName = 'outletProduct';   // Firestore collection name

  constructor(private firestore: AngularFirestore) {}

  getInventoryData(){
    return this.firestore.collection('inventory').valueChanges({idField: 'id'});
  }

  getOutletProductList(): Observable<any[]> {
    return this.firestore
      .collectionGroup('products') // fetches all products under all outlet docs
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



  // // 📌 Add new GRN
  // addOutletProduct(grnData: any): Promise<any> {
  //   const payload = {
  //     ...grnData,
  //     createdAt: new Date()
  //   };
  //   return this.firestore
  //     .collection(this.collectionName)
  //     .add(payload)
  //     .then((result) => {
  //       console.log('✅ Outlet Product added successfully:', result);
  //       return result;
  //     })
  //     .catch((error) => {
  //       console.error('❌ Error adding GRN:', error);
  //       throw error;
  //     });
  // }

  addOutletProduct(grnData: any): Promise<any> {
    const payload = {
      ...grnData,
      createdAt: new Date(),
      // Add any additional fields as needed
    };
    return this.firestore
      .collection(this.collectionName)  // main collection
      .doc(grnData.outletId)        // outletID (document ID)
      .collection('products')// sub-collection for products
      .doc(grnData.sku)
      .set(payload)

  }
  addInventoryProduct(inventoryData: any): Promise<any> {
    const payload = {
      ...inventoryData,
      createdAt: new Date(),
    };
    return this.firestore
      .collection('inventory')
      .doc(inventoryData.dealerOutlet)
      .set(
        {products: {[inventoryData.sku]: payload}},
        {merge: true}
      );
  }

  // 📌 Update GRN
  updateOutletProduct(outletId: string, productId: string, grnData: any): Promise<any> {
    return this.firestore
      .collection(this.collectionName)   // outletProduct
      .doc(outletId)                     // specific outlet
      .collection('products')            // products sub-collection
      .doc(productId)                    // specific product
      .update(grnData)
      .then(() => {
        console.log('✅ Outlet Product updated successfully');
      })
      .catch((error) => {
        console.error('❌ Error updating GRN:', error);
        throw error;
      });
  }


// outlet-product.service.ts
  deleteOutletProduct(outletId: string, productId: string): Promise<void> {
    return this.firestore
      .collection(this.collectionName)    // 'outletProduct'
      .doc(outletId)                      // outlet doc (e.g. VWC014)
      .collection('products')             // subcollection
      .doc(productId)                     // product doc id (e.g. EKPsTW9N...)
      .delete();
  }


  // 📌 Get GRN by ID
  getOutletProductById(id: string): Observable<any> {
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


  //collection >document > sub-collection > document > sub-collection > document > data
  //
}
