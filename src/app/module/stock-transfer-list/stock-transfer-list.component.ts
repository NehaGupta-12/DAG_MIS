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
import {ActivityLogService} from "../activity-log/activity-log.service";
import {MatTab, MatTabContent, MatTabGroup} from "@angular/material/tabs";
import {InventoryService} from "../add-inventory/inventory.service";


export interface StockTransfer {
  id?: string;
  createBy: string;
  createdAt: Date | string;
  fromDealerOutlet: string;
  toDealerOutlet: string;
  status:'Approved','Pending','Cancel','Rejected',
  items: StockTransferItem[];
}

export interface StockTransferItem {
  model: string;
  sku: string;
  quantity: number;
  unit: string;
  [key: string]: any;
}
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
    CommonModule,
    MatTab,
    MatTabContent,
    MatTabGroup
  ],
  templateUrl: './stock-transfer-list.component.html',
  standalone: true,
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
    {def: 'status', label: 'Status'},
    {def: 'createdAt', label: 'CreatedAt'},
    {def: 'typeOfGrn', label: 'GrnType'},
  ];

  displayedColumns: string[] = [
    'serial',
    'fromOutletDealer',
    'toOutletDealer',
    'quantityCount',
    'productsCount',
    'status',
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
    private inventoryService: InventoryService,
    private mService: ActivityLogService,
  ) {}

  ngOnInit() {
    this.loadLocationList();
    this. getIncomingStockTransferList();
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
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch stock transfer list', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  getIncomingStockTransferList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.stockTransferService.getStockTransferList().subscribe({
        next: (data: any) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch stock transfer list', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  // ✅ EDIT Stock Transfer
  editGrn(row: any) {
    this.router.navigate(['module/add-grn'], {
      queryParams: { data: JSON.stringify(row) }
    });


  }

  // ✅ ADD Stock Transfer
  navigateToAddStockTransfer() {
    this.router.navigate(['module/add-stock-transfer']);

  }



// Filtering
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  deleteGrn(id: string, row?: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Stock Transfer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loadingService.setLoading(true);

      runInInjectionContext(this.injector, () => {
        this.stockTransferService.deleteStockTransfer(id)
          .then(() => {
            this.loadLocationList();
            Swal.fire('Deleted!', 'Stock Transfer has been deleted.', 'success');

            // ✅ get username from localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';

            // ✅ collect product names from row.items
            const productNames = (row?.items || [])
              .map((p: any) => p.name || p.model || 'Unknown Product')
              .filter(Boolean)
              .join(', ');


            // 👉 log delete with username + product names
            this.mService.addLog({
              date: Date.now(),
              section: 'StockTransfer',
              action: 'Delete',
              description: `Deleted Stock Transfer by ${username} | Products: ${productNames} and mail is `
            });
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

  cancelTransfer(id: string) {
    Swal.fire({
      title: 'Cancel this transfer?',
      text: 'This will mark the transfer as Cancelled.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.stockTransferService.updateStockTransfer(id, 'Cancelled', 'outgoing')
          .then(() => Swal.fire('Cancelled', 'Stock transfer has been cancelled.', 'success'))
          .catch(err => Swal.fire('Error', 'Failed to cancel transfer.', 'error'));
      }
    });
  }


  approveTransfer(row: any) {
    runInInjectionContext(this.injector, async () => {
    Swal.fire({
      title: 'Approve this transfer?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.stockTransferService.updateStockTransfer(row.id, 'Approved', 'incoming');
          await this.updateInventoryAfterApproval(row); // Inventory adjustment on approval
          Swal.fire('Approved', 'Transfer approved successfully.', 'success');
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Failed to approve transfer.', 'error');
        }
      }
    });
    });
  }

  rejectTransfer(row: any) {
    Swal.fire({
      title: 'Reject this transfer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject',
    }).then((result) => {
      if (result.isConfirmed) {
        this.stockTransferService.updateStockTransfer(row.id, 'Rejected', 'incoming')
          .then(() => Swal.fire('Rejected', 'Transfer has been rejected.', 'success'))
          .catch(err => Swal.fire('Error', 'Failed to reject transfer.', 'error'));
      }
    });
  }

  // async updateInventoryAfterApproval(row: any) {
  //   for (const item of row.items) {
  //     await this.updateInventory(item, row.toDealerOutlet, 'increase');
  //   }
  // }

  async updateInventoryAfterApproval(row: any) {
    if (!row?.items || !row.toDealerOutlet) return;

    for (const item of row.items) {
      // Increase inventory in "to" outlet
      await this.updateInventory(item, row.toDealerOutlet, 'increase');

      // Decrease inventory in "from" outlet
      await this.updateInventory(item, row.fromDealerOutlet, 'decrease');
    }
  }

  updateInventory(product: any, outletId: string, action: 'increase' | 'decrease'): Promise<void> {
    const quantityChange = action === 'increase' ? product.quantity : -product.quantity;
    return runInInjectionContext(this.injector, () =>
      this.inventoryService.updateInventoryQuantity(outletId, product.sku, quantityChange)
    );
  }





}
