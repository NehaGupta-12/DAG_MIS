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
import {Location} from "@angular/common";
import Swal from "sweetalert2";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ProductMasterService} from "../product-master.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-add-product-master',
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
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  templateUrl: './add-product-master.component.html',
  styleUrl: './add-product-master.component.scss'
})
export class AddProductMasterComponent implements OnInit {
  uniqueCountries: any[] = [];
  isEditMode: boolean = false;
  productForm: FormGroup;

  constructor(private fb: UntypedFormBuilder,
              private location: Location,
              private productService: ProductMasterService, // Replace 'any' with actual service type
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      sku: ['', [Validators.required]],
      model: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      category: ['', [Validators.required]],
      subCategory: ['', [Validators.required]],
      varient: ['', [Validators.required]],
      engineCc: ['', [Validators.required]],
      unit: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // ✅ Patch data to form
        this.productForm.patchValue(rowData);

        // ✅ Check if ID exists
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData; // ✅ Store it for later
        }
      }
    });
  }


  onRegister() {
    if (this.productForm.valid) {
      Swal.fire({
        title: this.isEditMode ? 'Update Product Details?' : 'Add Product Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result: any) => {
        if (result.isConfirmed) {
          const { ...productData } = this.productForm.getRawValue();

          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const username = userData.userName || 'Unknown User';
          const timestamp = Date.now();

          const transformedData: any = {
            ...productData,
          };

          if (this.isEditMode && this.data.id) {
            // ✅ Update logic
            transformedData.updateBy = username;
            transformedData.updatedAt = timestamp;

            runInInjectionContext(this.injector, () => {
              this.productService.updateProduct(this.data.id, transformedData)
                .then(() => {
                  Swal.fire('Updated!', 'Product details updated successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error updating product details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                });
            });
          } else {
            // ✅ Add logic
            transformedData.status = 'Active';
            transformedData.createBy = username;
            transformedData.createdAt = timestamp;

            runInInjectionContext(this.injector, () => {
              this.productService.addProduct(transformedData)
                .then(() => {
                  Swal.fire('Added!', 'Product details added successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error adding product details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                });
            });
          }
        }
      });
    } else {
      console.log('Form is invalid:', this.productForm.errors);
    }
  }


  goBack() {
    this.location.back();
  }

}
