import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
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
import {LoadingService} from "../../Services/loading.service";

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
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'unit', 'quantity', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('fromDealerSearchInput') fromDealerSearchInput!: ElementRef;
  @ViewChild('toDealerSearchInput') toDealerSearchInput!: ElementRef;
  @ViewChild('productSearchInput') productSearchInput!: ElementRef;

  _allDealers: any[] = [];
  filteredFromDealers: any[] = [];
  filteredToDealers: any[] = [];
  fromDealerSearchText: string = '';
  toDealerSearchText: string = '';

  _allProducts: any[] = [];
  filteredProducts: any[] = [];
  productSearchText: string = '';

  debounceTimer: any;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private dealer: Location,
    private stockTransferService: StockTransferService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private addDealerService: AddDealerService,
    private productService: ProductMasterService,
    private outletProductService: OutletProductService,
    private inventoryService: InventoryService,
    private loadingService: LoadingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
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
    this.loadInventoryDaata();

    this.stockTransferForm.get('products')?.disable();

    this.stockTransferForm.get('fromDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());
    this.stockTransferForm.get('toDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        this.stockTransferForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          openingStock: rowData.openingStock,
          typeOfGrn: rowData.typeOfGrn
        });

        if (rowData.items && Array.isArray(rowData.items)) {
          this.addedProducts = rowData.items.map((item: any) => ({
            ...item,
            varient: item.varient ?? item.variant,
            quantity: item.quantity ?? 1
          }));
        }

        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;
        }
      }
    });

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
      // Get inventory items for both outlets
      const fromOutletInventory = this.dataSource.data.filter((item: any) =>
        item.dealerOutlet === fromOutletName
      );

      const toOutletInventory = this.dataSource.data.filter((item: any) =>
        item.dealerOutlet === toOutletName
      );

      // Find products that exist in both outlets' inventory
      const commonInventoryProducts = fromOutletInventory.filter((fromItem: any) =>
        toOutletInventory.some((toItem: any) =>
          fromItem.name === toItem.name || fromItem.sku === toItem.sku
        )
      );

      // Map inventory products to actual product details from productList
      const availableProducts = commonInventoryProducts.map((inventoryItem: any) => {
        // Find the corresponding product from productList using name or sku
        const productDetail = this._allProducts.find((product: any) =>
          product.name === inventoryItem.name || product.sku === inventoryItem.sku
        );

        // Return the product detail if found, otherwise return the inventory item
        return productDetail || inventoryItem;
      }).filter((product, index, self) =>
        // Remove duplicates based on product name or sku
        index === self.findIndex(p => p.name === product.name || p.sku === product.sku)
      );

      // Update the filtered products for the dropdown
      this.vehicledataSource.data = availableProducts;
      this.filteredProducts = [...availableProducts];

      // Enable the products dropdown
      this.stockTransferForm.get('products')?.enable();
    } else {
      // Clear products if outlets are not selected
      this.vehicledataSource.data = [];
      this.filteredProducts = [];
      this.stockTransferForm.get('products')?.disable();
    }
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.loadingService.setLoading(true);
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          console.log("Dealer data",data)
          this.dealerdataSource.data = data;
          this._allDealers = data; // Populate the new array
          this.filteredFromDealers = [...data];
          this.filteredToDealers = [...data];
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  productList() {
    runInInjectionContext(this.injector, () => {
      this.loadingService.setLoading(true);
      this.productService.getProductList().subscribe({
        next: (data) => {
          this.vehicledataSource.data = data;
          console.log(data,"data")
          this._allProducts = data; // Populate the new array
          this.filteredProducts = [...data];
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

// ----------------- FROM DEALER -----------------
  filterFromDealers() {
    const searchText = this.fromDealerSearchText.toLowerCase();
    this.filteredFromDealers = this._allDealers.filter(dealer =>
      dealer.name.toLowerCase().includes(searchText)
    );
  }

  onFromDealerSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fromDealerSearchText = event.target.value;
      this.filterFromDealers();
    }, 300);
  }

  onFromDealerSelectOpened(isOpened: boolean) {
    this.resetFromDealerSearch(); // reset on open/close
    if (isOpened) setTimeout(() => this.fromDealerSearchInput.nativeElement.focus(), 0);
  }

  private resetFromDealerSearch() {
    this.fromDealerSearchText = '';
    this.filteredFromDealers = [...this._allDealers];
    if (this.fromDealerSearchInput) this.fromDealerSearchInput.nativeElement.value = '';
  }

// ----------------- TO DEALER -----------------
  filterToDealers() {
    const searchText = this.toDealerSearchText.toLowerCase();
    this.filteredToDealers = this._allDealers.filter(dealer =>
      dealer.name.toLowerCase().includes(searchText)
    );
  }

  onToDealerSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.toDealerSearchText = event.target.value;
      this.filterToDealers();
    }, 300);
  }

  onToDealerSelectOpened(isOpened: boolean) {
    this.resetToDealerSearch(); // reset on open/close
    if (isOpened) setTimeout(() => this.toDealerSearchInput.nativeElement.focus(), 0);
  }

  private resetToDealerSearch() {
    this.toDealerSearchText = '';
    this.filteredToDealers = [...this._allDealers];
    if (this.toDealerSearchInput) this.toDealerSearchInput.nativeElement.value = '';
  }

