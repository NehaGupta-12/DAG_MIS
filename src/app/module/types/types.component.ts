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
import Swal from "sweetalert2";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";
import {MatTooltip} from "@angular/material/tooltip";


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
    MatTooltip,
  ],
  templateUrl: './types.component.html',
  standalone: true,
  styleUrl: './types.component.scss'
})
export class TypesComponent implements OnInit {
  showModal = false;
  newCategory = '';
  newField = '';
  submitted = false;

  categories: any[] = [];
  selectedCategory: any = null;
  isLoading: any; // ✅ loader flag

  constructor(
    private mDatabase: AngularFireDatabase,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.mDatabase.object('categories').valueChanges().subscribe((data: any) => {
      if (data) {
        this.categories = data;
      }
    });
  }

// ✅ Load categories with loader
  loadCategories() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      mDatabase.list('typelist').valueChanges().subscribe({
        next: (data: any[]) => {
          this.categories = data;
          console.log(this.categories);
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to load categories', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  onSubmitCategory() {
    this.submitted = true;

    if (!this.newCategory || this.newCategory.trim() === '') {
      return; // stop if empty, error will show
    }

    this.addCategory(this.newCategory.trim());
    this.newCategory = '';
    this.submitted = false; // reset
    this.closeModal();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

// ✅ Add category with loader
  addCategory(name: string) {
    if (!name.trim()) return;

    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      const key = name.replace(/\s+/g, '_');

      mDatabase.object(`typelist/${key}`).set({ name, subcategories: [] })
        .then(() => {
          this.newCategory = '';
          console.log('Category added successfully!');
          this.loadingService.setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to add category', err);
          this.loadingService.setLoading(false);
        });
    });
  }

// ✅ Delete category with loader
  deleteCategory(name: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Type!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.setLoading(true);
        runInInjectionContext(this.injector, () => {
          const mDatabase = this.injector.get(AngularFireDatabase);
          const key = name.replace(/\s+/g, '_');

          mDatabase.object(`typelist/${key}`).remove()
            .then(() => {
              Swal.fire('Deleted!', 'Type has been deleted.', 'success');
              this.loadingService.setLoading(false);
            })
            .catch((error) => {
              Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
              console.error('Delete Type error:', error);
              this.loadingService.setLoading(false);
            });
        });
      } else {
        Swal.fire('Cancelled', 'Type is safe.', 'info');
      }
    });
  }

// ✅ Add subcategory with loader
  addSubCategory(field: string) {
    if (!field.trim() || !this.selectedCategory) return;

    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      const mDatabase = this.injector.get(AngularFireDatabase);
      const key = this.selectedCategory.name.replace(/\s+/g, '_');

      mDatabase.object<any[]>(`typelist/${key}/subcategories`)
        .valueChanges()
        .pipe(take(1))
        .subscribe({
          next: (subcats) => {
            const updatedSubcategories = subcats ? [...subcats, field] : [field];

            mDatabase.object(`typelist/${key}/subcategories`)
              .set(updatedSubcategories)
              .then(() => {
                console.log(`Subcategory "${field}" added to ${this.selectedCategory.name}`);
                this.selectedCategory = {
                  ...this.selectedCategory,
                  subcategories: updatedSubcategories
                };

                const index = this.categories.findIndex(c => c.name === this.selectedCategory.name);
                if (index > -1) {
                  this.categories[index] = this.selectedCategory;
                }

                this.loadingService.setLoading(false);
              })
              .catch((err) => {
                console.error('Failed to add subcategory', err);
                this.loadingService.setLoading(false);
              });
          },
          error: (err) => {
            console.error('Failed to fetch subcategories', err);
            this.loadingService.setLoading(false);
          }
        });
    });
  }

// ✅ Delete subcategory with loader
  deleteSubCategory(subCategory: string) {
    if (!this.selectedCategory) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `You will not be able to recover the sub type "${subCategory}"!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.setLoading(true);
        runInInjectionContext(this.injector, () => {
          const mDatabase = this.injector.get(AngularFireDatabase);
          const key = this.selectedCategory.name.replace(/\s+/g, '_');

          mDatabase.object<any[]>(`typelist/${key}/subcategories`)
            .valueChanges()
            .pipe(take(1))
            .subscribe({
              next: (subcats) => {
                if (subcats && Array.isArray(subcats)) {
                  const updatedSubcategories = subcats.filter(item => item !== subCategory);

                  mDatabase.object(`typelist/${key}/subcategories`)
                    .set(updatedSubcategories)
                    .then(() => {
                      Swal.fire('Deleted!', `Sub Type "${subCategory}" deleted.`, 'success');
                      this.selectedCategory = {
                        ...this.selectedCategory,
                        subcategories: updatedSubcategories
                      };

                      const index = this.categories.findIndex(c => c.name === this.selectedCategory.name);
                      if (index > -1) {
                        this.categories[index] = this.selectedCategory;
                      }

                      this.loadingService.setLoading(false);
                    })
                    .catch((error) => {
                      Swal.fire('Error!', 'Failed to delete Sub Type.', 'error');
                      console.error('Delete Sub Type error:', error);
                      this.loadingService.setLoading(false);
                    });
                }
              },
              error: (err) => {
                console.error('Failed to fetch subcategories', err);
                this.loadingService.setLoading(false);
              }
            });
        });
      } else {
        Swal.fire('Cancelled', 'Sub Type is safe.', 'info');
      }
    });
  }

  private saveToDatabase() {
    this.mDatabase.object('categories').set(this.categories).then(() => {
      console.log('Data saved successfully!');
    });
  }

}
