import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
import { MatButtonModule} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import { MatInputModule} from "@angular/material/input";
import {CommonModule, Location, NgForOf} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {AddDealerService} from "../add-dealer.service";
import {ProductMasterService} from "../product-master.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import Swal from "sweetalert2";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {StockTransferService} from "../stock-transfer.service";
import {OutletProductService} from "../outlet-product.service";
import {InventoryService} from "../add-inventory/inventory.service";

@Component({
  selector: 'app-add-stock-transfer',
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
  templateUrl: './add-stock-transfer.component.html',
  standalone: true,
  styleUrl: './add-stock-transfer.component.scss'
})
export class AddStockTransferComponent implements OnInit {

  isEditMode: boolean = false;
  stockTransferForm: FormGroup;
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'variant', 'unit', 'quantity', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  dataSource = new MatTableDataSource<any>();


  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(private fb: UntypedFormBuilder,
              private dealer: Location,
              private stockTransferService: StockTransferService,
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              private addDealerService: AddDealerService,
              private productService:ProductMasterService,
              private outletProductService: OutletProductService,
              private inventoryService : InventoryService,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // this.initForm();
    this.isEditMode = !!data?.id;
    this.stockTransferForm = this.fb.group({
      products: ['', [Validators.required]],
      fromDealerOutlet: ['', [Validators.required]],
      toDealerOutlet: ['', [Validators.required]],
      items: this.fb.array([]),
    });
  }


