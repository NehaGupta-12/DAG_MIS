import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {LocationService} from "../location.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-location',
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
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent implements OnInit {

  // users = [
  //   {
  //     id: 1,
  //     firstName: 'John Doe',
  //     email: 'john.doe@example.com',
  //     gender: 'Male',
  //     birthDate: '1990-01-15',
  //     mobile: '9876543210',
  //     address: '123 Main St, New York',
  //     country: 'USA'
  //   },
  //   {
  //     id: 2,
  //     firstName: 'Jane Smith',
  //     email: 'jane.smith@example.com',
  //     gender: 'Female',
  //     birthDate: '1985-05-23',
  //     mobile: '9876501234',
  //     address: '456 Park Ave, London',
  //     country: 'UK'
  //   },
  //   {
  //     id: 3,
  //     firstName: 'Raj Kumar',
  //     email: 'raj.kumar@example.com',
  //     gender: 'Male',
  //     birthDate: '1992-09-10',
  //     mobile: '9876123456',
  //     address: 'MG Road, Bangalore',
  //     country: 'India'
  //   }
  // ];

  users = [
    {
      id: 1,
      country: 'India',
      locationType: 'Head Office',
      name: 'Mumbai Central',
      locationCode: 'LOC001',
      division: 'us-central',
      town: 'Hingna',
      address: '123 MG Road, Mumbai',
      locationHead: 'Mr. Sharma',
    },
    {
      id: 2,
      country: 'India',
      locationType: 'Branch',
      name: 'Pune East',
      locationCode: 'LOC002',
      division: 'us-east',
      town: 'Thane',
      address: '45 Park Street, Pune',
      locationHead: 'Ms. Iyer',
    },
    {
      id: 3,
      country: 'India',
      locationType: 'Showroom',
      name: 'Nagpur Central',
      locationCode: 'LOC003',
      division: 'asia-south',
      town: 'Kharadi',
      address: '12 Residency Road, Nagpur',
      locationHead: 'Mr. Patil',
    },
    {
      id: 4,
      country: 'India',
      locationType: 'Outlet',
      name: 'Pimpri West',
      locationCode: 'LOC004',
      division: 'asia-northeast',
      town: 'Pimpri',
      address: '78 MG Road, Pimpri',
      locationHead: 'Mr. Deshmukh',
    },
    {
      id: 5,
      country: 'India',
      locationType: 'Warehouse',
      name: 'Amravati Depot',
      locationCode: 'LOC005',
      division: 'europe-west',
      town: 'Khamla',
      address: '56 Industrial Area, Amravati',
      locationHead: 'Mr. Gupta',
    }
  ];


  dataSource = new MatTableDataSource<any>();

  // Define columns
  columnDefinitions = [
    {def: 'id', label: 'ID'},
    {def: 'name', label: 'Name'},
    {def: 'country', label: 'Country'},
    {def: 'locationType', label: 'Location Type'},
    {def: 'locationCode', label: 'Location Code'},
    {def: 'division', label: 'Division'},
    {def: 'town', label: 'Town'},
    {def: 'address', label: 'Address'},
    {def: 'locationHead', label: 'Location Head'},
  ];

  displayedColumns: string[] = [
    'id',
    'name',
    'country',
    'locationType',
    'locationCode',
    'division',
    'town',
    'address',
    'locationHead',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  // ✅ Data source
  // dataSource = new MatTableDataSource<AdvanceTable>([]);
  // isLoading = false;


  constructor(private dialog: MatDialog,
              private router: Router,
              private locationService: LocationService,
              private injector: EnvironmentInjector,
  ) {
  }

  ngOnInit() {
    this.loadLocationList()
  }

  loadLocationList() {
    runInInjectionContext(this.injector, () => {
      this.locationService.getLocationList().subscribe((data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.dataSource.data)
      });
    });
  }

  goToEdit(row: any) {
    this.router.navigate(['module/add-location'], {
      queryParams: {data: JSON.stringify(row)}
    });
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

  navigateToAddLocation() {
    this.router.navigate(['module/add-location']);
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
      text: 'You will not be able to recover this Installation!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deletion
        runInInjectionContext(this.injector, () => {
          this.locationService.deleteLocation(id).then(() => {
            this.loadLocationList();

            // // Log activity
            // const activity = {
            //   date: new Date().getTime(),
            //   section: 'Installation List',
            //   action: 'Delete',
            //   description: `Installation deleted by user`,
            //   currentIp: localStorage.getItem('currentip')!,
            // };
            // this.mLogService.addLog(activity);

            // Optional: Show success alert
            Swal.fire('Deleted!', 'Installation has been deleted.', 'success');
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Installation is safe.', 'info');
      }
    });
  }

}
