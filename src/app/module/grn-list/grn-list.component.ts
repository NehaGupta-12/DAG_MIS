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
import {AddDealerService} from "../add-dealer.service";
import Swal from "sweetalert2";
import {GrnService} from "../grn.service";
import {Validators} from "@angular/forms";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";
import {GrnViewComponent} from "../grn-view/grn-view.component";
import {ActivityLogService} from "../activity-log/activity-log.service";
import {InventoryService} from "../add-inventory/inventory.service";

@Component({
  selector: 'app-grn-list',
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
  templateUrl: './grn-list.component.html',
  standalone: true,
  styleUrl: './grn-list.component.scss'
})
export class GRNListComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'name', label: 'Name'},
    {def: 'sku', label: 'Sku'},
    {def: 'variant', label: 'Variant'},
    {def: 'dealerOutlet', label: 'Dealer Outlet'},
    {def: 'quantity', label: 'Quantity'},
    {def: 'stockDate', label: 'CreatedAt'},
    // {def: 'typeOfGrn', label: 'GrnType'},
  ];

  displayedColumns: string[] = [
    'serial',
    'name',
    'sku',
    'variant',
    'dealerOutlet',
    'quantity',
    'stockDate',
    // 'typeOfGrn',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private grnService: GrnService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
    private mService: ActivityLogService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    this.loadLocationList();
  }

  loadLocationList() {
    this.loadingService.setLoading(true); // ✅ start loader
    runInInjectionContext(this.injector, () => {
      this.grnService.getGrnList().subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log(this.dataSource.data);
          this.loadingService.setLoading(false); // ✅ stop loader on success
        },
        error: (err) => {
          console.error('Error fetching GRN list:', err);
          this.loadingService.setLoading(false); // ✅ stop loader on error
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
      // width: '400px',
      autoFocus: false
    });
  }

  // navigateToAddGrn() {
  //   this.router.navigate(['module/add-grn']);
  // }

  navigateToAddGrn(): void {
    this.router.navigate(['module/add-grn']);


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

  // deleteGrn(row: any) {
  //   const docId = row.docId; // ✅ Firestore document ID
  //
  //   if (!docId) {
  //     Swal.fire('Error', 'Missing document ID for this Daily Stock.', 'error');
  //     return;
  //   }
  //
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'You will not be able to recover this Daily Stock!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'No, cancel',
  //   }).then((result) => {
  //     if (!result.isConfirmed) return;
  //
  //     this.loadingService.setLoading(true); // ✅ start loader
  //     runInInjectionContext(this.injector, () => {
  //       this.grnService.deleteGrn(docId)
  //         .then(() => {
  //           // ✅ Optimistically update UI
  //           this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);
  //           Swal.fire('Deleted!', 'Daily Stock has been deleted.', 'success');
  //         })
  //         .catch((err) => {
  //           console.error('Delete failed:', err);
  //           Swal.fire('Error', 'Failed to delete the Daily Stock. Please try again.', 'error');
  //         })
  //         .finally(() => {
  //           this.loadingService.setLoading(false); // ✅ stop loader
  //         });
  //     });
  //   });
  // }



  deleteGrn(row: any): void {
    const docId = row.docId;

    if (!docId) {
      Swal.fire('Error', 'Missing document ID for this Grn.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Grn Data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loadingService.setLoading(true);

      runInInjectionContext(this.injector, async () => {
        try {
          // 1️⃣ Delete GRN
          await this.grnService.deleteGrn(docId);

          // 2️⃣ Restore inventory
          await this.updateInventory(row, 'decrease'); // adds back deleted quantity

          // 3️⃣ Update UI
          this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);

          // 4️⃣ Log deletion
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
          await this.mService.addLog({
            date: Date.now(),
            section: 'Daily Stock',
            action: 'Delete',
            user: username,
            description: `${username} deleted GRN for ${row.name} (SKU: ${row.sku})`
          });

          Swal.fire('Deleted!', 'Grn Details has been deleted and inventory restored.', 'success');
        } catch (err) {
          console.error('Delete failed:', err);
          Swal.fire('Error', 'Failed to delete the Grn Details. Please try again.', 'error');
        } finally {
          this.loadingService.setLoading(false);
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
    if (!row?.items) return 0;
    return row.items
      .map((i: any) => i.quantity || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
  }

  viewGrn(row: any) {
    this.dialog.open(GrnViewComponent, {
      width: '900px',
      height: '600px',
      data: row, // pass row data to dialog
    });
  }

}
