import {Component, EnvironmentInjector, OnInit, runInInjectionContext} from '@angular/core';
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
import {AngularFirestore} from "@angular/fire/compat/firestore";

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
editProductId: string = '';
data:any ={}
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
              private readonly  mFirestore:AngularFirestore,
  ) {
    // this.initForm();
    this.route.queryParams.subscribe(params => {
      this.data =JSON.parse( params['data']);
      this.isEditMode = this.data?.id!= null ;
      console.log("Edit Mode:", this.isEditMode, "Data:", this.data);
      // alert(this.data.id)
      this.editProductId  = this.data?.id || '';

    })

    this.grnForm = this.fb.group({
      products: ['', [Validators.required]],
      dealerOutlet: ['', [Validators.required]],
      remark: ['', [Validators.required]],
      // items: this.fb.array([]),
    });
  }

  ngOnInit() {
    // this.changeVariant()

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
          products: rowData.name   // 🟢 patch the product dropdown
        });

        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;

          // Disable dealerOutlet and products so user cannot change them
          this.grnForm.get('dealerOutlet')?.disable();
          this.grnForm.get('products')?.disable();   // 🟢 disable product field

          // 🔑 Only show the selected product in addedProducts
          this.addedProducts = [{
            ...rowData,
            varient: rowData.varient ?? rowData.variant,
            openingStock: rowData.openingStock ?? 1,
            __isNew: false
          }];

          console.log('Product restored for edit:', this.addedProducts);
        }
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
        this.allDealers = data;       // store all dealers
        this.dealers = data;          // directly assign without filtering
        this.dealerdataSource.data = this.dealers;
        console.log("All Dealers:", this.dealerdataSource.data);
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
    // Check dealerOutlet value, even if disabled
    const dealerValue = this.grnForm.getRawValue().dealerOutlet;
    const remarkValid = !!this.grnForm.get('remark')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(
      p => p.openingStock && p.openingStock > 0
    );

    return !!dealerValue && remarkValid && hasProducts && allQuantitiesValid;
  }



  addProduct() {
    // if (!this.isEditMode ) {
    //   Swal.fire('Info', 'You can only add one product in create mode.', 'info');
    //   return;
    // }

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

      this.addedProducts = [
        ...this.addedProducts,
        { ...product, openingStock: 1, __isNew: true }
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

      // ✅ Validate form + products
      const isMainFormValid =
        !!formValues.dealerOutlet &&   // must have dealer selected
        this.grnForm.get('remark')?.valid;

      if (!isMainFormValid || this.addedProducts.length === 0) {
        Swal.fire('Error', 'Please fill all required fields and add at least one product.', 'error');
        return;
      }

      // ✅ Confirm before save/update
      const result = await Swal.fire({
        title: this.isEditMode ? 'Update GRN Details?' : 'Add GRN Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      if (!result.isConfirmed) return;

      // ✅ Get user info
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = userData.userName || 'Unknown User';
      const timestamp = Date.now();

      // ✅ Find dealerId based on dealer name
      const selectedName = (formValues.dealerOutlet || '').trim();
      const selectedDealer =
        this.allDealers.find((d: any) => (d.name || '').trim() === selectedName) ||
        this.dealers.find((d: any) => (d.name || '').trim() === selectedName);
      const dealerId = selectedDealer?.id ?? '';

      const basePayload = {
        ...formValues,
        dealerId,
        createdAt: timestamp,
        createdBy: username,
      };

      // ✅ Process products
      runInInjectionContext(this.injector, async () => {
      const productsData:any = []
        for (const product of this.addedProducts) {
          const mProduct = {
            ...basePayload,
            sku: product.sku ?? '',
            name: product.name ?? '',
            brand: product.brand ?? '',
            model: product.model ?? '',
            variant: product.variant ?? product.varient ?? '',
            unit: product.unit ?? '',
            openingStock: product.openingStock ?? 0,
            quantity: product.openingStock ?? 0,
          };
          productsData.push(mProduct)
        }
          // FOR EDIT MODE
        // alert(this.editProductId)

          if (this.isEditMode && this.editProductId) {
            await this.outletProductService.updateOutletProduct(
              dealerId,
            this.editProductId,
              productsData[0]  // only one product in edit mode
            );
          }

          // FOR ADD MODE
        else {

        if(!this.isEditMode)    productsData.forEach((product: any) => {
              this.outletProductService.addOutletProduct({
                ...product,
                outletId: dealerId
              });
          this.outletProductService.addInventoryProduct({
            ...product,
            outletId: dealerId
          });
            })
          }
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          `GRN Details ${this.isEditMode ? 'updated' : 'added'} successfully.`,
          'success'
        );
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

  private changeVariant() {
    runInInjectionContext(this.injector, async () => {
      this.mFirestore.collection('product').get().subscribe(res => {
        res.forEach(doc => {
          const data = doc.data();
          // @ts-expect-error: Firestore data may have 'varient' instead of 'variant'
          this.mFirestore.collection('product').doc(doc.id).update({ variant: data?.varient }).then(r => {
            console.log(r);
            console.log('product updated');
          });
        });
      });
    });
  }
}
