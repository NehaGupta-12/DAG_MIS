import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import Swal from "sweetalert2";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {OutletProductService} from "../outlet-product.service";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";

@Component({
  selector: 'app-outlet-product-list',
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
    FeatherIconsComponent,
    CommonModule
  ],
  templateUrl: './outlet-product-list.component.html',
  standalone: true,
  styleUrl: './outlet-product-list.component.scss'
})
export class OutletProductListComponent implements OnInit {


  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'name', label: 'Name'},
    {def: 'sku', label: 'Sku'},
    {def: 'variant', label: 'Variant'},
    {def: 'outlet', label: 'Outlet'},
    {def: 'openingStock', label: 'OpeningStock'},
    {def: 'remark', label: 'Remark'},
    {def: 'action', label: 'Action'},
  ];

  displayedColumns: string[] = [
    'serial',
    'outlet',
    'name',
    'sku',
    'variant',
    'openingStock',
    'remark',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private outletProductService: OutletProductService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
  ) {}

  ngOnInit() {
    this.loadOutletProduct();
  }

// ✅ Load Outlet Product with loader
  loadOutletProduct() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductList().subscribe({
        next: (data: any) => {
          console.log("Fetched Outlet Products:", data);
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch outlet products', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  editloadOutletProduct(row: any) {
    this.router.navigate(['module/add-outlet-product'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, { autoFocus: false });
  }

  navigateToAddloadOutletProduct() {
    this.router.navigate(['module/add-outlet-product']);
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

// Delete with loader
  deleteOutletProduct(row: any) {
    const outletId = row.outletId || row.dealerId;
    const productId = row.id;

    if (!outletId || !productId) {
      Swal.fire('Error', 'Missing outletId or productId on this row.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Dealer/Outlet Product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loadingService.setLoading(true); // ✅ loader for delete

      runInInjectionContext(this.injector, () => {
        this.outletProductService.deleteOutletProduct(outletId, productId)
          .then(() => {
            this.dataSource.data = this.dataSource.data.filter((p: any) => p.id !== productId);
            Swal.fire('Deleted!', 'Dealer/Outlet Product has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the product. Please try again.', 'error');
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
      .map((i: any) => i.openingStock || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
  }

}
