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
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";
import {GrnViewComponent} from "../grn-view/grn-view.component";
import {DailySaleViewComponent} from "../daily-sale-view/daily-sale-view.component";
import {ActivityLogService} from "../activity-log/activity-log.service";
import {InventoryService} from "../add-inventory/inventory.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";


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

  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    {def: 'id', label: 'ID'},
    {def: 'name', label: 'Name'},
    {def: 'sku', label: 'Sku'},
    {def: 'variant', label: 'Variant'},
    {def: 'dealerOutlet', label: 'Dealer Outlet'},
    {def: 'salesDate', label: 'SalesDate'},
    {def: 'quantity', label: 'Quantity'},
    {def: 'salesType', label: 'SalesType'},
  ];

  displayedColumns: string[] = [
    'id',
    'name',
    'sku',
    'variant',
    'dealerOutlet',
    'quantity',
    'salesType',
    'salesDate',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private mFirestore: AngularFirestore,
    private injector: EnvironmentInjector,
    private dailySlaes: DailySalesService,
    private loadingService: LoadingService,
    public authService: AuthService,
    private mService: ActivityLogService,
    private inventoryService: InventoryService,
  ) {
  }

  ngOnInit() {
    this.loadLocationList();
  }

  loadLocationList() {
    this.loadingService.setLoading(true); // ✅ start loader
    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe({
        next: (data) => {
          console.log("data", data)
          let sum = 0;
          data.forEach(it =>{
            sum += it.quantity
          })
          console.log(sum)
          this.dataSource.data = data.map((item, index) => ({
            id: index + 1, // Sr. No.
            ...item
          }));
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log(this.dataSource.data);
          this.loadingService.setLoading(false); // ✅ stop loader on success
        },
        error: (err) => {
          console.error('Error fetching Daily Sales:', err);
          this.loadingService.setLoading(false); // ✅ stop loader on error
        }
      });
    });
  }

  goToEdit(row: any) {
    this.router.navigate(['module/add-daily-sales'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }

  viewStock(row: any) {
    this.dialog.open(DailySaleViewComponent, {
      width: '900px',
      height: '600px',
      data: row, // pass row data to dialog
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',
      autoFocus: false
    });
  }

  // navigateToAddDailySales() {
  //   this.router.navigate(['module/add-daily-sales']);
  // }


  // ✅ ADD
  navigateToAddDailySales() {
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

  // deleteDailySales(row: any) {
  //   const docId = row.docId; // ✅ Firestore document ID
  //
  //   if (!docId) {
  //     Swal.fire('Error', 'Missing document ID for this Daily Sale.', 'error');
  //     return;
  //   }
  //
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'You will not be able to recover this Daily Sale!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'No, cancel',
  //   }).then((result) => {
  //     if (!result.isConfirmed) return;
  //
  //     this.loadingService.setLoading(true); // ✅ start loader
  //
  //     runInInjectionContext(this.injector, () => {
  //       this.dailySlaes.deleteDailySales(docId)
  //         .then(() => {
  //           // ✅ Optimistically update UI (remove row)
  //           this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);
  //
  //           Swal.fire('Deleted!', 'Daily Sale has been deleted.', 'success');
  //         })
  //         .catch((err) => {
  //           console.error('Delete failed:', err);
  //           Swal.fire('Error', 'Failed to delete the Daily Sale. Please try again.', 'error');
  //         })
  //         .finally(() => {
  //           this.loadingService.setLoading(false); // ✅ stop loader after completion
  //         });
  //     });
  //   });
  // }

  // ✅ DELETE

  // deleteDailySales(row: any): void { // explicitly void
  //   const docId = row.docId;
  //   if (!docId) {
  //     Swal.fire('Error', 'Missing document ID for this Daily Sale.', 'error');
  //     return;
  //   }
  //
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'You will not be able to recover this Daily Sale!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'No, cancel',
  //   }).then((result) => {
  //     if (!result.isConfirmed) return;
  //
  //     this.loadingService.setLoading(true);
  //
  //     runInInjectionContext(this.injector, () => {
  //       this.dailySlaes.deleteDailySales(docId)
  //         .then(() => {
  //           this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);
  //           Swal.fire('Deleted!', 'Daily Sale has been deleted.', 'success');
  //
  //           // Log deletion
  //           this.mService.addLog({
  //             date: Date.now(),
  //             section: 'Daily Sales',
  //             action: 'Delete',
  //             description: `Deleted Daily Sale for ${row.name} (SKU: ${row.sku})`
  //           });
  //
  //           return; // ✅ explicit return
  //         })
  //         .catch((err) => {
  //           console.error('Delete failed:', err);
  //           Swal.fire('Error', 'Failed to delete the Daily Sale. Please try again.', 'error');
  //           return; // ✅ explicit return
  //         })
  //         .finally(() => {
  //           this.loadingService.setLoading(false);
  //           return; // ✅ explicit return
  //         });
  //     });
  //
  //     return; // ✅ explicit return after Swal
  //   });
  //
  //   return; // ✅ explicit return for the outer function
  // }

  deleteDailySales(sale: any) {
    Swal.fire({
      title: 'Delete Daily Sale?',
      text: `Are you sure you want to delete the sale for ${sale.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No'
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      this.loadingService.setLoading(true);

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
      const timestamp = Date.now();

      runInInjectionContext(this.injector, async () => {
        try {
          // 1️⃣ Delete the daily sale
          await this.dailySlaes.deleteDailySales(sale.docId);

          // 2️⃣ Restore the inventory by increasing quantity
          await this.updateInventory(sale, 'increase'); // note: 'increase' adds back the deleted quantity

          // 3️⃣ Log the deletion activity
          await this.mService.addLog({
            date: timestamp,
            section: 'DailySales',
            action: 'Delete',
            user: username,
            description: `${username} deleted daily sales for vehicle: ${sale.name}`
          });

          Swal.fire('Deleted!', 'Daily sale removed and inventory updated.', 'success');

          // Optionally refresh the list
          // this.loadDailySalesList();

        } catch (err) {
          console.error('Error deleting daily sale:', err);
          Swal.fire('Error', 'Something went wrong while deleting.', 'error');
        } finally {
          this.loadingService.setLoading(false);
          return; // ✅ explicit return
        }
      });

    });
  }

  updateInventory(product: any, action: 'increase' | 'decrease'): Promise<void> {
    const quantityChange = action === 'increase' ? product.quantity : -product.quantity;
    return runInInjectionContext(this.injector, () =>
      this.inventoryService.updateInventoryQuantity(product.dealerOutlet, product.sku, quantityChange)
    );
  }


  getTotalQuantity(row: any): number {
    if (!row?.products) return 0;
    return row.products
      .map((p: any) => p.quantity || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
  }


}
