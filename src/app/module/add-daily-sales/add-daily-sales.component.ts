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
import {InventoryService} from "../add-inventory/inventory.service";
import {LoadingService} from "../../Services/loading.service";

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
    private inventoryService: InventoryService,
    private loadingService: LoadingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isEditMode = !!data?.id;
    this.dailySalesForm = this.fb.group({
      dealerOutlet: ['', Validators.required],
      division: ['', Validators.required],
      country: ['', Validators.required],
      town: ['', Validators.required],
      vehicle: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.DealerList();
    this.loadInventoryDaata();

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Edit Mode Row Data:', rowData);

        this.dailySalesForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          division: rowData.division,
          country: rowData.country,
          town: rowData.town,
          vehicle: rowData.name,
        });

        this.addedProducts = [{
          docId: rowData.docId,
          sku: rowData.sku ?? '',
          name: rowData.name ?? '',
          brand: rowData.brand ?? '',
          model: rowData.model ?? '',
          variant: rowData.variant ?? rowData.varient ?? '',
          unit: rowData.unit ?? '',
          quantity: rowData.quantity ?? 1
        }];

        this.dailySalesForm.patchValue({ vehicle: rowData.name });
        this.dailySalesForm.get('vehicle')?.disable();
        this.isEditMode = true;
        this.data = rowData;
      }
    });
  }

  DealerList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          this.dealerdataSource.data = data;
          console.log(this.dealerdataSource.data);
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  loadInventoryDaata() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.inventoryService.getInventoryAllData().subscribe({
        next: (data) => {
          console.log('Inventory data:', data);
          this.dataSource.data = data;
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  onDealerChange(event: any) {
    const dealerName = event.value;
    const dealer = this.dealerdataSource.data.find((d: any) => d.name === dealerName);
    if (dealer) {
      this.dailySalesForm.patchValue({
        division: dealer.division || '',
        country: dealer.country || '',
        town: dealer.town || ''
      });
    }
    const availableProducts = this.dataSource.data.filter(
      (p: any) => p.dealerId === dealer.id && p.openingStock > 0
    );
    this.vehicledataSource.data = availableProducts;
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
      const exists = this.addedProducts.some(p => p.productId === product.id);
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
      console.log(this.addedProducts);
    }
    this.dailySalesForm.get('vehicle')?.reset();
  }

  removeProduct(index: number) {
    // Remove only the clicked product
    this.addedProducts = this.addedProducts.filter((_, i) => i !== index);

    // ✅ Force table refresh
    this.addedProducts = [...this.addedProducts];
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

            const baseInfo = {
              dealerOutlet: formValues.dealerOutlet,
              division: formValues.division,
              country: formValues.country,
              town: formValues.town,
              status: 'Active',
              updatedBy: username,
              updatedAt: timestamp
            };

            this.loadingService.setLoading(true);

            if (this.isEditMode) {
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
                this.dailySalesService.updateDailySales(productToUpdate.docId, productDoc)
              )
                .then(() => this.updateInventory(productDoc, 'decrease'))
                .then(() => {
                  Swal.fire('Updated!', 'Daily Sales updated successfully.', 'success');
                  this.goBack();
                })
                .catch(err => {
                  console.error('Error updating daily sales:', err);
                  Swal.fire('Error', 'Something went wrong while updating.', 'error');
                })
                .finally(() => this.loadingService.setLoading(false));
            } else {
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
                ).then(() => this.updateInventory(productDoc, 'decrease'));
              });

              Promise.all(createPromises)
                .then(() => {
                  Swal.fire('Added!', 'All products saved as separate documents.', 'success');
                  this.router.navigate(['/module/daily-sales-list']);
                })
                .catch(err => {
                  console.error('Error adding daily sales:', err);
                  Swal.fire('Error', 'Something went wrong while adding.', 'error');
                })
                .finally(() => this.loadingService.setLoading(false));
            }
          } catch (innerErr) {
            console.error('Unexpected error during submission:', innerErr);
            Swal.fire('Error', 'Unexpected issue occurred.', 'error');
            this.loadingService.setLoading(false);
          }
        }
      });
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
      this.loadingService.setLoading(false);
    }
  }

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
