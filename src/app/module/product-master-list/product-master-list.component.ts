import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {CommonModule, DatePipe, NgIf} from "@angular/common";
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
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {ProductMasterService} from "../product-master.service";
import Swal from "sweetalert2";
import {AddShowroomComponent} from "../add-showroom/add-showroom.component";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";
import {ActivityLogService} from "../activity-log/activity-log.service";

@Component({
  selector: 'app-product-master-list',
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
    NgIf,
    MatDialogModule,
  ],
  templateUrl: './product-master-list.component.html',
  standalone: true,
  styleUrl: './product-master-list.component.scss'
})
export class ProductMasterListComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'sku', label: 'Sku' },
    { def: 'name', label: 'Name' },
    { def: 'model', label: 'Model' },
    { def: 'brand', label: 'Brand' },
    { def: 'category', label: 'Category' },
    // { def: 'subCategory', label: 'Sub Category' },
    { def: 'varient', label: 'Varient' },
    { def: 'engineCc', label: 'Engine CC' },
    { def: 'unit', label: 'Unit' },
  ];

  displayedColumns: string[] = [
    'id',
    'name',
    'sku',
    'model',
    'brand',
    'category',
    // 'subCategory',
    'varient',
    'engineCc',
    'unit',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private productService: ProductMasterService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
    private mService: ActivityLogService,
  ) {}

  ngOnInit() {
    this.productList();
  }

// ✅ Product list with loader
  productList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe({
        next: (data: any) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch products', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  // goToEdit(row: any) {
  //   this.router.navigate(['module/add-products-master'], {
  //     queryParams: { data: JSON.stringify(row) }
  //   });
  // }

  // ✅ EDIT product
  goToEdit(row: any) {
    this.router.navigate(['module/add-products-master'], {
      queryParams: { data: JSON.stringify(row) }
    });

    // 👉 log edit
    this.mService.addLog({
      date: Date.now(),
      section: "Product",
      action: "Edit",
      description: `Edited product: ${row.name || row.sku}`
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      autoFocus: false
    });
  }

  // navigateToAddProductMaster() {
  //   this.router.navigate(['module/add-products-master']);
  // }

  // ✅ ADD product
  navigateToAddProductMaster() {
    this.router.navigate(['module/add-products-master']);

    // 👉 log add
    this.mService.addLog({
      date: Date.now(),
      section: "Product",
      action: "Add",
      description: `Navigated to add new product`
    });
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
//   delete(id: string) {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'You will not be able to recover this Product!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'No, cancel',
//     }).then((result) => {
//       if (!result.isConfirmed) return;
//
//       this.loadingService.setLoading(true); // ✅ loader for delete
//
//       runInInjectionContext(this.injector, () => {
//         this.productService.deleteProduct(id)
//           .then(() => {
//             this.productList();
//             Swal.fire('Deleted!', 'Product has been deleted.', 'success');
//           })
//           .catch((err) => {
//             console.error('Delete failed:', err);
//             Swal.fire('Error', 'Failed to delete the product. Please try again.', 'error');
//           })
//           .finally(() => {
//             this.loadingService.setLoading(false);
//           });
//       });
//     });
//   }


  // ✅ DELETE product
  delete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loadingService.setLoading(true);

      runInInjectionContext(this.injector, () => {
        this.productService.deleteProduct(id)
          .then(() => {
            this.productList();
            Swal.fire('Deleted!', 'Product has been deleted.', 'success');

            // 👉 log delete
            this.mService.addLog({
              date: Date.now(),
              section: "Product",
              action: "Delete",
              description: `Deleted product with ID: ${id}`
            });
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
  openAssignDialog(): void {
    const dialogRef = this.dialog.open(AddShowroomComponent, {
      width: '400px',
      data: { /* optional data */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Assigned successfully!');
      }
    });
  }



}
