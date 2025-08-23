import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {Location} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {AddDealerService} from "../add-dealer.service";
import Swal from "sweetalert2";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-add-dealer',
  standalone: true,
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
    MatDialogModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} } // ✅ Fallback
  ],
  templateUrl: './add-dealer.component.html',
  styleUrls: ['./add-dealer.component.scss']
})
export class AddDealerComponent implements OnInit{
  uniqueCountries: any[] = [];
  isEditMode: boolean = false;
  dealerForm: FormGroup;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  private users: any;
  constructor(private fb: UntypedFormBuilder,
              private dealer: Location,
              private addDealerService: AddDealerService,
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    // this.initForm();
    this.isEditMode = !!data?.id;
    this.dealerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      country: ['', [Validators.required]],
      outletType: ['', [Validators.required]],
      // locationCode: ['', [Validators.required]],
      division: ['', [Validators.required]],
      town: ['', [Validators.required]],
      category: ['', [Validators.required]],
      location: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // ✅ Patch data to form
        this.dealerForm.patchValue(rowData);

        // ✅ Check if ID exists
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData; // ✅ Store it for later
        }
      }
    });
  }



  submitForm() {
    if (this.dealerForm.valid) {
      Swal.fire({
        title: this.isEditMode ? 'Update Location Details?' : 'Add Location Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result: any) => {
        if (result.isConfirmed) {
          const { ...locationData } = this.dealerForm.getRawValue();

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
              this.addDealerService.updateDealer(this.data.id, transformedData)
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
              this.addDealerService.addDealer(transformedData)
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
      console.log('Form is invalid:', this.dealerForm.errors);
    }
  }



  goBack() {
    this.dealer.back();
  }
}
