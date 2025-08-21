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
  selector: 'app-add-product-master',
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
  templateUrl: './add-product-master.component.html',
  styleUrl: './add-product-master.component.scss'
})
export class AddProductMasterComponent {
  // Form 1
  productForm?: UntypedFormGroup;
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
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      sku: ['', [Validators.required]],
      model: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      category: ['', [Validators.required]],
      varient: ['', [Validators.required]],
      engineCc: ['', [Validators.required]],
      unit: ['', [Validators.required]],
    });
  }
  onRegister() {
    console.log('Form Value', this.productForm?.value);
  }

  goBack() {
    this.location.back();
  }

}
