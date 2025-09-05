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
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {AddUserComponent} from "../add-user/add-user.component";
import {Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {AuthService} from "@core";
import {UserService} from "../add-user/user.service";
import {UserDataModel} from "../add-user/UserData.model";
import {deleteUser} from "@angular/fire/auth";

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
    DatePipe,
    FeatherIconsComponent
  ],
  templateUrl: './user-list.component.html',
  standalone: true,
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit{
  users : any[]=[];
  dataSource = new MatTableDataSource<any>(this.users);
  // Define columns
  displayedColumns: string[] = [
    'first',
    'last',
    'email',
    'mobile',
    'country',
    'department',
    'role',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private dialog: MatDialog,
              private router: Router,
              private userService: UserService,
              private authService : AuthService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    // Fetch employee data
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
    if (element && element.uid) {
      this.router.navigate(['module/edit-user', element.uid]);
    } else {
      console.error('User ID not found');
    }
  }

  deleteUser(element:any) {
  }

}
