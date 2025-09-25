import {Component, ElementRef, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {UserService} from "../add-user/user.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MatDividerModule} from "@angular/material/divider";
import {MatTableModule} from '@angular/material/table';
import {LoadingService} from 'app/Services/loading.service';
import {MatButton} from "@angular/material/button";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {AsyncPipe, CommonModule, NgForOf, NgIf} from "@angular/common";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import Swal from "sweetalert2";
import {AddDealerService} from "../add-dealer.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss'],
  standalone: true,
    imports: [
        MatDividerModule,
        MatTableModule,
        MatButton,
        RouterLink,
        MatFormField,
        MatLabel,
        MatSelect,
        MatOption,
        NgForOf,
        AsyncPipe,
        CommonModule,
        NgIf,
        MatSelectModule,
        MatInput,
        FormsModule,
        ReactiveFormsModule,
        MatCheckbox,
        MatIcon

    ]
})
export class ViewUserComponent implements OnInit {
  userId: string | null = null;
  userData: any = null;
  selectedRole: string | null = null;
  selectedOutlet: any[] = [];
  selectCountries: any[] = [];
  displayedColumns: string[] = ['address', 'city', 'country', 'department', 'email', 'mobileNumber'];
  _roles$!: Observable<string[]>;
  _departments$!: Observable<any[]>;
  _country$!: Observable<any[]>;
  dealerData: any [] = [];
  roles: string[] = ['Admin', 'Manager', 'Sales Executive', 'Billing Executive'];
  outlets: string[] = ['Outlet 1', 'Outlet 2', 'Outlet 3'];
  @ViewChild('dealerSearchInput') dealerSearchInput!: ElementRef;
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  // ✅ Add these
  leftData: { field: string; value: string }[] = [];
  rightData: { field: string; value: string }[] = [];
  dataSource: { field: string; value: string }[] = [];
  // selectedOutlet: string[] = [];
  filteredDealerOptions: any[] = [];
  debounceTimer:any;
  _countries: string[] = [];
  filteredCountries: string[] = [];
  countrySearchText: string = '';

  constructor(private userService: UserService,
              private injector: EnvironmentInjector,
              private loadingService: LoadingService,
              private mDatabase: AngularFireDatabase,
              private router: Router,
              private addDealerService: AddDealerService,
              private route: ActivatedRoute) {
    this._roles$ = this.mDatabase
      .object<{ subcategories: any[] }>('/typelist/Role')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));
    this._departments$ = this.mDatabase
      .object<{ subcategories: any }>('/typelist/Department')
      .valueChanges()
      .pipe(
        map(data => {
          const depts = data?.subcategories ? Object.values(data.subcategories) : [];
          console.log('Departments:', depts);
          return depts;
        })
      );
    this._country$ = this.mDatabase
      .object<{ subcategories: any[] }>('/typelist/Countries')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));


    this._country$.subscribe(countries => {
      this._countries = countries;
      this.filterCountries(); // You already have this
    });
  }

  ngOnInit(): void {
    this.DealerList();
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      runInInjectionContext(this.injector, () => {
        this.userService.getUserById(this.userId).subscribe((user: any) => {
          if (user) {
            this.userData = user;

            this.selectedOutlet = user.allowedOutlet ? Object.values(user.allowedOutlet) : [];
            this.selectCountries = user.allowedCountries ? Object.values(user?.allowedCountries) : [];

            this.selectedRole = user.role || null;

            this.dataSource = [
              {field: 'First Name', value: user.first},
              {field: 'Last Name', value: user.last},
              {field: 'Email', value: user.email},
              {field: 'Mobile', value: user.mobile},
              {field: 'Role', value: user.role},
              {field: 'Department', value: user.department},
              {field: 'Address', value: user.address},
              {field: 'City', value: user.city},
              {field: 'State', value: user.state},
              {field: 'Country', value: user.country},
              {field: 'Terms Accepted', value: user.termcondition ? 'Yes' : 'No'},
              {field: 'User ID', value: user.userCode}
            ];

            this.leftData = this.dataSource.slice(0, Math.ceil(this.dataSource.length / 2));
            this.rightData = this.dataSource.slice(Math.ceil(this.dataSource.length / 2));
          } else {
            console.warn('No user found with ID:', this.userId);
          }
        });
      });
    }
  }
// Handles the search input with debouncing
  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.countrySearchText = event.target.value;
      this.filterCountries();
    }, 300); // Adjust the delay as needed
  }
  // Resets the search when the dropdown is opened
  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened && this.countrySearchInput) {
      this.countrySearchText = ''; // Clear search text
      this.filterCountries(); // Reset the filtered list
      setTimeout(() => {
        this.countrySearchInput?.nativeElement.focus();
      }, 0);
    }
  }
  filterCountries() {
    const sortedCountries = [...this._countries].sort((a, b) =>
      a.trim().toLowerCase().localeCompare(b.trim().toLowerCase())
    );

    if (!this.countrySearchText) {
      this.filteredCountries = sortedCountries;
    } else {
      this.filteredCountries = sortedCountries.filter(country =>
        country.toLowerCase().includes(this.countrySearchText.toLowerCase())
      );
    }
  }
  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getAllDealerList().subscribe((data: any) => {
        this.dealerData = data;
        console.log('Fetched dealer data:', this.dealerData);
        this.filteredDealerOptions = [...data]; // init with all
      });
    });
  }

// 🔎 Search filter
  onDealerSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchText = (event.target.value || '').toLowerCase();
      this.filteredDealerOptions = this.dealerData.filter((d: any) =>
        d?.name?.toLowerCase().includes(searchText)
      );
    }, 300);
  }

// 🎯 Reset + focus when opened
  onDealerSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.filteredDealerOptions = [...this.dealerData];
      setTimeout(() => {
        try {
          this.dealerSearchInput.nativeElement.focus();
        } catch {}
      }, 0);
    }
  }

  updateUser(): void {
    if (this.userId) {
      // 🔎 Find outlets matching the selected countries
      const matchedOutlets = this.dealerData.filter(
        (dealer: any) => this.selectCountries.includes(dealer.country)
      );

      // You can either save just outlet names or the full dealer objects
      this.selectedOutlet = matchedOutlets.map((dealer: any) => dealer.name);

      // Prepare final payload
      const updatedData = {
        ...this.userData,
        role: this.selectedRole,
        allowedOutlet: this.selectedOutlet.reduce((acc, outlet, i) => {
          acc[i] = outlet;
          return acc;
        }, {} as any),
        allowedCountries: this.selectCountries.reduce((acc, country, i) => {
          acc[i] = country;
          return acc;
        }, {} as any)
      };

      // 🔥 Update user
      this.userService.updateUser(this.userId, updatedData).then(() => {
        Swal.fire({
          title: 'Success!',
          text: 'User updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/module/user-list']);
        });
      }).catch((error) => {
        console.error('Error updating user:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update user. Please try again.',
          icon: 'error',
          confirmButtonText: 'Close'
        });
      });
    }
  }


}
