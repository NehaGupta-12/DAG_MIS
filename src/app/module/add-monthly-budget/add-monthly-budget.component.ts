import {Component, ElementRef, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from "@angular/forms";
import { CommonModule, Location, NgForOf } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
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
import { ProductMasterService } from "../product-master.service";
import { MonthlyBudgetService } from "../monthly-budget.service";
import {LoadingService} from "../../Services/loading.service";

@Component({
  selector: 'app-add-monthly-budget',
  standalone: true,
  templateUrl: './add-monthly-budget.component.html',
  styleUrls: ['./add-monthly-budget.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class AddMonthlyBudgetComponent implements OnInit {

  isEditMode = false;
  editingDocId: string | null = null;
  budgetForm: FormGroup;
  displayedColumns: string[] = ['country', 'year', 'month', 'period', 'name', 'sku', 'quantity','target', 'action'];
  dataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  vehicledataSource = new MatTableDataSource<any>();

  _countriesTypes$!: Observable<string[]>;
  _yearTypes$!: Observable<string[]>;
  _monthTypes$!: Observable<string[]>;


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
    private monthlybudgetService: MonthlyBudgetService,
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
    this.budgetForm = this.fb.group({
      products: [''],
      period: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required],
      }),
      country: ['', Validators.required],
      year: ['', Validators.required],
      month: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadBudgets();

    runInInjectionContext(this.injector, () => {
      this.budgetForm.get('month')?.valueChanges.subscribe(() => this.updatePeriod());
      this.budgetForm.get('year')?.valueChanges.subscribe(() => this.budgetForm.get('period')?.reset());
    });

    this.route.queryParams.subscribe(params => {
      if (params['docId']) this.loadEditMode(params);
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

    this.budgetForm.patchValue({
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

  loadProducts() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe({
        next: (data) => {
          this.vehicledataSource.data = data;
          this._allProducts = data; // Populate the new array
          this.filteredProducts = [...data]; // Initialize the filtered list
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  loadBudgets() {
    this.loadingService.setLoading(true);  // ✅ start loader
    runInInjectionContext(this.injector, () => {
      this.monthlybudgetService.getBudgetList().subscribe({
        next: (data: any) => {
          this.dataSource.data = data;
          this.loadingService.setLoading(false); // ✅ stop loader
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  updatePeriod() {
    const yearValue = this.budgetForm.get('year')?.value;
    const monthValue = this.budgetForm.get('month')?.value;

    if (!yearValue || !monthValue) {
      this.budgetForm.get('period')?.reset();
      return;
    }

    const [startFY, endFY] = yearValue.split('-').map(Number);
    const monthIndex = this.getMonthIndex(monthValue);

    if (monthIndex === -1) {
      this.budgetForm.get('period')?.reset();
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

    this.budgetForm.get('period')?.patchValue({ start: startDate, end: endDate });
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

  addProduct() {
    const formValues = this.budgetForm.getRawValue();
    const product = this.vehicledataSource.data.find(
      p => p.name === formValues.products
    );

    if (!product) {
      Swal.fire('Error', 'Please select a valid product.', 'error');
      return;
    }

    // Normalize values
    const newName = String(product.name).trim().toLowerCase();
    const newCountry = String(formValues.country).trim().toLowerCase();
    const newYear = String(formValues.year).trim();

    // ✅ Check duplicate ONLY for the same product + country + year
    const existsGlobal = this.dataSource.data.some((p: any) =>
      String(p.name).trim().toLowerCase() === newName &&
      String(p.country).trim().toLowerCase() === newCountry &&
      String(p.year).trim() === newYear
    );

    const existsLocal = this.addedProducts.some((p: any) =>
      String(p.name).trim().toLowerCase() === newName &&
      String(p.country).trim().toLowerCase() === newCountry &&
      String(p.year).trim() === newYear
    );

    if (existsGlobal || existsLocal) {
      Swal.fire(
        'Duplicate Entry',
        `Product "${product.name}" is already added for ${formValues.country} (${formValues.year}).`,
        'warning'
      );
      return;
    }

    // ✅ Add product to local list
    this.addedProducts = [
      ...this.addedProducts,
      {
        ...product,
        country: formValues.country,
        year: formValues.year,
        month: formValues.month,
        period: formValues.period,
        quantity: 1,
        target: 1,
        __isNew: true
      }
    ];

    // Reset only the product field (so country/year stay same for multiple entries)
    this.budgetForm.get('products')?.reset();
  }




  removeProduct(index: number) {
    // Remove only the clicked product
    this.addedProducts = this.addedProducts.filter((_, i) => i !== index);

    // ✅ Force table refresh
    this.addedProducts = [...this.addedProducts];
  }

  submitForm() {
    const formValues = this.budgetForm.getRawValue();
    delete formValues.products;

    if (this.addedProducts.length === 0) {
      Swal.fire('Error', 'Please add at least one product.', 'error');
      return;
    }

    Swal.fire({
      title: this.isEditMode ? 'Update Budget?' : 'Add Budget?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = userData.userName || 'Unknown User';
      const timestamp = Date.now();

      const baseInfo = {
        country: formValues.country,
        year: formValues.year,
        month: formValues.month,
        period: formValues.period,
        status: 'Active',
        updatedBy: username,
        updatedAt: timestamp
      };

      runInInjectionContext(this.injector, () => {
        if (this.isEditMode && this.editingDocId) {
          const productToUpdate = this.addedProducts[0];
          const productDoc = {
            ...baseInfo,
            id: productToUpdate.id,
            sku: productToUpdate.sku,
            name: productToUpdate.name,
            quantity: productToUpdate.quantity,
            target: productToUpdate.target
          };

          this.loadingService.setLoading(true); // ✅ start loader
          this.monthlybudgetService.updateBudget(productToUpdate.id, productDoc)
            .then(() => Swal.fire('Updated!', 'Product updated successfully.', 'success'))
            .then(() => this.goBack())
            .catch(() => Swal.fire('Error', 'Something went wrong while updating.', 'error'))
            .finally(() => this.loadingService.setLoading(false)); // ✅ stop loader
        } else {
          this.loadingService.setLoading(true); // ✅ start loader
          Promise.all(this.addedProducts.map(p => {
            const productDoc = {
              ...baseInfo,
              sku: p.sku,
              name: p.name,
              brand: p.brand,
              model: p.model,
              variant: p.variant ?? p.varient,
              unit: p.unit,
              quantity: p.quantity,
              target: p.target
            };
            return this.monthlybudgetService.addBudget(productDoc);
          }))
            .then(() => Swal.fire('Added!', 'All products saved successfully.', 'success'))
            .then(() => this.goBack())
            .catch(() => Swal.fire('Error', 'Something went wrong.', 'error'))
            .finally(() => this.loadingService.setLoading(false)); // ✅ stop loader
        }
      });
    });
  }

  goBack() {
    this.dealer.back();
  }

  get canAddProduct(): boolean {
    const f = this.budgetForm.value;
    return !!(f.country && f.year && f.month && f.products);
  }

  preventDecimal(event: KeyboardEvent) {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }

}
