import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from "@angular/forms";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatCheckbox, MatCheckboxModule} from "@angular/material/checkbox";
import {MatInput, MatInputModule, MatLabel, MatSuffix} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {CommonModule, Location, NgForOf} from "@angular/common";
import {GrnService} from "../grn.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import Swal from "sweetalert2";
import {AddDealerService} from "../add-dealer.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
  MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {ProductMasterService} from "../product-master.service";
import {OutletProductService} from "../outlet-product.service";
import {DailySalesService} from "../daily-sales.service";
import {InventoryService} from "../add-inventory/inventory.service";
import firebase from "firebase/compat/app";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { increment } from 'firebase/firestore';

@Component({
  selector: 'app-add-grn',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    NgForOf,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    CommonModule,
    MatTableModule
  ],
  providers: [
    {provide: MAT_DIALOG_DATA, useValue: {}} // ✅ Fallback
  ],
  templateUrl: './add-grn.component.html',
  standalone: true,
  styleUrl: './add-grn.component.scss'
})
export class AddGRNComponent implements OnInit{

  // isEditMode: boolean = false;
  // grnForm: FormGroup;
  // displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'variant', 'unit', 'quantity', 'action'];
  // dealerdataSource = new MatTableDataSource<any>();
  // vehicledataSource = new MatTableDataSource<any>();
  // addedProducts: any[] = [];
  // dataSource = new MatTableDataSource<any>();
  // allOutletProducts: any[] = [];
  //
  // breadscrums = [
  //   {
  //     title: 'Examples',
  //     items: ['Forms'],
  //     active: 'Examples',
  //   },
  // ];
  //
  // constructor(private fb: UntypedFormBuilder,
  //             private dealer: Location,
  //             private grnService: GrnService,
  //             private injector: EnvironmentInjector,
  //             private route: ActivatedRoute,
  //             private addDealerService: AddDealerService,
  //             private productService:ProductMasterService,
  //             private outletProductService: OutletProductService,
  //             @Inject(MAT_DIALOG_DATA) public data: any,
  // ) {
  //   // this.initForm();
  //   this.isEditMode = !!data?.id;
  //   this.grnForm = this.fb.group({
  //     products: ['', [Validators.required]],
  //     // openingStock: ['', [Validators.required]],
  //     // grnQuantity: ['', [Validators.required]],
  //     typeOfGrn: ['', [Validators.required]],
  //     dealerOutlet: ['', [Validators.required]],
  //     items: this.fb.array([]),
  //   });
  // }
  //
  // ngOnInit() {
  //   this.DealerList();
  //   this.loadOutletProduct();
  //
  //   this.route.queryParams.subscribe(params => {
  //     if (params['data']) {
  //       const rowData = JSON.parse(params['data']);
  //       console.log('Received row data:', rowData);
  //
  //       // ✅ Patch simple fields
  //       this.grnForm.patchValue({
  //         dealerOutlet: rowData.dealerOutlet,
  //         // openingStock: rowData.openingStock,
  //         typeOfGrn: rowData.typeOfGrn
  //       });
  //
  //       // ✅ If there are items, load them into addedProducts
  //       if (rowData.items && Array.isArray(rowData.items)) {
  //         this.addedProducts = rowData.items.map((item: any) => ({
  //           ...item,
  //           varient: item.variant ?? item.variant,  // fallback if rowData has 'variant'
  //           quantity: item.quantity ?? 1
  //         }));
  //       }
  //
  //
  //       // ✅ Check if ID exists for edit mode
  //       if (rowData.id) {
  //         this.isEditMode = true;
  //         this.data = rowData;
  //       }
  //     }
  //   });
  // }
  //
  //
  //
  // DealerList() {
  //   runInInjectionContext(this.injector, () => {
  //     this.addDealerService.getDealerList().subscribe((data) => {
  //       this.dealerdataSource.data = data;
  //       console.log(this.dealerdataSource.data)
  //     });
  //   });
  // }
  //
  //
  // loadOutletProduct() {
  //   runInInjectionContext(this.injector, () => {
  //     this.outletProductService.getOutletProductList().subscribe((data) => {
  //       this.allOutletProducts = data; // keep all products here
  //       this.vehicledataSource.data = []; // keep dropdown empty until outlet selected
  //       console.log("All Outlet Products:", this.allOutletProducts);
  //     });
  //   });
  // }
  //
  // onOutletChange(selectedOutlet: string) {
  //   const selectedOutletData = this.dealerdataSource.data.find(
  //     dealer => dealer.name === selectedOutlet
  //   );
  //
  //   if (selectedOutletData) {
  //     // Filter products belonging to this outlet
  //     this.vehicledataSource.data = this.allOutletProducts.filter(
  //       product => product.outletId === selectedOutletData.id ||
  //         product.dealerId === selectedOutletData.id
  //     );
  //   } else {
  //     this.vehicledataSource.data = [];
  //   }
  //
  //   console.log("Filtered Products:", this.vehicledataSource.data);
  // }
  //
  //
  //
  // isSubmitEnabled(): boolean {
  //   const formValid =
  //     !!this.grnForm.get('dealerOutlet')?.valid &&
  //     // !!this.grnForm.get('openingStock')?.valid &&
  //     !!this.grnForm.get('typeOfGrn')?.valid;
  //
  //   const hasProducts = this.addedProducts.length > 0;
  //   const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);
  //
  //   return formValid && hasProducts && allQuantitiesValid;
  // }
  //
  //
  // addProduct() {
  //   const selectedProductName = this.grnForm.get('products')?.value;
  //
  //   if (!selectedProductName) {
  //     Swal.fire('Error', 'Please select a product before adding.', 'error');
  //     return;
  //   }
  //
  //   const product = this.vehicledataSource.data.find(p => p.name === selectedProductName);
  //
  //   if (product) {
  //     const exists = this.addedProducts.some(p => p.id === product.id);
  //     if (exists) {
  //       Swal.fire('Info', 'This product is already added.', 'info');
  //       return;
  //     }
  //
  //     // 🔥 Important: create new array reference for Angular change detection
  //     this.addedProducts = [...this.addedProducts, { ...product, quantity: 1 }];
  //   }
  //
  //   // Reset product dropdown
  //   this.grnForm.get('products')?.reset();
  // }
  //
  //
  //
  // removeProduct(index: number) {
  //   this.addedProducts.splice(index, 1);
  // }
  //
  //
  // submitForm() {
  //   try {
  //     const formValues = this.grnForm.getRawValue();
  //     delete formValues.products; // remove dropdown selection
  //
  //     if (this.addedProducts.length === 0) {
  //       Swal.fire('Error', 'Please add at least one product.', 'error');
  //       return;
  //     }
  //
  //     Swal.fire({
  //       title: this.isEditMode ? 'Update GRN Details?' : 'Add GRN Details?',
  //       text: 'Are you sure you want to proceed?',
  //       icon: 'question',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes',
  //       cancelButtonText: 'No'
  //     }).then((result: any) => {
  //       if (!result.isConfirmed) return;
  //
  //       try {
  //         const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  //         const username = userData.userName || 'Unknown User';
  //         const timestamp = Date.now();
  //
  //         // 🔹 Base info from form
  //         const baseInfo = {
  //           dealerOutlet: formValues.dealerOutlet,
  //           typeOfGrn: formValues.typeOfGrn,
  //           status: 'Active',
  //           updatedBy: username,
  //           updatedAt: timestamp
  //         };
  //
  //         if (this.isEditMode && this.data?.docId) {
  //           // 🔹 Update only ONE GRN document in edit mode
  //           const productToUpdate = this.addedProducts[0]; // assume one product per GRN edit
  //
  //           const productDoc = {
  //             ...baseInfo,
  //             sku: productToUpdate.sku,
  //             name: productToUpdate.name,
  //             brand: productToUpdate.brand,
  //             model: productToUpdate.model,
  //             variant: productToUpdate.variant ?? productToUpdate.varient,
  //             unit: productToUpdate.unit,
  //             quantity: productToUpdate.quantity
  //           };
  //
  //           runInInjectionContext(this.injector, () =>
  //             this.grnService.updateGrn(this.data.docId, productDoc)
  //           )
  //             .then(() => {
  //               Swal.fire('Updated!', 'GRN Details updated successfully.', 'success');
  //               this.goBack();
  //             })
  //             .catch(error => {
  //               console.error('Error updating GRN:', error);
  //               Swal.fire('Error', 'Something went wrong.', 'error');
  //             });
  //
  //         } else {
  //           // 🔹 Create one document per product (Add Mode)
  //           const createPromises = this.addedProducts.map(p => {
  //             const productDoc = {
  //               ...baseInfo,
  //               sku: p.sku ?? '',
  //               name: p.name ?? '',
  //               brand: p.brand ?? '',
  //               model: p.model ?? '',
  //               variant: p.variant ?? p.varient ?? '',
  //               unit: p.unit ?? '',
  //               quantity: p.quantity ?? 0,
  //               createdBy: username,
  //               createdAt: timestamp
  //             };
  //
  //             return runInInjectionContext(this.injector, () =>
  //               this.grnService.addGrn(productDoc)
  //             );
  //           });
  //
  //           Promise.all(createPromises)
  //             .then(() => {
  //               Swal.fire('Added!', 'All GRN products saved as separate documents.', 'success');
  //               this.goBack();
  //             })
  //             .catch(error => {
  //               console.error('Error adding GRN:', error);
  //               Swal.fire('Error', 'Something went wrong.', 'error');
  //             });
  //         }
  //       } catch (innerErr) {
  //         console.error('Unexpected error during GRN submission:', innerErr);
  //         Swal.fire('Error', 'Unexpected issue occurred.', 'error');
  //       }
  //     });
  //   } catch (err) {
  //     console.error('Global GRN submit error:', err);
  //     Swal.fire('Error', 'Something went wrong while submitting.', 'error');
  //   }
  // }
  //
  //
  //
  //
  //
  //
  // goBack() {
  //   this.dealer.back();
  // }









