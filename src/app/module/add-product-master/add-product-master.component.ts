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
  import {AsyncPipe, CommonModule, Location, NgFor, NgForOf} from "@angular/common";
  import Swal from "sweetalert2";
  import {MAT_DIALOG_DATA} from "@angular/material/dialog";
  import {ProductMasterService} from "../product-master.service";
  import {ActivatedRoute, Router} from "@angular/router";
  import {map} from "rxjs/operators";
  import {AngularFireDatabase} from "@angular/fire/compat/database";
  import {Observable} from "rxjs";
  import {LoadingService} from "../../Services/loading.service";
  import {CountryService} from "../../Services/country.service";
import {ActivityLogService} from "../activity-log/activity-log.service";

  @Component({
    selector: 'app-add-product-master',
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
      AsyncPipe,
      NgForOf,
      CommonModule,
      NgFor
    ],
    providers: [
      {provide: MAT_DIALOG_DATA, useValue: {}}
    ],
    templateUrl: './add-product-master.component.html',
    standalone: true,
    styleUrl: './add-product-master.component.scss'
  })
  export class AddProductMasterComponent implements OnInit {
    uniqueCountries: any[] = [];
    isEditMode: boolean = false;
    productForm: FormGroup;
    _modelTypes$!: Observable<string[]>;
    _categoryTypes$!: Observable<string[]>;
    _subCategoryTypes$!: Observable<string[]>;
    _variantTypes$!: Observable<string[]>;
    _engineTypes$!: Observable<string[]>;
    _unitTypes$!: Observable<string[]>;
    @ViewChild('modelSearchInput') modelSearchInput!: ElementRef;
    @ViewChild('categorySearchInput') categorySearchInput!: ElementRef;
    @ViewChild('variantSearchInput') variantSearchInput!: ElementRef;
    @ViewChild('engineSearchInput') engineSearchInput!: ElementRef;
    @ViewChild('unitSearchInput') unitSearchInput!: ElementRef;

    _modelTypes: string[] = [];
    filteredModels: string[] = [];
    modelSearchText: string = '';

    _categoryTypes: string[] = [];
    filteredCategories: string[] = [];
    categorySearchText: string = '';

    _variantTypes: string[] = [];
    filteredVariants: string[] = [];
    variantSearchText: string = '';

    _engineTypes: string[] = [];
    filteredEngines: string[] = [];
    engineSearchText: string = '';

    _unitTypes: string[] = [];
    filteredUnits: string[] = [];
    unitSearchText: string = '';

    debounceTimer: any;
countries$:Observable<string[]>
    constructor(
      private fb: UntypedFormBuilder,
      private location: Location,
      private productService: ProductMasterService,
      private injector: EnvironmentInjector,
      private route: ActivatedRoute,
      private router: Router,
      private mDatabase: AngularFireDatabase,
      private readonly mCountryService:CountryService,
      private mService: ActivityLogService,
      private loadingService: LoadingService,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {

   this.countries$ = this.mCountryService.getCountries()

      this.countries$.subscribe(countries => {
        this.uniqueCountries = countries || [];
      });


      // Subscribe to all observables and populate local arrays
      this._modelTypes$ = this.mDatabase
        .object<{ subcategories: string[] }>('typelist/Model')
        .valueChanges()
        .pipe(map(data => data?.subcategories || []));
      this._modelTypes$.subscribe(data => {
        this._modelTypes = data;
        this.filteredModels = [...data];
      });

      this._categoryTypes$ = this.mDatabase
        .object<{ subcategories: string[] }>('/typelist/Product_Category')
        .valueChanges()
        .pipe(map(data => data?.subcategories || []));
      this._categoryTypes$.subscribe(data => {
        this._categoryTypes = data;
        this.filteredCategories = [...data];
      });

      this._subCategoryTypes$ = this.mDatabase
        .object<{ subcategories: string[] }>('/typelist/Sub_Category')
        .valueChanges()
        .pipe(map(data => data?.subcategories || []));

      this._variantTypes$ = this.mDatabase
        .object<{ subcategories: string[] }>('typelist/Variant')
        .valueChanges()
        .pipe(map(data => data?.subcategories || []));
      this._variantTypes$.subscribe(data => {
        this._variantTypes = data;
        this.filteredVariants = [...data];
      });

      this._engineTypes$ = this.mDatabase
        .object<{ subcategories: string[] }>('typelist/EngineCC')
        .valueChanges()
        .pipe(map(data => data?.subcategories || []));
      this._engineTypes$.subscribe(data => {
        this._engineTypes = data;
        this.filteredEngines = [...data];
      });

      this._unitTypes$ = this.mDatabase
        .object<{ subcategories: string[] }>('typelist/UnitOfMeasurement')
        .valueChanges()
        .pipe(map(data => data?.subcategories || []));
      this._unitTypes$.subscribe(data => {
        this._unitTypes = data;
        this.filteredUnits = [...data];
      });

      this.productForm = this.fb.group({
        name: ['', [Validators.required]],
        model: ['', [Validators.required]],
        brand: ['', [Validators.required]],
        category: ['', [Validators.required]],
        // subCategory: ['', [Validators.required]],
        varient: ['', [Validators.required]],
        engineCc: ['', [Validators.required]],
        unit: ['', [Validators.required]],
        availableIn: ['', [Validators.required]],

      });
    }

    // ngOnInit() {
    //   this.route.queryParams.subscribe(params => {
    //     if (params['data']) {
    //       const rowData = JSON.parse(params['data']);
    //       console.log('Received row data:', rowData);
    //
    //       this.productForm.patchValue(rowData);
    //
    //       if (rowData.id) {
    //         this.isEditMode = true;
    //         this.data = rowData;
    //       }
    //     }
    //   });
    // }


    ngOnInit() {
      // Ensure that uniqueCountries is populated before we try to use it for filtering
      // by putting the subscription logic inside ngOnInit or ensuring it completes first.
      // The constructor setup already handles this, but we'll use a safer approach below.

      this.countries$.subscribe(countries => {
        // This subscription already runs in the constructor, but doing it here
        // ensures `this.uniqueCountries` is set before `ngOnInit` logic,
        // especially if the observables are cold or the router navigates quickly.
        this.uniqueCountries = countries || [];

        this.route.queryParams.subscribe(params => {
          if (params['data']) {
            const rowData = JSON.parse(params['data']);
            console.log('Received row data:', rowData);

            if (rowData.id) {
              this.isEditMode = true;
              this.data = rowData;
            }

            // 1. Get the countries the product was originally saved with
            const productSavedCountries: string[] = rowData.availableIn || [];

            // 2. Filter the product's countries based on the current user's access
            const userAccessibleCountries = this.filterAvailableCountriesForUser(productSavedCountries);

            // 3. Create a partial object for patching
            const patchData = {
              ...rowData,
              availableIn: userAccessibleCountries // Use the filtered list for the form
            };

            // 4. Patch the form with the filtered data
            this.productForm.patchValue(patchData);
          }
        });
      });
    }

    private filterAvailableCountriesForUser(productCountries: string[]): string[] {
      if (!productCountries || productCountries.length === 0) {
        return [];
      }

      // Use a Set for uniqueCountries for O(1) lookups for better performance
      const allowedCountriesSet = new Set(this.uniqueCountries);

      // Intersect the product's countries with the user's allowed countries
      return productCountries.filter(country => allowedCountriesSet.has(country));
    }

    // --- Model Methods ---
    filterModels() {
      if (!this.modelSearchText) {
        this.filteredModels = [...this._modelTypes];
        return;
      }
      const searchText = this.modelSearchText.toLowerCase();
      this.filteredModels = this._modelTypes.filter(model =>
        model.toLowerCase().includes(searchText)
      );
    }

    onModelSearchChange(event: any) {
      const value = event.target.value;
      this.modelSearchText = value;
      this.filterModels();
      event.stopPropagation();
    }

    onModelSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.modelSearchText = '';
        this.filteredModels = [...this._modelTypes];
        setTimeout(() => {
          if (this.modelSearchInput) {
            this.modelSearchInput.nativeElement.value = '';
            this.modelSearchInput.nativeElement.focus();
          }
        }, 0);
      } else {
        // Reset on close
        this.modelSearchText = '';
        this.filteredModels = [...this._modelTypes];
        if (this.modelSearchInput) {
          this.modelSearchInput.nativeElement.value = '';
        }
      }
    }

    // --- Category Methods ---
    filterCategories() {
      if (!this.categorySearchText) {
        this.filteredCategories = [...this._categoryTypes];
        return;
      }
      const searchText = this.categorySearchText.toLowerCase();
      this.filteredCategories = this._categoryTypes.filter(category =>
        category.toLowerCase().includes(searchText)
      );
    }

    onCategorySearchChange(event: any) {
      const value = event.target.value;
      this.categorySearchText = value;
      this.filterCategories();
      event.stopPropagation();
    }

    onCategorySelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.categorySearchText = '';
        this.filteredCategories = [...this._categoryTypes];
        setTimeout(() => {
          if (this.categorySearchInput) {
            this.categorySearchInput.nativeElement.value = '';
            this.categorySearchInput.nativeElement.focus();
          }
        }, 0);
      } else {
        // Reset on close
        this.categorySearchText = '';
        this.filteredCategories = [...this._categoryTypes];
        if (this.categorySearchInput) {
          this.categorySearchInput.nativeElement.value = '';
        }
      }
    }

    // --- Variant Methods ---
    filterVariants() {
      if (!this.variantSearchText) {
        this.filteredVariants = [...this._variantTypes];
        return;
      }
      const searchText = this.variantSearchText.toLowerCase();
      this.filteredVariants = this._variantTypes.filter(variant =>
        variant.toLowerCase().includes(searchText)
      );
    }

    onVariantSearchChange(event: any) {
      const value = event.target.value;
      this.variantSearchText = value;
      this.filterVariants();
      event.stopPropagation();
    }

    onVariantSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.variantSearchText = '';
        this.filteredVariants = [...this._variantTypes];
        setTimeout(() => {
          if (this.variantSearchInput) {
            this.variantSearchInput.nativeElement.value = '';
            this.variantSearchInput.nativeElement.focus();
          }
        }, 0);
      } else {
        // Reset on close
        this.variantSearchText = '';
        this.filteredVariants = [...this._variantTypes];
        if (this.variantSearchInput) {
          this.variantSearchInput.nativeElement.value = '';
        }
      }
    }

    // --- Engine CC Methods ---
    filterEngines() {
      if (!this.engineSearchText) {
        this.filteredEngines = [...this._engineTypes];
        return;
      }
      const searchText = this.engineSearchText.toLowerCase();
      this.filteredEngines = this._engineTypes.filter(engine =>
        engine.toLowerCase().includes(searchText)
      );
    }

    onEngineSearchChange(event: any) {
      const value = event.target.value;
      this.engineSearchText = value;
      this.filterEngines();
      event.stopPropagation();
    }

    onEngineSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.engineSearchText = '';
        this.filteredEngines = [...this._engineTypes];
        setTimeout(() => {
          if (this.engineSearchInput) {
            this.engineSearchInput.nativeElement.value = '';
            this.engineSearchInput.nativeElement.focus();
          }
        }, 0);
      } else {
        // Reset on close
        this.engineSearchText = '';
        this.filteredEngines = [...this._engineTypes];
        if (this.engineSearchInput) {
          this.engineSearchInput.nativeElement.value = '';
        }
      }
    }

    // --- Unit Methods ---
    filterUnits() {
      if (!this.unitSearchText) {
        this.filteredUnits = [...this._unitTypes];
        return;
      }
      const searchText = this.unitSearchText.toLowerCase();
      this.filteredUnits = this._unitTypes.filter(unit =>
        unit.toLowerCase().includes(searchText)
      );
    }

    onUnitSearchChange(event: any) {
      const value = event.target.value;
      this.unitSearchText = value;
      this.filterUnits();
      event.stopPropagation();
    }

    onUnitSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.unitSearchText = '';
        this.filteredUnits = [...this._unitTypes];
        setTimeout(() => {
          if (this.unitSearchInput) {
            this.unitSearchInput.nativeElement.value = '';
            this.unitSearchInput.nativeElement.focus();
          }
        }, 0);
      } else {
        // Reset on close
        this.unitSearchText = '';
        this.filteredUnits = [...this._unitTypes];
        if (this.unitSearchInput) {
          this.unitSearchInput.nativeElement.value = '';
        }
      }
    }

    // onRegister() {
    //   if (this.productForm.valid) {
    //     Swal.fire({
    //       title: this.isEditMode ? 'Update Product Details?' : 'Add Product Details?',
    //       text: 'Are you sure you want to proceed?',
    //       icon: 'question',
    //       showCancelButton: true,
    //       confirmButtonText: 'Yes',
    //       cancelButtonText: 'No'
    //     }).then((result: any) => {
    //       if (result.isConfirmed) {
    //         const { ...productData } = this.productForm.getRawValue();
    //
    //         const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    //         const username = userData.userName || 'Unknown User';
    //         const timestamp = Date.now();
    //
    //         const transformedData: any = { ...productData };
    //
    //         if (this.isEditMode && this.data.id) {
    //           // ✅ Update logic
    //           transformedData.updateBy = username;
    //           transformedData.updatedAt = timestamp;
    //
    //           runInInjectionContext(this.injector, () => {
    //             this.loadingService.setLoading(true);  // ✅ Start loader
    //             this.productService.updateProduct(this.data.id, transformedData)
    //               .then(() => {
    //                 this.loadingService.setLoading(false);  // ✅ Stop loader
    //                 Swal.fire('Updated!', 'Product details updated successfully.', 'success')
    //                   .then(() => {
    //                     this.router.navigate(['/module/product-master-list']);
    //                   });
    //               })
    //               .catch(error => {
    //                 this.loadingService.setLoading(false);  // ✅ Stop loader on error
    //                 console.error('Error updating product details:', error);
    //                 Swal.fire('Error', 'Something went wrong.', 'error');
    //               });
    //           });
    //         } else {
    //           // ✅ Add logic
    //           transformedData.status = 'Active';
    //           transformedData.createBy = username;
    //           transformedData.createdAt = timestamp;
    //
    //           runInInjectionContext(this.injector, () => {
    //             this.loadingService.setLoading(true);  // ✅ Start loader
    //             this.productService.addProduct(transformedData)
    //               .then(() => {
    //                 this.loadingService.setLoading(false);  // ✅ Stop loader
    //                 Swal.fire('Added!', 'Product details added successfully.', 'success')
    //                   .then(() => {
    //                     this.router.navigate(['/module/product-master-list']);
    //                   });
    //               })
    //               .catch(error => {
    //                 this.loadingService.setLoading(false);  // ✅ Stop loader on error
    //                 console.error('Error adding product details:', error);
    //                 Swal.fire('Error', 'Something went wrong.', 'error');
    //               });
    //           });
    //         }
    //       }
    //     });
    //   } else {
    //     console.log('Form is invalid:', this.productForm.errors);
    //   }
    // }


    // onRegister() {
    //   if (this.productForm.valid) {
    //     Swal.fire({
    //       title: this.isEditMode ? 'Update Product Details?' : 'Add Product Details?',
    //       text: 'Are you sure you want to proceed?',
    //       icon: 'question',
    //       showCancelButton: true,
    //       confirmButtonText: 'Yes',
    //       cancelButtonText: 'No'
    //     }).then((result: any) => {
    //       if (result.isConfirmed) {
    //         // Separate 'availableIn' from other form data
    //         const { availableIn, ...productData } = this.productForm.getRawValue();
    //         const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    //         const username = userData.userName || 'Unknown User';
    //         const timestamp = Date.now();
    //
    //         const transformedData: any = { ...productData };
    //
    //         if (this.isEditMode && this.data.id) {
    //           // ===================================
    //           // ✅ ENHANCED UPDATE LOGIC (Country Merge)
    //           // ===================================
    //
    //           // 1. Get the current user's submitted countries (what's checked on the form)
    //           const submittedCountries: string[] = availableIn || [];
    //
    //           // 2. Get the existing, full list of countries saved on the product
    //           // This uses the original data loaded into 'this.data' from the route/dialog
    //           const existingCountries: string[] = this.data.availableIn || [];
    //
    //           // 3. Get the set of countries the current user is allowed to see/modify
    //           const userAccessSet = new Set(this.uniqueCountries);
    //
    //           // 4. Initialize the final set of countries for the database
    //           const finalCountriesSet = new Set<string>();
    //
    //           // A. Preserve countries the current user could NOT modify (countries outside their access list)
    //           existingCountries.forEach(country => {
    //             if (!userAccessSet.has(country)) {
    //               // Country the current user has NO access to: PRESERVE it.
    //               finalCountriesSet.add(country);
    //             }
    //           });
    //
    //           // B. Merge in the submitted countries.
    //           // This implicitly handles additions (newly selected accessible countries)
    //           // and deletions (accessible countries that were deselected).
    //           submittedCountries.forEach(country => {
    //             finalCountriesSet.add(country);
    //           });
    //
    //           // 5. Update the transformed data with the merged array
    //           transformedData.availableIn = Array.from(finalCountriesSet);
    //
    //           transformedData.updateBy = username;
    //           transformedData.updatedAt = timestamp;
    //
    //           // Perform the update
    //           runInInjectionContext(this.injector, () => {
    //             this.loadingService.setLoading(true);
    //             this.productService.updateProduct(this.data.id, transformedData)
    //               .then(() => {
    //                 this.loadingService.setLoading(false);
    //                 Swal.fire('Updated!', 'Product details updated successfully.', 'success')
    //                   .then(() => {
    //                     this.router.navigate(['/module/product-master-list']);
    //                   });
    //               })
    //               .catch(error => {
    //                 this.loadingService.setLoading(false);
    //                 console.error('Error updating product details:', error);
    //                 Swal.fire('Error', 'Something went wrong.', 'error');
    //               });
    //           });
    //
    //         } else {
    //           // ==============================
    //           // ✅ ADD LOGIC
    //           // ==============================
    //           // For a new entry, just use the form value (which includes 'availableIn')
    //           transformedData.status = 'Active';
    //           transformedData.createBy = username;
    //           transformedData.createdAt = timestamp;
    //           transformedData.availableIn = availableIn || []; // Ensure it's included
    //
    //           runInInjectionContext(this.injector, () => {
    //             this.loadingService.setLoading(true);
    //             this.productService.addProduct(transformedData)
    //               .then(() => {
    //                 this.loadingService.setLoading(false);
    //                 Swal.fire('Added!', 'Product details added successfully.', 'success')
    //                   .then(() => {
    //                     this.router.navigate(['/module/product-master-list']);
    //                   });
    //               })
    //               .catch(error => {
    //                 this.loadingService.setLoading(false);
    //                 console.error('Error adding product details:', error);
    //                 Swal.fire('Error', 'Something went wrong.', 'error');
    //               });
    //           });
    //         }
    //       }
    //     });
    //   } else {
    //     // Optional: Add logic to display form validation errors to the user
    //     console.log('Form is invalid:', this.productForm.errors);
    //   }
    // }

    onRegister() {
      if (this.productForm.valid) {
        Swal.fire({
          title: this.isEditMode ? 'Update Product Details?' : 'Add Product Details?',
          text: 'Are you sure you want to proceed?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result: any) => {
          if (result.isConfirmed) {
            const { availableIn, ...productData } = this.productForm.getRawValue();
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
            const timestamp = Date.now();

            const transformedData: any = { ...productData };

            if (this.isEditMode && this.data.id) {
              // ===================================
              // ✅ UPDATE LOGIC WITH COUNTRY MERGE
              // ===================================
              const submittedCountries: string[] = availableIn || [];
              const existingCountries: string[] = this.data.availableIn || [];
              const userAccessSet = new Set(this.uniqueCountries);
              const finalCountriesSet = new Set<string>();

              existingCountries.forEach(country => {
                if (!userAccessSet.has(country)) {
                  finalCountriesSet.add(country);
                }
              });

              submittedCountries.forEach(country => {
                finalCountriesSet.add(country);
              });

              transformedData.availableIn = Array.from(finalCountriesSet);
              transformedData.updateBy = username;
              transformedData.updatedAt = timestamp;

              runInInjectionContext(this.injector, () => {
                this.loadingService.setLoading(true);
                this.productService.updateProduct(this.data.id, transformedData)
                  .then(async () => {
                    // ✅ Activity log for update
                    await this.mService.addLog({
                      date: timestamp,
                      section: "Product Master",
                      action: "Update",
                      user: username,
                      description: `${username} updated product: ${productData.name}`
                    });

                    this.loadingService.setLoading(false);
                    Swal.fire('Updated!', 'Product details updated successfully.', 'success')
                      .then(() => {
                        this.router.navigate(['/module/product-master-list']);
                      });
                  })
                  .catch(error => {
                    this.loadingService.setLoading(false);
                    console.error('Error updating product details:', error);
                    Swal.fire('Error', 'Something went wrong.', 'error');
                  });
              });

            } else {
              // ==============================
              // ✅ ADD LOGIC
              // ==============================
              transformedData.status = 'Active';
              transformedData.createBy = username;
              transformedData.createdAt = timestamp;
              transformedData.availableIn = availableIn || [];

              runInInjectionContext(this.injector, () => {
                this.loadingService.setLoading(true);
                this.productService.addProduct(transformedData)
                  .then(async () => {
                    // ✅ Activity log for add
                    await this.mService.addLog({
                      date: timestamp,
                      section: "Product Master",
                      action: "Submit",
                      user: username,
                      description: `${username} added new product: ${productData.name}`
                    });

                    this.loadingService.setLoading(false);
                    Swal.fire('Added!', 'Product details added successfully.', 'success')
                      .then(() => {
                        this.router.navigate(['/module/product-master-list']);
                      });
                  })
                  .catch(error => {
                    this.loadingService.setLoading(false);
                    console.error('Error adding product details:', error);
                    Swal.fire('Error', 'Something went wrong.', 'error');
                  });
              });
            }
          }
        });
      } else {
        console.log('Form is invalid:', this.productForm.errors);
      }
    }



    // goBack() {
    //   this.location.back();
    // }

    goBack() {
      this.router.navigate(['/module/product-master-list']);
    }


    // --- Country Select All ---
    toggleSelectAllCountries() {
      const allCountries = this.uniqueCountries; // or from (countries$)
      const selectedCountries: string[] = this.productForm.get('availableIn')?.value || [];

      if (this.isAllCountriesSelected()) {
        // If already all selected → clear
        this.productForm.get('availableIn')?.setValue([]);
      } else {
        // Otherwise → select all
        this.productForm.get('availableIn')?.setValue(allCountries);
      }
    }

    isAllCountriesSelected(): boolean {
      const selectedCountries: string[] = this.productForm.get('availableIn')?.value || [];
      const allCountries = this.uniqueCountries; // or from (countries$)
      return allCountries.length > 0 && allCountries.every(c => selectedCountries.includes(c));
    }

    getCountriesDisplay(): string {
      const selected: string[] = this.productForm.get('availableIn')?.value || [];

      if (selected.length === 0) {
        return 'Select countries';
      }
      if (selected.length === 1) {
        return selected[0];
      }
      return `${selected[0]} (+${selected.length - 1} others)`;
    }



  }
