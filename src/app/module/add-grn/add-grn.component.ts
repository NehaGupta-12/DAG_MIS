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
  selector: 'app-add-grn',
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
  templateUrl: './add-grn.component.html',
  styleUrl: './add-grn.component.scss'
})
export class AddGRNComponent {

  // Form 1
  grnForm?: UntypedFormGroup;
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
    this.grnForm = this.fb.group({
      location: ['', [Validators.required]],
      products: ['', [Validators.required]],
      openingStock: ['', [Validators.required]],
      grnQuantity: ['', [Validators.required]],
      typeOfGrn: ['', [Validators.required]],
    });
  }
  onRegister() {
    console.log('Form Value', this.grnForm?.value);
  }

  goBack() {
    this.location.back();
  }

}
