import {Component,OnInit} from '@angular/core';
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
import { MatSelectModule} from "@angular/material/select";
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
  constructor(private fb: UntypedFormBuilder ,
              private location: Location,
              private router : Router,
              private route : ActivatedRoute,
              private mDatabase : AngularFireDatabase,
              private userService : UserService,
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
          console.log('Departments:', depts);
          return depts;
        })
      );
    this.passwordControl = new FormControl('', [Validators.minLength(6)]);
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
            city: user.city || '',
            role: user.role || '',
            department: user.department || '',
            allowedOutlet: user.allowedOutlet || [],  // ✅ outlets multi-select
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


  initForm() {
    this.register = this.fb.group({
      first: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      last: [''],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      address: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
        country: ['', [Validators.required]],
      role: ['', [Validators.required]],
      allowedOutlet: [[]],
      department: ['', [Validators.required]],
      termcondition: [false, [Validators.requiredTrue]],
    });
    // Capitalize first letter for first and last name
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
      last: [''],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      address: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      termcondition: [false, [Validators.requiredTrue]],
    });
  }

  initThirdForm() {
    this.thirdForm = this.fb.group({
      first: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      last: [''],
      password: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      address: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
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
    if (this.register && this.register.valid) {
      const formValue = { ...this.register.getRawValue() };
      const timestamp = new Date().toISOString(); // ✅ ISO format

      try {
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
          const password = "password@123";
          const response = await this.userService.createUser(email, password);

          if (response.success) {
            this.register.addControl('uid', this.fb.control(response.uid));

            // ✅ Add createdAt field on new user
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
      }
    } else {
      this.submitted = false;
      alert("Form is Invalid. Please complete all required fields.");
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
