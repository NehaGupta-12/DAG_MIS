import {Component, ViewChild} from '@angular/core';
import {DatePipe} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-dealer-list',
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
    DatePipe
  ],
  templateUrl: './dealer-list.component.html',
  styleUrl: './dealer-list.component.scss'
})
export class DealerListComponent {
  users = [
    {
      id: 1,
      firstName: 'John Doe',
      email: 'john.doe@example.com',
      gender: 'Male',
      birthDate: '1990-01-15',
      mobile: '9876543210',
      address: '123 Main St, New York',
      country: 'USA'
    },
    {
      id: 2,
      firstName: 'Jane Smith',
      email: 'jane.smith@example.com',
      gender: 'Female',
      birthDate: '1985-05-23',
      mobile: '9876501234',
      address: '456 Park Ave, London',
      country: 'UK'
    },
    {
      id: 3,
      firstName: 'Raj Kumar',
      email: 'raj.kumar@example.com',
      gender: 'Male',
      birthDate: '1992-09-10',
      mobile: '9876123456',
      address: 'MG Road, Bangalore',
      country: 'India'
    }
  ];

  dataSource = new MatTableDataSource<any>(this.users);

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'firstName', label: 'First Name' },
    { def: 'email', label: 'Email' },
    { def: 'gender', label: 'Gender' },
    { def: 'birthDate', label: 'Birth Date' },
    { def: 'mobile', label: 'Mobile' },
    { def: 'address', label: 'Address' },
    { def: 'country', label: 'Country' },
  ];

  displayedColumns: string[] = [
    'id',
    'firstName',
    'email',
    'gender',
    'birthDate',
    'mobile',
    'address',
    'country'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  // ✅ Data source
  // dataSource = new MatTableDataSource<AdvanceTable>([]);
  // isLoading = false;


  constructor(private dialog: MatDialog, private router: Router) {
  }

  ngOnInit() {
    // this.loadDummyData();
  }

  // ✅ Dynamically get columns to display
  // getDisplayedColumns(): string[] {
  //   return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  // }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',   // set width
      autoFocus: false  // optional
    });
  }

  navigateToAddDealer(){
    this.router.navigate(['module/add-dealer']);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDisplayedColumns() {
    return this.columnDefinitions.map(c => c.def);
  }

  // Filtering
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isLoading: any;



}
