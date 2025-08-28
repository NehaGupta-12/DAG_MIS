import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {CommonModule, DatePipe} from "@angular/common";
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
import {MatIcon} from "@angular/material/icon";
import {MatPaginator} from "@angular/material/paginator";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {DailySalesService} from "../daily-sales.service";
import Swal from "sweetalert2";


@Component({
  selector: 'app-daily-sales-list',
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
    FeatherIconsComponent,
    MatSort,
    CommonModule
  ],
  templateUrl: './daily-sales-list.component.html',
  standalone: true,
  styleUrl: './daily-sales-list.component.scss'
})
export class DailySalesListComponent implements OnInit {

  users = [
    {
      id: 1,
      location: 'Mumbai Central',
      dealerOutlet: 'John Doe',
      vehicle: 'Swift VXI',
      salesQuantity: 12,
      typeOfCustomer: 'Active Customers',
      division: 'europe-west',
      country: 'India',
      town: 'Hingna',

    },
    {
      id: 2,
      location: 'Pune East',
      dealerOutlet: 'Jane Smith',
      vehicle: 'Honda City ZX',
      salesQuantity: 8,
      typeOfCustomer: 'Lapsed Customers',
      division: 'asia-northeast',
      country: 'India',
      town: 'Thane'
    },
    {
      id: 3,
      location: 'Nagpur Central',
      dealerOutlet: 'Raj Kumar',
      vehicle: 'Hyundai Creta',
      salesQuantity: 15,
      typeOfCustomer: 'Referring Customers',
      division: 'asia-southeast',
      country: 'India',
      town: 'Kharadi'
    },
    {
      id: 4,
      location: 'Amravati Depot',
      dealerOutlet: 'Prashant T',
      vehicle: 'Royal Enfield Classic 350',
      salesQuantity: 5,
      typeOfCustomer: 'Wandering Customers',
      division: 'asia-south',
      country: 'India',
      town: 'Khamla'
    },
    {
      id: 5,
      location: 'Mumbai Central',
      dealerOutlet: 'Saurav S',
      vehicle: 'KTM Duke 200',
      salesQuantity: 10,
      typeOfCustomer: 'Active Customers',
      division: 'asia-east',
      country: 'India',
      town: 'Pimpri'
    },
    {
      id: 6,
      location: 'Pune East',
      dealerOutlet: 'Jane Smith',
      vehicle: 'Swift VXI',
      salesQuantity: 7,
      typeOfCustomer: 'Wandering Customers',
      division: 'us-west',
      country: 'India',
      town: 'Dadar'
    },
    {
      id: 7,
      location: 'Nagpur Central',
      dealerOutlet: 'Raj Kumar',
      vehicle: 'Honda City ZX',
      salesQuantity: 11,
      typeOfCustomer: 'Active Customers',
      division: 'us-east',
      country: 'India',
      town: 'Hingna'
    },
    {
      id: 8,
      location: 'Amravati Depot',
      dealerOutlet: 'Prashant T',
      vehicle: 'Hyundai Creta',
      salesQuantity: 6,
      typeOfCustomer: 'Lapsed Customers',
      division: 'us-central',
      country: 'India',
      town: 'Thane'
    },
    {
      id: 9,
      location: 'Mumbai Central',
      dealerOutlet: 'John Doe',
      vehicle: 'Royal Enfield Classic 350',
      salesQuantity: 9,
      typeOfCustomer: 'Referring Customers',
      division: 'south-africa',
      country: 'India',
      town: 'Dadar'
    },
    {
      id: 10,
      location: 'Pune East',
      dealerOutlet: 'Saurav S',
      vehicle: 'KTM Duke 200',
      salesQuantity: 13,
      typeOfCustomer: 'Active Customers',
      division: 'south-africa',
      country: 'India',
      town: 'Pimpri'
    }
  ];


  dataSource = new MatTableDataSource<any>();

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'dealerOutlet', label: 'Dealer Outlet' },
    { def: 'productCount', label: 'Product' },
    { def: 'division', label: 'Division' },
    { def: 'country', label: 'Country' },
    { def: 'town', label: 'Town' },
  ];

  displayedColumns: string[] = [
    'id',
    'dealerOutlet',
    'division',
    'country',
    'town',
    'productCount',   // ✅ New column
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  // ✅ Data source
  // dataSource = new MatTableDataSource<AdvanceTable>([]);
  // isLoading = false;


  constructor(private dialog: MatDialog,
              private router: Router,
              private injector: EnvironmentInjector,
              private dailySlaes: DailySalesService,
              ) {
  }

  ngOnInit() {
    this.loadLocationList()
  }

  loadLocationList() {
    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe((data) => {
        this.dataSource.data = data.map((item, index) => ({
          id: index + 1, // Sr. No.
          ...item
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.dataSource.data)
      });
    });
  }


  goToEdit(row: any) {
    this.router.navigate(['module/add-daily-sales'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',   // set width
      autoFocus: false  // optional
    });
  }

  navigateToAddDailySales(){
    this.router.navigate(['module/add-daily-sales']);
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

  delete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Daily Sales!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deletion
        runInInjectionContext(this.injector, () => {
          this.dailySlaes.deleteDailySales(id).then(() => {
            this.loadLocationList();


            // Optional: Show success alert
            Swal.fire('Deleted!', 'Daily Sales has been deleted.', 'success');
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Daily Sales is safe.', 'info');
      }
    });
  }

  getTotalQuantity(row: any): number {
    if (!row?.products) return 0;
    return row.products
      .map((p: any) => p.quantity || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
  }




}
