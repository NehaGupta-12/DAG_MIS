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
    CommonModule
  ],
  templateUrl: './budget-list.component.html',
  styleUrl: './budget-list.component.scss'
})
export class BudgetListComponent implements OnInit {


  dataSource = new MatTableDataSource<any>();

  // Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'name', label: 'Name'},
    {def: 'sku', label: 'Sku'},
    {def: 'country', label: 'Country'},
    {def: 'year', label: 'Year'},
    {def: 'period', label: 'Period'},
    {def: 'budgetQuantity', label: 'BudgetQuantity'},
    {def: 'action', label: 'Action'},
  ];



  displayedColumns: string[] = [
    'serial',
    'name',
    'sku',
    'country',
    'year',
    'period',
    'budgetQuantity',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(private dialog: MatDialog,
              private router: Router,
              private outletProductService: OutletProductService,
              private budgetService: BudgetService,
              private injector: EnvironmentInjector,
  ) {
  }

  ngOnInit() {
    this.loadbudget()
  }

  loadbudget() {
    runInInjectionContext(this.injector, () => {
      // Directly subscribe to the service method within the injection context
      this.budgetService.getBudgetList().subscribe((data: any) => {
        console.log(data);
        this.dataSource.data = data;  // Assign fetched data to the table's dataSource
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        console.log("Table Data:", this.dataSource.data);
      });

    });
  }


  editloadOutletProduct(row: any) {
    this.router.navigate(['module/add-budget'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }


  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',   // set width
      autoFocus: false  // optional
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
    return this.columnDefinitions.map(c => c.def);
  }

  // Filtering
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isLoading: any;

  deleteBudget(row: any) {
    const docId = row.docId; // ✅ use Firestore document ID

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

      this.isLoading = true;

      runInInjectionContext(this.injector, () => {
        this.budgetService.deleteBudget(docId)
          .then(() => {
            // ✅ Optimistic remove from UI
            this.dataSource.data = this.dataSource.data.filter((p: any) => p.docId !== docId);

            Swal.fire('Deleted!', 'Budget Product has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the Budget product. Please try again.', 'error');
          })
          .finally(() => {
            this.isLoading = false;
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
