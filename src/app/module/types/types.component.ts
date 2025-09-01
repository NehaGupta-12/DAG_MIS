import {Component, EnvironmentInjector, OnInit, runInInjectionContext} from '@angular/core';
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
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {take} from "rxjs";

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

  categories: any[] = [];

  selectedCategory: any = null;

  constructor(private mDatabase: AngularFireDatabase, private injector: EnvironmentInjector,) {}

  ngOnInit() {
    this.loadCategories();
    this.mDatabase.object('categories').valueChanges().subscribe((data: any) => {
      if (data) {
        this.categories = data;
      }
    });
  }


  loadCategories() {
    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      mDatabase.list('typelist').valueChanges().subscribe((data: any[]) => {
        this.categories = data;  // ✅ Real-time updates from Firebase
        console.log(this.categories)
      });
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  addCategory(name: string) {
    if (!name.trim()) return;

    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      const key = name.replace(/\s+/g, '_');

      mDatabase.object(`typelist/${key}`).set({ name, subcategories: [] })
        .then(() => {
          this.newCategory = '';
          console.log('Category added successfully!');
        });
    });
  }

  deleteCategory(name: string) {
    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      const key = name.replace(/\s+/g, '_');

      mDatabase.object(`typelist/${key}`).remove()
        .then(() => console.log('Category deleted!'));
    });
  }

  addSubCategory(field: string) {
    if (!field.trim() || !this.selectedCategory) return;

    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      const key = this.selectedCategory.name.replace(/\s+/g, '_');

      mDatabase.object<any[]>(`typelist/${key}/subcategories`)
        .valueChanges()
        .pipe(take(1))
        .subscribe((subcats) => {
          const updatedSubcategories = subcats ? [...subcats, field] : [field];

          // ✅ Update DB
          mDatabase.object(`typelist/${key}/subcategories`)
            .set(updatedSubcategories)
            .then(() => {
              console.log(`Subcategory "${field}" added to ${this.selectedCategory.name}`);

              // ✅ Keep dropdown selected and update local reference
              this.selectedCategory = {
                ...this.selectedCategory,
                subcategories: updatedSubcategories
              };

              // ✅ Also update categories array in memory
              const index = this.categories.findIndex(c => c.name === this.selectedCategory.name);
              if (index > -1) {
                this.categories[index] = this.selectedCategory;
              }
            });
        });
    });
  }




  deleteSubCategory(subCategory: string) {
    if (!this.selectedCategory) return;

    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      const key = this.selectedCategory.name.replace(/\s+/g, '_');

      mDatabase.object<any[]>(`typelist/${key}/subcategories`)
        .valueChanges()
        .pipe(take(1))
        .subscribe((subcats) => {
          if (subcats && Array.isArray(subcats)) {
            const updatedSubcategories = subcats.filter(item => item !== subCategory);

            // ✅ Update DB
            mDatabase.object(`typelist/${key}/subcategories`)
              .set(updatedSubcategories)
              .then(() => {
                console.log(`Subcategory "${subCategory}" deleted from ${this.selectedCategory.name}`);

                // ✅ Keep dropdown selected and update local reference
                this.selectedCategory = {
                  ...this.selectedCategory,
                  subcategories: updatedSubcategories
                };

                // ✅ Also update categories array in memory
                const index = this.categories.findIndex(c => c.name === this.selectedCategory.name);
                if (index > -1) {
                  this.categories[index] = this.selectedCategory;
                }
              });
          }
        });
    });
  }



  private saveToDatabase() {
    this.mDatabase.object('categories').set(this.categories).then(() => {
      console.log('Data saved successfully!');
    });
  }
}
