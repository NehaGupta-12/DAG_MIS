import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {NgIf} from "@angular/common";

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
  ],
  templateUrl: './types.component.html',
  styleUrl: './types.component.scss'
})
export class TypesComponent {

  showAddFieldRow = false;   // default hidden
  selectedOption = '';       // holds selected dropdown value

  onTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.selectedOption = value;
      this.showAddFieldRow = true;  // show the Add button row
    } else {
      this.showAddFieldRow = false; // hide if nothing selected
    }
  }

}
