import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
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
import {LoadingService} from "../../Services/loading.service";
import {map} from "rxjs/operators";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {BehaviorSubject, Observable} from "rxjs";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

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
    MatTableModule,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatProgressSpinner
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
  isSubmitting: boolean = false;
  grnForm: FormGroup;
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'variant', 'unit', 'quantity', 'action'];
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

  // Search & filtered arrays
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;

  divisionSearchText: string = '';
  countrySearchText: string = '';
  townSearchText: string = '';
  vehicleSearchText: string = '';

  filteredCountries: string[] = [];
  filteredDivisionTypes: string[] = [];
  filteredVehicles: any[] = [];

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

    this.isEditMode = !!data?.id;
    this.grnForm = this.fb.group({
      dealerOutlet: ['', Validators.required],
      products: [[], Validators.required],
      country: ['', Validators.required],
      division: ['', Validators.required],
      town: ['', Validators.required],
      date: [null, Validators.required]   // 🔥 initially blank
    });
  }

  // ngOnInit() {
  //   this.setupCascadingDropdowns();
  //   this.loadInventoryDaata();
  //   this.DealerList();
  //
  //   // ✅ Initialize country list
  //   this._countriesTypes$.subscribe(countries => {
  //     this.filteredCountries = [...countries];  // show all countries initially
  //   });
  //
  //   // ✅ Initialize division list (blank until country is selected)
  //   this._divisionTypes$.subscribe(divisions => {
  //     this.filteredDivisionTypes = [...divisions];
  //   });
  //
  //   // ✅ Initialize towns list
  //   this._townTypes$.subscribe(towns => {
  //     this.filteredTowns$.next(towns);
  //   });
  // }

  ngOnInit() {
    this.loadInventoryDaata();
    this.DealerList();
  }

// // Dealer search
//   onDealerSearchChange(event: any) {
//     const searchValue = event.target.value.toLowerCase();
//     const allDealers = this.dealerdataSource.data;
//
//     if (!searchValue) {
//       this.filteredDealers$.next(allDealers);
//     } else {
//       this.filteredDealers$.next(
//         allDealers.filter((dealer: any) =>
//           dealer.name.toLowerCase().includes(searchValue)
//         )
//       );
//     }
//   }

// ✅ When dealer changes → auto-populate location + fetch vehicles
  onDealerChange(event: any) {
    const dealerName = event.value;
    const dealer = this.dealerdataSource.data.find((d: any) => d.name === dealerName);

    if (!dealer) return;

    // Auto populate Country, Division, Town
    this.grnForm.patchValue({
      country: dealer.country,
      division: dealer.division,
      town: dealer.town
    });

    // Fetch products of this dealer
    // const availableProducts = this.dataSource.data.filter(
    //   (p: any) => p.dealerId === dealer.id && p.openingStock > 0
    // );
    //
    // this.vehicledataSource.data = availableProducts;
    // this.filteredVehicles = [...availableProducts];
    //
    // this.grnForm.get('products')?.reset();

    // Fetch ALL products of this dealer (including zero stock)
    const availableProducts = this.dataSource.data.filter(
      (p: any) => p.dealerId === dealer.id
    );

    this.vehicledataSource.data = availableProducts;
    this.filteredVehicles = [...availableProducts];
    this.grnForm.get('products')?.reset();

  }

  DealerList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          this.dealerdataSource.data = data;
          this.filteredDealers$.next(data);
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }



  setupCascadingDropdowns() {
    this.grnForm.get('country')?.valueChanges.subscribe((selectedCountry: string) => {
      const divisions = [...new Set(
        this.dealerdataSource.data
          .filter(d => d.country === selectedCountry)
          .map(d => d.division)
      )];

      this.filteredDivisions$.next(divisions);
      this.filteredDivisionTypes = [...divisions];  // ✅ keep HTML loop in sync

      this.grnForm.get('division')?.reset();
      this.grnForm.get('town')?.reset();
      this.filteredTowns$.next([]);
      this.filteredDealers$.next([]);
    });

    this.grnForm.get('division')?.valueChanges.subscribe((selectedDivision: string) => {
      const selectedCountry = this.grnForm.get('country')?.value;
      const towns = [...new Set(
        this.dealerdataSource.data
          .filter(d => d.country === selectedCountry && d.division === selectedDivision)
          .map(d => d.town)
      )];
      this.filteredTowns$.next(towns);
      this.grnForm.get('town')?.reset();
      this.filteredDealers$.next([]);
    });

    this.grnForm.get('town')?.valueChanges.subscribe((selectedTown: string) => {
      const selectedCountry = this.grnForm.get('country')?.value;
      const selectedDivision = this.grnForm.get('division')?.value;
      const dealers = this.dealerdataSource.data
        .filter(d => d.country === selectedCountry && d.division === selectedDivision && d.town === selectedTown);
      this.filteredDealers$.next(dealers);
    });
  }



  // Country
  filterCountries() {
    const searchText = this.countrySearchText.toLowerCase();
    this._countriesTypes$.subscribe(countries => {
      this.filteredCountries = countries.filter(c => c.toLowerCase().includes(searchText));
    });
  }
  onCountrySearchChange(event: any) {
    this.countrySearchText = event.target.value;
    this.filterCountries();
  }
  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.countrySearchText = '';
      this.filterCountries();
      setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
    }
  }

