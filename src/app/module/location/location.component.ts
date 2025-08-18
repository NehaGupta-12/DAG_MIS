import {Component, ViewChild} from '@angular/core';
import {AdvanceTable} from "../../advance-table/advance-table.model";
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDialog} from "@angular/material/dialog";
import {AddLocationComponent} from "../add-location/add-location.component";

@Component({
  selector: 'app-location',
  imports: [
    MatHeaderRow,
    MatRow,
    MatProgressSpinner,
    MatIcon,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatPaginator,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {
  // ✅ Column definitions
  columnDefinitions = [
    { def: 'firstName', label: 'First Name', visible: true },
    { def: 'email', label: 'Email', visible: true },
    { def: 'gender', label: 'Gender', visible: true },
    { def: 'birthDate', label: 'Birth Date', visible: true },
    { def: 'mobile', label: 'Mobile', visible: true },
    { def: 'address', label: 'Address', visible: true },
    { def: 'country', label: 'Country', visible: true },
  ];

  // ✅ Data source
  dataSource = new MatTableDataSource<AdvanceTable>([]);
  isLoading = false;

  // ✅ Paginator & Sort
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    this.loadDummyData();
  }

  // ✅ Dynamically get columns to display
  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  }

  // ✅ Load dummy data
  loadDummyData() {
    const dummyData: AdvanceTable[] = [
      // {
      //   id: 1,
      //   firstName: 'John Doe',
      //   email: 'john.doe@example.com',
      //   gender: 'Male',
      //   birthDate: '1990-01-15',
      //   mobile: '9876543210',
      //   address: '123 Main St, New York',
      //   country: 'USA'
      // },
      // {
      //   id: 2,
      //   firstName: 'Jane Smith',
      //   email: 'jane.smith@example.com',
      //   gender: 'Female',
      //   birthDate: '1985-05-23',
      //   mobile: '9876501234',
      //   address: '456 Park Ave, London',
      //   country: 'UK'
      // },
      // {
      //   id: 3,
      //   firstName: 'Raj Kumar',
      //   email: 'raj.kumar@example.com',
      //   gender: 'Male',
      //   birthDate: '1992-09-10',
      //   mobile: '9876123456',
      //   address: 'MG Road, Bangalore',
      //   country: 'India'
      // }
    ];

    this.dataSource.data = dummyData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // ✅ Search filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // ✅ Add button click
  addNew() {
    alert('Add button clicked! Implement dialog or form here.');
  }

  openDialog() {
    this.dialog.open(AddLocationComponent, {
      // width: '400px',   // set width
      autoFocus: false  // optional
    });
  }

}
