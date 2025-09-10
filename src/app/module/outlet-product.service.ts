import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import 'firebase/compat/firestore';
import {deleteField} from "@angular/fire/firestore";
@Injectable({
  providedIn: 'root'
})
export class OutletProductService {
  private collectionName = 'outletProduct';   // Firestore collection name

  constructor(private mFirestore: AngularFirestore) {}

  getInventoryData(){
    return this.mFirestore.collection('inventory').valueChanges({idField: 'id'});
  }

  getOutletProductList(): Observable<any[]> {
    return this.mFirestore
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
    return this.mFirestore
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
    return this.mFirestore
      .collection('inventory')
      .doc(inventoryData.dealerOutlet)
      .set(
        {products: {[inventoryData.sku]: payload}},
        {merge: true}
      );
  }

  // 📌 Update GRN
  updateOutletProduct(outletId: string, productId: string, grnData: any): Promise<any> {
    return this.mFirestore
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
    return this.mFirestore
      .collection(this.collectionName)    // 'outletProduct'
      .doc(outletId)                      // outlet doc (e.g. VWC014)
      .collection('products')             // subcollection
      .doc(productId)                     // product doc id (e.g. EKPsTW9N...)
      .delete();
  }


  async deleteOutletProductAndInventory(outletId: string, productId: string, dealerOutlet: string): Promise<void> {
    const batch = this.mFirestore.firestore.batch();

    // Delete product from outlet sub-collection
    const outletRef = this.mFirestore
      .collection(this.collectionName)
      .doc(outletId)
      .collection('products')
      .doc(productId).ref;
    batch.delete(outletRef);

    // Delete product from inventory nested field
    const inventoryRef = this.mFirestore.collection('inventory').doc(dealerOutlet).ref;

    // Use Firestore FieldValue.delete() to remove the specific SKU
    batch.update(inventoryRef, {
      [`products.${productId}`]:deleteField()
    });

    return batch.commit();
  }


  // 📌 Get GRN by ID
  getOutletProductById(id: string): Observable<any> {
    return this.mFirestore
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