  ngOnInit() {
    this.DealerList();
    this.productList();
    // this.loadOutletProduct();
    this.loadInventoryDaata();

    // disable products until both dealers selected
    this.stockTransferForm.get('products')?.disable();

    this.stockTransferForm.get('fromDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());
    this.stockTransferForm.get('toDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // ✅ Patch simple fields
        this.stockTransferForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          openingStock: rowData.openingStock,
          typeOfGrn: rowData.typeOfGrn
        });

        // ✅ If there are items, load them into addedProducts
        if (rowData.items && Array.isArray(rowData.items)) {
          this.addedProducts = rowData.items.map((item: any) => ({
            ...item,
            varient: item.varient ?? item.variant,  // fallback if rowData has 'variant'
            quantity: item.quantity ?? 1
          }));
        }


        // ✅ Check if ID exists for edit mode
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;
        }
      }
    });

    // custom validator: prevent same outlet
    this.stockTransferForm.valueChanges.subscribe(values => {
      const fromOutlet = values.fromDealerOutlet;
      const toOutlet = values.toDealerOutlet;

      if (fromOutlet && toOutlet && fromOutlet === toOutlet) {
        this.stockTransferForm.get('toDealerOutlet')?.setErrors({ sameOutlet: true });
      } else {
        if (this.stockTransferForm.get('toDealerOutlet')?.hasError('sameOutlet')) {
          this.stockTransferForm.get('toDealerOutlet')?.setErrors(null);
        }
      }
    });
  }

  toggleProducts() {
    const fromOutletName = this.stockTransferForm.get('fromDealerOutlet')?.value;
    const toOutletName = this.stockTransferForm.get('toDealerOutlet')?.value;

    if (fromOutletName && toOutletName) {
      // get all products for each outlet
      const fromProducts = this.dataSource.data.filter(
        (p: any) => p.dealerOutlet === fromOutletName
      );
      const toProducts = this.dataSource.data.filter(
        (p: any) => p.dealerOutlet === toOutletName
      );

      // find common products (match by id OR name)
      const commonProducts = fromProducts.filter((fp: any) =>
        toProducts.some((tp: any) => tp.id === fp.id || tp.name === fp.name)
      );

      this.vehicledataSource.data = commonProducts;
      this.stockTransferForm.get('products')?.enable();
    } else {
      this.vehicledataSource.data = [];
      this.stockTransferForm.get('products')?.disable();
    }
  }


  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data) => {
        this.dealerdataSource.data = data;
      });
    });
  }


  //product
  productList() {
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe((data) => {
        this.vehicledataSource.data = data;
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

  isSubmitEnabled(): boolean {
    const formValid =
      this.stockTransferForm.get('fromDealerOutlet')?.valid &&
      this.stockTransferForm.get('toDealerOutlet')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(
      p => p.quantity && p.quantity > 0
    );

    return !!formValid && hasProducts && allQuantitiesValid;
  }



  addProduct() {
    const selectedProductName = this.stockTransferForm.get('products')?.value;

    if (!selectedProductName) {
      Swal.fire('Error', 'Please select a product before adding.', 'error');
      return;
    }

    const product = this.vehicledataSource.data.find(p => p.name === selectedProductName);

    if (product) {
      const exists = this.addedProducts.some(p => p.id === product.id);
      if (exists) {
        Swal.fire('Info', 'This product is already added.', 'info');
        return;
      }

      // 🔥 Important: create new array reference for Angular change detection
      this.addedProducts = [...this.addedProducts, { ...product, quantity: 1 }];
    }

    // Reset product dropdown
    this.stockTransferForm.get('products')?.reset();
  }



  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
  }


  // submitForm() {
  //   try {
  //     const formValues = this.stockTransferForm.getRawValue();
  //     delete formValues.products; // remove temporary dropdown value
  //
  //     const isMainFormValid =
  //       this.stockTransferForm.get('fromDealerOutlet')?.valid &&
  //       this.stockTransferForm.get('toDealerOutlet')?.valid;
  //
  //     if (isMainFormValid && this.addedProducts.length > 0) {
  //       Swal.fire({
  //         title: this.isEditMode ? 'Update Stock Transfer?' : 'Add Stock Transfer?',
  //         text: 'Are you sure you want to proceed?',
  //         icon: 'question',
  //         showCancelButton: true,
  //         confirmButtonText: 'Yes',
  //         cancelButtonText: 'No'
  //       }).then((result: any) => {
  //         if (result.isConfirmed) {
  //           try {
  //             const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  //             const username = userData.userName || 'Unknown User';
  //             const timestamp = Date.now();
  //
  //             // ✅ Transform + sanitize data
  //             const transformedData: any = {
  //               ...formValues,
  //               items: this.addedProducts.map(p => ({
  //                 id: p.id ?? '',
  //                 sku: p.sku ?? '',
  //                 name: p.name ?? '',
  //                 brand: p.brand ?? '',
  //                 model: p.model ?? '',
  //                 variant: p.variant ?? p.varient ?? '',
  //                 unit: p.unit ?? '',
  //                 quantity: p.quantity ?? 0
  //               }))
  //             };
  //
  //             // Remove undefined fields
  //             Object.keys(transformedData).forEach(k => {
  //               if (transformedData[k] === undefined) {
  //                 transformedData[k] = '';
  //               }
  //             });
  //
  //             if (this.isEditMode && this.data.id) {
  //               transformedData.updateBy = username;
  //               transformedData.updatedAt = timestamp;
  //
  //               runInInjectionContext(this.injector, () => {
  //                 this.stockTransferService
  //                   .updateStockTransfer(this.data.id, transformedData)
  //                   .then(() => {
  //                     Swal.fire('Updated!', 'Stock Transfer updated successfully.', 'success');
  //                     this.goBack();
  //                   })
  //                   .catch(error => {
  //                     console.error('Error updating stock transfer:', error);
  //
  //                     Swal.fire('Error', 'Something went wrong.', 'error');
  //                   });
  //               });
  //             } else {
  //               transformedData.status = 'Active';
  //               transformedData.createBy = username;
  //               transformedData.createdAt = timestamp;
  //
  //               runInInjectionContext(this.injector, () => {
  //                 this.stockTransferService
  //                   .addStockTransfer(transformedData)
  //                   .then(() => {
  //                     Swal.fire('Added!', 'Stock Transfer added successfully.', 'success');
  //                     this.goBack();
  //                   })
  //                   .catch(error => {
  //                     console.error('Error adding stock transfer:', error);
  //                     Swal.fire('Error', 'Something went wrong.', 'error');
  //                   });
  //               });
  //             }
  //           } catch (innerErr) {
  //             console.error('Unexpected error during submission:', innerErr);
  //             Swal.fire('Error', 'Unexpected issue occurred.', 'error');
  //           }
  //         }
  //       });
  //     } else {
  //       Swal.fire('Error', 'Please fill in From/To dealers and add at least one product.', 'error');
  //     }
  //   } catch (err) {
  //     console.error('Global submit error:', err);
  //     Swal.fire('Error', 'Something went wrong while submitting.', 'error');
  //   }
  // }
  submitForm() {
    try {
      const formValues = this.stockTransferForm.getRawValue();
      delete formValues.products; // remove temporary dropdown value

      const isMainFormValid =
        this.stockTransferForm.get('fromDealerOutlet')?.valid &&
        this.stockTransferForm.get('toDealerOutlet')?.valid;

      if (isMainFormValid && this.addedProducts.length > 0) {
        Swal.fire({
          title: this.isEditMode ? 'Update Stock Transfer?' : 'Add Stock Transfer?',
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

              const transformedData: any = {
                ...formValues,
                items: this.addedProducts.map(p => ({
                  id: p.id ?? '',
                  sku: p.sku ?? '',
                  name: p.name ?? '',
                  brand: p.brand ?? '',
                  model: p.model ?? '',
                  variant: p.variant ?? p.varient ?? '',
                  unit: p.unit ?? '',
                  quantity: p.quantity ?? 0
                }))
              };

              if (this.isEditMode && this.data.id) {
                transformedData.updateBy = username;
                transformedData.updatedAt = timestamp;

                runInInjectionContext(this.injector, async () => {
                  await this.stockTransferService.updateStockTransfer(this.data.id, transformedData);

                  // 🔹 Update inventory for each product (decrease from source, increase in target)
                  for (const item of transformedData.items) {
                    await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
                    await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
                  }

                  Swal.fire('Updated!', 'Stock Transfer updated successfully.', 'success');
                  this.goBack();
                });
              } else {
                transformedData.status = 'Active';
                transformedData.createBy = username;
                transformedData.createdAt = timestamp;

                runInInjectionContext(this.injector, async () => {
                  await this.stockTransferService.addStockTransfer(transformedData);

                  for (const item of transformedData.items) {
                    await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
                    await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
                  }

                  Swal.fire('Added!', 'Stock Transfer added successfully.', 'success');
                  this.goBack();
                });
              }
            } catch (innerErr) {
              console.error('Unexpected error during submission:', innerErr);
              Swal.fire('Error', 'Unexpected issue occurred.', 'error');
            }
          }
        });
      } else {
        Swal.fire('Error', 'Please fill in From/To dealers and add at least one product.', 'error');
      }
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }


  updateInventory(product: any, outletId: string, action: 'increase' | 'decrease'): Promise<void> {
    const quantityChange = action === 'increase' ? product.quantity : -product.quantity;
    return runInInjectionContext(this.injector, () =>
      this.inventoryService.updateInventoryQuantity(outletId, product.sku, quantityChange)
    );
  }

  goBack() {
    this.dealer.back();
  }

}
