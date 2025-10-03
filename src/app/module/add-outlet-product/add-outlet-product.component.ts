import {
  Component,
  ElementRef,
  EnvironmentInjector,
  isDevMode,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from "@angular/forms";
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
import {ActivatedRoute, Router} from "@angular/router";
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
import {environment} from "../../../environments/environment";
import {ActivityLogService} from "../activity-log/activity-log.service";

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
    env = isDevMode() ? environment.testCollections : environment.collections;
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
    dealerControl = new FormControl();
    selectedDealer: any = {};
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
        private loadingService: LoadingService,
        private mService: ActivityLogService,
        private router: Router,
    ) {
        this.route.queryParams.subscribe(params => {
            this.data = JSON.parse(params['data']);
            this.isEditMode = this.data?.id != null;
            console.log("Edit Mode:", this.isEditMode, "Data:", this.data);
            this.editProductId = this.data?.id || '';
        });

        this.grnForm = this.fb.group({
            products: [[], [Validators.required]],
            dealerOutlet: ['',],
            remark: [''],
        });
    }

    ngOnInit() {
      this.ensureProductsIsArray();
        // this.loadOutletProduct();
        this.DealerList();

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

                  // if (rowData.dealerOutlet) {
                  //   this.loadOutletProduct(rowData.dealerOutlet);
                  // }
                }
            }
        });

    }

  private ensureProductsIsArray() {
    const currentValue = this.grnForm.get('products')?.value;
    if (!Array.isArray(currentValue)) {
      console.warn('Products value is not an array, resetting to empty array:', currentValue);
      this.grnForm.get('products')?.setValue([], { emitEvent: false });
    }
  }

  // loadOutletProduct(id:any) {
  //   console.log(id)
  //   this.loadingService.setLoading(true);
  //   runInInjectionContext(this.injector, () => {
  //     this.outletProductService.getOutletProductListByDealerId(id).subscribe({
  //       next: (data: any) => {
  //         console.log('Fetched outlet products:', data);
  //         this.outletProducts = data;
  //         this.dataSource.data = data;
  //         this.loadingService.setLoading(false);
  //       },
  //       error: (err) => {
  //         console.error('Failed to fetch outlet products', err);
  //         this.loadingService.setLoading(false);
  //       }
  //     });
  //   });
  // }

  loadOutletProduct(id: any) {
    console.log('Loading outlet products for ID:', id);
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductListByDealerId(id).subscribe({
        next: (data: any) => {
          console.log('Fetched outlet products:', data);
          this.outletProducts = data;
          this.dataSource.data = data;

          // ✅ After loading, apply disabled flags to products
          this.applyDisabledFlags();

          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch outlet products', err);
          this.outletProducts = [];
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  applyDisabledFlags() {
    if (!this.selectedDealer?.id) return;

    const outletId = this.selectedDealer.id;

    // Get SKUs that already exist in this outlet
    const existingSkus = this.outletProducts
      .filter(p => p.outletId === outletId || p.dealerId === outletId)
      .map(p => p.sku);

    console.log('Existing SKUs in outlet:', existingSkus);

    // Mark products as disabled if they exist in outlet
    const cachedProducts = (this.productService as any).cachedProducts || [];
    const processedProducts = cachedProducts.map((p: any) => ({
      ...p,
      disabled: existingSkus.includes(p.sku) && !(this.isEditMode && p.sku === this.data?.sku)
    }));

    // Update all product arrays
    this.vehicledataSource.data = processedProducts;
    this._allProducts = processedProducts;
    this.filteredProducts = [...processedProducts];

    console.log('Products with disabled flags:', processedProducts);
  }

  // DealerList() {
  //   this.loadingService.setLoading(true);
  //   runInInjectionContext(this.injector, () => {
  //     this.addDealerService.getDealerList().subscribe({
  //       next: (data) => {
  //         this.allDealers = data;
  //         this.dealers = data;
  //         this.dealerdataSource.data = this.dealers;
  //         this.filteredDealers = [...this.dealers];
  //         console.log("All Dealers:", this.dealerdataSource.data);
  //
  //         // Handle edit mode after dealers are loaded
  //         if (this.isEditMode && this.data?.dealerOutlet) {
  //           const matchedDealer = this.allDealers.find(dealer =>
  //             dealer.name === this.data.dealerOutlet || dealer.id === this.data.dealerId
  //           );
  //
  //           if (matchedDealer) {
  //             this.dealerControl.setValue(matchedDealer);
  //             this.selectedDealer = matchedDealer;
  //             this.grnForm.get('dealerOutlet')?.setValue(matchedDealer.name);
  //             this.productList(); // Load products for the selected dealer
  //           }
  //         }
  //
  //         this.loadingService.setLoading(false);
  //       },
  //       error: () => this.loadingService.setLoading(false)
  //     });
  //   });
  // }

  DealerList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          this.allDealers = data;
          this.dealers = data;
          this.dealerdataSource.data = this.dealers;
          this.filteredDealers = [...this.dealers];
          console.log("All Dealers loaded:", this.dealerdataSource.data.length);

          // Handle edit mode after dealers are loaded
          if (this.isEditMode && this.data?.dealerOutlet) {
            const matchedDealer = this.allDealers.find(dealer =>
              dealer.name === this.data.dealerOutlet || dealer.id === this.data.dealerId
            );

            if (matchedDealer) {
              this.dealerControl.setValue(matchedDealer);
              this.selectedDealer = matchedDealer;
              this.grnForm.get('dealerOutlet')?.setValue(matchedDealer.name);

              // Load products then outlet products for edit mode
              this.productService.getProductListByCountry(matchedDealer.country).subscribe({
                next: (productData) => {
                  (this.productService as any).cachedProducts = productData;
                  this.vehicledataSource.data = productData;
                  this._allProducts = productData;
                  this.filteredProducts = [...productData];

                  // Load outlet products to apply disabled flags
                  const outletId = matchedDealer.id || matchedDealer.outletId;
                  if (outletId) {
                    this.loadOutletProduct(outletId);
                  }

                  this.loadingService.setLoading(false);
                },
                error: () => this.loadingService.setLoading(false)
              });
            } else {
              this.loadingService.setLoading(false);
            }
          } else {
            this.loadingService.setLoading(false);
          }
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

    productList() {
        this.loadingService.setLoading(true);
        runInInjectionContext(this.injector, () => {
            this.productService.getProductListByCountry(this.selectedDealer.country).subscribe({
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

  // filterProductsForOutlet(selectedOutlet: string) {
  //   const dealer = this.allDealers.find(
  //     d => (d.name || '').trim() === (selectedOutlet || '').trim()
  //   );
  //   const outletId = dealer?.outletId;
  //   console.log("Outlet ID:", outletId);
  //   this.loadOutletProduct(outletId);
  //
  //   if (!outletId) {
  //     this.vehicledataSource.data = [];
  //     return;
  //   }
  //
  //   const existingSkus = this.outletProducts
  //     .filter(p => p.outletId === outletId)
  //     .map(p => p.sku);
  //
  //   const cachedProducts = (this.productService as any).cachedProducts || [];
  //   let processedProducts = cachedProducts.map((p: any) => ({
  //     ...p,
  //     disabled: existingSkus.includes(p.sku)
  //   }));
  //
  //   if (this.isEditMode && this.data?.sku) {
  //     processedProducts = processedProducts.map((p: any) => ({
  //       ...p,
  //       disabled: p.sku === this.data.sku ? false : p.disabled
  //     }));
  //   }
  //
  //   this.vehicledataSource.data = processedProducts;
  //   console.log("Products with disabled flag:", processedProducts);
  // }


  // filterProductsForOutlet(selectedOutlet: string) {
  //   // 1️⃣ Get the selected dealer object
  //   const dealer = this.allDealers.find(
  //     d => (d.name || '').trim() === (selectedOutlet || '').trim()
  //   );
  //   const outletId = dealer?.outletId;
  //   console.log("Selected Outlet ID:", outletId);
  //
  //   if (!outletId) {
  //     this.vehicledataSource.data = [];
  //     return;
  //   }
  //
  //   // 2️⃣ Load outlet products
  //   this.loadOutletProduct(outletId);
  //
  //   // 3️⃣ Get cached products (all products for the dealer)
  //   const cachedProducts = (this.productService as any).cachedProducts || [];
  //
  //   // 4️⃣ Disable products already in this outlet
  //   const existingSkus = this.outletProducts
  //     .filter(p => p.outletId === outletId)
  //     .map(p => p.sku);
  //
  //   let processedProducts = cachedProducts.map((p: any) => ({
  //     ...p,
  //     disabled: existingSkus.includes(p.sku)
  //   }));
  //
  //   // 5️⃣ Keep the product editable if we are in edit mode and it's the current product
  //   if (this.isEditMode && this.data?.sku) {
  //     processedProducts = processedProducts.map((p: any) => ({
  //       ...p,
  //       disabled: p.sku === this.data.sku ? false : p.disabled
  //     }));
  //   }
  //
  //   // 6️⃣ Update the dropdown
  //   this.vehicledataSource.data = processedProducts;
  //   this.filteredProducts = [...processedProducts];
  //   console.log("Dropdown products with disabled flag:", processedProducts);
  // }


  filterProductsForOutlet(selectedOutlet: string) {
    const dealer = this.allDealers.find(
      d => (d.name || '').trim() === (selectedOutlet || '').trim()
    );

    if (!dealer) {
      console.warn('No dealer found for outlet:', selectedOutlet);
      this.vehicledataSource.data = [];
      this._allProducts = [];
      this.filteredProducts = [];
      return;
    }

    const outletId = dealer.id || dealer.outletId;
    console.log("Selected Outlet ID:", outletId);

    // Load outlet products - disabled flags will be applied in the callback
    this.loadOutletProduct(outletId);
  }



  // ----------------- PRODUCTS -----------------


  toggleSelectAllProducts() {
    const allProducts = this.filteredProducts.filter(p => !p.disabled);
    const selectedProducts: any[] = this.grnForm.get('products')?.value || [];

    // Add safety check for array
    if (!Array.isArray(selectedProducts)) {
      console.warn('selectedProducts is not an array in toggleSelectAllProducts:', selectedProducts);
      this.grnForm.get('products')?.setValue([]);
      return;
    }

    if (this.isAllProductsSelected()) {
      this.grnForm.get('products')?.setValue([]);
    } else {
      this.grnForm.get('products')?.setValue(allProducts);
    }
  }

  isAllProductsSelected(): boolean {
    const selectedProducts: any[] = this.grnForm.get('products')?.value || [];
    const allEnabledProducts = this.filteredProducts.filter(p => !p.disabled);

    // Add safety checks
    if (!Array.isArray(selectedProducts)) {
      console.warn('selectedProducts is not an array:', selectedProducts);
      return false;
    }

    if (!Array.isArray(allEnabledProducts) || allEnabledProducts.length === 0) {
      return false;
    }

    return allEnabledProducts.every(ap =>
      selectedProducts.some(sp => sp && sp.id === ap.id)
    );
  }



  isSubmitEnabled(): boolean {
    const dealerValue = this.dealerControl.value;
    const remarkValid = !!this.grnForm.get('remark')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    // allow 0 also
    const allQuantitiesValid = this.addedProducts.every(
      p => p.openingStock !== null && p.openingStock >= 0
    );

    return !!dealerValue && remarkValid && hasProducts && allQuantitiesValid;
  }



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
                    {...product, openingStock: null, __isNew: true}
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


    async submitForm() {
        try {
          this.grnForm.value.dealer = this.selectedDealer.name
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
                            {openingStock: productsData[0].openingStock}
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

  // async submitForm() {
  //   if (!this.isSubmitEnabled()) {
  //     Swal.fire('Error', 'Please fill all required fields and add at least one product.', 'error');
  //     return;
  //   }
  //
  //   Swal.fire({
  //     title: this.isEditMode ? 'Update Outlet Product Details?' : 'Add Outlet Product Details?',
  //     text: 'Are you sure you want to proceed?',
  //     icon: 'question',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes',
  //     cancelButtonText: 'No',
  //   }).then((result: any) => {
  //     if (!result.isConfirmed) return;
  //
  //     const formValues = this.grnForm.getRawValue();
  //     delete formValues.products;
  //
  //     const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  //     const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
  //     const userEmail = userData.email || 'Unknown Email';
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
  //
  //       const productsData: any = this.addedProducts.map(product => ({
  //         ...basePayload,
  //         sku: product.sku ?? '',
  //         name: product.name ?? '',
  //         brand: product.brand ?? '',
  //         model: product.model ?? '',
  //         variant: product.variant ?? product.varient ?? '',
  //         unit: product.unit ?? '',
  //         openingStock: product.openingStock ?? 0,
  //         quantity: product.openingStock ?? 0,
  //       }));
  //
  //       try {
  //         if (this.isEditMode && this.editProductId) {
  //           // --- UPDATE CASE ---
  //           await this.outletProductService.updateOutletProduct(dealerId, this.editProductId, productsData[0]);
  //           await this.outletProductService.updateInventoryProduct(
  //             basePayload?.dealerOutlet,
  //             productsData[0].sku,
  //             { openingStock: productsData[0].openingStock }
  //           );
  //
  //           // ✅ Activity log
  //           this.mService.addLog({
  //             date: timestamp,
  //             section: 'Outlet/Dealer Product List',
  //             action: 'Update',
  //             user: username,
  //             description: `${username} has updated outlet product ${productsData[0].name} for dealer ${formValues.dealerOutlet}`,
  //           });
  //
  //           Swal.fire('Updated!', 'Outlet Product Details updated successfully.', 'success');
  //
  //         } else {
  //           // --- ADD CASE ---
  //           for (const product of productsData) {
  //             await this.outletProductService.addOutletProduct({ ...product, outletId: dealerId });
  //             await this.outletProductService.addInventoryProduct({ ...product, outletId: dealerId });
  //           }
  //
  //           // ✅ Activity log
  //           this.mService.addLog({
  //             date: timestamp,
  //             section: 'Outlet/Dealer Product List',
  //             action: 'Submit',
  //             user: username,
  //             description: `${username} has added ${productsData.length} new product(s) for dealer ${formValues.dealerOutlet}`,
  //           });
  //
  //           Swal.fire('Added!', 'Outlet Product Details added successfully.', 'success');
  //         }
  //
  //         this.goBack();
  //       } catch (err) {
  //         console.error('Error in submit:', err);
  //         Swal.fire('Error', 'Something went wrong while submitting.', 'error');
  //       } finally {
  //         this.loadingService.setLoading(false);
  //       }
  //     });
  //   });
  // }




  // goBack() {
    //     this.dealer.back();
    // }

  goBack() {
    this.router.navigate(['/module/outlet-product-list']);
  }

    private changeVariant() {
        this.loadingService.setLoading(true);
        runInInjectionContext(this.injector, async () => {
            this.mFirestore.collection(this.env.products).get().subscribe({
                next: (res) => {
                    res.forEach(doc => {
                        const data = doc.data();
                        this.mFirestore.collection(this.env.products).doc(doc.id)
                            .update({variant: (data as any)?.varient})
                            .then(r => console.log('product updated'));
                    });
                    this.loadingService.setLoading(false);
                },
                error: () => this.loadingService.setLoading(false)
            });
        });
    }


  // onChangeDealer() {
  //   const selectedDealer = this.dealerControl.value;
  //   console.log(selectedDealer)
  //
  //   if (selectedDealer) {
  //     // 1. Store the selected object (as you use it later in productList/submitForm)
  //     this.selectedDealer = selectedDealer;
  //
  //     // 2. CRITICAL FIX: Set the 'dealerOutlet' form control value to the dealer's NAME.
  //     // This is what satisfies the '!!formValues.dealerOutlet' check in submitForm.
  //     this.grnForm.get('dealerOutlet')?.setValue(selectedDealer.name);
  //
  //     // 3. Call productList() as per your original logic
  //     this.productList();
  //     // this.loadOutletProduct(selectedDealer.outletId)
  //   } else {
  //     this.selectedDealer = {};
  //     this.grnForm.get('dealerOutlet')?.setValue(null);
  //   }
  // }

  onChangeDealer() {
    const selectedDealer = this.dealerControl.value;
    console.log('Selected dealer:', selectedDealer);

    if (selectedDealer) {
      // Store the selected dealer
      this.selectedDealer = selectedDealer;

      // Set form value
      this.grnForm.get('dealerOutlet')?.setValue(selectedDealer.name);

      // Load products first, then outlet products
      this.loadingService.setLoading(true);
      runInInjectionContext(this.injector, () => {
        this.productService.getProductListByCountry(this.selectedDealer.country).subscribe({
          next: (data) => {
            // Cache products
            (this.productService as any).cachedProducts = data;
            this.vehicledataSource.data = data;
            this._allProducts = data;
            this.filteredProducts = [...data];
            console.log("All Products loaded:", data.length);

            // Now load outlet products and apply disabled flags
            const outletId = selectedDealer.id || selectedDealer.outletId;
            if (outletId) {
              this.loadOutletProduct(outletId);
            } else {
              this.loadingService.setLoading(false);
            }
          },
          error: () => {
            this.loadingService.setLoading(false);
          }
        });
      });
    } else {
      // Reset everything
      this.selectedDealer = {};
      this.grnForm.get('dealerOutlet')?.setValue(null);
      this.vehicledataSource.data = [];
      this._allProducts = [];
      this.filteredProducts = [];
      this.outletProducts = [];
    }
  }

}
