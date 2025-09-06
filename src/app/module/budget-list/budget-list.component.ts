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
import {BudgetService} from "../budget.service";
import { ViewBudgetProductComponent } from '../view-budget-product/view-budget-product.component';
import {LoadingService} from "../../Services/loading.service";

@Component({
  selector: 'app-budget-list',
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
    CommonModule,
    MatSort
  ],
  templateUrl: './budget-list.component.html',
  standalone: true,
  styleUrl: './budget-list.component.scss'
})
export class BudgetListComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    { def: 'serial', label: 'Serial' },
    { def: 'country', label: 'Country' },
    { def: 'year', label: 'Year' },
    { def: 'period', label: 'Period' },
    { def: 'budgetQuantity', label: 'BudgetQuantity' },
    { def: 'action', label: 'Action' },
  ];

  displayedColumns: string[] = [
    'serial',
    'country',
    'year',
    'period',
    'budgetQuantity',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private outletProductService: OutletProductService,
    private budgetService: BudgetService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadbudget();
  }

  loadbudget() {
    this.loadingService.setLoading(true); // ✅ show loader
    runInInjectionContext(this.injector, () => {
      this.budgetService.getBudgetList().subscribe({
        next: (data: any[]) => {
          console.log('Raw Data:', data);

          // 🔹 Group by country + year + period
          const grouped = data.reduce((acc: any[], curr: any) => {
            const key = `${curr.country}_${curr.year}_${curr.period.start.seconds}_${curr.period.end.seconds}`;

            let existing = acc.find(
              (x: any) =>
                x.country === curr.country &&
                x.year === curr.year &&
                x.period.start.seconds === curr.period.start.seconds &&
                x.period.end.seconds === curr.period.end.seconds
            );

            if (!existing) {
              existing = {
                id: curr.docId,
                country: curr.country,
                year: curr.year,
                period: curr.period,
                products: [],
                quantity: 0, // ✅ total budgetQuantity
              };
              acc.push(existing);
            }

            // 🔹 Push each product
            existing.products.push({
              id: curr.docId,
              sku: curr.sku,
              productName: curr.name, // map Firestore name -> productName
              budgetQuantity: curr.quantity, // map quantity -> budgetQuantity
            });

            // 🔹 Update total for list page
            existing.quantity += curr.quantity || 0;

            return acc;
          }, []);

          console.log('Grouped Data:', grouped);

          // ✅ This goes to table
          this.dataSource.data = grouped;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loadingService.setLoading(false); // ✅ hide loader
        },
        error: () => {
          this.loadingService.setLoading(false); // ✅ hide loader on error
        },
      });
    });
  }

// ✅ Group products into one row per country-year-period
  private groupBudgets(data: any[]) {
    const grouped: any = {};

    data.forEach((item) => {
      const key = `${item.country}-${item.year}-${item.period.start}-${item.period.end}`;

      if (!grouped[key]) {
        grouped[key] = {
          docId: item.docId, // keep docId for delete
          country: item.country,
          year: item.year,
          period: item.period,
          budgetQuantity: 0,
          products: [],
        };
      }

      // push product
      grouped[key].products.push({
        sku: item.sku,
        productName: item.productName,
        budgetQuantity: item.budgetQuantity,
      });

      // sum quantity
      grouped[key].budgetQuantity += item.budgetQuantity;
    });

    return Object.values(grouped);
  }

  editloadOutletProduct(row: any) {
    this.router.navigate(['module/add-budget'], {
      queryParams: { data: JSON.stringify(row) },
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      autoFocus: false,
    });
  }

  navigateToAddloadOutletProduct() {
    this.router.navigate(['module/add-budget']);
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

  deleteBudget(row: any) {
    const docId = row.docId;

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

      this.loadingService.setLoading(true); // ✅ show loader

      runInInjectionContext(this.injector, () => {
        this.budgetService
          .deleteBudget(docId)
          .then(() => {
            this.dataSource.data = this.dataSource.data.filter(
              (p: any) => p.docId !== docId
            );
            Swal.fire('Deleted!', 'Budget Product has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire(
              'Error',
              'Failed to delete the Budget product. Please try again.',
              'error'
            );
          })
          .finally(() => {
            this.loadingService.setLoading(false); // ✅ hide loader
          });
      });
    });
  }

  openViewDialog(row: any) {
    console.log(row);
    this.dialog.open(ViewBudgetProductComponent, {
      width: '90vw', // ✅ use viewport width (90% of screen width)
      maxWidth: '70vw', // ✅ allow full width if needed
      height: '80vh', // optional: control height too
      panelClass: 'custom-dialog-container',
      data: {
        id: row.id,
        country: row.country,
        year: row.year,
        period: row.period,
        items: row.products, // ✅ product-wise details
      },
    });
  }




}
