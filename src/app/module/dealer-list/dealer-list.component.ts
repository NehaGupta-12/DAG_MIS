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
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";

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
    DatePipe,
    FeatherIconsComponent
  ],
  templateUrl: './dealer-list.component.html',
  styleUrl: './dealer-list.component.scss'
})
export class DealerListComponent {
  users = [
    {
      id: 1,
      name: "John Doe",
      outletType: "COCO",
      division: "us-central",
      country: "USA",
      town: "Hingna",
      category: "DEALER",
      location: "Dadar, Mumbai, India"
    },
    {
      id: 2,
      name: "Amit Sharma",
      outletType: "CODO",
      division: "us-east",
      country: "India",
      town: "Thane",
      category: "OUTLET",
      location: "Thane, Mumbai, India"
    },
    {
      id: 3,
      name: "Fatima Noor",
      outletType: "COCO",
      division: "asia-south",
      country: "UAE",
      town: "Kharadi",
      category: "SHOWROOM",
      location: "Kharadi, Pune, India"
    },
    {
      id: 4,
      name: "Hiroshi Tanaka",
      outletType: "CODO",
      division: "asia-northeast",
      country: "Japan",
      town: "Khamla",
      category: "CUSTOMER",
      location: "Khamla, Nagpur, India"
    },
    {
      id: 5,
      name: "Sara Khan",
      outletType: "COCO",
      division: "europe-west",
      country: "Saudi Arabia",
      town: "Pimpri",
      category: "DEALER",
      location: "Pimpri, Pune, India"
    },
    {
      id: 6,
      name: "Michael Smith",
      outletType: "CODO",
      division: "us-west",
      country: "USA",
      town: "Dadar",
      category: "OUTLET",
      location: "Dadar, Mumbai, India"
    },
    {
      id: 7,
      name: "Lakshmi Iyer",
      outletType: "COCO",
      division: "asia-east",
      country: "Sri Lanka",
      town: "Thane",
      category: "SHOWROOM",
      location: "Thane, Mumbai, India"
    },
    {
      id: 8,
      name: "David Miller",
      outletType: "CODO",
      division: "south-africa",
      country: "USA",
      town: "Kharadi",
      category: "CUSTOMER",
      location: "Kharadi, Pune, India"
    },
    {
      id: 9,
      name: "Ravi Patel",
      outletType: "COCO",
      division: "asia-southeast",
      country: "India",
      town: "Khamla",
      category: "DEALER",
      location: "Khamla, Nagpur, India"
    },
    {
      id: 10,
      name: "Noor Al-Fahad",
      outletType: "CODO",
      division: "us-central",
      country: "UAE",
      town: "Pimpri",
      category: "OUTLET",
      location: "Pimpri, Pune, India"
    }
  ];


  dataSource = new MatTableDataSource<any>(this.users);

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'name', label: 'Name' },
    { def: 'outletType', label: 'Outlet Type' },
    { def: 'division', label: 'Division' },
    { def: 'country', label: 'Country' },
    { def: 'town', label: 'Birth Date' },
    { def: 'category', label: 'Category' },
    { def: 'location', label: 'Location' },
  ];

  displayedColumns: string[] = [
    'id',
    'name',
    'outletType',
    'division',
    'country',
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
