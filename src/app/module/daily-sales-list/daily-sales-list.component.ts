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

  dataSource = new MatTableDataSource<any>();

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'name', label: 'Name' },
    { def: 'sku', label: 'Sku' },
    { def: 'variant', label: 'Variant' },
    { def: 'dealerOutlet', label: 'Dealer Outlet' },
    { def: 'quantity', label: 'Quantity' },
  ];

  displayedColumns: string[] = [
    'id',
    'name',
    'sku',
    'variant',
    'dealerOutlet',
    'quantity',
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
        console.log(this.dataSource.data);
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

  deleteDailySales(row: any) {
    const docId = row.docId; // ✅ Firestore document ID

    if (!docId) {
      Swal.fire('Error', 'Missing document ID for this Daily Sale.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Daily Sale!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isLoading = true;

      runInInjectionContext(this.injector, () => {
        this.dailySlaes.deleteDailySales(docId) // ✅ use docId
          .then(() => {
            // ✅ Optimistically update UI (remove row)
            this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);

            Swal.fire('Deleted!', 'Daily Sale has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the Daily Sale. Please try again.', 'error');
          })
          .finally(() => {
            this.isLoading = false;
          });
      });
    });
  }


  getTotalQuantity(row: any): number {
    if (!row?.products) return 0;
    return row.products
      .map((p: any) => p.quantity || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
  }




}
