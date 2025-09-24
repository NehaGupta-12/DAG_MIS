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
import { CommonModule, Location, NgForOf } from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import Swal from "sweetalert2";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { map } from "rxjs/operators";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { Observable } from "rxjs";
import { BudgetService } from "../budget.service";
import { ProductMasterService } from "../product-master.service";
import {LoadingService} from "../../Services/loading.service";
import {MonthlyBudgetService} from "../monthly-budget.service";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-add-budget',
  standalone: true,
  templateUrl: './add-budget.component.html',
  styleUrl: './add-budget.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgForOf,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatCheckbox,
  ]
})
export class AddBudgetComponent implements OnInit {
  isEditMode = false;
  editingDocId: string | null = null;
  targetForm: FormGroup;
  displayedColumns: string[] = ['country', 'year', 'month', 'period', 'name', 'sku', 'quantity','target', 'action'];
  dataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  vehicledataSource = new MatTableDataSource<any>();
  budgetdataSource = new MatTableDataSource<any>();

  _countriesTypes$!: Observable<string[]>;
  _yearTypes$!: Observable<string[]>;
  _monthTypes$!: Observable<string[]>;
  disabledMonths: string[] = [];


  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('yearSearchInput') yearSearchInput!: ElementRef;
  @ViewChild('monthSearchInput') monthSearchInput!: ElementRef;
  @ViewChild('productSearchInput') productSearchInput!: ElementRef;

  _countriesTypes: string[] = [];
  filteredCountries: string[] = [];
  countrySearchText: string = '';

  _yearTypes: string[] = [];
  filteredYears: string[] = [];
  yearSearchText: string = '';

  _monthTypes: string[] = [];
  filteredMonths: string[] = [];
  monthSearchText: string = '';

  _allProducts: any[] = [];
  filteredProducts: any[] = [];
  productSearchText: string = '';

  debounceTimer: any;

  constructor(
    private fb: UntypedFormBuilder,
    private dealer: Location,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductMasterService,
    private mDatabase: AngularFireDatabase,
    private budgetService: BudgetService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService
  ) {
    // Dropdowns
    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._yearTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Year')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._monthTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Month')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    // Subscribe to the observables to get the data and populate the local arrays
    this._countriesTypes$.subscribe(data => {
      this._countriesTypes = data;
      this.filteredCountries = [...this._countriesTypes];
    });

    this._yearTypes$.subscribe(data => {
      this._yearTypes = data;
      this.filteredYears = [...this._yearTypes];
    });

    this._monthTypes$.subscribe(data => {
      this._monthTypes = data;
      this.filteredMonths = [...this._monthTypes];
    });

    // Form
    this.targetForm = this.fb.group({
      country: ['', Validators.required],
      year: ['', Validators.required],
      month: ['', Validators.required],
      period: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required],
      }),
      products: [[]],   // multiple values
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadBudgets();
    this.loadbudget();

    runInInjectionContext(this.injector, () => {
      this.targetForm.get('month')?.valueChanges.subscribe(() => this.updatePeriod());
      this.targetForm.get('year')?.valueChanges.subscribe(() => this.targetForm.get('period')?.reset());
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        this.isEditMode = true;
        this.editingDocId = rowData.docId;

        // 🔄 Convert Firestore timestamps to Date
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (rowData.period?.start?.seconds) {
          startDate = new Date(rowData.period.start.seconds * 1000);
        }
        if (rowData.period?.end?.seconds) {
          endDate = new Date(rowData.period.end.seconds * 1000);
        }

        this.targetForm.patchValue({
          country: rowData.country,
          year: rowData.year,
          month: rowData.month,
          period: { start: startDate, end: endDate }
        });

        // ✅ prefill products into table
        if (rowData.products && rowData.products.length > 0) {
          this.addedProducts = rowData.products.map((p: any) => ({
            name: p.model,
            target: p.targetQuantity,
            country: rowData.country,
            year: rowData.year,
            month: rowData.month
          }));

          // ✨ Set the selected products in the form control
          const selectedProductModels = rowData.products.map((p: any) => p.model);
          this.targetForm.get('products')?.setValue(selectedProductModels);
        }
      }
    });

    runInInjectionContext(this.injector, () => {
      // ✅ Combine subscriptions for country and year
      this.targetForm.get('country')?.valueChanges.subscribe((selectedCountry: string) => {
        const selectedYear = this.targetForm.get('year')?.value;
        if (selectedYear && selectedCountry) {
          this.updateDisabledMonths(selectedYear, selectedCountry);
        } else {
          this.disabledMonths = [];
        }
      });

      this.targetForm.get('year')?.valueChanges.subscribe((selectedYear: string) => {
        const selectedCountry = this.targetForm.get('country')?.value;
        if (selectedYear && selectedCountry) {
          this.updateDisabledMonths(selectedYear, selectedCountry);
        } else {
          this.disabledMonths = [];
        }
      });

      this.targetForm.get('month')?.valueChanges.subscribe(() => this.updatePeriod());
    });
  }

  updateDisabledMonths(year: string, country: string) {
    if (!this.budgetdataSource?.data || !year || !country) {
      this.disabledMonths = [];
      return;
    }

    const usedMonths = this.budgetdataSource.data
      .filter((row: any) => row.year === year && row.country === country)
      .map((row: any) => row.month);

    this.disabledMonths = usedMonths;
  }


  loadbudget() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.budgetService.getBudgetList().subscribe({
        next: (data: any[]) => {
          console.log("Raw Data:", data);
          this.budgetdataSource.data = data;
          this.loadingService.setLoading(false);
        },
        error: () => {
          this.loadingService.setLoading(false);
        },
      });
    });
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

