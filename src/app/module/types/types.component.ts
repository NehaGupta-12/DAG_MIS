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
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";

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
    FeatherIconsComponent,
  ],
  templateUrl: './types.component.html',
  standalone: true,
  styleUrl: './types.component.scss'
})
export class TypesComponent implements OnInit {

  showModal = false;
  newCategory = '';
  newField = '';



  categories: any[] = [
    { name: 'Division', subcategories: [] },
    { name: 'Town', subcategories: [] },
    { name: 'Types of Customer', subcategories: [] }
  ];

  selectedCategory: any = null;

  ngOnInit() {
    const saved = localStorage.getItem('categories');
    if (saved) {
      this.categories = JSON.parse(saved);
    }
  }


  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  addCategory(name: string) {
    if (name.trim()) {
      this.categories.push({ name, subcategories: [] });
      this.saveToStorage();
    }
  }

  deleteCategory(index: number) {
    this.categories.splice(index, 1);
    this.selectedCategory = null;
    this.saveToStorage();
  }



  addSubCategory(field: string) {
    if (this.selectedCategory && field.trim()) {
      this.selectedCategory.subcategories.push(field);
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }
}
