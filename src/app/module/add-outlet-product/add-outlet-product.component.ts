import {Component, ElementRef, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
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
import {OutletProductService} from "../outlet-product.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {LoadingService} from "../../Services/loading.service";

@Component({
  selector: 'app-add-outlet-product',
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
  templateUrl: './add-outlet-product.component.html',
  standalone: true,
  styleUrl: './add-outlet-product.component.scss'
})
export class AddOutletProductComponent implements OnInit {
  isEditMode: boolean = false;
  grnForm: FormGroup;
  displayedColumns: string[] = ['name', 'brand', 'model', 'variant', 'unit', 'openingStock', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  outletProducts: any[] = [];
  dealers: any[] = [];
  allDealers: any[] = [];
  editProductId: string = '';
  data: any = {};
  @ViewChild('dealerSearchInput') dealerSearchInput!: ElementRef;
  @ViewChild('productSearchInput') productSearchInput!: ElementRef;

  filteredDealers: any[] = [];
  dealerSearchText: string = '';

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
    private outletProductService: OutletProductService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private addDealerService: AddDealerService,
    private productService: ProductMasterService,
    private readonly mFirestore: AngularFirestore,
    private loadingService: LoadingService
  ) {
    this.route.queryParams.subscribe(params => {
      this.data = JSON.parse(params['data']);
      this.isEditMode = this.data?.id != null;
      console.log("Edit Mode:", this.isEditMode, "Data:", this.data);
      this.editProductId = this.data?.id || '';
    });

    this.grnForm = this.fb.group({
      products: [[], [Validators.required]],
      dealerOutlet: ['', [Validators.required]],
      remark: [''],
    });
  }

  ngOnInit() {
    this.loadOutletProduct();
    this.DealerList();
    this.productList();

    this.grnForm.get('dealerOutlet')?.valueChanges.subscribe(selectedOutlet => {
      if (selectedOutlet) {
        this.filterProductsForOutlet(selectedOutlet);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        this.grnForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          remark: rowData.remark,
          products: rowData.name
        });

        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;

          this.grnForm.get('dealerOutlet')?.disable();
          this.grnForm.get('products')?.disable();

          this.addedProducts = [{
            ...rowData,
            varient: rowData.varient ?? rowData.variant,
            openingStock: rowData.openingStock ?? 1,
            __isNew: false
          }];

          console.log('Product restored for edit:', this.addedProducts);
        }
      }
    });
  }

  loadOutletProduct() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductList().subscribe({
        next: (data) => {
          this.outletProducts = data;
          this.dataSource.data = data;
          console.log("Outlet Products:", this.outletProducts);
          this.loadingService.setLoading(false);
          this.DealerList(); // load dealers after outlet products
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  DealerList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          this.allDealers = data;
          this.dealers = data;
          this.dealerdataSource.data = this.dealers;
          this.filteredDealers = [...this.dealers]; // Initialize the filtered list
          console.log("All Dealers:", this.dealerdataSource.data);
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  productList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe({
        next: (data) => {
          (this.productService as any).cachedProducts = data;
          this.vehicledataSource.data = data;
          this._allProducts = data; // Populate the local array
          this.filteredProducts = [...this._allProducts]; // Initialize filtered list
          console.log("All Products:", data);
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  filterDealers() {
    const searchText = this.dealerSearchText.toLowerCase();
    this.filteredDealers = this.dealers.filter(dealer => dealer.name.toLowerCase().includes(searchText));
  }
  onDealerSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.dealerSearchText = event.target.value;
      this.filterDealers();
    }, 300);
  }
  onDealerSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.dealerSearchText = '';
      this.filterDealers();
      setTimeout(() => this.dealerSearchInput.nativeElement.focus(), 0);
    }
  }

  filterProducts() {
    const searchText = this.productSearchText.toLowerCase();
    this.filteredProducts = this._allProducts.filter(product => product.name.toLowerCase().includes(searchText));
  }
  onProductSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.productSearchText = event.target.value;
      this.filterProducts();
    }, 300);
  }
  onProductSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.productSearchText = '';
      this.filterProducts();
      setTimeout(() => this.productSearchInput.nativeElement.focus(), 0);
    }
  }

  filterProductsForOutlet(selectedOutlet: string) {
    const dealer = this.allDealers.find(
      d => (d.name || '').trim() === (selectedOutlet || '').trim()
    );
    const outletId = dealer?.id;

    if (!outletId) {
      this.vehicledataSource.data = [];
      return;
    }

    const existingSkus = this.outletProducts
      .filter(p => p.outletId === outletId)
      .map(p => p.sku);

    let processedProducts = (this.productService as any).cachedProducts.map((p: any) => ({
      ...p,
      disabled: existingSkus.includes(p.sku)
    }));

    if (this.isEditMode && this.data?.sku) {
      processedProducts = processedProducts.map((p: any) => ({
        ...p,
        disabled: p.sku === this.data.sku ? false : p.disabled
      }));
    }

    this.vehicledataSource.data = processedProducts;
    console.log("Products with disabled flag:", processedProducts);
  }


  isSubmitEnabled(): boolean {
    const dealerValue = this.grnForm.getRawValue().dealerOutlet;
    const remarkValid = !!this.grnForm.get('remark')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(
      p => p.openingStock && p.openingStock > 0
    );

    return !!dealerValue && remarkValid && hasProducts && allQuantitiesValid;
  }

  // addProduct() {
  //   const selectedProductName = this.grnForm.get('products')?.value;
  //   if (!selectedProductName) {
  //     Swal.fire('Error', 'Please select a product before adding.', 'error');
  //     return;
  //   }
  //
  //   const product = this.vehicledataSource.data.find(p => p.name === selectedProductName);
  //   if (product) {
  //     const exists = this.addedProducts.some(p => p.id === product.id);
  //     if (exists) {
  //       Swal.fire('Info', 'This product is already added.', 'info');
  //       return;
  //     }
  //
  //     // openingStock null → input will show empty
  //     this.addedProducts = [
  //       ...this.addedProducts,
  //       { ...product, openingStock: null, __isNew: true }
  //     ];
  //   }
  //
  //   this.grnForm.get('products')?.reset();
  // }
  addProduct() {
    const selectedProducts = this.grnForm.get('products')?.value || [];
    if (!selectedProducts.length) {
      Swal.fire('Error', 'Please select at least one product before adding.', 'error');
      return;
    }

    selectedProducts.forEach((product: any) => {
      const exists = this.addedProducts.some(p => p.id === product.id);
      if (!exists) {
        this.addedProducts = [
          ...this.addedProducts,
          { ...product, openingStock: null, __isNew: true }
        ];
      }
    });

    // reset selection
    this.grnForm.get('products')?.reset([]);
  }