// --- Year Methods ---
  filterYears() {
    const searchText = this.yearSearchText.toLowerCase();
    this.filteredYears = this._yearTypes.filter(year => year.toLowerCase().includes(searchText));
  }
  onYearSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.yearSearchText = event.target.value;
      this.filterYears();
    }, 300);
  }
  onYearSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.yearSearchText = '';
      this.filterYears();
      setTimeout(() => this.yearSearchInput.nativeElement.focus(), 0);
    }
  }

// --- Month Methods ---
  filterMonths() {
    const searchText = this.monthSearchText.toLowerCase();
    this.filteredMonths = this._monthTypes.filter(month => month.toLowerCase().includes(searchText));
  }
  onMonthSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.monthSearchText = event.target.value;
      this.filterMonths();
    }, 300);
  }
  onMonthSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.monthSearchText = '';
      this.filterMonths();
      setTimeout(() => this.monthSearchInput.nativeElement.focus(), 0);
    }
  }

// --- Product Methods ---
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

  private loadEditMode(params: any) {
    this.isEditMode = true;
    this.editingDocId = params['docId'];
    const periodObj = params['period'] ? JSON.parse(params['period']) : null;

    this.targetForm.patchValue({
      country: params['country'] || '',
      year: params['year'] || '',
      month: params['month'] || '',
      products: params['name'] || params['productName'] || '',
      period: periodObj
    });

    this.addedProducts = [{
      id: params['docId'],
      sku: params['sku'],
      name: params['name'] || params['productName'],
      quantity: params['budgetQuantity'] ? Number(params['budgetQuantity']) : 0,
      target: params['targetQuantity'] ? Number(params['targetQuantity']) : 0,
      country: params['country'],
      year: params['year'],
      month: params['month'],
      period: periodObj
    }];
  }

  private simplifyModelName(model: string): string {
    if (!model) return '';

    // Special cases first
    if (model.toUpperCase().startsWith('PULSAR')) return 'PULSAR 180';
    if (model.toUpperCase().startsWith('DISC')) return 'DISCOVER';
    if (model.toUpperCase().startsWith('RE MAXIMA')) return 'MAXIMA';
    if (model.toUpperCase().startsWith('CT125')) return 'CT125';
    if (model.toUpperCase().startsWith('RE4S')) return 'RE4S';

    // General case: capture BM + digits
    const match = model.match(/BM\d+/i);
    return match ? match[0].toUpperCase() : model;
  }

  loadProducts() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe({
        next: (data) => {
          console.log("raw data", data);

          // ✅ Deduplicate based on simplified model
          const uniqueModelsMap = new Map<string, any>();
          data.forEach((prod) => {
            const simpleName = this.simplifyModelName(prod.model);
            if (!uniqueModelsMap.has(simpleName)) {
              uniqueModelsMap.set(simpleName, {
                ...prod,
                name: simpleName // override name for dropdown
              });
            }
          });

          this._allProducts = Array.from(uniqueModelsMap.values());
          this.filteredProducts = [...this._allProducts];
          this.vehicledataSource.data = data; // keep raw data if needed for details
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }


  loadBudgets() {
    this.loadingService.setLoading(true);  // ✅ start loader
    runInInjectionContext(this.injector, () => {
      this.budgetService.getBudgetList().subscribe({
        next: (data: any) => {
          this.dataSource.data = data;
          this.loadingService.setLoading(false); // ✅ stop loader
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  updatePeriod() {
    const yearValue = this.targetForm.get('year')?.value;
    const monthValue = this.targetForm.get('month')?.value;

    if (!yearValue || !monthValue) {
      this.targetForm.get('period')?.reset();
      return;
    }

    const [startFY, endFY] = yearValue.split('-').map(Number);
    const monthIndex = this.getMonthIndex(monthValue);

    if (monthIndex === -1) {
      this.targetForm.get('period')?.reset();
      return;
    }

    let startDate: Date;
    let endDate: Date;

    if (monthIndex >= 3) {
      startDate = new Date(startFY, monthIndex, 1);
      endDate = new Date(startFY, monthIndex + 1, 0);
    } else {
      startDate = new Date(endFY, monthIndex, 1);
      endDate = new Date(endFY, monthIndex + 1, 0);
    }

    this.targetForm.get('period')?.patchValue({ start: startDate, end: endDate });
  }

  getMonthIndex(monthName: string): number {
    const map: { [key: string]: number } = {
      'Jan': 0, 'January': 0,
      'Feb': 1, 'February': 1,
      'Mar': 2, 'March': 2,
      'Apr': 3, 'April': 3,
      'May': 4, 'Jun': 5, 'June': 5,
      'Jul': 6, 'July': 6,
      'Aug': 7, 'August': 7,
      'Sep': 8, 'Sept': 8, 'September': 8,
      'Oct': 9, 'October': 9,
      'Nov': 10, 'November': 10,
      'Dec': 11, 'December': 11
    };
    return map[monthName] ?? -1;
  }



  // ----------------- PRODUCTS -----------------
  toggleSelectAllProducts() {
    const allProducts = this.filteredProducts.filter(p => !p.disabled);
    const selectedProducts: any[] = this.targetForm.get('products')?.value || [];

    if (this.isAllProductsSelected()) {
      // Unselect all
      this.targetForm.get('products')?.setValue([]);
    } else {
      // Select all
      this.targetForm.get('products')?.setValue(allProducts);
    }
  }

  isAllProductsSelected(): boolean {
    const selectedProducts: any[] = this.targetForm.get('products')?.value || [];
    const allEnabledProducts = this.filteredProducts.filter(p => !p.disabled);

    return allEnabledProducts.length > 0 &&
      allEnabledProducts.every(ap =>
        selectedProducts.some(sp => sp.id === ap.id)
      );
  }


  addProduct() {
    const formValues = this.targetForm.getRawValue();

    if (!formValues.products || formValues.products.length === 0) {
      Swal.fire('Error', 'Please select at least one product.', 'error');
      return;
    }

    formValues.products.forEach((selectedProduct: any) => {
      // selectedProduct is now the full object
      if (!selectedProduct || !selectedProduct.name) return;

      const exists = this.addedProducts.some((p: any) =>
        p.name.toLowerCase() === selectedProduct.name.toLowerCase() &&
        p.country.toLowerCase() === formValues.country.toLowerCase() &&
        p.year === formValues.year &&
        p.month === formValues.month
      );

      if (!exists) {
        this.addedProducts = [
          ...this.addedProducts,
          {
            name: selectedProduct.name,
            sku: selectedProduct.sku || '',   // fallback if missing
            country: formValues.country,
            year: formValues.year,
            month: formValues.month,
            target: 1,
          }
        ];
      }
    });

    // reset selection
    this.targetForm.get('products')?.reset([]);
  }




  removeProduct(index: number) {
    // Remove only the clicked product
    this.addedProducts = this.addedProducts.filter((_, i) => i !== index);

    // ✅ Force table refresh
    this.addedProducts = [...this.addedProducts];
  }

  submitForm() {
    if (this.targetForm.invalid) {
      Swal.fire('Error', 'Please fill all required fields.', 'error');
      return;
    }

    if (this.addedProducts.length === 0) {
      Swal.fire('Error', 'Please add at least one product.', 'error');
      return;
    }

    Swal.fire({
      title: this.isEditMode ? 'Update Yearly Budget?' : 'Add Yearly Budget?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = userData.userName || 'Unknown User';
      const timestamp = Date.now();

      const formValues = this.targetForm.getRawValue();

      // ✅ Build document with products array
      const productDoc = {
        country: formValues.country,
        year: formValues.year,
        month: formValues.month,
        period: formValues.period,
        products: this.addedProducts.map(p => ({
          model: p.name,               // from table
          targetQuantity: p.target     // from input in table
        })),
        status: 'Active',
        updatedBy: username,
        updatedAt: timestamp
      };

      runInInjectionContext(this.injector, () => {
        if (this.isEditMode && this.editingDocId) {
          this.loadingService.setLoading(true);
          this.budgetService.updateBudget(this.editingDocId, productDoc)
            .then(() => Swal.fire('Updated!', 'Yearly Budget updated successfully.', 'success'))
            .then(() => this.goBack())
            .catch(() => Swal.fire('Error', 'Something went wrong while updating.', 'error'))
            .finally(() => this.loadingService.setLoading(false));
        } else {
          this.loadingService.setLoading(true);
          this.budgetService.addBudget(productDoc)
            .then(() => Swal.fire('Added!', 'Yearly Budget saved successfully.', 'success'))
            .then(() => this.goBack())
            .catch(() => Swal.fire('Error', 'Something went wrong.', 'error'))
            .finally(() => this.loadingService.setLoading(false));
        }
      });
    });
  }



  goBack() {
    this.dealer.back();
  }

  get canAddProduct(): boolean {
    const f = this.targetForm.value;
    return !!(f.country && f.year && f.month && f.products);
  }

  preventDecimal(event: KeyboardEvent) {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }

}
