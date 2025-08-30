import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {
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
import {CommonModule, Location, NgForOf} from "@angular/common";
import {GrnService} from "../grn.service";
import {ActivatedRoute} from "@angular/router";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import Swal from "sweetalert2";
import {AddDealerService} from "../add-dealer.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
  MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {ProductMasterService} from "../product-master.service";
import {OutletProductService} from "../outlet-product.service";

@Component({
  selector: 'app-add-grn',
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
  templateUrl: './add-grn.component.html',
  standalone: true,
  styleUrl: './add-grn.component.scss'
})
export class AddGRNComponent implements OnInit{

  isEditMode: boolean = false;
  grnForm: FormGroup;
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'variant', 'unit', 'quantity', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  dataSource = new MatTableDataSource<any>();

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(private fb: UntypedFormBuilder,
              private dealer: Location,
              private grnService: GrnService,
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              private addDealerService: AddDealerService,
              private productService:ProductMasterService,
              private outletProductService: OutletProductService,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // this.initForm();
    this.isEditMode = !!data?.id;
    this.grnForm = this.fb.group({
      products: ['', [Validators.required]],
      // openingStock: ['', [Validators.required]],
      // grnQuantity: ['', [Validators.required]],
      typeOfGrn: ['', [Validators.required]],
      dealerOutlet: ['', [Validators.required]],
      items: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.DealerList();
    this.productList();
    this.loadOutletProduct();

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // ✅ Patch simple fields
        this.grnForm.patchValue({
          dealerOutlet: rowData.dealerOutlet,
          // openingStock: rowData.openingStock,
          typeOfGrn: rowData.typeOfGrn
        });

        // ✅ If there are items, load them into addedProducts
        if (rowData.items && Array.isArray(rowData.items)) {
          this.addedProducts = rowData.items.map((item: any) => ({
            ...item,
            varient: item.variant ?? item.variant,  // fallback if rowData has 'variant'
            quantity: item.quantity ?? 1
          }));
        }


        // ✅ Check if ID exists for edit mode
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;
        }
      }
    });
  }



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

  loadOutletProduct() {
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductList().subscribe((data) => {
        this.dataSource.data = data;
        console.log(this.dataSource.data)
      });
    });
  }

  onOutletChange(selectedOutlet: string) {
    // Find the selected outlet from dealer data
    const selectedOutletData = this.dealerdataSource.data.find(dealer => dealer.name === selectedOutlet);

    if (selectedOutletData) {
      // Find the products associated with this outlet from all outlet products
      const outletProducts = this.dataSource.data.find(o => o.dealerOutlet === selectedOutletData.name)?.items;

      // Bind to vehicledataSource for products dropdown
      this.vehicledataSource.data = outletProducts || [];
    } else {
      this.vehicledataSource.data = []; // Reset if no outlet found
    }
  }


  isSubmitEnabled(): boolean {
    const formValid =
      !!this.grnForm.get('dealerOutlet')?.valid &&
      // !!this.grnForm.get('openingStock')?.valid &&
      !!this.grnForm.get('typeOfGrn')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);

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

      // 🔥 Important: create new array reference for Angular change detection
      this.addedProducts = [...this.addedProducts, { ...product, quantity: 1 }];
    }

    // Reset product dropdown
    this.grnForm.get('products')?.reset();
  }



  removeProduct(index: number) {
    this.addedProducts.splice(index, 1);
  }


  submitForm() {
    try {
      const formValues = this.grnForm.getRawValue();
      delete formValues.products; // remove dropdown value

      const isMainFormValid =
        this.grnForm.get('dealerOutlet')?.valid &&
        // this.grnForm.get('openingStock')?.valid &&
        this.grnForm.get('typeOfGrn')?.valid;

      if (isMainFormValid && this.addedProducts.length > 0) {
        Swal.fire({
          title: this.isEditMode ? 'Update GRN Details?' : 'Add GRN Details?',
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

              // ✅ Transform + sanitize data
              const transformedData: any = {
                ...formValues,
                items: this.addedProducts.map(p => ({
                  id: p.id ?? '',
                  sku: p.sku ?? '',
                  name: p.name ?? '',
                  brand: p.brand ?? '',
                  model: p.model ?? '',
                  variant: p.variant ?? p.variant ?? '',
                  unit: p.unit ?? '',
                  quantity: p.quantity ?? 0
                }))
              };

              // Remove undefined fields recursively
              Object.keys(transformedData).forEach(k => {
                if (transformedData[k] === undefined) {
                  transformedData[k] = '';
                }
              });

              if (this.isEditMode && this.data.id) {
                transformedData.updateBy = username;
                transformedData.updatedAt = timestamp;

                runInInjectionContext(this.injector, () => {
                  this.grnService.updateGrn(this.data.id, transformedData)
                    .then(() => {
                      Swal.fire('Updated!', 'GRN Details updated successfully.', 'success');
                      this.goBack();
                    })
                    .catch(error => {
                      console.error('Error updating GRN:', error);
                      Swal.fire('Error', 'Something went wrong.', 'error');
                    });
                });
              } else {
                transformedData.status = 'Active';
                transformedData.createBy = username;
                transformedData.createdAt = timestamp;

                runInInjectionContext(this.injector, () => {
                  this.grnService.addGrn(transformedData)
                    .then(() => {
                      Swal.fire('Added!', 'GRN Details added successfully.', 'success');
                      this.goBack();
                    })
                    .catch(error => {
                      console.error('Error adding GRN:', error);
                      Swal.fire('Error', 'Something went wrong.', 'error');
                    });
                });
              }
            } catch (innerErr) {
              console.error('Unexpected error during GRN submission:', innerErr);
              Swal.fire('Error', 'Unexpected issue occurred.', 'error');
            }
          }
        });
      } else {
        Swal.fire('Error', 'Please fill in all required fields and add at least one product.', 'error');
      }
    } catch (err) {
      console.error('Global GRN submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }





  goBack() {
    this.dealer.back();
  }
}
