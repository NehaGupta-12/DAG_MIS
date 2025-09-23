import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext, signal,
  ViewChild
} from '@angular/core';
import {
  FormControl,
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
import {AsyncPipe, Location, NgFor, NgForOf, NgIf, SlicePipe} from "@angular/common";
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
import {map} from "rxjs/operators";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {BehaviorSubject, Observable} from "rxjs";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";

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
    AsyncPipe,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    SlicePipe,

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
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'variant', 'unit', 'quantity','action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  dataSource = new MatTableDataSource<any>();
  _countriesTypes$!: Observable<string[]>;
  _divisionTypes$!: Observable<string[]>;
  _townTypes$!: Observable<string[]>;
  filteredDivisions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  filteredTowns$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  filteredDealers$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  // Search controller for towns
  townFilterCtrl: FormControl = new FormControl();


// Full list of towns (before search, after cascading)
  private allTowns: string[] = [];

  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;

  _divisionTypes: string[] = [];
  filteredDivisionTypes: string[] = [];
  divisionSearchText: string = '';

  _countriesTypes: string[] = [];
  filteredCountries: string[] = [];
  countrySearchText: string = '';

  _townTypes: string[] = [];
  filteredTownTypes: string[] = [];
  townSearchText: string = '';

  debounceTimer: any;

  // --- Vehicle Search ---
  vehicleSearchText: string = '';
  filteredVehicles: any[] = [];

  // --- Dealer Search ---
  dealerSearchText: string = '';
  filteredDealersList: any[] = [];


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
    private mDatabase: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this._divisionTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Division')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));
    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._townTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Town')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    // Subscribe to all observables and populate local arrays
    this._divisionTypes$.subscribe(data => {
      this._divisionTypes = data;
      this.filterDivisionTypes();
    });

    this._countriesTypes$.subscribe(data => {
      this._countriesTypes = data;
      this.filterCountries();
    });

    this._townTypes$.subscribe(data => {
      this._townTypes = data;
      this.filterTownTypes();
    });
    this.isEditMode = !!data?.id;
    this.dailySalesForm = this.fb.group({
      dealerOutlet: ['', Validators.required],
      division: [''],
      country: [''],
      town: [''],
      vehicle: [[], Validators.required],
      salesDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.setupCascadingDropdowns();
    this.loadInventoryDaata();
    this.DealerList();
  }

// --- Division Methods ---
  filterDivisionTypes() {
    const searchText = this.divisionSearchText.toLowerCase();
    this.filteredDivisionTypes = this._divisionTypes.filter(type => type.toLowerCase().includes(searchText));
  }
  onDivisionSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.divisionSearchText = event.target.value;
      this.filterDivisionTypes();
    }, 300);
  }
  onDivisionSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.divisionSearchText = '';
      this.filterDivisionTypes();
      setTimeout(() => this.divisionSearchInput.nativeElement.focus(), 0);
    }
  }

// --- Country Methods ---
  filterCountries() {
    const searchText = this.countrySearchText.toLowerCase();
    this.filteredCountries = this._countriesTypes.filter(country => country.toLowerCase().includes(searchText));
  }
  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.countrySearchText = event.target.value;
      this.filterCountries();
    }, 300);
  }
  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.countrySearchText = '';
      this.filterCountries();
      setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
    }
  }

