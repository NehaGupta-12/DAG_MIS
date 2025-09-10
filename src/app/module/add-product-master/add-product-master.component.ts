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

    constructor(
      private fb: UntypedFormBuilder,
      private location: Location,
      private productService: ProductMasterService,
      private injector: EnvironmentInjector,
      private route: ActivatedRoute,
      private router: Router,
      private mDatabase: AngularFireDatabase,
      private loadingService: LoadingService,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
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
      });
    }

    ngOnInit() {
      this.route.queryParams.subscribe(params => {
        if (params['data']) {
          const rowData = JSON.parse(params['data']);
          console.log('Received row data:', rowData);

          this.productForm.patchValue(rowData);

          if (rowData.id) {
            this.isEditMode = true;
            this.data = rowData;
          }
        }
      });
    }

    // --- Model Methods ---
    filterModels() {
      const searchText = this.modelSearchText.toLowerCase();
      this.filteredModels = this._modelTypes.filter(model => model.toLowerCase().includes(searchText));
    }
    onModelSearchChange(event: any) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.modelSearchText = event.target.value;
        this.filterModels();
      }, 300);
    }
    onModelSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.modelSearchText = '';
        this.filterModels();
        setTimeout(() => this.modelSearchInput.nativeElement.focus(), 0);
      }
    }

// --- Category Methods ---
    filterCategories() {
      const searchText = this.categorySearchText.toLowerCase();
      this.filteredCategories = this._categoryTypes.filter(category => category.toLowerCase().includes(searchText));
    }
    onCategorySearchChange(event: any) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.categorySearchText = event.target.value;
        this.filterCategories();
      }, 300);
    }
    onCategorySelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.categorySearchText = '';
        this.filterCategories();
        setTimeout(() => this.categorySearchInput.nativeElement.focus(), 0);
      }
    }

// --- Varient Methods ---
    filterVariants() {
      const searchText = this.variantSearchText.toLowerCase();
      this.filteredVariants = this._variantTypes.filter(variant => variant.toLowerCase().includes(searchText));
    }
    onVariantSearchChange(event: any) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.variantSearchText = event.target.value;
        this.filterVariants();
      }, 300);
    }
    onVariantSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.variantSearchText = '';
        this.filterVariants();
        setTimeout(() => this.variantSearchInput.nativeElement.focus(), 0);
      }
    }

// --- Engine CC Methods ---
    filterEngines() {
      const searchText = this.engineSearchText.toLowerCase();
      this.filteredEngines = this._engineTypes.filter(engine => engine.toLowerCase().includes(searchText));
    }
    onEngineSearchChange(event: any) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.engineSearchText = event.target.value;
        this.filterEngines();
      }, 300);
    }
    onEngineSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.engineSearchText = '';
        this.filterEngines();
        setTimeout(() => this.engineSearchInput.nativeElement.focus(), 0);
      }
    }

// --- Unit Methods ---
    filterUnits() {
      const searchText = this.unitSearchText.toLowerCase();
      this.filteredUnits = this._unitTypes.filter(unit => unit.toLowerCase().includes(searchText));
    }
    onUnitSearchChange(event: any) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.unitSearchText = event.target.value;
        this.filterUnits();
      }, 300);
    }
    onUnitSelectOpened(isOpened: boolean) {
      if (isOpened) {
        this.unitSearchText = '';
        this.filterUnits();
        setTimeout(() => this.unitSearchInput.nativeElement.focus(), 0);
      }
    }

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
            const { ...productData } = this.productForm.getRawValue();

            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const username = userData.userName || 'Unknown User';
            const timestamp = Date.now();

            const transformedData: any = { ...productData };

            if (this.isEditMode && this.data.id) {
              // ✅ Update logic
              transformedData.updateBy = username;
              transformedData.updatedAt = timestamp;

              runInInjectionContext(this.injector, () => {
                this.loadingService.setLoading(true);  // ✅ Start loader
                this.productService.updateProduct(this.data.id, transformedData)
                  .then(() => {
                    this.loadingService.setLoading(false);  // ✅ Stop loader
                    Swal.fire('Updated!', 'Product details updated successfully.', 'success')
                      .then(() => {
                        this.router.navigate(['/module/product-master-list']);
                      });
                  })
                  .catch(error => {
                    this.loadingService.setLoading(false);  // ✅ Stop loader on error
                    console.error('Error updating product details:', error);
                    Swal.fire('Error', 'Something went wrong.', 'error');
                  });
              });
            } else {
              // ✅ Add logic
              transformedData.status = 'Active';
              transformedData.createBy = username;
              transformedData.createdAt = timestamp;

              runInInjectionContext(this.injector, () => {
                this.loadingService.setLoading(true);  // ✅ Start loader
                this.productService.addProduct(transformedData)
                  .then(() => {
                    this.loadingService.setLoading(false);  // ✅ Stop loader
                    Swal.fire('Added!', 'Product details added successfully.', 'success')
                      .then(() => {
                        this.router.navigate(['/module/product-master-list']);
                      });
                  })
                  .catch(error => {
                    this.loadingService.setLoading(false);  // ✅ Stop loader on error
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

    goBack() {
      this.location.back();
    }


  }
