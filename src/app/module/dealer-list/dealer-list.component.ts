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
      name: 'John Doe',
      modelType: 'Hatchbacks',
      division: 'Mumbai',
      town: 'Hingna',
      category: 'COCO',
      location: '123 Main St, New York',
    },
    {
      id: 2,
      name: 'Jane Smith',
      modelType: 'Sedans',
      division: 'Pune',
      town: 'Thane',
      category: 'DOCO',
      location: '456 Park Ave, London',
    },
    {
      id: 3,
      name: 'Raj Kumar',
      modelType: 'SUVs',
      division: 'Nagpur',
      town: 'Kharadi',
      category: 'DEALER',
      location: 'MG Road, Bangalore',
    },
    {
      id: 3,
      name: 'Prashant T',
      modelType: 'Hatchbacks',
      division: 'Mumbai',
      town: 'Pimpri',
      category: 'OUTLET',
      location: 'MG Road, Bangalore',
    },
    {
      id: 3,
      name: 'Saurav S',
      modelType: 'SUVs',
      division: 'Amravati',
      town: 'Khamla',
      category: 'SHOWROOM',
      location: 'MG Road, Bangalore',
    }
  ];

  dataSource = new MatTableDataSource<any>(this.users);

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'name', label: 'Name' },
    { def: 'modelType', label: 'Model Type' },
    { def: 'division', label: 'Division' },
    { def: 'town', label: 'Birth Date' },
    { def: 'category', label: 'Category' },
    { def: 'location', label: 'Location' },
  ];

  displayedColumns: string[] = [
    'id',
    'name',
    'modelType',
    'division',
    'town',
    'category',
    'location',
    'action'
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

  editDealer(row: any) {
    console.log("Edit Dealer:", row);
    // Navigate or open dialog to edit
  }

  deleteDealer(row: any) {
    console.log("Delete Dealer:", row);
    // Add delete logic here
  }

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