// --- Town Methods ---
  filterTownTypes() {
    const searchText = this.townSearchText.toLowerCase();
    this.filteredTownTypes = this._townTypes.filter(town => town.toLowerCase().includes(searchText));
  }
  // onTownSearchChange(event: any) {
  //   clearTimeout(this.debounceTimer);
  //   this.debounceTimer = setTimeout(() => {
  //     this.townSearchText = event.target.value;
  //     this.filterTownTypes();
  //   }, 300);
  // }
  selectionOpen(isOpened: boolean, type: 'dealer' | 'vehicle' | 'country' | 'division' | 'town') {
    if (!isOpened) return;

    switch (type) {
      case 'dealer':
        this.dealerSearchText = '';
        this.onDealerSearchChange({ target: { value: '' } }); // reset filter
        break;

      case 'vehicle':
        this.vehicleSearchText = '';
        this.filteredVehicles = [...this.vehicledataSource.data];
        break;

      case 'country':
        this.countrySearchText = '';
        this.filterCountries();
        setTimeout(() => this.countrySearchInput?.nativeElement.focus(), 0);
        break;

      case 'division':
        this.divisionSearchText = '';
        this.filterDivisionTypes();
        setTimeout(() => this.divisionSearchInput?.nativeElement.focus(), 0);
        break;

      case 'town':
        this.townSearchText = '';
        this.filterTownTypes();
        setTimeout(() => this.townSearchInput?.nativeElement.focus(), 0);
        break;
    }
  }

  onTownSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.townSearchText = '';
      this.filterTownTypes();
      setTimeout(() => this.townSearchInput.nativeElement.focus(), 0);
    }
  }

  setupCascadingDropdowns() {
    this.dailySalesForm.get('country')?.valueChanges.subscribe((selectedCountry: string) => {
      const divisions = [...new Set(
        this.dealerdataSource.data
          .filter(d => d.country === selectedCountry)
          .map(d => d.division)
      )];
      this.filteredDivisions$.next(divisions);
      this.dailySalesForm.get('division')?.reset();
      this.dailySalesForm.get('town')?.reset();
      this.filteredTowns$.next([]);
      this.filteredDealers$.next([]);
    });

    // Division change → update towns
    this.dailySalesForm.get('division')?.valueChanges.subscribe((selectedDivision: string) => {
      const selectedCountry = this.dailySalesForm.get('country')?.value;

      this.allTowns = [...new Set(
        this.dealerdataSource.data
          .filter(d => d.country === selectedCountry && d.division === selectedDivision)
          .map(d => d.town)
      )];

      this.filteredTowns$.next(this.allTowns);
      this.dailySalesForm.get('town')?.reset();
      this.filteredDealers$.next([]);
    });

    // 🔍 Search filter for towns
    this.townFilterCtrl.valueChanges.subscribe((search: string) => {
      if (!search) {
        this.filteredTowns$.next(this.allTowns);
      } else {
        this.filteredTowns$.next(
          this.allTowns.filter(t =>
            t.toLowerCase().includes(search.toLowerCase())
          )
        );
      }
    });

    this.dailySalesForm.get('town')?.valueChanges.subscribe((selectedTown: string) => {
      const selectedCountry = this.dailySalesForm.get('country')?.value;
      const selectedDivision = this.dailySalesForm.get('division')?.value;
      const dealers = this.dealerdataSource.data
        .filter(d => d.country === selectedCountry && d.division === selectedDivision && d.town === selectedTown);
      this.filteredDealers$.next(dealers);
    });
  }
  onTownSearchChange(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    if (!searchValue) {
      this.filteredTowns$.next(this.allTowns);
    } else {
      this.filteredTowns$.next(
        this.allTowns.filter(town =>
          town.toLowerCase().includes(searchValue)
        )
      );
    }
  }
  onVehicleSearchChange(event: any) {
    const searchValue = event.target.value.toLowerCase();
    this.filteredVehicles = this.vehicledataSource.data.filter(v =>
      v.name.toLowerCase().includes(searchValue)
    );
  }

  onDealerSearchChange(event: any) {
    const searchValue = event.target.value.toLowerCase();
    const filtered = this.dealerdataSource.data.filter(d =>
      d.name.toLowerCase().includes(searchValue)
    );
    this.filteredDealers$.next(filtered); // ✅ update observable, not local array
  }



  DealerList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          console.log("data", data);
          this.dealerdataSource.data = data;

          // ✅ show all dealers initially
          this.filteredDealers$.next(data);

          this.loadingService.setLoading(false);

          // --- handle edit mode ---
          this.route.queryParams.subscribe(params => {
            if (params['data']) {
              const rowData = JSON.parse(params['data']);
              console.log('Edit Mode Row Data:', rowData);

              this.dailySalesForm.patchValue({
                dealerOutlet: rowData.dealerOutlet,
                country: rowData.country,
                division: rowData.division,
                town: rowData.town,
                vehicle: rowData.name,
                salesDate: rowData.salesDate ? new Date(rowData.salesDate) : ''  // ✅ works fine
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

              this.dailySalesForm.get('vehicle')?.disable();
              this.isEditMode = true;
              this.data = rowData;
            }
          });
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }


  private populateEditFormDropdowns(rowData: any) {
    // Filter and populate Divisions
    const divisions = [...new Set(
      this.dealerdataSource.data
        .filter(d => d.country === rowData.country)
        .map(d => d.division)
    )];
    this.filteredDivisions$.next(divisions);

    // Filter and populate Towns
    const towns = [...new Set(
      this.dealerdataSource.data
        .filter(d => d.country === rowData.country && d.division === rowData.division)
        .map(d => d.town)
    )];
    this.filteredTowns$.next(towns);

    // Filter and populate Dealers
    const dealers = this.dealerdataSource.data
      .filter(d => d.country === rowData.country && d.division === rowData.division && d.town === rowData.town);
    this.filteredDealers$.next(dealers);
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

    if (!dealer) {
      this.vehicledataSource.data = [];
      this.filteredVehicles = [];
      this.dailySalesForm.get('vehicle')?.reset();
      return;
    }

    // ✅ Patch Country, Division, Town automatically
    this.dailySalesForm.patchValue({
      country: dealer.country,
      division: dealer.division,
      town: dealer.town,
    });

    // Load products for this dealer
    const availableProducts = this.dataSource.data.filter(
      (p: any) => p.dealerId === dealer.id && p.openingStock > 0
    );

    runInInjectionContext(this.injector, () => {
      this.inventoryService.getInventoryData(dealer.name).subscribe(inventoryProducts => {
        const inventoryMap = new Map<string, number>();
        inventoryProducts.forEach(ip => {
          inventoryMap.set(ip.sku, ip.quantity);
        });

        const patchedProducts = availableProducts.map(product => ({
          ...product,
          avlQuantity: inventoryMap.get(product.sku) || 0
        }));

        this.vehicledataSource.data = patchedProducts;
        this.filteredVehicles = [...patchedProducts];
        this.dailySalesForm.get('vehicle')?.reset();
      });
    });
  }


  onQuantityChange(product: any) {
    if (product.quantity > product.avlQuantity) {
      alert(`Quantity cannot be greater than available quantity (${product.avlQuantity})`);
      // Clear input temporarily
      product.quantity = '';
      setTimeout(() => {
        product.quantity = null; // or zero, or leave empty string
      }, 0);
    }
  }


  isSubmitEnabled(): boolean {
    const formValid =
      this.dailySalesForm.get('dealerOutlet')?.valid &&
      this.dailySalesForm.get('division')?.valid &&
      this.dailySalesForm.get('country')?.valid &&
      this.dailySalesForm.get('town')?.valid &&
      this.dailySalesForm.get('salesDate')?.valid;


    const hasProducts = this.addedProducts.length > 0;
    // const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);

    return !!formValid && hasProducts;
  }

  // addProduct() {
  //   const selectedProductId = this.dailySalesForm.get('vehicle')?.value;
  //   if (!selectedProductId) {
  //     Swal.fire('Error', 'Please select a product before adding.', 'error');
  //     return;
  //   }
  //
  //   const product = this.vehicledataSource.data.find(p => p.name === selectedProductId);
  //   if (product) {
  //     const exists = this.addedProducts.some(p => p.productId === product.id);
  //     if (exists) {
  //       Swal.fire('Info', 'This product is already added.', 'info');
  //       return;
  //     }
  //
  //     this.addedProducts = [...this.addedProducts, {
  //       productId: product.id,
  //       sku: product.sku,
  //       name: product.name,
  //       brand: product.brand,
  //       model: product.model,
  //       variant: product.variant,
  //       unit: product.unit,
  //       avlQuantity: product.avlQuantity,
  //       quantity: 1
  //     }];
  //     console.log(this.addedProducts);
  //   }
  //   this.dailySalesForm.get('vehicle')?.reset();
  // }
  // addProduct() {
  //   const selectedProducts = this.dailySalesForm.get('vehicle')?.value; // this will be an array
  //   if (!selectedProducts || selectedProducts.length === 0) {
  //     Swal.fire('Error', 'Please select at least one product before adding.', 'error');
  //     return;
  //   }
  //
  //   let newProducts: any[] = [];
  //
  //   selectedProducts.forEach((selectedName: string) => {
  //     const product = this.vehicledataSource.data.find(p => p.name === selectedName);
  //     if (product) {
  //       const exists = this.addedProducts.some(p => p.productId === product.id);
  //       if (!exists) {
  //         newProducts.push({
  //           productId: product.id,
  //           sku: product.sku,
  //           name: product.name,
  //           brand: product.brand,
  //           model: product.model,
  //           variant: product.variant,
  //           unit: product.unit,
  //           avlQuantity: product.avlQuantity,
  //           quantity: 0
  //         });
  //       } else {
  //         Swal.fire('Info', `${product.name} is already added.`, 'info');
  //       }
  //     }
  //   });
  //
  //   if (newProducts.length > 0) {
  //     this.addedProducts = [...this.addedProducts, ...newProducts];
  //     console.log(this.addedProducts);
  //   }
  //
  //   // Reset selection after adding
  //   this.dailySalesForm.get('vehicle')?.reset();
  // }

  addProduct() {
    const selectedProducts = this.dailySalesForm.get('vehicle')?.value; // array of selected names
    if (!selectedProducts || selectedProducts.length === 0) {
      Swal.fire('Error', 'Please select at least one product before adding.', 'error');
      return;
    }

    let newProducts: any[] = [];

    selectedProducts.forEach((selectedName: string) => {
      const product = this.vehicledataSource.data.find(p => p.name === selectedName);
      if (product) {
        const exists = this.addedProducts.some(p => p.productId === product.id);
        if (!exists) {
          newProducts.push({
            productId: product.id,
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            model: product.model,
            variant: product.variant,
            unit: product.unit,
            avlQuantity: product.avlQuantity,
            quantity: 0
          });
        } else {
          Swal.fire('Info', `${product.name} is already added.`, 'info');
        }
      }
    });

    if (newProducts.length > 0) {
      this.addedProducts = [...this.addedProducts, ...newProducts];
      console.log(this.addedProducts);
    }

    // Reset selection after adding
    this.dailySalesForm.get('vehicle')?.reset();
  }

  // Toggle select/unselect all vehicles
  toggleSelectAllVehicles() {
    const allVehicleNames = this.vehicledataSource.data.map(v => v.name);
    const selectedVehicles: string[] = this.dailySalesForm.get('vehicle')?.value || [];

    if (this.isAllVehiclesSelected()) {
      // All selected → unselect all
      this.dailySalesForm.get('vehicle')?.setValue([]);
    } else {
      // Select all
      this.dailySalesForm.get('vehicle')?.setValue(allVehicleNames);
    }
  }

// Check if all vehicles are selected
  isAllVehiclesSelected(): boolean {
    const selectedVehicles: string[] = this.dailySalesForm.get('vehicle')?.value || [];
    const allVehicleNames = this.vehicledataSource.data.map(v => v.name);
    return allVehicleNames.length > 0 && allVehicleNames.every(name => selectedVehicles.includes(name));
  }



  removeProduct(index: number) {
    // Remove only the clicked product
    this.addedProducts = this.addedProducts.filter((_, i) => i !== index);

    // ✅ Force table refresh
    this.addedProducts = [...this.addedProducts];
  }


  submitForm() {
    try {
      if (this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please add at least one product.', 'error');
        return;
      }

      // Filter out products with a quantity of 0 or less
      const productsToSubmit = this.addedProducts.filter(p => p.quantity > 0);

      // If no products have a quantity > 0, show an error and stop.
      if (productsToSubmit.length === 0) {
        Swal.fire('Error', 'Please enter a quantity greater than 0 for at least one product.', 'error');
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

            const formValues = this.dailySalesForm.getRawValue();

            let salesDateTime: number | null = null;
            if (formValues.salesDate) {
              const selectedDate = new Date(formValues.salesDate);
              const now = new Date();
              selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
              salesDateTime = selectedDate.getTime();
            }

            const baseInfo = {
              dealerOutlet: formValues.dealerOutlet,
              division: formValues.division,
              country: formValues.country,
              town: formValues.town,
              salesDate: salesDateTime,
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
              // ✅ NEW LOGIC: Use productsToSubmit instead of addedProducts
              const createPromises = productsToSubmit.map(p => {
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
                  Swal.fire('Added!', 'All valid products saved as separate documents.', 'success');
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
