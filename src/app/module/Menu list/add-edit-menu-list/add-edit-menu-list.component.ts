import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext} from '@angular/core';
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
import { serverTimestamp } from 'firebase/firestore';
import {ActivityLogService} from "../../activity-log/activity-log.service";
import {LoadingService} from "../../../Services/loading.service";
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
  ],
  templateUrl: './add-edit-menu-list.component.html',
  standalone: true,
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
    private injector : EnvironmentInjector,
    private dialogRef: MatDialogRef<AddEditMenuListComponent>,
    private mSnackBar: MatSnackBar,
    private userService: UserService,
    private mService: ActivityLogService,
    private loadingService: LoadingService,
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

  // async submitForm(): Promise<void> {
  //   if (!this.menuForm.valid || !this.userId) {
  //     this.mSnackBar.open('Please enter all required fields', undefined, { duration: 2000 });
  //     return;
  //   }
  //
  //   this.isLoading = true;
  //   this.menuForm.get('menu_name')?.enable();
  //
  //   const menuData = this.menuForm.getRawValue();
  //   const transformedData: Menus = {
  //     menu_name: this.toUcFirst(menuData.menu_name.trim()),
  //     menu_url: menuData.menu_url.trim(),
  //     createdAt: new Date(),     // ✅ normal JS Date
  //     createdBy: this.userId!,   // ✅ userId
  //   } as Menus;
  //
  //   try {
  //     await runInInjectionContext(this.injector, () =>
  //       this.menusService.addMenu(transformedData)
  //     );
  //     this.handleSuccess('Menu details added successfully', 'Add');
  //   } catch (error) {
  //     this.handleError(error);
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }

  async submitForm(): Promise<void> {
    if (!this.menuForm.valid || !this.userId) {
      this.mSnackBar.open('Please enter all required fields', undefined, { duration: 2000 });
      return;
    }

    this.loadingService.setLoading(true);
    this.menuForm.get('menu_name')?.enable();

    const menuData = this.menuForm.getRawValue();
    const transformedData: Menus = {
      menu_name: this.toUcFirst(menuData.menu_name.trim()),
      menu_url: menuData.menu_url.trim(),
      createdAt: new Date(),     // ✅ normal JS Date
      createdBy: this.userId!,   // ✅ userId
    } as Menus;

    try {
      await runInInjectionContext(this.injector, () =>
        this.menusService.addMenu(transformedData)
      );

      // ✅ Activity log
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = userData.userName || `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
      const gender = userData.gender || 'Male';
      const pronoun = gender.toLowerCase() === 'female' ? 'her' : 'his';
      const timestamp = Date.now();

      this.mService.addLog({
        date: timestamp,
        section: "Menu List",
        action: "Add",
        user: username,
        description: `${username} added new menu "${transformedData.menu_name}" and ${pronoun} mail is `
      });

      this.handleSuccess('Menu details added successfully', 'Add');

    } catch (error) {
      this.handleError(error);
    } finally {
      this.loadingService.setLoading(false);
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
