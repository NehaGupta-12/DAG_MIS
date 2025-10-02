import {EnvironmentInjector, Injectable, isDevMode, runInInjectionContext} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import 'firebase/compat/firestore';
import {deleteField} from "@angular/fire/firestore";
import {environment} from "../../environments/environment";
@Injectable({
  providedIn: 'root'
})
export class OutletProductService {
  collectionNameOutletProduct = isDevMode() ? environment.testCollections.outletProduct : environment.collections.outletProduct;// Firestore collection name
  env = isDevMode() ? environment.testCollections : environment.collections;// Firestore collection name

  constructor(private mFirestore: AngularFirestore,
              private injector : EnvironmentInjector) {}




// /updatedProductOutlet/A.And.UBarrieEnterprises
  getOutletProductListByDealerId(dealerId: string): Observable<any[]> {
    return this.mFirestore
      .collection(`${this.env.outletProduct}/${dealerId}/products`)
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            console.log(data)
            console.log(data)
            const id = a.payload.doc.id;
            return { id, ...(data as any) };
          })
        )
      );
  }


  addOutletProduct(grnData: any): Promise<any> {
    const payload = {
      ...grnData,
      createdAt: new Date(),
      // Add any additional fields as needed
    };
    return this.mFirestore
      .collection(this.env.outletProduct)  // main collection
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
      .collection(this.env.inventory)
      .doc(inventoryData.dealerOutlet)
      .set(
        {products: {[inventoryData.sku]: payload}},
        {merge: true}
      );
  }

  // 📌 Update GRN
  updateOutletProduct(
    outletId: string,
    productId: string,
    grnData: any
  ): Promise<any> {
    return runInInjectionContext(this.injector, () => {
      return this.mFirestore
        .collection(this.env.outletProduct) // outletProduct
        .doc(outletId)                   // specific outlet
        .collection('products')          // products sub-collection
        .doc(productId)                  // specific product
        .update(grnData)
        .then(() => console.log('Outlet Product updated successfully'))
        .catch((error) => {
          console.error('❌ Error updating GRN:', error);
          throw error;
        });
    });
  }

  updateInventoryProduct(
    dealerOutlet: string,
    sku: string,
    updateData: Partial<{ openingStock: number; quantity?: number; [key: string]: any }>
  ): Promise<void> {
    if (!dealerOutlet || !sku) {
      return Promise.reject(new Error('Dealer outlet and SKU are required'));
    }

    const payload = {
      ...updateData,
      updatedAt: new Date()
    };

    return runInInjectionContext(this.injector, () => {
      console.log(dealerOutlet)
      return this.mFirestore
        .collection(this.env.inventory)
        .doc(dealerOutlet)
        .set(
          { products: { [sku]: payload } },
          { merge: true } // merge=true ensures only updated fields are changed
        )
        .then(() => console.log(`✅ Inventory product ${sku} updated successfully`))
        .catch(err => {
          console.error(`❌ Error updating inventory product ${sku}:`, err);
          throw err;
        });
    });
  }

// outlet-product.service.ts
  deleteOutletProduct(outletId: string, productId: string): Promise<void> {
    return this.mFirestore
      .collection(this.env.outletProduct)    // 'outletProduct'
      .doc(outletId)                      // outlet doc (e.g. VWC014)
      .collection('products')             // subcollection
      .doc(productId)                     // product doc id (e.g. EKPsTW9N...)
      .delete();
  }

  async deleteOutletProductAndInventory(outletId: string, productId: string, dealerOutlet: string): Promise<void> {
    const batch = this.mFirestore.firestore.batch();

    // Delete product from outlet sub-collection
    const outletRef = this.mFirestore
      .collection(this.env.outletProduct)
      .doc(outletId)
      .collection('products')
      .doc(productId).ref;
    batch.delete(outletRef);

    // Delete product from inventory nested field
    const inventoryRef = this.mFirestore.collection(this.env.inventory).doc(dealerOutlet).ref;

    // Use Firestore FieldValue.delete() to remove the specific SKU
    batch.update(inventoryRef, {
      [`products.${productId}`]:deleteField()
    });

    return batch.commit();
  }

  // 📌 Get GRN by ID
  getOutletProductById(id: string): Observable<any> {
    return this.mFirestore
      .collection(this.env.outletProduct)
      .doc(id)
      .snapshotChanges()
      .pipe(
        map((action) => {
          const data = action.payload.data();
          return { id, ...(data as any) };
        })
      );
  }

}
