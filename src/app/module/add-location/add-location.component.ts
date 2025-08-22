import {Component, Inject} from '@angular/core';
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
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {LocationService} from "../location.service";
import Swal from "sweetalert2";

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
export class AddLocationComponent {
  // Form 1
  // locationForm?: UntypedFormGroup;
  // hide = true;
  // Form 2
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
  constructor(private fb: UntypedFormBuilder,
              private location: Location,
              private locationService: LocationService,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // this.initForm();
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
    this.uniqueCountries = [...new Set(this.users.map((u:any) => u.country))];
    console.log(this.uniqueCountries);
  }


  onRegister() {
    if (this.locationForm.valid) {
      Swal.fire({
        title: 'Add Location Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result:any) => {
        if (result.isConfirmed) {
          const { ...locationData } = this.locationForm.getRawValue();

          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const username = userData.userName || 'Unknown User';
          const timestamp = new Date().getTime();

          const transformedData: any = {
            ...locationData,
            status: 'Active',  // Default status for Location
            createBy: username,
            createdAt: timestamp
          };

          // 🔍 Duplicate check (optional: by name + country)
          const isDuplicate = this.users?.some((entry: any) =>
            entry.name === locationData.name &&
            entry.country === locationData.country
          );

          if (isDuplicate) {
            Swal.fire({
              icon: 'warning',
              title: 'Duplicate Entry',
              text: 'This Location already exists.',
            });
            return;
          }

          // ➕ Add Logic
          this.locationService.addLocation(transformedData)
            .then(() => {
              Swal.fire('Added!', 'Location Details added successfully.', 'success');
              this.goBack(); // Navigate back after success
            })
            .catch(error => {
              console.error('Error adding Location Details:', error);
              Swal.fire('Error', 'Something went wrong.', 'error');
            });

          // // 📝 Log Entry
          // this.mLogService.addLog({
          //   date: timestamp,
          //   section: 'Location List',
          //   action: 'Add',
          //   description: `Location Details added by ${username}`,
          //   currentIp: localStorage.getItem('currentip')!,
          // });
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
