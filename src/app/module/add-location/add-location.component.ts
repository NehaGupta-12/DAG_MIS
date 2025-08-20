import {Component} from '@angular/core';
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
  selector: 'app-add-location',
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
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.scss'
})
export class AddLocationComponent {
  // Form 1
  locationForm?: UntypedFormGroup;
  hide = true;
  // Form 2
  uniqueCountries: any[] = [];

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  private users: any;
  constructor(private fb: UntypedFormBuilder , private location: Location) {
    this.initForm();
  }

  ngOnInit() {
    this.uniqueCountries = [...new Set(this.users.map((u:any) => u.country))];
    console.log(this.uniqueCountries);
  }

  initForm() {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      country: ['', [Validators.required]],
      locationType: ['', [Validators.required]],
      locationCode: ['', [Validators.required]],
      division: ['', [Validators.required]],
      town: ['', [Validators.required]],
      address: ['', [Validators.required]],
      locationHead: ['', [Validators.required]],
    });
  }
  onRegister() {
    console.log('Form Value', this.locationForm?.value);
  }


  goBack() {
    this.location.back();
  }

}
