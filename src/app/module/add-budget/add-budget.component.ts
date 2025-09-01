import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
  MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {CommonModule, Location, NgForOf} from "@angular/common";
import {OutletProductService} from "../outlet-product.service";
import {ActivatedRoute} from "@angular/router";
import {AddDealerService} from "../add-dealer.service";
import {ProductMasterService} from "../product-master.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import Swal from "sweetalert2";
import {MatButton, MatButtonModule} from "@angular/material/button";
import { MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from "@angular/material/datepicker";
import {map} from "rxjs/operators";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {Observable} from "rxjs";
import {GrnService} from "../grn.service";
import {BudgetService} from "../budget.service";

@Component({
  selector: 'app-add-budget',
  imports: [
    FormsModule,
    MatButton,
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
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    {provide: MAT_DIALOG_DATA, useValue: {}}
  ],
  templateUrl: './add-budget.component.html',
  styleUrl: './add-budget.component.scss'
})
export class AddBudgetComponent implements OnInit {

  isEditMode: boolean = false;
  budgetForm: FormGroup;
  displayedColumns: string[] = ['country', 'year', 'period', 'name', 'sku', 'quantity', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  outletProducts: any[] = [];
  dealers: any[] = [];
  allDealers: any[] = [];
  _countriesTypes$!: Observable<string[]>;
  _yearTypes$!: Observable<string[]>;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(private fb: UntypedFormBuilder,
              private dealer: Location,
              private productMasterService: ProductMasterService,
              private outletProductService: OutletProductService,
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              private addDealerService: AddDealerService,
              private productService:ProductMasterService,
              private mDatabase: AngularFireDatabase,
              private budgetService: BudgetService,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
    this._yearTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Year')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
    // this.initForm();
    this.isEditMode = !!data?.id;
    this.budgetForm = this.fb.group({
      products: ['', [Validators.required]],
      period: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required],
      }),
      country: ['', [Validators.required]],
      year: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadOutletProduct();
    this.productList();

    // 🔹 Watch for year selection change
    this.budgetForm.get('year')?.valueChanges.subscribe((yearValue: string) => {
      if (yearValue) {
        this.setFinancialYearDates(yearValue);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // Patch ALL form fields
        this.budgetForm.patchValue({
          country: rowData.country,
          year: rowData.year,
          period: {
            start: rowData.period?.start ? new Date(rowData.period.start.seconds * 1000) : null,
            end: rowData.period?.end ? new Date(rowData.period.end.seconds * 1000) : null,
          },
          products: rowData.name
        });

        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;

          // disable product dropdown when editing
          this.budgetForm.get('products')?.disable();

          // push into addedProducts with period patched
          this.addedProducts = [{
            ...rowData,
            varient: rowData.varient ?? rowData.variant,
            quantity: rowData.quantity ?? rowData.openingStock ?? 1,
            period: {
              start: rowData.period?.start ? new Date(rowData.period.start.seconds * 1000) : null,
              end: rowData.period?.end ? new Date(rowData.period.end.seconds * 1000) : null,
            },
            __isNew: false
          }];
        }

      }
    });

  }


  setFinancialYearDates(yearValue: string) {
    const [startYear, endYear] = yearValue.split('-').map(Number);

    if (startYear && endYear) {
      const startDate = new Date(startYear, 3, 1);   // 01-Apr-startYear
      const endDate = new Date(endYear, 2, 31);      // 31-Mar-endYear

      this.budgetForm.get('period')?.patchValue({
        start: startDate,
        end: endDate
      });
    }
  }






  loadOutletProduct() {
    runInInjectionContext(this.injector, () => {
      this.productMasterService.getProductList().subscribe((data) => {
        this.outletProducts = data; // save for filtering
        this.dataSource.data = data;
      });
    });
  }

  //product
  productList() {
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe((data) => {
        this.vehicledataSource.data = data;
        console.log(this.vehicledataSource.data)
      });
    });
  }

  isSubmitEnabled(): boolean {
    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(
      p => p.quantity && p.quantity > 0   // use quantity, not openingStock
    );

    return hasProducts && allQuantitiesValid;
  }



  addProduct() {
    const selectedProductName = this.budgetForm.get('products')?.value;
    if (!selectedProductName) {
      Swal.fire('Error', 'Please select a product before adding.', 'error');
      return;
    }

    const product = this.vehicledataSource.data.find(p => p.name === selectedProductName);
    if (product) {
      // check by name instead of id
      const exists = this.addedProducts.some(p => p.name === product.name);
      if (exists) {
        Swal.fire('Info', 'This product is already added.', 'info');
        return;
      }

      const formValues = this.budgetForm.getRawValue();

      this.addedProducts = [
        ...this.addedProducts,
        {
          ...product,
          country: formValues.country,
          year: formValues.year,
          period: formValues.period,
          quantity: 1,   // default
          __isNew: true
        }
      ];
    }

    // reset product dropdown so user can pick another
    this.budgetForm.get('products')?.setValue(null);
    this.budgetForm.get('products')?.markAsPristine();
  }



  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
  }


  submitForm() {
    try {
      const formValues = this.budgetForm.getRawValue();
      delete formValues.products; // remove dropdown value

      if (this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please add at least one product.', 'error');
        return;
      }

      Swal.fire({
        title: this.isEditMode ? 'Update Budget?' : 'Add Budget?',
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

            // 🔹 Prepare base info (shared for all products)
            const baseInfo = {
              country: formValues.country,
              year: formValues.year,
              period: formValues.period,
              status: 'Active',
              createBy: username,
              createdAt: timestamp
            };

            // 🔹 Create one document per product
            const createPromises = this.addedProducts.map(p => {
              const productDoc = {
                ...baseInfo,
                id: p.id ?? '',
                sku: p.sku ?? '',
                name: p.name ?? '',
                brand: p.brand ?? '',
                model: p.model ?? '',
                variant: p.variant ?? p.varient ?? '',
                unit: p.unit ?? '',
                quantity: p.quantity ?? 0
              };

              return runInInjectionContext(this.injector, () =>
                this.budgetService.addBudget(productDoc)
              );
            });

            Promise.all(createPromises)
              .then(() => {
                Swal.fire('Added!', 'All products saved as separate documents.', 'success');
                this.goBack();
              })
              .catch(error => {
                console.error('Error adding multiple products:', error);
                Swal.fire('Error', 'Something went wrong.', 'error');
              });

          } catch (innerErr) {
            console.error('Unexpected error during submission:', innerErr);
            Swal.fire('Error', 'Unexpected issue occurred.', 'error');
          }
        }
      });
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }




  goBack() {
    this.dealer.back();
  }

  get canAddProduct(): boolean {
    return !!(
      this.budgetForm.get('country')?.value &&
      this.budgetForm.get('year')?.value &&
      this.budgetForm.get('period')?.value &&
      this.budgetForm.get('products')?.value
    );
  }


}
