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
import {LocationService} from "../location.service";
import Swal from "sweetalert2";
import {ActivatedRoute} from "@angular/router";
import {LoadingService} from "../../Services/loading.service";

@Component({
  selector: 'app-add-location',
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
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.scss'
})
export class AddLocationComponent implements OnInit {
  uniqueCountries: any[] = [];
  isEditMode: boolean = false;
  locationForm: FormGroup;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  private users: any;

  constructor(
    private fb: UntypedFormBuilder,
    private location: Location,
    private locationService: LocationService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isEditMode = !!data?.id;
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      country: ['', [Validators.required]],
      locationType: ['', [Validators.required]],
      locationCode: ['', [Validators.required]],
      division: ['', [Validators.required]],
      town: ['', [Validators.required]],
      address: ['', [Validators.required]],
      locationHead: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        // ✅ Patch data to form
        this.locationForm.patchValue(rowData);

        // ✅ Check if ID exists
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData; // ✅ Store it for later
        }
      }
    });
  }

  onRegister() {
    if (this.locationForm.valid) {
      Swal.fire({
        title: this.isEditMode ? 'Update Location Details?' : 'Add Location Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result: any) => {
        if (result.isConfirmed) {
          const { ...locationData } = this.locationForm.getRawValue();

          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const username = userData.userName || 'Unknown User';
          const timestamp = Date.now();

          const transformedData: any = {
            ...locationData,
          };

          if (this.isEditMode && this.data.id) {
            transformedData.updateBy = username;
            transformedData.updatedAt = timestamp;

            this.loadingService.setLoading(true); // ✅ Start loader
            runInInjectionContext(this.injector, () => {
              this.locationService.updateLocation(this.data.id, transformedData)
                .then(() => {
                  Swal.fire('Updated!', 'Location Details updated successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error updating Location Details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                })
                .finally(() => this.loadingService.setLoading(false)); // ✅ Stop loader
            });
          } else {
            // ➕ Add logic
            transformedData.status = 'Active';
            transformedData.createBy = username;
            transformedData.createdAt = timestamp;

            this.loadingService.setLoading(true); // ✅ Start loader
            runInInjectionContext(this.injector, () => {
              this.locationService.addLocation(transformedData)
                .then(() => {
                  Swal.fire('Added!', 'Location Details added successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  console.error('Error adding Location Details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                })
                .finally(() => this.loadingService.setLoading(false)); // ✅ Stop loader
            });
          }
        }
      });
    } else {
      console.log('Form is invalid:', this.locationForm.errors);
    }
  }

  goBack() {
    this.location.back();
  }

}
