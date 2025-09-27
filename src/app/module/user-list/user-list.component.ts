import {Component, OnInit, ViewChild} from '@angular/core';
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {AddUserComponent} from "../add-user/add-user.component";
import {Router} from "@angular/router";
import {DatePipe, NgIf} from "@angular/common";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
// import {AuthService} from "@core";
import {UserService} from "../add-user/user.service";
import {UserDataModel} from "../add-user/UserData.model";
import {deleteUser} from "@angular/fire/auth";
import {AuthService} from "../../authentication/auth.service";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatSnackBar} from "@angular/material/snack-bar";
import firebase from "firebase/compat";
import Functions = firebase.functions.Functions;
import {AngularFireFunctions} from "@angular/fire/compat/functions";

@Component({
  selector: 'app-user-list',
  imports: [
    MatCell,
    MatHeaderCell,
    MatHeaderRow,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatTable,
    MatTooltip,
    MatColumnDef,
    MatTableModule,
    MatIconModule,
    DatePipe,
    FeatherIconsComponent,
    NgIf,
    MatSlideToggle
  ],
  templateUrl: './user-list.component.html',
  standalone: true,
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit{
  users : any[]=[];
  dataSource = new MatTableDataSource<any>(this.users);
  hasCountry: boolean = false;
  // Define columns
  displayedColumns: string[] = [
    'sr',
    'user',
    'email',
    'mobile',
    'country',
    'department',
    'role',
    'status',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private dialog: MatDialog,
              private router: Router,
              private userService: UserService,
              public authService : AuthService,
              private snackBar : MatSnackBar,
              private functions: AngularFireFunctions,
              ) {
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.userService.getUsers().subscribe((snapshotChanges:any) => {
      this.users = [];
      snapshotChanges.forEach((snapshot:any) => {
        const emp = snapshot.payload.toJSON() as UserDataModel;
        if (snapshot.key != null) {
          emp['id'] = snapshot.key;
        }
        this.users.push(emp);
      });

      this.dataSource = new MatTableDataSource(this.users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // 👇 Custom filter logic
      this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
        const searchTerm = filter.trim().toLowerCase();

        // combine fields you want searchable
        const fullName = `${data.first || ''} ${data.last || ''}`.toLowerCase();
        const userName = (data.userName || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        const mobile = (data.mobile || '').toLowerCase();
        const country = (data.country || '').toLowerCase();
        const department = (data.department || '').toLowerCase();
        const role = (data.role || '').toLowerCase();

        // return true if search term is found in ANY field
        return (
          fullName.includes(searchTerm) ||
          userName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          mobile.includes(searchTerm) ||
          country.includes(searchTerm) ||
          department.includes(searchTerm) ||
          role.includes(searchTerm)
        );
      };

      this.isLoading = false;
    });
  }

  navigateToAddUser(){
    this.router.navigate(['module/add-user']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  isLoading: any;

  editDialog(element: any) {
    console.log(element)
    if (element && element.id) {
      this.router.navigate(['module/edit-user', element.id]);
    } else {
      console.error('User ID not found');
    }
  }

  deleteUser(element:any) {
  }
  toggleStatus(user: any, isActive: boolean): void {
    const disable = !isActive;
    alert(disable)
    this.functions.httpsCallable('disableUser')({
      uid: user.id,
      disabled: disable
    }).subscribe({
      next: (res: any) => {
        user.status = res.status; // use returned status
        this.snackBar.open(
          `User ${user.first} ${user.last} marked as ${user.status}`,
          '',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error('Error toggling user:', err);
        this.snackBar.open('Failed to update user status', '', { duration: 3000 });
      }
    });
  }



  viewUser(element:any) {
    console.log(element)
    if (element) {
      this.router.navigate(['module/view-user', element.id]);
    } else {
      console.error('User ID not found');
    }
  }


}
