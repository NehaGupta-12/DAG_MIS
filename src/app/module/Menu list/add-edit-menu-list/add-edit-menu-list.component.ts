import {Component, Inject, OnInit} from '@angular/core';
import {MenuService} from "../../../Services/menu.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {UserService} from "../../add-user/user.service";
import {firstValueFrom, Subscription} from "rxjs";
import {Menus} from "../../../interfaces/menu.interface";
import firebase from "firebase/compat/app";
import {MatFormField, MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {DatePipe, NgIf} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-add-edit-menu-list',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatFormField,
    MatInput,
    MatFormField,
    MatButton,
    NgIf,
    DatePipe,
    MatTooltip
  ],
  templateUrl: './add-edit-menu-list.component.html',
  styleUrl: './add-edit-menu-list.component.scss'
})
export class AddEditMenuListComponent  {
  menuForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  userId: string | null = null;
  userSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private menusService: MenuService,
    private dialogRef: MatDialogRef<AddEditMenuListComponent>,
    private mSnackBar: MatSnackBar,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.id;
    this.menuForm = this.fb.group({
      menu_name: [{ value: data?.menu_name || '', disabled: this.isEditMode }, Validators.required],
      menu_url: [data?.menu_url || '', Validators.required],
    });

    this.userSubscription = this.userService.getUserId().subscribe(id => {
      this.userId = id;
    });
  }



  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  async submitForm(): Promise<void> {
    if (!this.menuForm.valid || !this.userId) {
      this.mSnackBar.open('Please enter all required fields', undefined, { duration: 2000 });
      return;
    }

    this.isLoading = true;
    this.menuForm.get('menu_name')?.enable();

    const menuData = this.menuForm.getRawValue();
    const baseData: Partial<Menus> = {
      menu_name: this.toUcFirst(menuData.menu_name.trim()),
      menu_url: menuData.menu_url.trim(),
    };

    try {
      if (this.isEditMode && this.data?.id) {
        // Edit existing menu
        const transformedData: Partial<Menus> = {
          ...baseData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: this.userId,
        };
        await this.menusService.updateMenu(this.data.id, transformedData);
        this.handleSuccess('Menu details updated successfully', 'Update');
      } else {
        // Add new menu without duplicate check
        const transformedData: Menus = {
          ...baseData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: this.userId!,
          updatedAt: '',
          updatedBy: '',
        } as Menus;

        await this.menusService.addMenu(transformedData);
        this.handleSuccess('Menu details added successfully', 'Add');
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }


handleSuccess(message: string, action: string) {

    this.isLoading = false;
    this.mSnackBar.open(message, undefined, { duration: 2500 });
    this.dialogRef.close(true);
  }

  handleError(error: any) {
    this.isLoading = false;
    this.mSnackBar.open('Operation failed. See console for details.', undefined, { duration: 3000 });
    console.error(error);
  }

  close(): void {
    this.menuForm.get('menu_name')?.enable();
    this.dialogRef.close();
  }

  toUcFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = this.toUcFirst(input.value);
  }
}
