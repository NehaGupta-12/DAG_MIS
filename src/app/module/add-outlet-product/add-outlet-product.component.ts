import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
import {CommonModule, Location, NgForOf} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {AddDealerService} from "../add-dealer.service";
import {ProductMasterService} from "../product-master.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import Swal from "sweetalert2";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {OutletProductService} from "../outlet-product.service";

@Component({
  selector: 'app-add-outlet-product',
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
    MatTableModule
  ],
  providers: [
    {provide: MAT_DIALOG_DATA, useValue: {}} // ✅ Fallback
  ],
  templateUrl: './add-outlet-product.component.html',
  standalone: true,
  styleUrl: './add-outlet-product.component.scss'
})
export class AddOutletProductComponent implements OnInit {

  isEditMode: boolean = false;
  grnForm: FormGroup;
  displayedColumns: string[] = ['name', 'brand', 'model', 'variant', 'unit', 'openingStock', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  outletProducts: any[] = [];
  dealers: any[] = [];
  allDealers: any[] = [];

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(private fb: UntypedFormBuilder,
              private dealer: Location,
              private outletProductService: OutletProductService,
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              private addDealerService: AddDealerService,
              private productService:ProductMasterService,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // this.initForm();
    this.isEditMode = !!data?.id;
    this.grnForm = this.fb.group({
      products: ['', [Validators.required]],
      dealerOutlet: ['', [Validators.required]],
      remark: ['', [Validators.required]],
      // items: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.loadOutletProduct();
    this.DealerList();
    this.productList();

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);
        this.grnForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          remark: rowData.remark,
        });
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;

          // Disable dealerOutlet so user cannot change it
          this.grnForm.get('dealerOutlet')?.disable();
        }
        // if (rowData.items && Array.isArray(rowData.items)) {
        //   this.addedProducts = rowData.items.map((item: any) => ({
        //     ...item,
        //     varient: item.varient ?? item.variant,
        //     openingStock: item.openingStock ?? 1,
        //     __isNew: false,
        //   }));
        // }
      }
    });
  }


  loadOutletProduct() {
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductList().subscribe((data) => {
        this.outletProducts = data; // save for filtering
        this.dataSource.data = data;
        console.log("Outlet Products:", this.outletProducts);

        // After loading products, load dealer list
        this.DealerList();
      });
    });
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data) => {
        this.allDealers = data; // <— save unfiltered

        const usedOutlets = this.outletProducts.map((p) => (p.dealerOutlet || '').trim());
        const filtered = data.filter((dealer: any) => !usedOutlets.includes((dealer.name || '').trim()));

        // In edit mode, ensure the currently selected dealer is still in the dropdown
        const currentName = (this.grnForm.get('dealerOutlet')?.value || '').trim();
        if (this.isEditMode && currentName) {
          const alreadyIn = filtered.some((d: any) => (d.name || '').trim() === currentName);
          if (!alreadyIn) {
            const currentDealer = this.allDealers.find((d: any) => (d.name || '').trim() === currentName);
            if (currentDealer) filtered.unshift(currentDealer);
          }
        }

        this.dealers = filtered;
        this.dealerdataSource.data = this.dealers;
        console.log("Filtered Dealers:", this.dealerdataSource.data);
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
    const formValid =
      !!this.grnForm.get('dealerOutlet')?.valid &&
      !!this.grnForm.get('remark')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(
      p => p.openingStock && p.openingStock > 0
    );

    return formValid && hasProducts && allQuantitiesValid;
  }


  addProduct() {
    const selectedProductName = this.grnForm.get('products')?.value;
    if (!selectedProductName) {
      Swal.fire('Error', 'Please select a product before adding.', 'error');
      return;
    }

    const product = this.vehicledataSource.data.find(p => p.name === selectedProductName);
    if (product) {
      const exists = this.addedProducts.some(p => p.id === product.id);
      if (exists) {
        Swal.fire('Info', 'This product is already added.', 'info');
        return;
      }

      // mark as new and keep sku blank so table won’t show junk
      this.addedProducts = [
        ...this.addedProducts,
        { ...product, openingStock: 1, sku: '', __isNew: true } // <— HERE
      ];
    }

    this.grnForm.get('products')?.reset();
  }




  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
  }


  async submitForm() {
    try {
      const formValues = this.grnForm.getRawValue();
      delete formValues.products;  // Remove 'products' from the form values

      const isMainFormValid =
        this.grnForm.get('dealerOutlet')?.valid &&
        this.grnForm.get('remark')?.valid;

      if (!isMainFormValid || this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please fill all required fields and add at least one product.', 'error');
        return;
      }

      // Confirmation prompt before submitting
      const result = await Swal.fire({
        title: this.isEditMode ? 'Update GRN Details?' : 'Add GRN Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      if (!result.isConfirmed) return;

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = userData.userName || 'Unknown User';
      const timestamp = Date.now();

      // Get dealerId based on selected dealer
      const selectedName = (formValues.dealerOutlet || '').trim();
      const selectedDealer = this.allDealers.find((d: any) => (d.name || '').trim() === selectedName) ||
        this.dealers.find((d: any) => (d.name || '').trim() === selectedName);
      const dealerId = selectedDealer?.id ?? '';

      const payload = {
        ...formValues,
        dealerId,
        createdAt: timestamp,
        createdBy: username,
      };

      // Use runInInjectionContext to execute outside of Angular lifecycle
      runInInjectionContext(this.injector, async () => {
        // Loop through the added products and add them to Firestore
        for (let i = 0; i < this.addedProducts.length; i++) {
          const product = this.addedProducts[i];

          // Determine if this product is new or not
          const isNew = product.__isNew === true || !product.sku || (dealerId && !String(product.sku).includes(dealerId));

          let outSku = product.sku ?? '';
          if (!this.isEditMode) {
            outSku = `${product.id ?? ''}${dealerId}`;
          } else {
            if (isNew) outSku = `${product.id ?? ''}${dealerId}`;
          }

          const productData = {
            ...payload,
            sku: outSku,
            name: product.name ?? '',
            brand: product.brand ?? '',
            model: product.model ?? '',
            variant: product.variant ?? product.varient ?? '',
            unit: product.unit ?? '',
            openingStock: product.openingStock ?? 0,
          };

          await this.outletProductService.addOutletProduct({
            ...productData,
            outletId: dealerId  // Add dealer-specific sub-collection
          });
        }

        Swal.fire('Added!', 'GRN Details added successfully.', 'success');
        this.goBack();
      });

    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }


  goBack() {
    this.dealer.back();
  }

}
