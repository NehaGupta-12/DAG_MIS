import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
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
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {map} from "rxjs/operators";
import {LoadingService} from "../../Services/loading.service";
import {CountryService} from "../../Services/country.service";
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
  @ViewChild('outletTypeSearchInput') outletTypeSearchInput!: ElementRef;
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;

  _divisionTypes: string[] = [];
  filteredDivisionTypes: string[] = [];
  divisionSearchText: string = '';

  _outletTypes: string[] = [];
  filteredOutletTypes: string[] = [];
  outletTypeSearchText: string = '';

  _countriesTypes: string[] = [];
  filteredCountries: string[] = [];
  countrySearchText: string = '';

  _townTypes: string[] = [];
  filteredTownTypes: string[] = [];
  townSearchText: string = '';

  debounceTimer: any;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private dealer: Location,
    private addDealerService: AddDealerService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private mDatabase: AngularFireDatabase,
    private loadingService: LoadingService,
    private countryService: CountryService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this._divisionTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Division')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._outletTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('/typelist/Outlet_Type')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._outletCategoryTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('/typelist/Outlet_Category')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._townTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Town')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    // Subscribe to all observables and populate local arrays
    this._divisionTypes$.subscribe(data => {
      this._divisionTypes = data;
      this.filterDivisionTypes();
    });

    this._outletTypes$.subscribe(data => {
      this._outletTypes = data;
      this.filterOutletTypes();
    });

    this.countryService.getCountries().subscribe(data => {
      this._countriesTypes = data;
      this.filterCountries();
    });
    // this._countriesTypes$.subscribe(data => {
    //   this._countriesTypes = data;
    //   this.filterCountries();
    // });

    this._townTypes$.subscribe(data => {
      this._townTypes = data;
      this.filterTownTypes();
    });

    this.isEditMode = !!data?.id;
    this.dealerForm = this.fb.group({
      outletCode: ['', [Validators.required]],
      name: ['', [Validators.required]],
      country: ['', [Validators.required]],
      outletType: ['', [Validators.required]],
      division: ['', [Validators.required]],
      town: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        this.dealerForm.patchValue(rowData);
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;
        }
      }
    });
  }

  // --- Outlet Type Methods ---
  filterOutletTypes() {
    const searchText = this.outletTypeSearchText.toLowerCase();
    this.filteredOutletTypes = this._outletTypes.filter(type => type.toLowerCase().includes(searchText));
  }
  onOutletTypeSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.outletTypeSearchText = event.target.value;
      this.filterOutletTypes();
    }, 300);
  }
  onOutletTypeSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.outletTypeSearchText = '';
      this.filterOutletTypes();
      setTimeout(() => this.outletTypeSearchInput.nativeElement.focus(), 0);
    }
  }

// --- Division Methods ---
  filterDivisionTypes() {
    const searchText = this.divisionSearchText.toLowerCase();
    this.filteredDivisionTypes = this._divisionTypes.filter(type => type.toLowerCase().includes(searchText));
  }
  onDivisionSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.divisionSearchText = event.target.value;
      this.filterDivisionTypes();
    }, 300);
  }
  onDivisionSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.divisionSearchText = '';
      this.filterDivisionTypes();
      setTimeout(() => this.divisionSearchInput.nativeElement.focus(), 0);
    }
  }

// --- Country Methods ---
  filterCountries() {
    const searchText = this.countrySearchText.toLowerCase();
    this.filteredCountries = this._countriesTypes.filter(country => country.toLowerCase().includes(searchText));
  }
  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.countrySearchText = event.target.value;
      this.filterCountries();
    }, 300);
  }
  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.countrySearchText = '';
      this.filterCountries();
      setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
    }
  }

// --- Town Methods ---
  filterTownTypes() {
    const searchText = this.townSearchText.toLowerCase();
    this.filteredTownTypes = this._townTypes.filter(town => town.toLowerCase().includes(searchText));
  }
  onTownSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.townSearchText = event.target.value;
      this.filterTownTypes();
    }, 300);
  }
  onTownSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.townSearchText = '';
      this.filterTownTypes();
      setTimeout(() => this.townSearchInput.nativeElement.focus(), 0);
    }
  }

  submitForm() {
    if (this.dealerForm.valid) {
      Swal.fire({
        title: this.isEditMode
          ? 'Update Dealer/Outlet Details?'
          : 'Add Dealer/Outlet Details?',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
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

            this.loadingService.setLoading(true);
            runInInjectionContext(this.injector, () => {
              this.addDealerService.updateDealer(this.data.id, transformedData)
                .then(() => {
                  this.loadingService.setLoading(false);
                  Swal.fire('Updated!', 'Dealer/Outlet Details updated successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  this.loadingService.setLoading(false);
                  console.error('Error updating Dealer/Outlet Details:', error);
                  Swal.fire('Error', 'Something went wrong.', 'error');
                });
            });
          } else {
            // ➕ Add logic
            transformedData.status = 'Active';
            transformedData.createBy = username;
            transformedData.createdAt = timestamp;

            this.loadingService.setLoading(true);
            runInInjectionContext(this.injector, () => {
              this.addDealerService.addDealer(transformedData)
                .then(() => {
                  this.loadingService.setLoading(false);
                  Swal.fire('Added!', 'Dealer/Outlet Details added successfully.', 'success');
                  this.goBack();
                })
                .catch(error => {
                  this.loadingService.setLoading(false);
                  console.error('Error adding Dealer/Outlet Details:', error);
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
    // this.dealer.back();
    this.router.navigate(['/module/dealer-list']);
  }

}
