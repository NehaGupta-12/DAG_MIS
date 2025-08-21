import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import { MatCheckboxModule} from "@angular/material/checkbox";
import { MatIconModule} from "@angular/material/icon";
import { MatSelectModule} from "@angular/material/select";
import { MatOptionModule} from "@angular/material/core";
import { MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Location} from "@angular/common";
import {AuthService} from "../../authentication/auth.service";

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
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
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

  constructor(private fb: UntypedFormBuilder ,
              private location: Location,
              private authService: AuthService) {
    this.initForm();
    this.initSecondForm();
    this.initThirdForm();
  }

  initForm() {
    this.register = this.fb.group({
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

  initSecondForm() {
    this.secondForm = this.fb.group({
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

  onRegister() {
    console.log('Form Value', this.register?.value);
  }
  async createUser(): Promise<void> {
    this.submitted = true;
    if (this.register && this.register.valid) {
      try {
        const email = this.register.get('email')?.value;
        const password = this.register.get('password')?.value;

        // Call backend Cloud Function through AuthService
        const response = await this.authService.createUser(email, password);
        console.log('User created:', response);

        if (response.success) {
          // Add uid into the form
          this.register.addControl('uid', this.fb.control(response.uid));

          const formValue = { ...this.register.value };

          if (formValue.date instanceof Date) {
            formValue.date = formValue.date.toISOString();
          }

          // TODO: Save formValue in your employeeService or DB
          console.log('Final user data to save:', formValue);
        } else {
          alert(`Error: ${response.error}`);
        }

      } catch (error) {
        console.error('Error creating user:', error);
      }
    } else {
      this.submitted = false;
      alert("Form is Invalid. Please complete all required fields.");
      console.log('INVALID CONTROLS', this.findInvalidControls());
    }
  }
  public findInvalidControls() {
    const invalid = [];
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
