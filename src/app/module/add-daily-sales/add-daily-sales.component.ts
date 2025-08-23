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
import {ActivatedRoute} from "@angular/router";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DailySalesService} from "../daily-sales.service";

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
    ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  templateUrl: './add-daily-sales.component.html',
  styleUrl: './add-daily-sales.component.scss'
})
export class AddDailySalesComponent implements OnInit {
  isEditMode: boolean = false;
  dailySalesForm: FormGroup;
  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  constructor(private fb: UntypedFormBuilder,
              private location: Location,
              private dailySlaes: DailySalesService,
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isEditMode = !!data?.id;
    this.dailySalesForm = this.fb.group({
      location: ['', [Validators.required]],
      dealerOutlet: ['', [Validators.required]],
      vehicle: ['', [Validators.required]],
      salesQuantity: ['', [Validators.required]],
      typeOfCustomer: ['', [Validators.required]],
      division: ['', [Validators.required]],
      country: ['', [Validators.required]],
      town: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // ✅ Patch data to form
        this.dailySalesForm.patchValue(rowData);

        // ✅ Check if ID exists
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData; // ✅ Store it for later
        }
      }
    });
  }

  onRegister() {
    if (this.dailySalesForm.valid) {
      Swal.fire({
        title: this.isEditMode ? 'Update Daily Sales Details?' : 'Add Daily Sales Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result: any) => {
        if (result.isConfirmed) {
          // Get form values
          const { ...salesData } = this.dailySalesForm.getRawValue();

          // Get user info from localStorage
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const username = userData.userName || 'Unknown User';
          const timestamp = Date.now();

          const transformedData: any = {
            ...salesData
          };

          if (this.isEditMode && this.data.id) {
            // Update Mode
            transformedData.updateBy = username;
            transformedData.updatedAt = timestamp;

            runInInjectionContext(this.injector, () => {
              this.dailySlaes.updateDailySales(this.data.id, transformedData)
                .then(() => {
                  Swal.fire('Updated!', 'Daily Sales Details updated successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error updating Daily Sales Details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                });
            });

          } else {
            // Add Mode
            transformedData.status = 'Active';
            transformedData.createBy = username;
            transformedData.createdAt = timestamp;

            runInInjectionContext(this.injector, () => {
              this.dailySlaes.addDailySales(transformedData)
                .then(() => {
                  Swal.fire('Added!', 'Daily Sales Details added successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error adding Daily Sales Details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                });
            });
          }
        }
      });
    } else {
      console.log('Form is invalid:', this.dailySalesForm.errors);
    }
  }


  goBack() {
    this.location.back();
  }

}
