import {Component, EnvironmentInjector, OnInit, runInInjectionContext} from '@angular/core';
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableModule
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatPaginator} from "@angular/material/paginator";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {DatePipe, NgFor, NgForOf, NgIf} from "@angular/common";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatCheckbox} from "@angular/material/checkbox";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { AngularFireDatabase } from '@angular/fire/compat/database';
import {Permission} from "../../interfaces/products.interface";
import {RoleService} from "../../Services/role.service";
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from "firebase/compat/app";
import {Subscription} from "rxjs";
import {UserService} from "../add-user/user.service";
import {MatCard} from "@angular/material/card";
import {MatDialogTitle} from "@angular/material/dialog";

@Component({
  selector: 'app-add-role',
  imports: [
    MatTableModule,
    FormsModule,
    MatCard,
    MatDialogTitle,
    ReactiveFormsModule,
    MatFormField,
    MatProgressSpinner,
    NgIf,
    NgForOf,
    MatButton,
    MatLabel,
    MatInput
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss'
})
export class AddRoleComponent implements OnInit{
  role_form!: FormGroup;
  isLoading = false;
  userId: string | null = null;
  userSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private roleService: RoleService,
    private router: Router,
    private injector : EnvironmentInjector,
    private mSnackBar: MatSnackBar,
    public userService: UserService,
  ) {
    this.userSubscription = this.userService.getUserId().subscribe((id:any) => {
      this.userId = id;
      console.log('Logged-in User ID:', this.userId);
    });
  }

  ngOnInit(): void {
    // if (!this.userService.hasPermission('Roles & Permissions', 'create')) {
    //   this.router.navigate(['/not-authorized']);
    //   return;
    // }

    this.role_form = this.fb.group({
      roleName: ['', Validators.required],
      createdBy: [''],
      createdAt: [''],
      permissions: this.fb.array([])
    });

    runInInjectionContext(this.injector, () => {
      this.afs.collection('menuList', ref => ref.orderBy('createdAt', 'asc'))
        .valueChanges({ idField: 'menuId' })
        .subscribe((menus: any[]) => {
          const control = this.permissionsArray;

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
        });
    });
  }


  get permissionsArray(): FormArray {
    return this.role_form.get('permissions') as FormArray;
  }

  getPermissionsGroup(group: AbstractControl): FormGroup {
    return group.get('permissions') as FormGroup;
  }

  save(): void {
    if (!this.role_form.valid) {
      this.markFormGroupTouched(this.role_form);
      this.mSnackBar.open('Form is Invalid')._dismissAfter(3000);
      return;
    }

    this.isLoading = true;
    const roleData = this.role_form.value;
    runInInjectionContext(this.injector, () =>
    this.afs.collection('roles').add({
      roleName: roleData.roleName,
      permissions: roleData.permissions,
      createdBy: this.userId,
      createdAt: new Date(),
    })).then(() => {
      this.isLoading = false;
      this.role_form.reset();
      this.permissionsArray.clear();
      this.router.navigate(['/module/role-list']);
      this.mSnackBar.open('New Role Successfully Added')._dismissAfter(3000);
    }).catch(error => {
      this.isLoading = false;
      console.error('Error adding role:', error);
      this.mSnackBar.open('Error while saving role')._dismissAfter(3000);
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
    // Can be used to update 'All' checkbox dynamically if needed
  }
}