// Division
  filterDivisionTypes() {
    const searchText = this.divisionSearchText.toLowerCase();
    this.filteredDivisionTypes = (this.filteredDivisions$.getValue() || []).filter(d => d.toLowerCase().includes(searchText));
  }
  onDivisionSearchChange(event: any) {
    this.divisionSearchText = event.target.value;
    this.filterDivisionTypes();
  }
  onDivisionSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.divisionSearchText = '';
      this.filterDivisionTypes();
      setTimeout(() => this.divisionSearchInput.nativeElement.focus(), 0);
    }
  }

// Town
//   townSearchText: string = '';
  onTownSearchChange(event: any) {
    const searchValue = event.target.value.toLowerCase();
    const allTowns = this.filteredTowns$.getValue();
    if (!searchValue) {
      this.filteredTowns$.next(allTowns);
    } else {
      this.filteredTowns$.next(allTowns.filter(t => t.toLowerCase().includes(searchValue)));
    }
  }
  onTownSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.townSearchText = '';
      const allTowns = this.filteredTowns$.getValue();
      this.filteredTowns$.next(allTowns);
      setTimeout(() => this.townSearchInput.nativeElement.focus(), 0);
    }
  }

// // Vehicle
//   onVehicleSearchChange(event: any) {
//     const searchValue = event.target.value.toLowerCase();
//     if (!searchValue) {
//       this.filteredVehicles = [...this.vehicledataSource.data];
//     } else {
//       this.filteredVehicles = this.vehicledataSource.data.filter(v =>
//         v.name.toLowerCase().includes(searchValue)
//       );
//     }
//   }
  // Toggle select/unselect all vehicles
  toggleSelectAllVehicles() {
    const allVehicleNames = this.vehicledataSource.data.map(v => v.name);
    const selectedVehicles: string[] = this.grnForm.get('products')?.value || [];

    if (this.isAllVehiclesSelected()) {
      // All selected → unselect all
      this.grnForm.get('products')?.setValue([]);
    } else {
      // Select all
      this.grnForm.get('products')?.setValue(allVehicleNames);
    }
  }

// Check if all vehicles are selected
  isAllVehiclesSelected(): boolean {
    const selectedVehicles: string[] = this.grnForm.get('products')?.value || [];
    const allVehicleNames = this.vehicledataSource.data.map(v => v.name);
    return allVehicleNames.length > 0 && allVehicleNames.every(name => selectedVehicles.includes(name));
  }



  // Add inside AddGRNComponent class

