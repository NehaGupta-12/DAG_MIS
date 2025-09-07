import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {CommonModule, DatePipe, NgIf} from "@angular/common";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
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
import {GrnService} from "../grn.service";
import Swal from "sweetalert2";
import {StockTransferService} from "../stock-transfer.service";
import {AddShowroomComponent} from "../add-showroom/add-showroom.component";
import {ViewStockTransferComponent} from "../view-stock-transfer/view-stock-transfer.component";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";

@Component({
  selector: 'app-stock-transfer-list',
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
  templateUrl: './stock-transfer-list.component.html',
  styleUrl: './stock-transfer-list.component.scss'
})
export class StockTransferListComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'fromOutletDealer', label: 'FromOutletDealer'},
    {def: 'toOutletDealer', label: 'ToOutletDealer'},
    {def: 'quantityCount', label: 'QuantityCount'},
    {def: 'productsCount', label: 'ProductsCount'},
    {def: 'createdAt', label: 'CreatedAt'},
    {def: 'typeOfGrn', label: 'GrnType'},
  ];

  displayedColumns: string[] = [
    'serial',
    'fromOutletDealer',
    'toOutletDealer',
    'quantityCount',
    'productsCount',
    'createdAt',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private stockTransferService: StockTransferService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
  ) {}

  ngOnInit() {
    this.loadLocationList();
  }

// ✅ Load list with loader
  loadLocationList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.stockTransferService.getStockTransferList().subscribe({
        next: (data: any) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log(this.dataSource.data);
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch stock transfer list', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  editGrn(row: any) {
    this.router.navigate(['module/add-grn'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      autoFocus: false
    });
  }

  navigateToAddStockTransfer() {
    this.router.navigate(['module/add-stock-transfer']);
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

// ✅ Delete with loader
  deleteGrn(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Stock Transfer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loadingService.setLoading(true); // loader before deletion

      runInInjectionContext(this.injector, () => {
        this.stockTransferService.deleteStockTransfer(id)
          .then(() => {
            this.loadLocationList();
            Swal.fire('Deleted!', 'Stock Transfer has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the Stock Transfer. Please try again.', 'error');
          })
          .finally(() => {
            this.loadingService.setLoading(false);
          });
      });
    });
  }

  getTotalQuantity(row: any): number {
    if (!row?.items) return 0;
    return row.items
      .map((i: any) => i.quantity || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
  }

  openAssignDialog(row: any): void {
    const dialogRef = this.dialog.open(ViewStockTransferComponent, {
      width: '70vw',
      height: '70vh',
      maxWidth: '100vw',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with:', result);
      }
    });
  }



}
