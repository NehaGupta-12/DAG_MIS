import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
import { CommonModule, Location, NgForOf } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
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
  ]
})
export class AddBudgetComponent implements OnInit {

  isEditMode: boolean = false;
  budgetForm: FormGroup;
  displayedColumns: string[] = ['country', 'year', 'period', 'name', 'sku', 'quantity', 'action'];
  dataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  vehicledataSource = new MatTableDataSource<any>();

  _countriesTypes$!: Observable<string[]>;
  _yearTypes$!: Observable<string[]>;

  constructor(
    private fb: UntypedFormBuilder,
    private dealer: Location,
    private route: ActivatedRoute,
    private productService: ProductMasterService,
    private mDatabase: AngularFireDatabase,
    private budgetService: BudgetService,
    private injector: EnvironmentInjector,
  ) {
    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._yearTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Year')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this.isEditMode = false;

    this.budgetForm = this.fb.group({
      products: [''],
      period: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required],
      }),
      country: ['', [Validators.required]],
      year: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadBudgets();
    runInInjectionContext(this.injector, () => {
    this.budgetForm.get('year')?.valueChanges.subscribe((yearValue: string) => {
      if (yearValue) this.setFinancialYearDates(yearValue);
    });
    });

    this.route.queryParams.subscribe(params => {
      if (params['docId']) {
        this.isEditMode = true;
        const periodObj = params['period'] ? JSON.parse(params['period']) : null;

        this.budgetForm.patchValue({
          country: params['country'] || '',
          year: params['year'] || '',
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
          period: periodObj
        }];
      }
    });
  }

  setFinancialYearDates(yearValue: string) {
    const [startYear, endYear] = yearValue.split('-').map(Number);
    if (startYear && endYear) {
      this.budgetForm.get('period')?.patchValue({
        start: new Date(startYear, 3, 1),
        end: new Date(endYear, 2, 31)
      });
    }
  }

  loadProducts() {
    runInInjectionContext(this.injector, () => {
    this.productService.getProductList().subscribe((data) => {
      this.vehicledataSource.data = data;
    });
    });
  }

  loadBudgets() {
    runInInjectionContext(this.injector, () => {
      this.budgetService.getBudgetList().subscribe((data: any) => {
        this.dataSource.data = data;
      });
      });
  }

  addProduct() {
    const formValues = this.budgetForm.getRawValue();
    const product = this.vehicledataSource.data.find(p => p.name === formValues.products);

    if (!product) {
      Swal.fire('Error', 'Please select a valid product.', 'error');
      return;
    }

    // 🔹 Normalize values
    const newName = String(product.name).trim().toLowerCase();
    const newCountry = String(formValues.country).trim().toLowerCase();
    const newYear = String(formValues.year).trim();

    // 🔹 1. Check duplicate in locally added products
    const existsLocal = this.addedProducts.some(p =>
      String(p.name).trim().toLowerCase() === newName &&
      String(p.country).trim().toLowerCase() === newCountry &&
      String(p.year).trim() === newYear
    );

    // 🔹 2. Check duplicate in already saved budgets (Firestore list)
    const existsDb = this.dataSource.data.some((p: any) =>
      String(p.name).trim().toLowerCase() === newName &&
      String(p.country).trim().toLowerCase() === newCountry &&
      String(p.year).trim() === newYear
    );

    if (existsLocal || existsDb) {
      Swal.fire(
        'Duplicate Entry',
        `Product "${product.name}" is already added for ${formValues.country} (${formValues.year}).
       Please update the existing entry instead of adding again.`,
        'warning'
      );
      return;
    }

    // ✅ Add new product
    this.addedProducts = [
      ...this.addedProducts,
      {
        ...product,
        country: formValues.country,
        year: formValues.year,
        period: formValues.period,
        quantity: 1,
        __isNew: true
      }
    ];

    // Reset product selection
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
        runInInjectionContext(this.injector, () => {
          this.budgetService.updateBudget(productToUpdate.id, productDoc)
            .then(() => Swal.fire('Updated!', 'Product updated successfully.', 'success'))
            .then(() => this.goBack())
            .catch(() => Swal.fire('Error', 'Something went wrong while updating.', 'error'));
        });
      } else {
        runInInjectionContext(this.injector, () => {
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
          return this.budgetService.addBudget(productDoc);
        }))
          .then(() => Swal.fire('Added!', 'All products saved successfully.', 'success'))
          .then(() => this.goBack())
          .catch(() => Swal.fire('Error', 'Something went wrong.', 'error'));
      })
      }
    });
  }

  goBack() {
    this.dealer.back();
  }

  get canAddProduct(): boolean {
    const f = this.budgetForm.value;
    return !!(f.country && f.year && f.period && f.products);
  }

  preventDecimal(event: KeyboardEvent) {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }

}
