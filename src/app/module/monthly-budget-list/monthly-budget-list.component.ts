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
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {OutletProductService} from "../outlet-product.service";
import {AddUserComponent} from "../add-user/add-user.component";
import Swal from "sweetalert2";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {CommonModule} from "@angular/common";
// import { ViewBudgetProductComponent } from '../view-budget-product/view-budget-product.component';
import {ViewMonthlyBudgetComponent} from "../view-monthly-budget/view-monthly-budget.component";
import {MonthlyBudgetService} from "../monthly-budget.service";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";
import {ActivityLogService} from "../activity-log/activity-log.service";

@Component({
  selector: 'app-monthly-budget-list',
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
  templateUrl: './monthly-budget-list.component.html',
  standalone: true,
  styleUrl: './monthly-budget-list.component.scss'
})
export class MonthlyBudgetListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();

  columnDefinitions = [
    { def: 'serial', label: 'Serial' },
    { def: 'country', label: 'Country' },
    { def: 'year', label: 'Year' },
    { def: 'month', label: 'Month' },
    { def: 'period', label: 'Period' },
    // { def: 'budgetQuantity', label: 'BudgetQuantity' },
    { def: 'targetQuantity', label: 'targetQuantity' },
    { def: 'action', label: 'Action' },
  ];

  displayedColumns: string[] = [
    'serial',
    'country',
    'year',
    'month',
    'period',
    // 'budgetQuantity',
    'targetQuantity',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private outletProductService: OutletProductService,
    private monthlybudgetService: MonthlyBudgetService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
    private mService: ActivityLogService,
  ) {}

  ngOnInit() {
    this.loadbudget();
  }

// ✅ Load budget with loader
  loadbudget() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.monthlybudgetService.getBudgetList().subscribe({
        next: (data: any[]) => {
          console.log("Raw Data:", data);

          // 🔄 Add totalTargetQuantity to each row
          this.dataSource.data = data.map(row => ({
            ...row,
            totalTargetQuantity: row.products?.reduce(
              (sum: number, p: any) => sum + (p.targetQuantity || 0),
              0
            ) || 0
          }));

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          this.loadingService.setLoading(false);
        },
        error: () => {
          this.loadingService.setLoading(false);
        },
      });
    });
  }


  // editloadOutletProduct(row: any) {
  //   this.router.navigate(['module/add-monthly-budget'], {
  //     queryParams: { data: JSON.stringify(row) },
  //   });
  // }
  // ✅ EDIT
  editloadOutletProduct(row: any) {
    this.router.navigate(['module/add-monthly-budget'], {
      queryParams: { data: JSON.stringify(row) },
    });

    // 👉 Log Activity
    this.mService.addLog({
      date: Date.now(),
      section: "Monthly Budget",
      action: "Edit",
      description: `Edited Monthly Budget for ${row.country} - ${row.year}/${row.month}`
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, { autoFocus: false });
  }

  // navigateToAddloadOutletProduct() {
  //   this.router.navigate(['module/add-monthly-budget']);
  // }


  // ✅ ADD
  navigateToAddloadOutletProduct() {
    this.router.navigate(['module/add-monthly-budget']);

    // 👉 Log Activity
    this.mService.addLog({
      date: Date.now(),
      section: "Monthly Budget",
      action: "Add",
      description: `Created a new Monthly Budget`
    });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDisplayedColumns() {
    return this.columnDefinitions.map((c) => c.def);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

// ✅ Delete budget with loader
//   deleteBudget(row: any) {
//     const docId = row.docId;
//     if (!docId) {
//       Swal.fire('Error', 'Missing document ID for this Monthly Target.', 'error');
//       return;
//     }
//
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'You will not be able to recover this Monthly Target Product!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'No, cancel',
//     }).then((result) => {
//       if (!result.isConfirmed) return;
//
//       this.loadingService.setLoading(true);
//
//       runInInjectionContext(this.injector, () => {
//         this.monthlybudgetService.deleteBudget(docId)
//           .then(() => {
//             this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);
//             Swal.fire('Deleted!', 'Monthly Target Product has been deleted.', 'success');
//             this.loadingService.setLoading(false);
//           })
//           .catch((err) => {
//             console.error('Delete failed:', err);
//             Swal.fire('Error', 'Failed to delete the Monthly Target product. Please try again.', 'error');
//             this.loadingService.setLoading(false);
//           });
//       });
//     });
//   }

  deleteBudget(row: any) {
    const docId = row.docId;
    if (!docId) {
      Swal.fire('Error', 'Missing document ID for this Monthly Target.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Monthly Target Product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loadingService.setLoading(true);

      runInInjectionContext(this.injector, () => {
        this.monthlybudgetService.deleteBudget(docId)
          .then(() => {
            this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);
            Swal.fire('Deleted!', 'Monthly Target Product has been deleted.', 'success');
            this.loadingService.setLoading(false);

            // 👉 Log Activity
            this.mService.addLog({
              date: Date.now(),
              section: "Monthly Budget",
              action: "Delete",
              description: `Deleted Monthly Budget for ${row.country} - ${row.year}/${row.month}`
            });
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the Monthly Target product. Please try again.', 'error');
            this.loadingService.setLoading(false);
          });
      });
    });
  }

  openViewDialog(row: any) {
    this.dialog.open(ViewMonthlyBudgetComponent, {
      width: '90vw',
      maxWidth: '70vw',
      height: '80vh',
      panelClass: 'custom-dialog-container',
      data: {
        id: row.id,
        country: row.country,
        year: row.year,
        month: row.month,
        period: row.period,
        items: row.products,
        model: row.model,
      }
    });
  }

}
