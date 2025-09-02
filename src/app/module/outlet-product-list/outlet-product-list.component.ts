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
    'name',
    'sku',
    'variant',
    'outlet',
    'openingStock',
    'remark',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(private dialog: MatDialog,
              private router: Router,
              private outletProductService: OutletProductService,
              private injector: EnvironmentInjector,
  ) {
  }

  ngOnInit() {
    this.loadOutletProduct()
  }

  loadOutletProduct() {
    runInInjectionContext(this.injector, () => {
      // Directly subscribe to the service method within the injection context
      this.outletProductService.getOutletProductList().subscribe((data: any) => {
        console.log(data);
        this.dataSource.data = data;  // Assign fetched data to the table's dataSource
        // Check the length of the data to display or use it for conditions
        // const dataLength = data.length;
        // console.log("Fetched Data Length:", dataLength);
        //
        // // Example: You could display a message based on the data length
        // if (dataLength === 0) {
        //   console.log("No data found in the collection");
        // } else {
        //   console.log(`Fetched ${dataLength} records`);
        // }

        // Set paginator and sorter for the table
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        console.log("Table Data:", this.dataSource.data);
      });

    });
  }


  editloadOutletProduct(row: any) {
    this.router.navigate(['module/add-outlet-product'], {
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

  isLoading: any;

  deleteOutletProduct(row: any) {
    const outletId = row.outletId || row.dealerId; // whichever you use
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

      // (optional) show a small loading state
      this.isLoading = true;

      // delete from subcollection
      runInInjectionContext(this.injector, () => {
        this.outletProductService.deleteOutletProduct(outletId, productId)
          .then(() => {
            // Optimistic remove from table (faster UI)
            this.dataSource.data = this.dataSource.data.filter((p: any) => p.id !== productId);

            // Or reload list:
            // this.loadOutletProduct();

            Swal.fire('Deleted!', 'Dealer/Outlet Product has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the product. Please try again.', 'error');
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
