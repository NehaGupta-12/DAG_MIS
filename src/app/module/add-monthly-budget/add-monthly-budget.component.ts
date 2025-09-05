import { Component, EnvironmentInjector, OnInit, runInInjectionContext } from '@angular/core';
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
  editingDocId: string | null = null; // track edited product
  budgetForm: FormGroup;
  displayedColumns: string[] = ['country', 'year', 'month', 'period', 'name', 'sku', 'quantity', 'action'];
  dataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  vehicledataSource = new MatTableDataSource<any>();

  _countriesTypes$!: Observable<string[]>;
  _yearTypes$!: Observable<string[]>;
  _monthTypes$!: Observable<string[]>;

  constructor(
    private fb: UntypedFormBuilder,
    private dealer: Location,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductMasterService,
    private mDatabase: AngularFireDatabase,
    private monthlybudgetService: MonthlyBudgetService,
    private injector: EnvironmentInjector,
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

    // Form
    // Remove required validator for 'products'
    this.budgetForm = this.fb.group({
      products: [''], // <-- no Validators.required
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
      country: params['country'],
      year: params['year'],
      month: params['month'],
      period: periodObj
    }];
  }

  loadProducts() {
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe(data => this.vehicledataSource.data = data);
    });
  }

  loadBudgets() {
    runInInjectionContext(this.injector, () => {
      this.monthlybudgetService.getBudgetList().subscribe((data: any) => this.dataSource.data = data);
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
      console.error('Invalid month name:', monthValue);
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
      'May': 4,
      'Jun': 5, 'June': 5,
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
    const product = this.vehicledataSource.data.find(p => p.name === formValues.products);

    if (!product) {
      Swal.fire('Error', 'Please select a valid product.', 'error');
      return;
    }

    const exists = this.addedProducts.some(
      p =>
        p.name === product.name &&
        p.country === formValues.country &&
        p.year === formValues.year &&
        p.month === formValues.month &&
        p.period?.start?.toString() === formValues.period?.start?.toString() &&
        p.period?.end?.toString() === formValues.period?.end?.toString()
    );

    if (exists) {
      Swal.fire('Info', `Product "${product.name}" already added for this country/year/month.`, 'info');
      return;
    }

    this.addedProducts = [
      ...this.addedProducts,
      {
        ...product,
        country: formValues.country,
        year: formValues.year,
        month: formValues.month,
        period: formValues.period,
        quantity: 1,
        __isNew: true
      }
    ];

    this.budgetForm.get('products')?.reset();
  }

  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
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
            quantity: productToUpdate.quantity
          };
          this.monthlybudgetService.updateBudget(productToUpdate.id, productDoc)
            .then(() => Swal.fire('Updated!', 'Product updated successfully.', 'success'))
            .then(() => this.goBack())
            .catch(() => Swal.fire('Error', 'Something went wrong while updating.', 'error'));
        } else {
          Promise.all(this.addedProducts.map(p => {
            const productDoc = {
              ...baseInfo,
              sku: p.sku,
              name: p.name,
              brand: p.brand,
              model: p.model,
              variant: p.variant ?? p.varient,
              unit: p.unit,
              quantity: p.quantity
            };
            return this.monthlybudgetService.addBudget(productDoc);
          }))
            .then(() => Swal.fire('Added!', 'All products saved successfully.', 'success'))
            .then(() => this.goBack())
            .catch(() => Swal.fire('Error', 'Something went wrong.', 'error'));
        }
      });
    });
  }

  goBack() {
    this.dealer.back();
  }

  // Update canAddProduct only for Add button
  get canAddProduct(): boolean {
    const f = this.budgetForm.value;
    return !!(f.country && f.year && f.month && f.products);
  }
}