// Dealer search
//   onDealerSearchChange(event: any) {
//     const searchValue = event.target.value.toLowerCase();
//     const allDealers = this.dealerdataSource.data;
//
//     if (!searchValue) {
//       this.filteredDealers$.next(allDealers);
//     } else {
//       this.filteredDealers$.next(
//         allDealers.filter((dealer: any) =>
//           dealer.name.toLowerCase().includes(searchValue)
//         )
//       );
//     }
//   }




  // DealerList() {
  //   this.loadingService.setLoading(true);
  //   runInInjectionContext(this.injector, () => {
  //     this.addDealerService.getDealerList().subscribe({
  //       next: (data) => {
  //         this.dealerdataSource.data = data;
  //         this.loadingService.setLoading(false);
  //
  //         // This is the key change for edit mode
  //         this.route.queryParams.subscribe(params => {
  //           if (params['data']) {
  //             const rowData = JSON.parse(params['data']);
  //             this.outlateId = rowData.outlateId;
  //
  //             this.grnForm.patchValue({
  //               country: rowData.country,
  //             });
  //
  //             // Call the new method to manually populate dropdowns
  //             this.populateEditFormDropdowns(rowData);
  //
  //             // Patch the remaining values after the dropdowns are ready
  //             this.grnForm.patchValue({
  //               division: rowData.division,
  //               town: rowData.town,
  //               dealerOutlet: rowData.dealerOutlet,
  //               products: rowData.products,
  //               // typeOfGrn: rowData.typeOfGrn,
  //             });
  //
  //             this.addedProducts = [{
  //               docId: rowData.docId,
  //               sku: rowData.sku ?? '',
  //               name: rowData.name ?? '',
  //               brand: rowData.brand ?? '',
  //               model: rowData.model ?? '',
  //               variant: rowData.variant ?? rowData.varient ?? '',
  //               unit: rowData.unit ?? '',
  //               quantity: rowData.quantity ?? 1
  //             }];
  //
  //             this.grnForm.patchValue({ products: rowData.name });
  //             this.grnForm.get('products')?.disable();
  //             this.isEditMode = true;
  //             this.data = rowData;
  //           }
  //         });
  //       },
  //       error: () => this.loadingService.setLoading(false)
  //     });
  //   });
  // }

  private populateEditFormDropdowns(rowData: any) {
    const divisions = [...new Set(
      this.dealerdataSource.data
        .filter(d => d.country === rowData.country)
        .map(d => d.division)
    )];
    this.filteredDivisions$.next(divisions);

    const towns = [...new Set(
      this.dealerdataSource.data
        .filter(d => d.country === rowData.country && d.division === rowData.division)
        .map(d => d.town)
    )];
    this.filteredTowns$.next(towns);

    const dealers = this.dealerdataSource.data
      .filter(d => d.country === rowData.country && d.division === rowData.division && d.town === rowData.town);
    this.filteredDealers$.next(dealers);
  }

  loadInventoryDaata() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.inventoryService.getInventoryAllData().subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  // onDealerChange(event: any) {
  //   const dealerName = event.value;
  //   const dealer = this.dealerdataSource.data.find((d: any) => d.name === dealerName);
  //
  //   if (!dealer) return;
  //
  //   const availableProducts = this.dataSource.data.filter(
  //     (p: any) => p.dealerId === dealer.id && p.openingStock > 0
  //   );
  //
  //   this.vehicledataSource.data = availableProducts;
  //
  //   // ✅ Initialize filtered vehicles here
  //   this.filteredVehicles = [...availableProducts];
  //
  //   this.grnForm.get('products')?.reset();
  // }


  isSubmitEnabled(): boolean {
    // Disable if currently submitting
    if (this.isSubmitting) {
      return false;
    }

    const formValid =
      this.grnForm.get('dealerOutlet')?.valid &&
      this.grnForm.get('date')?.valid;

    const hasProducts = this.addedProducts.length > 0;

    return !!formValid && hasProducts;
  }

  // addProduct() {
  //   const selectedProductId = this.grnForm.get('products')?.value;
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
  //       quantity: 1
  //     }];
  //   }
  //
  //   this.grnForm.get('products')?.reset();
  // }

  addProduct() {
    const selectedProducts = this.grnForm.get('products')?.value; // this will be an array
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
    this.grnForm.get('products')?.reset();
  }

  removeProduct(index: number) {
    // Remove only the clicked product
    this.addedProducts = this.addedProducts.filter((_, i) => i !== index);

    // ✅ Force table refresh
    this.addedProducts = [...this.addedProducts];
  }

  submitForm() {
    try {
      const formValues = this.grnForm.getRawValue();

      if (this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please add at least one product.', 'error');
        return;
      }

      const productsToSubmit = this.addedProducts.filter(p => p.quantity > 0);

      if (productsToSubmit.length === 0) {
        Swal.fire('Error', 'Please enter a quantity greater than 0 for at least one product.', 'error');
        return;
      }

      Swal.fire({
        title: this.isEditMode ? 'Update Grn?' : 'Add Daily Stock?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result: any) => {
        if (result.isConfirmed) {
          try {
            // ✅ Set loading flags immediately after confirmation
            this.isSubmitting = true;
            this.loadingService.setLoading(true);

            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const username = userData.userName || 'Unknown User';
            const timestamp = Date.now();

            const selectedDate = formValues.date ? new Date(formValues.date) : null;
            let dateTime: string | null = null;

            if (selectedDate) {
              const now = new Date();
              selectedDate.setHours(
                now.getHours(),
                now.getMinutes(),
                now.getSeconds(),
                now.getMilliseconds()
              );
              dateTime = selectedDate.toISOString();
            }

            const baseInfo = {
              dealerOutlet: formValues.dealerOutlet,
              country: formValues.country,
              division: formValues.division,
              town: formValues.town,
              stockDate: dateTime,
              status: 'Active',
              updatedBy: username,
              updatedAt: timestamp
            };

            if (this.isEditMode) {
              const productToUpdate = productsToSubmit[0];
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
                .then(() => this.updateInventory(productDoc, 'increase'))
                .then(() => {
                  Swal.fire('Updated!', 'Daily Stock updated successfully.', 'success');
                  this.goBack();
                })
                .catch(err => {
                  console.error('Error updating Daily Stock:', err);
                  Swal.fire('Error', 'Something went wrong while updating.', 'error');
                })
                .finally(() => {
                  // ✅ Reset loading flags
                  this.isSubmitting = false;
                  this.loadingService.setLoading(false);
                });
            } else {
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
                  this.grnService.addGrn(productDoc)
                ).then(() => this.updateInventory(productDoc, 'increase'));
              });

              Promise.all(createPromises)
                .then(() => {
                  Swal.fire('Added!', 'All valid products saved and inventory updated.', 'success');
                  this.router.navigate(['/module/grn-list']);
                })
                .catch(err => {
                  console.error('Error adding Daily Stock:', err);
                  Swal.fire('Error', 'Something went wrong while adding.', 'error');
                })
                .finally(() => {
                  // ✅ Reset loading flags
                  this.isSubmitting = false;
                  this.loadingService.setLoading(false);
                });
            }
          } catch (innerErr) {
            console.error('Unexpected error during submission:', innerErr);
            Swal.fire('Error', 'Unexpected issue occurred.', 'error');
            // ✅ Reset loading flags on error
            this.isSubmitting = false;
            this.loadingService.setLoading(false);
          }
        }
      });
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
      // ✅ Reset loading flags on early error
      this.isSubmitting = false;
      this.loadingService.setLoading(false);
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
    this.router.navigate(["/module/grn-list"]);
  }

  // ----------------- Dealer -----------------
  @ViewChild('dealerSearchInput') dealerSearchInput!: ElementRef;

  onDealerSearchChange(event: any) {
    const searchValue = event.target.value.toLowerCase();
    const filtered = this.dealerdataSource.data.filter(d =>
      d.name.toLowerCase().includes(searchValue)
    );
    this.filteredDealers$.next(filtered);
  }

  onDealerSelectOpened(isOpened: boolean) {
    this.resetDealerSearch();
    if (isOpened) setTimeout(() => this.dealerSearchInput.nativeElement.focus(), 0);
  }

  private resetDealerSearch() {
    this.filteredDealers$.next(this.dealerdataSource.data);
    if (this.dealerSearchInput) this.dealerSearchInput.nativeElement.value = '';
  }

// ----------------- Vehicle -----------------
  @ViewChild('vehicleSearchInput') vehicleSearchInput!: ElementRef;

  onVehicleSearchChange(event: any) {
    const searchValue = event.target.value.toLowerCase();
    this.filteredVehicles = this.vehicledataSource.data.filter(v =>
      v.name.toLowerCase().includes(searchValue)
    );
  }

  onVehicleSelectOpened(isOpened: boolean) {
    this.resetVehicleSearch();
    if (isOpened) setTimeout(() => this.vehicleSearchInput.nativeElement.focus(), 0);
  }

  private resetVehicleSearch() {
    this.filteredVehicles = [...this.vehicledataSource.data];
    if (this.vehicleSearchInput) this.vehicleSearchInput.nativeElement.value = '';
  }
}
