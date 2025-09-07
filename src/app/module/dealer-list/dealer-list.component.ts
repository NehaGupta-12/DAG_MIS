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
import {AddDealerService} from "../add-dealer.service";
import Swal from "sweetalert2";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";

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
    FeatherIconsComponent,

  ],
  templateUrl: './dealer-list.component.html',
  standalone: true,
  styleUrls: ['./dealer-list.component.scss']
})
export class DealerListComponent implements OnInit{
  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'name', label: 'Name'},
    {def: 'outletType', label: 'Outlet Type'},
    {def: 'country', label: 'Country'},
    {def: 'division', label: 'Division'},
    {def: 'town', label: 'Town'},
    // {def: 'category', label: 'category'},
    // {def: 'location', label: 'Location '},
  ];

  displayedColumns: string[] = [
    'serial',
    'name',
    'outletType',
    'country',
    'division',
    'town',
    // 'category',
    // 'location',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private addDealerService: AddDealerService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
  ) {}

  ngOnInit() {
    this.DealerList();
  }

  DealerList() {
    this.loadingService.setLoading(true); // ✅ start loader
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log(this.dataSource.data);
          this.loadingService.setLoading(false); // ✅ stop loader on success
        },
        error: (err) => {
          console.error('Error fetching Dealer list:', err);
          this.loadingService.setLoading(false); // ✅ stop loader on error
        }
      });
    });
  }

  editDealer(row: any) {
    this.router.navigate(['module/add-dealer'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',
      autoFocus: false
    });
  }

  navigateToAddDealer() {
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

  deleteDealer(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Dealer/Outlet!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.setLoading(true); // ✅ start loader
        runInInjectionContext(this.injector, () => {
          this.addDealerService.deleteDealer(id)
            .then(() => {
              this.DealerList(); // ✅ reload list after delete
              Swal.fire('Deleted!', 'Dealer/Outlet has been deleted.', 'success');
            })
            .catch((err) => {
              console.error('Delete failed:', err);
              Swal.fire('Error', 'Failed to delete Dealer/Outlet. Please try again.', 'error');
            })
            .finally(() => {
              this.loadingService.setLoading(false); // ✅ stop loader
            });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Dealer/Outlet data is safe.', 'info');
      }
    });
  }

}
