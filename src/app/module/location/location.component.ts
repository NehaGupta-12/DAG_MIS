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
import {CommonModule, DatePipe} from "@angular/common";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {LocationService} from "../location.service";
import Swal from "sweetalert2";
import {LoadingService} from "../../Services/loading.service";

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
    FeatherIconsComponent,
    CommonModule
  ],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent implements OnInit {


  dataSource = new MatTableDataSource<any>();

  users = [
    // ... your static user data
  ];

  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'name', label: 'Name' },
    { def: 'country', label: 'Country' },
    { def: 'locationType', label: 'Location Type' },
    { def: 'locationCode', label: 'Location Code' },
    { def: 'division', label: 'Division' },
    { def: 'town', label: 'Town' },
    { def: 'address', label: 'Address' },
    { def: 'locationHead', label: 'Location Head' },
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
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private locationService: LocationService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadLocationList();
  }

// ✅ Load locations with loader
  loadLocationList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.locationService.getLocationList().subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log(this.dataSource.data);
          this.loadingService.setLoading(false);
        },
        error: () => {
          this.loadingService.setLoading(false);
        },
      });
    });
  }

  goToEdit(row: any) {
    this.router.navigate(['module/add-location'], {
      queryParams: { data: JSON.stringify(row) },
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      autoFocus: false,
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
    return this.columnDefinitions.map((c) => c.def);
  }

// Filtering
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isLoading: any;

// ✅ Delete with loader
  delete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Location!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.setLoading(true);
        runInInjectionContext(this.injector, () => {
          this.locationService
            .deleteLocation(id)
            .then(() => {
              this.loadLocationList(); // reload list
              Swal.fire('Deleted!', 'Location has been deleted.', 'success');
              this.loadingService.setLoading(false);
            })
            .catch(() => {
              this.loadingService.setLoading(false);
            });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Location is safe.', 'info');
      }
    });
  }


}