// ✅ Block decimals and negatives
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    // Block: minus sign (-) and dot (.)
    if (charCode === 45 || charCode === 46) {
      event.preventDefault();
      return;
    }

    // Allow: digits 0-9 only
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


// ✅ Validator to ensure integer, no decimals, no negatives
  validateOpeningStock(product: any) {
    if (product.openingStock != null) {
      let value = Number(product.openingStock);

      // Disallow decimals
      value = Math.floor(value);

      // Disallow negatives & zero
      if (value < 1) {
        value = 1;
      }

      product.openingStock = value;
    }
  }


  removeProduct(index: number) {
    // Remove only the clicked product
    this.addedProducts = this.addedProducts.filter((_, i) => i !== index);

    // ✅ Force table refresh
    this.addedProducts = [...this.addedProducts];
  }

  // async submitForm() {
  //   try {
  //     const formValues = this.grnForm.getRawValue();
  //     delete formValues.products;
  //
  //     const isMainFormValid =
  //       !!formValues.dealerOutlet &&
  //       this.grnForm.get('remark')?.valid;
  //
  //     if (!isMainFormValid || this.addedProducts.length === 0) {
  //       Swal.fire('Error', 'Please fill all required fields and add at least one product.', 'error');
  //       return;
  //     }
  //
  //     const result = await Swal.fire({
  //       title: this.isEditMode ? 'Update Outlet Product Details?' : 'Add Outlet Product Details?',
  //       text: 'Are you sure you want to proceed?',
  //       icon: 'question',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes',
  //       cancelButtonText: 'No'
  //     });
  //
  //     if (!result.isConfirmed) return;
  //
  //     const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  //     const username = userData.userName || 'Unknown User';
  //     const timestamp = Date.now();
  //
  //     const selectedName = (formValues.dealerOutlet || '').trim();
  //     const selectedDealer =
  //       this.allDealers.find((d: any) => (d.name || '').trim() === selectedName) ||
  //       this.dealers.find((d: any) => (d.name || '').trim() === selectedName);
  //     const dealerId = selectedDealer?.id ?? '';
  //
  //     const basePayload = {
  //       ...formValues,
  //       dealerId,
  //       createdAt: timestamp,
  //       createdBy: username,
  //     };
  //
  //     runInInjectionContext(this.injector, async () => {
  //       this.loadingService.setLoading(true);
  //       const productsData: any = [];
  //       for (const product of this.addedProducts) {
  //         const mProduct = {
  //           ...basePayload,
  //           sku: product.sku ?? '',
  //           name: product.name ?? '',
  //           brand: product.brand ?? '',
  //           model: product.model ?? '',
  //           variant: product.variant ?? product.varient ?? '',
  //           unit: product.unit ?? '',
  //           openingStock: product.openingStock ?? 0,
  //           quantity: product.openingStock ?? 0,
  //         };
  //         productsData.push(mProduct);
  //       }
  //
  //       try {
  //         if (this.isEditMode && this.editProductId) {
  //           await this.outletProductService.updateOutletProduct(
  //             dealerId,
  //             this.editProductId,
  //             productsData[0]
  //           );
  //         } else {
  //           if (!this.isEditMode) {
  //             productsData.forEach((product: any) => {
  //               this.outletProductService.addOutletProduct({
  //                 ...product,
  //                 outletId: dealerId
  //               });
  //               this.outletProductService.addInventoryProduct({
  //                 ...product,
  //                 outletId: dealerId
  //               });
  //             });
  //           }
  //         }
  //
  //         Swal.fire(
  //           this.isEditMode ? 'Updated!' : 'Added!',
  //           `Outlet Product Details ${this.isEditMode ? 'updated' : 'added'} successfully.`,
  //           'success'
  //         );
  //         this.goBack();
  //       } catch (err) {
  //         console.error('Error in submit:', err);
  //         Swal.fire('Error', 'Something went wrong while submitting.', 'error');
  //       } finally {
  //         this.loadingService.setLoading(false);
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
      delete formValues.products;

      const isMainFormValid =
        !!formValues.dealerOutlet &&
        this.grnForm.get('remark')?.valid;

      if (!isMainFormValid || this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please fill all required fields and add at least one product.', 'error');
        return;
      }

      const result = await Swal.fire({
        title: this.isEditMode ? 'Update Outlet Product Details?' : 'Add Outlet Product Details?',
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

      const selectedName = (formValues.dealerOutlet || '').trim();
      const selectedDealer =
        this.allDealers.find((d: any) => (d.name || '').trim() === selectedName) ||
        this.dealers.find((d: any) => (d.name || '').trim() === selectedName);
      const dealerId = selectedDealer?.id ?? '';

      const basePayload = {
        ...formValues,
        dealerId,
        createdAt: timestamp,
        createdBy: username,
      };
      console.log(basePayload)
      runInInjectionContext(this.injector, async () => {
        this.loadingService.setLoading(true);
        const productsData: any = [];
        for (const product of this.addedProducts) {
          const mProduct = {
            ...basePayload,
            sku: product.sku ?? '',
            name: product.name ?? '',
            brand: product.brand ?? '',
            model: product.model ?? '',
            variant: product.variant ?? product.varient ?? '',
            unit: product.unit ?? '',
            openingStock: product.openingStock ?? 0,
            quantity: product.openingStock ?? 0,
          };
          productsData.push(mProduct);
        }

        try {
          if (this.isEditMode && this.editProductId) {
            // Update outlet product
            await this.outletProductService.updateOutletProduct(
              dealerId,
              this.editProductId,
              productsData[0]
            );

            // ✅ Update only openingStock in inventory
            await this.outletProductService.updateInventoryProduct(
              basePayload?.dealerOutlet,
              productsData[0].sku,
              { openingStock: productsData[0].openingStock }
            );

          } else {
            if (!this.isEditMode) {
              productsData.forEach((product: any) => {
                this.outletProductService.addOutletProduct({
                  ...product,
                  outletId: dealerId
                });
                this.outletProductService.addInventoryProduct({
                  ...product,
                  outletId: dealerId
                });
              });
            }
          }

          Swal.fire(
            this.isEditMode ? 'Updated!' : 'Added!',
            `Outlet Product Details ${this.isEditMode ? 'updated' : 'added'} successfully.`,
            'success'
          );
          this.goBack();
        } catch (err) {
          console.error('Error in submit:', err);
          Swal.fire('Error', 'Something went wrong while submitting.', 'error');
        } finally {
          this.loadingService.setLoading(false);
        }
      });
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }



  goBack() {
    this.dealer.back();
  }

  private changeVariant() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, async () => {
      this.mFirestore.collection('product').get().subscribe({
        next: (res) => {
          res.forEach(doc => {
            const data = doc.data();
            this.mFirestore.collection('product').doc(doc.id)
              .update({ variant: (data as any)?.varient })
              .then(r => console.log('product updated'));
          });
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

}
