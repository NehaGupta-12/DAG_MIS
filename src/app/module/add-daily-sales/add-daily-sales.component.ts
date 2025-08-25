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
import {ActivatedRoute} from "@angular/router";
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

      // ✅ Find selected vehicle from product list
      const selectedProduct = this.vehicledataSource.data.find((p: any) => p.id === formData.vehicle);

      if (!selectedProduct) {
        Swal.fire('Error', 'Please select a valid vehicle.', 'error');
        return;
      }

      // ✅ Build row object for the table
      const productRow = {
        id: selectedProduct.id,
        sku: selectedProduct.sku,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        model: selectedProduct.model,
        variant: selectedProduct.varient || selectedProduct.variant, // adjust key spelling
        unit: selectedProduct.unit,
        quantity: 1 // default quantity
      };

      // ✅ Push to table data
      const currentData = this.dataSource.data;
      this.dataSource.data = [...currentData, productRow];  // reassign so table updates

      console.log('[addProduct] Added product row:', productRow);

      Swal.fire('Added!', 'Product added to daily sales list.', 'success');
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
