import {Component, EnvironmentInjector, runInInjectionContext} from '@angular/core';
import {AddDealerService} from "../module/add-dealer.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {logCumulativeDurations} from "@angular/build/src/tools/esbuild/profiling";

@Component({
  selector: 'app-auto-function-upload',
  imports: [],
  templateUrl: './auto-function-upload.component.html',
  standalone: true,
  styleUrl: './auto-function-upload.component.scss'
})
export class AutoFunctionUploadComponent {

  constructor(private dealerService: AddDealerService,
              private firestore: AngularFirestore,
              private injector: EnvironmentInjector) {
    // this.updateDealerData();
    // this.updateCopyDealerData();
    // Use injector to run subscription in injection context
    // this.getDealer2Length();
    // this.updateOulteCollection();
    // this.copyRolesToRoles2()
  }
  copyRolesToRoles2() {
    const sourceCollection = 'dealer';
    const targetCollection = 'dealerCopyData';
    runInInjectionContext(this.injector, async () => {
    this.firestore.collection(sourceCollection).get().subscribe(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const id = doc.id; // optional: keep the same doc ID
        runInInjectionContext(this.injector, async () => {
        this.firestore.collection(targetCollection).doc(id).set(data)
          .then(() => console.log(`Copied document ${id}`))
          .catch(err => console.error('Error copying document', id, err));
      });
      });
    }, error => {
      console.error('Error fetching source collection', error);
    });

    });
  }

  updateDealerData() {
    runInInjectionContext(this.injector, async () => {
      const dealerData:any = await this.firestore.collection('dealer').get().toPromise();
      const data: any[] = [];
      dealerData.forEach(doc => {
        const dealer:any = doc.data();
        dealer.id = doc.id; // mimic idField
        data.push(dealer);
      });

      console.log('Dealer List:', data.length);

      data.forEach((dealer: any) => {
        if (dealer.name) {
          const outletId = dealer.name.replace(/[\s/]+/g, '');
          runInInjectionContext(this.injector, () => {
            this.firestore.collection('dealer2').doc(outletId).set(dealer)
              .then(() => console.log(`Updated outletId for ${dealer.outletId}`))
              .catch(err => console.error(`Error updating ${dealer.outletId}:`, err));
          });
        }
      });

      console.log('Dealer List with outletId:', data);
    });
  }

  updateCopyDealerData() {
    runInInjectionContext(this.injector, async () => {
      const dealerData:any = await this.firestore.collection('dealer').get().toPromise();

      const data: any[] = [];
      dealerData.forEach((doc:any) => {
        const dealer = doc.data();
        dealer.id = doc.id;
        data.push(dealer);
      });

      console.log('Dealer List:', data);
      console.log('Dealer List:', data.length);

      data.forEach((dealer: any) => {
        if (dealer.name) {
          dealer.outletId = dealer. name.replace(/[\s/]+/g, '');
        }

        const newDocId = dealer.outletId

        runInInjectionContext(this.injector, () => {
          this.firestore.collection('dealer2').doc(newDocId).set(JSON.parse(dealer))
            .then(() => console.log(`Copied dealer ${dealer.name} to dealer2`))
            .catch(err => console.error(`Error copying ${dealer.name}:`, err));
        });
      });

      console.log('Dealer List with outletId:', data);
      console.log('Dealer List with outletId:', data.length);

    });
  }

  private getDealer2Length() {
    runInInjectionContext(this.injector, async () => {
      const dealer2Data:any = await this.firestore.collection('dealer2').get().toPromise();
      const data: any[] = [];
      dealer2Data.forEach((doc:any) => {
        const dealer = doc.data();
        dealer.id = doc.id;
        data.push(dealer);
      });

      console.log('Dealer2 List:', data);
      console.log('Dealer2 List Length:', data.length);
    });
  }

  private updateOulteCollection() {
    runInInjectionContext(this.injector, async () => {
  //step 1: get all outets from outletProduct collection
  //     step2 : Now in each document get the subcollection products and loop through each product
// step3: For each product, update the product with repective outletId in dealer2 collection
this.firestore.collection('outletProduct').get().toPromise().then((outlets:any) => {
  console.log(`Total Outlets: ${outlets.size}`);
  outlets.forEach((doc:any) => {
    console.log(`Processing Outlet ID: ${doc.id}`);
  this.processOutletProducts(doc.id);
  })
}
)

//       this.firestore.collection(`outletProduct/${docId}/products/`).get().toPromise().then((products:any) => {
//  const updateProducts:any =[]
//   products.forEach((productDoc:any) => {
// const p  = productDoc.data();
//     p.outletId = newOutletId;
//
//   updateProducts.push(p)
//
//   });
//   console.log('updatedProducts: ',updateProducts )
//     })

    })
}

  private processOutletProducts(id) {
    runInInjectionContext(this.injector, async () => {

      this.firestore.collection(`outletProduct/${id}/products/`).get().toPromise().then((products:any) => {
        console.log(`Total Products for Outlet ${id}: ${products.size}`);
        products.forEach((productDoc:any) => {
          const product  = productDoc.data();
          const newOutletId =product.dealerOutlet.replace(/[\s/]+/g, '');
          product.outletId = newOutletId;
          console.log(`Updating Product SKU: ${product.sku} for Outlet ID: ${newOutletId}`);
          runInInjectionContext(this.injector, async () => {
            this.firestore.collection('updatedProductOutlet').doc(newOutletId).collection('products').doc(product.sku).set(product)
              .catch(err => console.error(`Error creating dealer document ${newOutletId}:`, err));
          });
        });
      }).catch(err => console.error(`Error fetching products for outlet ${id}:`, err));
    });

  }
}

