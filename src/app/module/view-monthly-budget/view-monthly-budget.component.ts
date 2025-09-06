import {Component, EnvironmentInjector, Inject, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
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
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";

import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";

import {MonthlyBudgetService} from "../monthly-budget.service";
import Swal from "sweetalert2";
import {LoadingService} from "../../Services/loading.service";

@Component({
  selector: 'app-view-monthly-budget',
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
    MatSort
  ],
  templateUrl: './view-monthly-budget.component.html',
  standalone: true,
  styleUrl: './view-monthly-budget.component.scss'
})
export class ViewMonthlyBudgetComponent implements OnInit {
  // ✅ Initialize empty table
  dataSource = new MatTableDataSource<any>([]);

// ✅ Centralized column definitions
  columnDefinitions = [
    { def: 'srNo', label: 'Sr No' },
    { def: 'sku', label: 'SKU' },
    { def: 'productName', label: 'Name' },
    { def: 'budgetQuantity', label: 'Quantity' },
    { def: 'action', label: 'Action' }
  ];

  displayedColumns: string[] = this.columnDefinitions.map(c => c.def);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private injector: EnvironmentInjector,
    private monthlybudgetService: MonthlyBudgetService,
    private loadingService: LoadingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log('Received data in ViewBudgetProduct:', this.data);

    // ✅ Show loader while fetching data
    this.loadingService.setLoading(true);

    // If dialog is passed full budget object
    if (this.data?.items) {
      this.dataSource = new MatTableDataSource(this.data.items);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loadingService.setLoading(false);
    }

    // If only docId is passed, fetch from service
    else if (this.data?.docId) {
      runInInjectionContext(this.injector, () => {
        this.monthlybudgetService.getBudgetById(this.data.docId).subscribe({
          next: (budget) => {
            if (budget?.items) {
              this.dataSource = new MatTableDataSource(budget.items);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }
            this.loadingService.setLoading(false);
          },
          error: (err) => {
            console.error('Failed to fetch budget:', err);
            this.loadingService.setLoading(false);
          }
        });
      });
    }
  }

// ✅ Dynamic displayed columns
  getDisplayedColumns() {
    return this.columnDefinitions.map(c => c.def);
  }

// ✅ Filter support
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editProduct(product: any) {
    console.log('Edit clicked:', product);

    this.dialog.closeAll();

    // 🔹 Pass product + parent data including month
    this.router.navigate(['/module/add-monthly-budget'], {
      queryParams: {
        ...product,
        sku: product.sku,
        docId: product?.id,
        productName: product.productName,
        budgetQuantity: product.budgetQuantity,
        country: this.data?.country,
        year: this.data?.year,
        month: this.data?.month,               // ✅ pass month
        period: JSON.stringify(product.period) // ✅ ensure object
      }
    });
  }

  deleteBudget(row: any) {
    const docId = row.id;

    if (!docId) {
      Swal.fire('Error', 'Missing document ID for this budget.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Budget Product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      // ✅ Show loader while deleting
      this.loadingService.setLoading(true);

      runInInjectionContext(this.injector, () => {
        this.monthlybudgetService.deleteBudget(docId)
          .then(() => {
            this.dataSource.data = this.dataSource.data.filter((p: any) => p.id !== docId);
            Swal.fire('Deleted!', 'Budget Product has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the Budget product. Please try again.', 'error');
          })
          .finally(() => {
            this.loadingService.setLoading(false);
          });
      });
    });
  }


}
