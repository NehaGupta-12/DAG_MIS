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
  selector: 'app-add-daily-sales',
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
  templateUrl: './add-daily-sales.component.html',
  styleUrl: './add-daily-sales.component.scss'
})
export class AddDailySalesComponent {
  // Form 1
  dailySalesForm?: UntypedFormGroup;
  hide = true;
  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  constructor(private fb: UntypedFormBuilder, private location: Location) {
    this.initForm();
  }
  initForm() {
    this.dailySalesForm = this.fb.group({
      location: ['', [Validators.required]],
      dealerOutlet: ['', [Validators.required]],
      vehicle: ['', [Validators.required]],
      salesQuntity: ['', [Validators.required]],
      typeOfCustomer: ['', [Validators.required]],
      division: ['', [Validators.required]],
      town: ['', [Validators.required]],
    });
  }
  onRegister() {
    console.log('Form Value', this.dailySalesForm?.value);
  }

  goBack() {
    this.location.back();
  }

}
