import { Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import {Location, NgFor, NgForOf, NgIf} from "@angular/common";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DailySalesService } from "../daily-sales.service";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { AddDealerService } from "../add-dealer.service";
import { ProductMasterService } from "../product-master.service";
import {OutletProductService} from "../outlet-product.service";

@Component({
  selector: 'app-add-daily-sales',
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
    MatTableModule,
    NgForOf,
    NgFor,
    NgIf,
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  templateUrl: './add-daily-sales.component.html',
  standalone: true,
  styleUrl: './add-daily-sales.component.scss'
})
export class AddDailySalesComponent implements OnInit {

  isEditMode: boolean = false;
  dailySalesForm: FormGroup;
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
    private productService: ProductMasterService,
    private router: Router,
    private outletProductService: OutletProductService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isEditMode = !!data?.id;
    this.dailySalesForm = this.fb.group({
      dealerOutlet: ['', Validators.required],
      division: ['', Validators.required],
      country: ['', Validators.required],
      town: ['', Validators.required],
      vehicle: ['', Validators.required], // selected vehicle
    });
  }

  ngOnInit() {
    this.DealerList();
    this.loadOutletProduct();

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Edit Mode Row Data:', rowData);

        // ✅ Patch dealer/outlet info
        this.dailySalesForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          division: rowData.division,
          country: rowData.country,
          town: rowData.town,
          vehicle: rowData.name,
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
        this.dailySalesForm.patchValue({ vehicle: rowData.name });
        // this.dailySalesForm.get('dealerOutlet')?.disable();
        this.dailySalesForm.get('vehicle')?.disable();

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

  // productList() {
  //   runInInjectionContext(this.injector, () => {
  //     this.productService.getProductList().subscribe((data) => {
  //       this.vehicledataSource.data = data;
  //       console.log("this.vehicledataSource.data", this.vehicledataSource.data)
  //     });
  //   });
  // }

  loadOutletProduct() {
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductList().subscribe((data) => {
        this.dataSource.data = data;
        console.log(this.dataSource.data)
      });
    });
  }

  onDealerChange(event: any) {
    const dealerName = event.value;

    // 1. Get dealer details (division, country, town)
    const dealer = this.dealerdataSource.data.find((d: any) => d.name === dealerName);
    if (dealer) {
      this.dailySalesForm.patchValue({
        division: dealer.division || '',
        country: dealer.country || '',
        town: dealer.town || ''
      });
    }

    // 2. Filter outlet products directly (since each doc is already one product)
    const availableProducts = this.dataSource.data.filter(
      (p: any) => p.dealerId === dealer.id && p.openingStock > 0
    );

    // 3. Bind to vehicle dropdown
    this.vehicledataSource.data = availableProducts;

    // reset vehicle selection
    this.dailySalesForm.get('vehicle')?.reset();
  }



  isSubmitEnabled(): boolean {
    const formValid =
      this.dailySalesForm.get('dealerOutlet')?.valid &&
      this.dailySalesForm.get('division')?.valid &&
      this.dailySalesForm.get('country')?.valid &&
      this.dailySalesForm.get('town')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);

    return !!formValid && hasProducts && allQuantitiesValid;
  }

  addProduct() {
    const selectedProductId = this.dailySalesForm.get('vehicle')?.value;
    if (!selectedProductId) {
      Swal.fire('Error', 'Please select a product before adding.', 'error');
      return;
    }

    const product = this.vehicledataSource.data.find(p => p.name === selectedProductId);
    if (product) {
      const exists = this.addedProducts.some(p => p.productId === product.name);
      if (exists) {
        Swal.fire('Info', 'This product is already added.', 'info');
        return;
      }

      this.addedProducts = [...this.addedProducts, {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        model: product.model,
        variant: product.variant,
        unit: product.unit,
        quantity: 1
      }];
      console.log(this.addedProducts)
    }

    // this.dailySalesForm.get('vehicle')?.reset();
  }

  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
  }

  submitForm() {
    try {
      const formValues = this.dailySalesForm.getRawValue();

      if (this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please add at least one product.', 'error');
        return;
      }

      Swal.fire({
        title: this.isEditMode ? 'Update Daily Sales?' : 'Add Daily Sales?',
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

            // 🔹 Base info from form
            const baseInfo = {
              dealerOutlet: formValues.dealerOutlet,
              division: formValues.division,
              country: formValues.country,
              town: formValues.town,
              status: 'Active',
              updatedBy: username,
              updatedAt: timestamp
            };

            if (this.isEditMode) {
              const productToUpdate = this.addedProducts[0]; // only one in edit mode

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
                this.dailySalesService.updateDailySales(productToUpdate.docId, productDoc)
              )
                .then(() => {
                  Swal.fire('Updated!', 'Daily Sales updated successfully.', 'success');
                  this.goBack();
                })
                .catch(err => {
                  console.error('Error updating daily sales:', err);
                  Swal.fire('Error', 'Something went wrong while updating.', 'error');
                });
            } else {
              // 🔹 Create one document per product (Add Mode)
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
                  this.dailySalesService.addDailySales(productDoc)
                );
              });

              Promise.all(createPromises)
                .then(() => {
                  Swal.fire('Added!', 'All products saved as separate documents.', 'success');
                  this.router.navigate(['/module/daily-sales-list']);
                })
                .catch(err => {
                  console.error('Error adding daily sales:', err);
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



  goBack() {
    this.location.back();
  }
}
