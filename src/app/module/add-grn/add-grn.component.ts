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
        this.outlateId = rowData.outlateId;
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
  submitForm() {
    try {
      const formValues = this.grnForm.getRawValue();

      if (this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please add at least one product.', 'error');
        return;
      }

      Swal.fire({
        title: this.isEditMode ? 'Update Grn?' : 'Add Grn?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result: any) => {
        if (result.isConfirmed) {
          try {
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

            if (this.isEditMode) {
              // ✅ Update GRN only (no inventory changes)
              const productToUpdate = this.addedProducts[0];

              const productDoc = {
                ...baseInfo,
                sku: productToUpdate.sku,
                name: productToUpdate.name,
                brand: productToUpdate.brand,
                model: productToUpdate.model,
                variant: productToUpdate.variant,
                unit: productToUpdate.unit,
                quantity: productToUpdate.quantity
              };

              runInInjectionContext(this.injector, () =>
                this.grnService.updateGrn(productToUpdate.docId, productDoc)
              )
                .then(() => {
                  this.updateInventory(productDoc, 'increase')
                  Swal.fire('Updated!', 'GRN updated successfully.', 'success');
                  this.goBack();
                })
                .catch(err => {
                  console.error('Error updating GRN:', err);
                  Swal.fire('Error', 'Something went wrong while updating.', 'error');
                });

            } else {
              // ✅ Add GRN and update inventory
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
                console.log(productDoc);

                return runInInjectionContext(this.injector, () =>
                  this.grnService.addGrn(productDoc)
                ).then(() => this.updateInventory(productDoc, 'increase')); // ✅ only increase on Add
              });

              Promise.all(createPromises)
                .then(() => {
                  Swal.fire('Added!', 'All products saved and inventory updated.', 'success');
                  this.router.navigate(['/module/grn-list']);
                })
                .catch(err => {
                  console.error('Error adding GRN:', err);
                  Swal.fire('Error', 'Something went wrong while adding.', 'error');
                });
            }
          } catch (innerErr) {
            console.error('Unexpected error during submission:', innerErr);
            Swal.fire('Error', 'Unexpected issue occurred.', 'error');
          }
        }
      });
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }

  outlateId: any;

  updateInventory(product: any, action: 'increase' | 'decrease'): Promise<void> {
    const quantityChange = action === 'increase' ? product.quantity : -product.quantity;
    return runInInjectionContext(this.injector, () =>
      this.inventoryService.updateInventoryQuantity(product.dealerOutlet, product.sku, quantityChange)
    );
  }
  goBack() {
    this.location.back();
  }
}