  isEditMode: boolean = false;
  grnForm: FormGroup;
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'variant', 'unit', 'quantity', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private fb: UntypedFormBuilder,
    private location: Location,
    private dailySalesService: DailySalesService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private addDealerService: AddDealerService,
    private afs: AngularFirestore,
    private grnService: GrnService,
    private productService: ProductMasterService,
    private router: Router,
    private outletProductService: OutletProductService,
    private inventoryService : InventoryService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isEditMode = !!data?.id;
    this.grnForm = this.fb.group({
      dealerOutlet: ['', Validators.required],
      products: ['', Validators.required],
      typeOfGrn: ['', Validators.required],
    });
  }


  ngOnInit() {
    this.DealerList();
    // this.loadOutletProduct();
    this.loadInventoryDaata();

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Edit Mode Row Data:', rowData);

        // ✅ Patch dealer/outlet info
        this.grnForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          products: rowData.products,
          typeOfGrn: rowData.typeOfGrn,
        });

        // ✅ Put product into addedProducts with docId
        this.addedProducts = [{
          docId: rowData.docId,  // Firestore document ID
          sku: rowData.sku ?? '',
          name: rowData.name ?? '',
          brand: rowData.brand ?? '',
          model: rowData.model ?? '',
          variant: rowData.variant ?? rowData.varient ?? '',
          unit: rowData.unit ?? '',
          quantity: rowData.quantity ?? 1
        }];

        // ✅ Patch vehicle field & disable it
        this.grnForm.patchValue({ products: rowData.name });
        // this.dailySalesForm.get('dealerOutlet')?.disable();
        this.grnForm.get('products')?.disable();

        // ✅ Mark edit mode
        this.isEditMode = true;
        this.data = rowData;
      }
    });

  }


  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data) => {
        this.dealerdataSource.data = data;
        console.log(this.dealerdataSource.data)
      });
    });
  }


  // loadOutletProduct() {
  //   runInInjectionContext(this.injector, () => {
  //     this.outletProductService.getOutletProductList().subscribe((data) => {
  //       this.dataSource.data = data;
  //       console.log(this.dataSource.data)
  //     });
  //   });
  // }

  loadInventoryDaata() {
    runInInjectionContext(this.injector, () => {
      this.inventoryService.getInventoryAllData().subscribe(data => {
        console.log('Inventory data:', data);
        this.dataSource.data = data;
      });
    });
  }

  onDealerChange(event: any) {
    const dealerName = event.value;

    // 1. Get dealer details (division, country, town)
    const dealer = this.dealerdataSource.data.find((d: any) => d.name === dealerName);
    // if (dealer) {
    //   this.grnForm.patchValue({
    //     division: dealer.division || '',
    //     country: dealer.country || '',
    //     town: dealer.town || ''
    //   });
    // }

    // 2. Filter outlet products directly (since each doc is already one product)
    const availableProducts = this.dataSource.data.filter(
      (p: any) => p.dealerId === dealer.id && p.openingStock > 0
    );

    // 3. Bind to vehicle dropdown
    this.vehicledataSource.data = availableProducts;

    // reset vehicle selection
    this.grnForm.get('products')?.reset();
  }



  isSubmitEnabled(): boolean {
    const formValid =
      this.grnForm.get('dealerOutlet')?.valid &&
      this.grnForm.get('typeOfGrn')?.valid

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);

    return !!formValid && hasProducts && allQuantitiesValid;
  }

  addProduct() {
    const selectedProductId = this.grnForm.get('products')?.value;
    if (!selectedProductId) {
      Swal.fire('Error', 'Please select a product before adding.', 'error');
      return;
    }

    const product = this.vehicledataSource.data.find(p => p.name === selectedProductId);
    if (product) {
      // ✅ Check duplicate by `id` (recommended) or fallback to `sku`
      const exists = this.addedProducts.some(p => p.productId === product.id);
      if (exists) {
        Swal.fire('Info', 'This product is already added.', 'info');
        return;
      }

      // ✅ Push product into table
      this.addedProducts = [...this.addedProducts, {
        productId: product.id,   // 🔹 unique ID
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        model: product.model,
        variant: product.variant,
        unit: product.unit,
        quantity: 1
      }];
      console.log(this.addedProducts);
    }

    // reset after adding
    this.grnForm.get('products')?.reset();
  }


  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
  }

  // submitForm() {
  //   try {
  //     const formValues = this.grnForm.getRawValue();
  //
  //     if (this.addedProducts.length === 0) {
  //       Swal.fire('Error', 'Please add at least one product.', 'error');
  //       return;
  //     }
  //
  //     Swal.fire({
  //       title: this.isEditMode ? 'Update Grn?' : 'Add Grn?',
  //       text: 'Are you sure you want to proceed?',
  //       icon: 'question',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes',
  //       cancelButtonText: 'No'
  //     }).then((result: any) => {
  //       if (result.isConfirmed) {
  //         try {
  //           const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  //           const username = userData.userName || 'Unknown User';
  //           const timestamp = Date.now();
  //
  //           // 🔹 Base info from form
  //           const baseInfo = {
  //             dealerOutlet: formValues.dealerOutlet,
  //             typeOfGrn: formValues.typeOfGrn,
  //             status: 'Active',
  //             updatedBy: username,
  //             updatedAt: timestamp
  //           };
  //
  //           if (this.isEditMode) {
  //             const productToUpdate = this.addedProducts[0]; // only one in edit mode
  //
  //             const productDoc = {
  //               ...baseInfo,
  //               sku: productToUpdate.sku,
  //               name: productToUpdate.name,
  //               brand: productToUpdate.brand,
  //               model: productToUpdate.model,
  //               variant: productToUpdate.variant,
  //               unit: productToUpdate.unit,
  //               quantity: productToUpdate.quantity
  //             };
  //
  //             runInInjectionContext(this.injector, () =>
  //               this.grnService.updateGrn(productToUpdate.docId, productDoc)
  //             )
  //               .then(() => {
  //                 Swal.fire('Updated!', 'Grn updated successfully.', 'success');
  //                 this.goBack();
  //               })
  //               .catch(err => {
  //                 console.error('Error updating Grn:', err);
  //                 Swal.fire('Error', 'Something went wrong while updating.', 'error');
  //               });
  //           } else {
  //             // 🔹 Create one document per product (Add Mode)
  //             const createPromises = this.addedProducts.map(p => {
  //               const productDoc = {
  //                 ...baseInfo,
  //                 id: p.id ?? '',
  //                 sku: p.sku ?? '',
  //                 name: p.name ?? '',
  //                 brand: p.brand ?? '',
  //                 model: p.model ?? '',
  //                 variant: p.variant ?? p.varient ?? '',
  //                 unit: p.unit ?? '',
  //                 quantity: p.quantity ?? 0,
  //                 createdBy: username,
  //                 createdAt: timestamp
  //               };
  //
  //               return runInInjectionContext(this.injector, () =>
  //                 this.grnService.addGrn(productDoc)
  //               );
  //             });
  //
  //             Promise.all(createPromises)
  //               .then(() => {
  //                 Swal.fire('Added!', 'All products saved as separate documents.', 'success');
  //                 this.router.navigate(['/module/grn-list']);
  //               })
  //               .catch(err => {
  //                 console.error('Error adding Grn:', err);
  //                 Swal.fire('Error', 'Something went wrong while adding.', 'error');
  //               });
  //           }
  //         } catch (innerErr) {
  //           console.error('Unexpected error during submission:', innerErr);
  //           Swal.fire('Error', 'Unexpected issue occurred.', 'error');
  //         }
  //       }
  //     });
  //   } catch (err) {
  //     console.error('Global submit error:', err);
  //     Swal.fire('Error', 'Something went wrong while submitting.', 'error');
  //   }
  // }

  async submitForm() {
    try {
      const formValues = this.grnForm.getRawValue();

      if (this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please add at least one product.', 'error');
        return;
      }

      const result = await Swal.fire({
        title: this.isEditMode ? 'Update Grn?' : 'Add Grn?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      if (!result.isConfirmed) return;

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = userData.userName || 'Unknown User';
      const timestamp = Date.now();

      const baseInfo = {
        dealerOutlet: formValues.dealerOutlet,
        typeOfGrn: formValues.typeOfGrn,
        status: 'Active',
        updatedBy: username,
        updatedAt: timestamp
      };

      const batch = this.afs.firestore.batch();
      const increments = increment;
      // const increments = firebase.firestore.FieldValue.increment;

      if (this.isEditMode) {
        const productToUpdate = this.addedProducts[0]; // Usually single product

        // Update GRN doc
        await runInInjectionContext(this.injector, () =>
          this.grnService.updateGrn(productToUpdate.docId, {
            ...baseInfo,
            sku: productToUpdate.sku,
            name: productToUpdate.name,
            brand: productToUpdate.brand,
            model: productToUpdate.model,
            variant: productToUpdate.variant,
            unit: productToUpdate.unit,
            quantity: productToUpdate.quantity
          })
        );

        // Inventory increment in batch
        const inventoryRef = this.afs.firestore.collection('inventory').doc(productToUpdate.dealerId);
        batch.set(
          inventoryRef,
          { openingStock: increments(productToUpdate.quantity) },
          { merge: true }
        );

      } else {
        // Add mode: Add multiple GRN docs
        const createPromises = this.addedProducts.map(p => {
          const productDoc = {
            ...baseInfo,
            id: p.id ?? '',
            sku: p.sku ?? '',
            name: p.name ?? '',
            brand: p.brand ?? '',
            model: p.model ?? '',
            variant: p.variant ?? p.varient ?? '',
            unit: p.unit ?? '',
            quantity: p.quantity ?? 0,
            createdBy: username,
            createdAt: timestamp
          };
          return runInInjectionContext(this.injector, () =>
            this.grnService.addGrn(productDoc)
          );
        });
        await Promise.all(createPromises);

        // Inventory batch increments
        this.addedProducts.forEach(p => {
          console.log(p)
          const inventoryRef = this.afs.firestore.collection('inventory').doc(p.dealerId);
          batch.set(
            inventoryRef,
            { openingStock: increments(p.quantity) },
            { merge: true }
          );
        });
      }

      // Commit batch once
      await batch.commit();

      Swal.fire(
        this.isEditMode ? 'Updated!' : 'Added!',
        this.isEditMode ? 'Grn updated and inventory incremented.' : 'All products saved and inventory updated.',
        'success'
      );

      if (!this.isEditMode) {
        this.router.navigate(['/module/grn-list']);
      } else {
        this.goBack();
      }

    } catch (err) {
      console.error('Error during submission:', err);
      Swal.fire('Error', 'Unexpected issue occurred.', 'error');
    }
  }
  goBack() {
    this.location.back();
  }
}
