import { Component, EnvironmentInjector, OnInit, runInInjectionContext } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from "firebase/compat/app";
import { Subscription } from "rxjs";
import { UserService } from "../add-user/user.service";
import {MatCard} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgForOf, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatDialogTitle} from "@angular/material/dialog";

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatFormField,
    MatProgressSpinner,
    NgIf,
    MatButton,
    NgForOf,
    MatDialogTitle,
    MatInput,
    MatLabel
  ],
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  role_form!: FormGroup;
  isLoading = false;
  userId: string | null = null;
  userSubscription: Subscription | undefined;
  roleId: string | null = null;  // detect if edit mode
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private injector: EnvironmentInjector,
    private mSnackBar: MatSnackBar,
    public userService: UserService,
  ) {
    this.userSubscription = this.userService.getUserId().subscribe((id: any) => {
      this.userId = id;
    });
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roleId;

    this.role_form = this.fb.group({
      roleName: ['', Validators.required],
      createdBy: [''],
      createdAt: [''],
      permissions: this.fb.array([])
    });

    // Load menu list first
    runInInjectionContext(this.injector, () => {
      this.afs.collection('menuList', ref => ref.orderBy('createdAt', 'asc'))
        .valueChanges({ idField: 'menuId' })
        .subscribe((menus: any[]) => {
          const control = this.permissionsArray;
          control.clear();

          menus.forEach((menu, index) => {
            control.push(this.fb.group({
              menuId: [menu.menuId],
              menuSrNo: [index + 1],
              menu_name: [menu.menu_name],
              permissions: this.fb.group({
                all: [false],
                list: [false],
                create: [false],
                edit: [false],
                delete: [false],
                print: [false],
                export: [false],
                approved: [false],
                disapproved: [false]
              })
            }));
          });

          // If edit mode → load role data
          if (this.isEditMode) {
            this.loadRoleData();
          }
        });
    });
  }

  get permissionsArray(): FormArray {
    return this.role_form.get('permissions') as FormArray;
  }

  getPermissionsGroup(group: AbstractControl): FormGroup {
    return group.get('permissions') as FormGroup;
  }

  loadRoleData(): void {
    runInInjectionContext(this.injector, () => {
    if (!this.roleId) return;
      this.afs.collection('roles').doc(this.roleId).get().subscribe(doc => {
        const role: any = doc.data();
        if (!role) return;

        this.role_form.get('roleName')?.setValue(role.roleName);

        // patch permissions
        this.permissionsArray.controls.forEach((control, index) => {
          const menuId = control.get('menuId')?.value;
          const menuPermission = role.permissions.find((p: any) => p.menuId === menuId);

          if (menuPermission) {
            control.get('permissions')?.patchValue(menuPermission.permissions);
          }
        });
      });
    });
  }

  save(): void {
    if (!this.role_form.valid) {
      this.markFormGroupTouched(this.role_form);
      this.mSnackBar.open('Form is Invalid', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const roleData = this.role_form.value;
    runInInjectionContext(this.injector, () => {
    if (this.isEditMode && this.roleId) {
      // 🔹 Update role inside injection context
        this.afs.collection('roles').doc(this.roleId).update({
          roleName: roleData.roleName,
          permissions: roleData.permissions,
          updatedBy: this.userId,
          updatedAt: new Date(),
        }).then(() => {
          this.isLoading = false;
          this.mSnackBar.open('Role updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/module/role-list']);
        }).catch(error => {
          this.isLoading = false;
          console.error('Error updating role:', error);
          this.mSnackBar.open('Error while updating role', 'Close', { duration: 3000 });
        });
    } else {
        this.afs.collection('roles').add({
          roleName: roleData.roleName,
          permissions: roleData.permissions,
          createdBy: this.userId,
          createdAt: new Date(),
        }).then(() => {
          this.isLoading = false;
          this.role_form.reset();
          this.permissionsArray.clear();
          this.router.navigate(['/module/role-list']);
          this.mSnackBar.open('New Role Successfully Added', 'Close', { duration: 3000 });
        }).catch(error => {
          this.isLoading = false;
          console.error('Error adding role:', error);
          this.mSnackBar.open('Error while saving role', 'Close', { duration: 3000 });
        });
    }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  resetForm(): void {
    window.location.reload();
  }

  backToHome(): void {
    this.router.navigate(['/module/role-list']);
  }

  isAllSelected(index: number): boolean {
    const permissions = this.permissionsArray.at(index).get('permissions') as FormGroup;
    return Object.values(permissions.value).every(val => val === true);
  }

  toggleAll(index: number, event: any): void {
    const checked = event.target.checked;
    const permissions = this.permissionsArray.at(index).get('permissions') as FormGroup;
    Object.keys(permissions.controls).forEach(key => permissions.get(key)?.setValue(checked));
  }

  onPermissionChange(index: number): void {
    // You can dynamically manage "all" checkbox here if needed
  }
}
