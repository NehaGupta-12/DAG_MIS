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

  constructor(private fb: UntypedFormBuilder , private location: Location) {
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
