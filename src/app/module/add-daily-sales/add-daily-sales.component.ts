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

  constructor(
    private fb: UntypedFormBuilder,
    private location: Location,
    private dailySalesService: DailySalesService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private addDealerService: AddDealerService,
    private productService: ProductMasterService,
    private router: Router,
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
    this.productList();

    // Edit mode handling
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        this.dailySalesForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          division: rowData.division,
          country: rowData.country,
          town: rowData.town
        });

        if (rowData.products && Array.isArray(rowData.products)) {
          this.addedProducts = rowData.products.map((p: any) => ({
            ...p,
            variant: p.variant ?? p.varient,
            quantity: p.quantity ?? 1
          }));
        }

        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;
        }
      }
    });
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data) => {
        this.dealerdataSource.data = data;
      });
    });
  }

  productList() {
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe((data) => {
        this.vehicledataSource.data = data;
        console.log("this.vehicledataSource.data", this.vehicledataSource.data)
      });
    });
  }

  onDealerChange(event: any) {
    const dealerId = event.value;
    const dealer = this.dealerdataSource.data.find((d: any) => d.name === dealerId);
    if (dealer) {
      this.dailySalesForm.patchValue({
        division: dealer.division || '',
        country: dealer.country || '',
        town: dealer.town || ''
      });
    }
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
        variant: product.varient,
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

      if (this.isSubmitEnabled()) {
        Swal.fire({
          title: this.isEditMode ? 'Update Daily Sales?' : 'Add Daily Sales?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.isConfirmed) {
            try {
              const userData = JSON.parse(localStorage.getItem('userData') || '{}');
              const username = userData.userName || 'Unknown User';
              const timestamp = Date.now();

              // ✅ Transform + sanitize data
              const transformedData: any = {
                ...formValues,
                products: this.addedProducts.map(p => ({
                  ...p,
                  variant: p.variant ?? p.varient ?? '',   // fix variant/varient mismatch
                  sku: p.sku ?? '',
                  brand: p.brand ?? '',
                  model: p.model ?? '',
                  unit: p.unit ?? '',
                  quantity: p.quantity ?? 0
                }))
              };

              // Remove undefined fields recursively
              Object.keys(transformedData).forEach(k => {
                if (transformedData[k] === undefined) {
                  transformedData[k] = '';
                }
              });

              if (this.isEditMode && this.data.id) {
                transformedData.updateBy = username;
                transformedData.updatedAt = timestamp;

                runInInjectionContext(this.injector, () => {
                  this.dailySalesService.updateDailySales(this.data.id, transformedData)
                    .then(() => {
                      Swal.fire('Updated!', 'Daily Sales updated successfully.', 'success');
                      this.goBack();
                    })
                    .catch(err => {
                      console.error('Error updating daily sales:', err);
                      Swal.fire('Error', 'Something went wrong.', 'error');
                    });
                });
              } else {
                transformedData.status = 'Active';
                transformedData.createBy = username;
                transformedData.createdAt = timestamp;

                runInInjectionContext(this.injector, () => {
                  this.dailySalesService.addDailySales(transformedData)
                    .then(() => {
                      Swal.fire('Added!', 'Daily Sales added successfully.', 'success');
                      this.router.navigate(['/module/daily-sales-list']);
                    })
                    .catch(err => {
                      console.error('Error adding daily sales:', err);
                      Swal.fire('Error', 'Something went wrong.', 'error');
                    });
                });
              }
            } catch (innerErr) {
              console.error('Unexpected error during submission:', innerErr);
              Swal.fire('Error', 'Unexpected issue occurred.', 'error');
            }
          }
        });
      } else {
        Swal.fire('Error', 'Please fill required fields and add at least one product.', 'error');
      }
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }


  goBack() {
    this.location.back();
  }
}
