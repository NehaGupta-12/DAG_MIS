import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {
  FormBuilder,
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
import {Location, NgFor, NgIf} from "@angular/common";
import Swal from "sweetalert2";
import {ActivatedRoute, Router} from "@angular/router";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DailySalesService} from "../daily-sales.service";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {AddDealerService} from "../add-dealer.service";
import {ProductMasterService} from "../product-master.service";

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
    NgIf,
    NgFor,
  ],
  providers: [
    {provide: MAT_DIALOG_DATA, useValue: {}}
  ],
  templateUrl: './add-daily-sales.component.html',
  standalone: true,
  styleUrl: './add-daily-sales.component.scss'
})
export class AddDailySalesComponent implements OnInit {

  isEditMode: boolean = false;
  dailySalesForm!: FormGroup;

  // Table
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'variant', 'unit', 'quantity', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  // Data
  dealers: any[] = [];
  products: any[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private location: Location,
    private dailySalesService: DailySalesService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private addDealerService: AddDealerService,
    private productService:ProductMasterService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isEditMode = !!data?.id;
  }


  ngOnInit() {
    this.DealerList()
    this.productList()
    console.log('[ngOnInit] Initializing AddDailySalesComponent');

    this.dailySalesForm = this.fb.group({
      dealerOutlet: ['', Validators.required],
      vehicle: ['', Validators.required],
      division: ['', Validators.required],
      country: ['', Validators.required],
      town: ['', Validators.required],
      products: this.fb.array([])   // <-- NEW
    });

    console.log('[ngOnInit] Form initialized:', this.dailySalesForm.value);

    // 🔹 Load dealers into dropdown
    console.log('[ngOnInit] Fetching dealers...');
    this.dailySalesService.getDealers().subscribe({
      next: (dealers: any[]) => {
        console.log('[ngOnInit] Dealers fetched:', dealers);
        this.dealers = dealers;
      },
      error: (err) => {
        console.error('[ngOnInit] Error fetching dealers:', err);
      }
    });


    // 🔹 Edit mode handling
    this.route.queryParams.subscribe(params => {
      console.log('[ngOnInit] Query params:', params);
      if (params['data']) {
        try {
          const rowData = JSON.parse(params['data']);
          console.log('[ngOnInit] Parsed rowData:', rowData);
          this.dailySalesForm.patchValue(rowData);

          if (rowData.id) {
            console.log('[ngOnInit] Edit mode enabled for ID:', rowData.id);
            this.isEditMode = true;
            this.data = rowData;
          }
        } catch (e) {
          console.error('[ngOnInit] Failed to parse query param data:', e);
        }
      }
    });

  }

  // ✅ Quantity update handler (bind in HTML)
  updateQuantity(row: any, value: number) {
    row.quantity = value;
  }


  submitDailySales() {
    if (this.dailySalesForm.invalid || this.dataSource.data.length === 0) {
      Swal.fire('Error', 'Please fill required fields and add at least one product.', 'error');
      return;
    }

    const formData = this.dailySalesForm.value;

    // 🔹 Prepare full sale object
    const saleData = {
      dealer: formData.dealer,
      location: formData.location,
      customerType: formData.customerType,
      createdAt: new Date().toISOString(),
      products: this.dataSource.data.map((p: any) => ({
        productId: p.productId,
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        model: p.model,
        variant: p.variant,
        unit: p.unit,
        quantity: p.quantity
      })),
      productCount: this.dataSource.data.length
    };

    // 🔹 Save in Firebase
    this.dailySalesService.addDailySales(saleData)
      .then(() => {
        Swal.fire('Success', 'Daily Sales saved permanently in Firebase.', 'success');
        this.router.navigate(['/module/daily-sales-list']);
      })
      .catch((err: any) => {
        console.error('Error saving Daily Sales:', err);
        Swal.fire('Error', 'Could not save Daily Sales.', 'error');
      });
  }









//master-outlets/dealer
  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data) => {
        this.dealerdataSource.data = data;
        console.log(this.dealerdataSource.data)
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

  onDealerChange(event: any) {
    const dealerId = event.value;
    const dealer = this.dealerdataSource.data.find((d: any) => d.id === dealerId);

    if (dealer) {
      console.log('[onDealerChange] Selected dealer:', dealer);
      this.dailySalesForm.patchValue({
        division: dealer.division || '',
        country: dealer.country || '',
        town: dealer.town || ''
      });
    }
  }



  addProduct() {
    if (this.dailySalesForm.valid) {
      const formData = this.dailySalesForm.value;

      const selectedProduct = this.vehicledataSource.data.find((p: any) => p.id === formData.vehicle);

      if (!selectedProduct) {
        Swal.fire('Error', 'Please select a valid vehicle.', 'error');
        return;
      }

      // Check if product already exists in table
      const exists = this.dataSource.data.find(p => p.productId === selectedProduct.id);
      if (exists) {
        Swal.fire('Info', 'This product is already added.', 'info');
        return;
      }

      const productRow = {
        id: Math.random().toString(36).substr(2, 9), // Temporary unique id for table
        productId: selectedProduct.id,
        sku: selectedProduct.sku,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        model: selectedProduct.model,
        variant: selectedProduct.varient || selectedProduct.variant,
        unit: selectedProduct.unit,
        quantity: 1,
        createdAt: new Date().toISOString()
      };

      // ✅ Only update local table, saving happens on Submit
      this.dataSource.data = [...this.dataSource.data, productRow];
      console.log('[addProduct] Product added locally:', productRow);

    } else {
      Swal.fire('Error', 'Please fill required fields first.', 'error');
    }
  }




  deleteProduct(row: any) {
    this.dataSource.data = this.dataSource.data.filter((p: any) => p.id !== row.id);
    Swal.fire('Deleted!', 'Product removed from daily sales list.', 'success');
  }



  goBack() {
    this.location.back();
  }
}
