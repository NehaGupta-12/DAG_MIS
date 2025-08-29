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
import {AsyncPipe, CommonModule, Location} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {AddDealerService} from "../add-dealer.service";
import Swal from "sweetalert2";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {map} from "rxjs/operators";
export interface ListType {
  name: string
  id?: string
}
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
    MatDialogModule,
    AsyncPipe,
    CommonModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} } // ✅ Fallback
  ],
  templateUrl: './add-dealer.component.html',
  styleUrls: ['./add-dealer.component.scss']
})
export class AddDealerComponent implements OnInit{

  isEditMode: boolean = false;
  dealerForm: FormGroup;
  _divisionTypes$!: Observable<string[]>;
  _outletTypes$!: Observable<string[]>;
  _outletCategoryTypes$!: Observable<string[]>;
  _countriesTypes$!: Observable<string[]>;
  _townTypes$!: Observable<string[]>;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(private fb: UntypedFormBuilder,
              private dealer: Location,
              private addDealerService: AddDealerService,
              private injector: EnvironmentInjector,
              private route: ActivatedRoute,
              private mDatabase: AngularFireDatabase,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this._divisionTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Division')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
    this._outletTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/outletType')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
    this._outletCategoryTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/outletCategory')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
    this._townTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Town')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
    // this.initForm();
    this.isEditMode = !!data?.id;
    this.dealerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      country: ['', [Validators.required]],
      outletType: ['', [Validators.required]],
      division: ['', [Validators.required]],
      town: ['', [Validators.required]],
      category: ['', [Validators.required]],
      // location: ['', [Validators.required]],
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
