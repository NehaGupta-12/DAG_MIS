import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import { MatCheckboxModule} from "@angular/material/checkbox";
import { MatIconModule} from "@angular/material/icon";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import { MatOptionModule} from "@angular/material/core";
import { MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {AsyncPipe, JsonPipe, Location, NgForOf, NgIf} from "@angular/common";
import {AuthService} from "../../authentication/auth.service";
import {UserService} from "./user.service";
import Swal from "sweetalert2";
import {ActivatedRoute, Router} from "@angular/router";
import {UserDataModel} from "./UserData.model";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";
import {LoadingService} from "../../Services/loading.service";

@Component({
  selector: 'app-add-user',
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
    AsyncPipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './add-user.component.html',
  standalone: true,
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit{
  // Form 1
  register?: UntypedFormGroup;
  submitted = false;
  hide = true;
  // Form 2
  secondForm?: UntypedFormGroup;
  hide2 = true;
  // Form 3
  thirdForm?: UntypedFormGroup;
  hide3 = true;
  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  isEditMode : any;
  userId:any;
  userData!: UserDataModel | null;
  _roles$!: Observable<string[]>;
  _departments$!: Observable<any[]>;
  _country$!: Observable<any[]>;
  passwordControl: FormControl
  @ViewChild('roleSearchInput') roleSearchInput!: ElementRef;
  @ViewChild('deptSearchInput') deptSearchInput!: ElementRef;
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('countrySelect') countrySelect!: MatSelect;
  // @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('deptSelect') deptSelect!: MatSelect;
  // @ViewChild('deptSearchInput') deptSearchInput!: ElementRef;
  _roles: string[] = [];
  filteredRoles: string[] = [];
  roleSearchText: string = '';

  _departments: string[] = [];
  filteredDepartments: string[] = [];
  deptSearchText: string = '';

  _countries: string[] = [];
  filteredCountries: string[] = [];
  countrySearchText: string = '';

  debounceTimer: any;

  constructor(private fb: UntypedFormBuilder ,
              private location: Location,
              private router : Router,
              private route : ActivatedRoute,
              private mDatabase : AngularFireDatabase,
              private userService : UserService,
              public loaderService : LoadingService,
              private authService: AuthService) {
    this.initForm();
    this.initSecondForm();
    this.initThirdForm();
    this._roles$ = this.mDatabase
      .object<{ subcategories: any[] }>('/typelist/Role')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));
    this._country$ = this.mDatabase
      .object<{ subcategories: any[] }>('/typelist/Countries')
      .valueChanges()
      .pipe(map(data => data?.subcategories || []));

    this._departments$ = this.mDatabase
      .object<{ subcategories: any }>('/typelist/Department')
      .valueChanges()
      .pipe(
        map(data => {
          const depts = data?.subcategories ? Object.values(data.subcategories) : [];
          return depts;
        })
      );
    this.passwordControl = new FormControl('', [Validators.minLength(6)]);

    // Subscribe to all observables and populate local arrays
    this._roles$.subscribe(roles => {
      this._roles = roles;
      this.filterRoles();
    });

    this._departments$.subscribe(departments => {
      this._departments = departments;
      this.filterDepartments();
    });

    this._country$.subscribe(countries => {
      this._countries = countries;
      this.filterCountries(); // You already have this
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.userId; // Flag for edit mode
    console.log('Editing user with ID:', this.userId);

    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe(user => {
        if (user) {
          this.userData = user;
          console.log('Fetched user data:', this.userData);

          this.register?.patchValue({
            first: user.first || '',
            last: user.last || '',
            email: user.email || '',
            mobile: user.mobile || '',
            address: user.address || '',
            userCode: user.userCode || '',
            city: user.city || '',
            role: user.role || '',
            department: user.department || '',
            allowedOutlet: user.allowedOutlet || [],
            allowedCountries: user?.allowedCountries || [],
            state: user.state || '',
            country: user.country || '',
            termcondition: user.termcondition || false,
          });
          if (this.isEditMode) {
            this.register?.get('email')?.disable();
          }
        } else {
          console.warn('No user found with ID:', this.userId);
        }
      });
    }
  }

  // 🔹 Search text variable
  // roleSearchText: string = '';
  // filteredRoles: string[] = [];
  // _roles: string[] = []; // your full roles list

  // @ViewChild('roleSearchInput') roleSearchInput!: ElementRef;

// --- Role Methods ---
  filterRoles() {
    if (!this.roleSearchText) {
      this.filteredRoles = [...this._roles];
    } else {
      const search = this.roleSearchText.toLowerCase();
      this.filteredRoles = this._roles.filter(role =>
        role.toLowerCase().includes(search)
      );
    }
  }

  onRoleSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.roleSearchText = event.target.value;
      this.filterRoles();
    }, 300);
  }

  onRoleSelectOpened(isOpened: boolean) {
    if (isOpened) {
      // ✅ Reset search text & filtered list when dropdown opens
      this.roleSearchText = '';
      this.filterRoles();

      // ✅ Clear input visually & focus
      setTimeout(() => {
        if (this.roleSearchInput) this.roleSearchInput.nativeElement.value = '';
        this.roleSearchInput?.nativeElement.focus();
      }, 0);
    } else {
      // ✅ Reset search text when dropdown closes
      this.roleSearchText = '';
      this.filterRoles();

      // ✅ Clear input visually
      if (this.roleSearchInput) {
        this.roleSearchInput.nativeElement.value = '';
      }
    }
  }

  onDeptSelectOpened(isOpened: boolean) {
    if (isOpened) {
      // ✅ Reset search text & filtered list
      this.deptSearchText = '';
      this.filterDepartments();

      // ✅ Clear input box visually
      if (this.deptSearchInput) {
        this.deptSearchInput.nativeElement.value = '';
        setTimeout(() => this.deptSearchInput.nativeElement.focus(), 0);
      }
    } else {
      // Dropdown close, reset search & filtered list
      this.deptSearchText = '';
      this.filterDepartments();

      // ✅ Clear invalid selection if any
      const currentValue = this.register?.get('department')?.value;
      if (!this._departments.includes(currentValue)) {
        this.register?.get('department')?.setValue(null);
      }

      // ✅ Force panel close if stuck
      setTimeout(() => {
        if (this.deptSelect.panelOpen) {
          this.deptSelect.close();
        }
      }, 0);
    }
  }

  onDeptSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.deptSearchText = event.target.value;
      this.filterDepartments();
    }, 300);
  }

  filterDepartments() {
    if (!this.deptSearchText) {
      this.filteredDepartments = [...this._departments];
    } else {
      const search = this.deptSearchText.toLowerCase();
      this.filteredDepartments = this._departments.filter(dept =>
        dept.toLowerCase().includes(search)
      );
    }
  }

  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened) {
      // ✅ Reset previous search text and filtered list
      this.countrySearchText = '';
      this.filterCountries();

      // ✅ Clear the input box visually
      if (this.countrySearchInput) {
        this.countrySearchInput.nativeElement.value = '';
        setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
      }
    } else {
      // Dropdown close, reset search and filtered list
      this.countrySearchText = '';
      this.filterCountries();

      // ✅ If selected value is invalid, clear it
      const currentValue = this.register?.get('country')?.value;
      if (!this._countries.includes(currentValue)) {
        this.register?.get('country')?.setValue(null);
      }

      // ✅ Force close panel if mat-select is stuck
      setTimeout(() => {
        if (this.countrySelect.panelOpen) {
          this.countrySelect.close();
        }
      }, 0);
    }
  }

  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.countrySearchText = event.target.value;
      this.filterCountries();
    }, 300);
  }

  filterCountries() {
    const sortedCountries = [...this._countries].sort((a, b) =>
      a.trim().toLowerCase().localeCompare(b.trim().toLowerCase())
    );

    if (!this.countrySearchText) {
      this.filteredCountries = sortedCountries;
    } else {
      const search = this.countrySearchText.toLowerCase();
      this.filteredCountries = sortedCountries.filter(c =>
        c.toLowerCase().includes(search)
      );
    }
  }


  initForm() {
    this.register = this.fb.group({
      first: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      last: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      address: [''],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],   // ✅ allows spaces
      state: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],  // ✅ allows spaces
      country: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],// ✅ allows spaces
      role: ['', [Validators.required]],
      userCode: ['', [Validators.required]],
      allowedOutlet: [[]],
      allowedCountries: [[]],
      department: ['', [Validators.required]],
      termcondition: [false, [Validators.requiredTrue]],
    });

    // Capitalize first/last name (unchanged)
    this.register.get('first')?.valueChanges.subscribe(value => {
      if (value) {
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
        if (value !== capitalized) {
          this.register?.get('first')?.setValue(capitalized, { emitEvent: false });
        }
      }
    });

    this.register.get('last')?.valueChanges.subscribe(value => {
      if (value) {
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
        if (value !== capitalized) {
          this.register?.get('last')?.setValue(capitalized, { emitEvent: false });
        }
      }
    });
  }


  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric input
    }
  }

  initSecondForm() {
    this.secondForm = this.fb.group({
      first: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      last: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      address: [''],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],   // ✅ fixed
      state: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],  // ✅ fixed
      country: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],// ✅ fixed
      termcondition: [false, [Validators.requiredTrue]],
    });
  }

  // Prevent non-alphabet characters at keypress level
  allowOnlyAlphabets(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);

    // Allow: A-Z, a-z, backspace, space, tab
    if (
      !(charCode >= 65 && charCode <= 90) && // A-Z
      !(charCode >= 97 && charCode <= 122) && // a-z
      charCode !== 32 && // space
      charCode !== 8 &&  // backspace
      charCode !== 9     // tab
    ) {
      event.preventDefault();
    }
  }


  initThirdForm() {
    this.thirdForm = this.fb.group({
      first: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      last: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      password: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      address: [''],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],   // ✅ fixed
      state: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],  // ✅ fixed
      country: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],// ✅ fixed
      termcondition: [false, [Validators.requiredTrue]],
    });
  }

  // async onRegister(): Promise<void> {
  //   this.submitted = true;
  //   if (this.register && this.register.valid) {
  //     const formValue = { ...this.register.getRawValue() }; // Use getRawValue to include disabled fields
  //     try {
  //       if (this.isEditMode && this.userId) {
  //         await this.userService.updateUser(this.userId, formValue);
  //         Swal.fire({
  //           title: 'Updated!',
  //           text: 'User details have been updated successfully.',
  //           icon: 'success',
  //           timer: 2000,
  //           showConfirmButton: false
  //         }).then(() => this.router.navigate(['/module/user-list']));
  //       } else {
  //         const email = formValue.email;
  //         const password = "password@123";
  //         const response = await this.userService.createUser(email, password);
  //         console.log('User created:', response);
  //         if (response.success) {
  //           this.register.addControl('uid', this.fb.control(response.uid));
  //           await this.userService.addEmployee(response.uid, formValue);
  //           Swal.fire({
  //             title: 'Added!',
  //             text: 'User details have been saved successfully.',
  //             icon: 'success',
  //             timer: 2000,
  //             showConfirmButton: false
  //           }).then(() => this.router.navigate(['/module/user-list']));
  //         } else {
  //           alert(`Error: ${response.error}`);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error saving user:', error);
  //     }
  //   } else {
  //     this.submitted = false;
  //     alert("Form is Invalid. Please complete all required fields.");
  //     console.log('INVALID CONTROLS', this.findInvalidControls());
  //   }
  // }
  async onRegister(): Promise<void> {
    this.submitted = true;

    if (this.register?.valid) {
      const formValue = { ...this.register.getRawValue() };
      const timestamp = new Date().toISOString();

      try {
        this.loaderService.setLoading(true); // ✅ start loader globally

        if (this.isEditMode && this.userId) {
          // ✅ Add updatedAt field when updating
          const updatedValue = { ...formValue, updatedAt: timestamp };
          await this.userService.updateUser(this.userId, updatedValue);

          Swal.fire({
            title: 'Updated!',
            text: 'User details have been updated successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/module/user-list']));

        } else {
          const email = formValue.email;
          const password = 'password@123';
          const response = await this.userService.createUser(email, password);

          if (response.success) {
            this.register.addControl('uid', this.fb.control(response.uid));

            // ✅ Add createdAt & updatedAt
            const newUserData = {
              ...formValue,
              uid: response.uid,
              createdAt: timestamp,
              updatedAt: timestamp
            };

            await this.userService.addEmployee(response.uid, newUserData);

            Swal.fire({
              title: 'Added!',
              text: 'User details have been saved successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            }).then(() => this.router.navigate(['/module/user-list']));
          } else {
            alert(`Error: ${response.error}`);
          }
        }
      } catch (error) {
        console.error('Error saving user:', error);
      } finally {
        this.loaderService.setLoading(false); // ✅ always stop loader
      }

    } else {
      this.submitted = false;
      alert('Form is Invalid. Please complete all required fields.');
      console.log('INVALID CONTROLS', this.findInvalidControls());
    }
  }

  changePassword() {
    // if password control valid first
    console.log(this.userId,)
    console.log(this.passwordControl.value)
    if (this.passwordControl.invalid) {
      alert('Please enter a valid password')
      return
    } else this.authService.changePasswordOfAnotherUser(this.userId, this.passwordControl.value).then(res => {
      //add snackabsr
      this.passwordControl.reset()

    })

  }
  public findInvalidControls(): string[] {
    const invalid: string[] = [];
    const controls = this.register?.controls;

    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onsecondFormSubmit() {
    console.log('Form Value', this.secondForm?.value);
  }

  onThirdFormSubmit() {
    console.log('Form Value', this.thirdForm?.value);
  }

  goBack() {
    this.location.back();
  }


}