// ----------------- PRODUCTS -----------------
  filterProducts() {
    const searchText = this.productSearchText.toLowerCase();
    this.filteredProducts = this.vehicledataSource.data.filter(product =>
      product.name.toLowerCase().includes(searchText) ||
      product.sku.toLowerCase().includes(searchText) ||
      product.brand.toLowerCase().includes(searchText) ||
      product.model.toLowerCase().includes(searchText)
    );
  }

  onProductSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.productSearchText = event.target.value;
      this.filterProducts();
    }, 300);
  }

  onProductSelectOpened(isOpened: boolean) {
    this.resetProductSearch(); // reset on open/close
    if (isOpened) setTimeout(() => this.productSearchInput.nativeElement.focus(), 0);
  }

  private resetProductSearch() {
    this.productSearchText = '';
    this.filterProducts(); // resets to full product list
    if (this.productSearchInput) this.productSearchInput.nativeElement.value = '';
  }


  loadInventoryDaata() {
    runInInjectionContext(this.injector, () => {
      this.loadingService.setLoading(true);
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

  isSubmitEnabled(): boolean {
    const formValid =
      this.stockTransferForm.get('fromDealerOutlet')?.valid &&
      this.stockTransferForm.get('toDealerOutlet')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);

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

      this.addedProducts = [...this.addedProducts, { ...product, quantity: 1 }];
    }

    this.stockTransferForm.get('products')?.reset();
  }

  removeProduct(index: number, event?: Event) {
    // Prevent event bubbling that might trigger other UI elements
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      // Validate index
      if (index < 0 || index >= this.addedProducts.length) {
        console.error('Invalid index for product removal:', index);
        return;
      }

      // Create a new array without the item at the specified index
      this.addedProducts = this.addedProducts.filter((_, i) => i !== index);

      console.log('Product removed at index:', index);
      console.log('Remaining products:', this.addedProducts.length);

    } catch (error) {
      console.error('Error removing product:', error);
      Swal.fire('Error', 'Failed to remove product. Please try again.', 'error');
    }
  }

  submitForm() {
    try {
      const formValues = this.stockTransferForm.getRawValue();
      delete formValues.products;

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

              runInInjectionContext(this.injector, async () => {
                try {
                  this.loadingService.setLoading(true);

                  if (this.isEditMode && this.data.id) {
                    transformedData.updateBy = username;
                    transformedData.updatedAt = timestamp;

                    await this.stockTransferService.updateStockTransfer(this.data.id, transformedData);

                    for (const item of transformedData.items) {
                      await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
                      await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
                    }

                    Swal.fire('Updated!', 'Stock Transfer updated successfully.', 'success');
                    this.goBack();
                  } else {
                    transformedData.status = 'Active';
                    transformedData.createBy = username;
                    transformedData.createdAt = timestamp;

                    await this.stockTransferService.addStockTransfer(transformedData);

                    for (const item of transformedData.items) {
                      await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
                      await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
                    }

                    Swal.fire('Added!', 'Stock Transfer added successfully.', 'success');
                    this.goBack();
                  }
                } catch (innerErr) {
                  console.error('Unexpected error during submission:', innerErr);
                  Swal.fire('Error', 'Unexpected issue occurred.', 'error');
                } finally {
                  this.loadingService.setLoading(false); // ✅ Always stop loader
                }
              });
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
