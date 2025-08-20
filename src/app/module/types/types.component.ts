import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { NgClass, NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'app-types',
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
    NgIf,
    NgClass,
    NgForOf,
  ],
  templateUrl: './types.component.html',
  standalone: true,
  styleUrl: './types.component.scss'
})
export class TypesComponent implements OnInit {

  availableTypes: string[] = ['Nagpur', 'Pune', 'Mumbai']; // dropdown
  selectedOption: string = '';
  fieldValue: string = '';

  // ✅ Each division will hold its own towns list
  typeData: { [key: string]: { name: string }[] } = {};

  showAddTypeForm = false;
  showAddFieldRow = false;

  typeForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.typeForm = this.fb.group({
      name: ['', Validators.required]
    });

    // initialize arrays for each type
    this.availableTypes.forEach(type => this.typeData[type] = []);
  }


  onTypeChange() {
    this.showAddTypeForm = false;
    this.showAddFieldRow = true;
  }

  openConfirmBeforeAddType() {
    if (confirm('Do you want to add a new type?')) {
      this.showAddTypeForm = true;
      this.showAddFieldRow = false;
    }
  }

  submitType() {
    if (this.typeForm.valid) {
      const newType = this.typeForm.value.name;

      // ✅ if not already present, add in dropdown + create its list
      if (!this.availableTypes.includes(newType)) {
        this.availableTypes.push(newType);
        this.typeData[newType] = [];
      }

      this.selectedOption = newType;
      this.showAddTypeForm = false;
      this.showAddFieldRow = true;

      this.typeForm.reset();
    }
  }

  confirmAddField() {
    if (this.fieldValue.trim() && this.selectedOption) {
      this.typeData[this.selectedOption].push({ name: this.fieldValue });
      this.fieldValue = '';
    }
  }

  deleteItem(type: string, index: number) {
    this.typeData[type].splice(index, 1);
  }
}
