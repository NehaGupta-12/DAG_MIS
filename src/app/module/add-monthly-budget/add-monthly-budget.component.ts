import { Component, EnvironmentInjector, OnInit, runInInjectionContext } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule, Location, NgForOf } from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
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
import {MonthlyBudgetService} from "../monthly-budget.service";

@Component({
  selector: 'app-add-monthly-budget',
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
  ],
  templateUrl: './add-monthly-budget.component.html',
  standalone: true,
})
export class AddMonthlyBudgetComponent implements OnInit {

  isEditMode: boolean = false;
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
    private productService: ProductMasterService,
    private mDatabase: AngularFireDatabase,
    private monthlybudgetService: MonthlyBudgetService,
    private injector: EnvironmentInjector,
    private router: Router   // 👈 Add this
  ) {
    // Fetch Countries, Years, Months
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

    // Form initialization
    this.budgetForm = this.fb.group({
      products: ['', [Validators.required]],
      period: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required],
      }),
      country: ['', [Validators.required]],
      year: ['', [Validators.required]],
      month: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadBudgets();

    runInInjectionContext(this.injector, () => {
      this.budgetForm.get('month')?.valueChanges.subscribe(() => this.updatePeriod());
    });

    runInInjectionContext(this.injector, () => {
      this.budgetForm.get('year')?.valueChanges.subscribe(() => {
        this.budgetForm.get('period')?.reset();
      });
    });

    this.route.queryParams.subscribe(params => {
      if (params['docId']) this.loadEditMode(params);
    });
  }



  private loadEditMode(params: any) {
    this.isEditMode = true;
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

    // Months Apr (3) - Dec (11) → startFY, Jan (0) - Mar (2) → endFY
    if (monthIndex >= 3) {
      startDate = new Date(startFY, monthIndex, 1);
      endDate = new Date(startFY, monthIndex + 1, 0);
    } else {
      startDate = new Date(endFY, monthIndex, 1);
      endDate = new Date(endFY, monthIndex + 1, 0);
    }

    this.budgetForm.get('period')?.patchValue({
      start: startDate,
      end: endDate
    });
  }

  /** Map DB month string → JS index (0 = Jan … 11 = Dec) */
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




  // getMonthIndex(monthName: string): number {
  //   const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  //   return months.indexOf(monthName); // 0-based
  // }



  addProduct() {
    console.log(" addProduct() called");

    const formValues = this.budgetForm.getRawValue();
    console.log(" Form Values:", formValues);

    const product = this.vehicledataSource.data.find(p => p.name === formValues.products);


    if (!product) {
      Swal.fire('Error', 'Please select a valid product.', 'error');
      console.error(" No product found for:", formValues.products);
      return;
    }

    const exists = this.addedProducts.some(
      p => p.name === product.name && p.country === formValues.country && p.year === formValues.year
    );
    console.log(" Already Exists Check:", exists);

    if (exists) {
      Swal.fire('Info', `Product "${product.name}" already exists for ${formValues.country} (${formValues.year}).`, 'info');
      return;
    }

    const newProduct = {
      ...product,
      country: formValues.country,
      year: formValues.year,
      month: formValues.month,
      period: formValues.period,
      quantity: 1,
      __isNew: true
    };

    this.addedProducts.push(newProduct);
    console.log(" Product Added to Table:", newProduct);
    console.log(" Updated addedProducts Array:", this.addedProducts);

    this.budgetForm.get('products')?.reset();
  }


  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
  }

  submitForm() {

    console.log(" submitForm() called", this.addedProducts);
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
    }).then(result => {
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

      if (this.isEditMode) {
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
          .then(() => this.router.navigate(['/monthly-budget-list'])) // 👈 redirect
          .catch(() => Swal.fire('Error', 'Something went wrong while updating.', 'error'));

      } else {
        Promise.all(
          this.addedProducts.map(p => {
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
          })
        )
          .then(() => Swal.fire('Added!', 'All products saved successfully.', 'success'))
          .then(() => this.router.navigate(['/monthly-budget-list'])) // 👈 redirect
          .catch(() => Swal.fire('Error', 'Something went wrong.', 'error'));
      }
    });
  }


  goBack() {
    this.dealer.back();
  }

  get canAddProduct(): boolean {
    const f = this.budgetForm.value;
    return !!(f.country && f.year && f.month && f.products);
  }
}
