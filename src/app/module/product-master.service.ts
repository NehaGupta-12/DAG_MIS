import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProductMasterService {
  constructor(private firestore: AngularFirestore) {}
  private collectionName = "product";
  getProductList() {
    return this.firestore
      .collection(this.collectionName)
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
    getProductListByCountry(country: string) {
        return this.firestore
            .collection(this.collectionName,ref => ref.where('availableIn','array-contains',country))

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


  // // Fetch all callSheet with pagination
  // getProductList(startAfter?: any): Observable<any> {
  //   return this.firestore
  //     .collection(this.collectionName, (ref) => {
  //       let query = ref.orderBy('createdAt','desc');
  //       if (startAfter) query = query.startAfter(startAfter);
  //       return query;
  //     })
  //     .snapshotChanges()
  //     .pipe(map((actions) => actions.map((a) => {
  //       const data = a.payload.doc.data();
  //       const id = a.payload.doc.id;
  //       return { id, ...(data as any) };
  //     })));
  // }

  addProduct(callSheet: any): Promise<any> {
    console.log('Calling Firestore addCallSheet with data:', callSheet);

    const sku = this.generateUniqueSku();
    callSheet.sku = sku;
    return this.firestore.collection(this.collectionName).doc(sku).set(callSheet)
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



  updateProduct(id: string, callSheet: any): Promise<any> {
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



  deleteProduct(id: string) {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

}
