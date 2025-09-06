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
    { def: 'subCategory', label: 'Sub Category' },
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
    'subCategory',
    'varient',
    'engineCc',
    'unit',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  // ✅ Data source
  // dataSource = new MatTableDataSource<AdvanceTable>([]);
  // isLoading = false;


  constructor(private dialog: MatDialog,
              private router: Router,
              private productService: ProductMasterService,
              private injector: EnvironmentInjector,
              ) {
  }

  ngOnInit() {
    this.productList()
  }

  productList() {
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe((data) => {
        console.log(data)
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.dataSource.data)
      });
    });
  }

  goToEdit(row: any) {
    this.router.navigate(['module/add-products-master'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }

  // ✅ Dynamically get columns to display
  // getDisplayedColumns(): string[] {
  //   return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  // }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',   // set width
      autoFocus: false  // optional
    });
  }

  navigateToAddProductMaster(){
    this.router.navigate(['module/add-products-master']);
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

  delete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deletion
        runInInjectionContext(this.injector, () => {
          this.productService.deleteProduct(id).then(() => {
            this.productList();

            // // Log activity
            // const activity = {
            //   date: new Date().getTime(),
            //   section: 'Installation List',
            //   action: 'Delete',
            //   description: `Installation deleted by user`,
            //   currentIp: localStorage.getItem('currentip')!,
            // };
            // this.mLogService.addLog(activity);

            // Optional: Show success alert
            Swal.fire('Deleted!', 'Product has been deleted.', 'success');
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Product is safe.', 'info');
      }
    });
  }


  openAssignDialog(): void {
    const dialogRef = this.dialog.open(AddShowroomComponent, {
      width: '400px',
      data: { /* you can pass data here */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Assigned successfully!');
      }
    });
  }



}
