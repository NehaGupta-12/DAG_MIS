import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatCheckbox, MatCheckboxModule} from "@angular/material/checkbox";
import {MatInput, MatInputModule, MatLabel, MatSuffix} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {Location} from "@angular/common";

@Component({
  selector: 'app-add-dealer',
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
  templateUrl: './add-dealer.component.html',
  styleUrl: './add-dealer.component.scss'
})
export class AddDealerComponent {
  // Form 1
  dealerForm?: UntypedFormGroup;
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
  constructor(private fb: UntypedFormBuilder, private location: Location) {
    this.initForm();
    // this.initSecondForm();
    // this.initThirdForm();
  }
  initForm() {
    this.dealerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      division: ['', [Validators.required]],
      town: ['', [Validators.required]],
      category: ['', [Validators.required]],
      modelType: ['', [Validators.required]],
      location: ['', [Validators.required]],
    });
  }
  // initSecondForm() {
  //   this.secondForm = this.fb.group({
  //     name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
  //     last: [''],
  //     password: ['', [Validators.required]],
  //     email: [
  //       '',
  //       [Validators.required, Validators.email, Validators.minLength(5)],
  //     ],
  //     address: [''],
  //     city: ['', [Validators.required]],
  //     state: ['', [Validators.required]],
  //     modelType: ['', [Validators.required]],
  //     termcondition: [false, [Validators.requiredTrue]],
  //   });
  // }
  // initThirdForm() {
  //   this.thirdForm = this.fb.group({
  //     name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
  //     last: [''],
  //     password: ['', [Validators.required]],
  //     email: [
  //       '',
  //       [Validators.required, Validators.email, Validators.minLength(5)],
  //     ],
  //     address: [''],
  //     city: ['', [Validators.required]],
  //     state: ['', [Validators.required]],
  //     modelType: ['', [Validators.required]],
  //     termcondition: [false, [Validators.requiredTrue]],
  //   });
  // }
  onRegister() {
    console.log('Form Value', this.dealerForm?.value);
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
