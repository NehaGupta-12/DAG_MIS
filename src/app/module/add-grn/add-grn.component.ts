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
import {GrnService} from "../grn.service";
import {ActivatedRoute} from "@angular/router";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import Swal from "sweetalert2";

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
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // this.initForm();
    this.isEditMode = !!data?.id;
    this.grnForm = this.fb.group({
      products: ['', [Validators.required]],
      openingStock: ['', [Validators.required]],
      grnQuantity: ['', [Validators.required]],
      typeOfGrn: ['', [Validators.required]],

      location: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // ✅ Patch data to form
        this.grnForm.patchValue(rowData);

        // ✅ Check if ID exists
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData; // ✅ Store it for later
        }
      }
    });
  }



  submitForm() {
    if (this.grnForm.valid) {
      Swal.fire({
        title: this.isEditMode ? 'Update Location Details?' : 'Add Location Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result: any) => {
        if (result.isConfirmed) {
          const { ...locationData } = this.grnForm.getRawValue();

          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const username = userData.userName || 'Unknown User';
          const timestamp = Date.now();

          const transformedData: any = {
            ...locationData,
          };

          if (this.isEditMode && this.data.id) {
            transformedData.updateBy = username;
            transformedData.updatedAt = timestamp;

            runInInjectionContext(this.injector, () => {
              this.grnService.updateGrn(this.data.id, transformedData)
                .then(() => {
                  Swal.fire('Updated!', 'Location Details updated successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error updating Location Details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                });
            });
          } else {
            // ➕ Add logic
            transformedData.status = 'Active';
            transformedData.createBy = username;
            transformedData.createdAt = timestamp;

            runInInjectionContext(this.injector, () => {
              this.grnService.addGrn(transformedData)
                .then(() => {
                  Swal.fire('Added!', 'Location Details added successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error adding Location Details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                });
            });
          }
        }
      });
    } else {
      console.log('Form is invalid:', this.grnForm.errors);
    }
  }



  goBack() {
    this.dealer.back();
  }
}
