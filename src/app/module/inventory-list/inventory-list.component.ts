import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {CommonModule, DatePipe, NgForOf, NgIf} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatButtonModule, MatIconButton} from "@angular/material/button";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {ProductMasterService} from "../product-master.service";
import Swal from "sweetalert2";
import {AddShowroomComponent} from "../add-showroom/add-showroom.component";
import {MatFormField, MatInputModule} from "@angular/material/input";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {AddDealerService} from "../add-dealer.service";
import {OutletProductService} from "../outlet-product.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {InventoryService} from "../add-inventory/inventory.service";

@Component({
  selector: 'app-inventory-list',
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
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    NgForOf,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    CommonModule,
    MatTableModule
  ],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent implements OnInit {


  dataSource = new MatTableDataSource<any>();
  dealerdataSource = new MatTableDataSource<any>();
  allOutletProducts: any[] = [];
  allDealers: any[] = [];

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'outlet', label: 'Outlet' },
    { def: 'name', label: 'Name' },
    { def: 'sku', label: 'Sku' },
    { def: 'model', label: 'Model' },
    { def: 'brand', label: 'Brand' },
    { def: 'varient', label: 'Varient' },
    { def: 'quantity', label: 'Quantity' },
    // { def: 'engineCc', label: 'Engine CC' },
  ];

  displayedColumns: string[] = [
    'id',
    'outlet',
    'name',
    'sku',
    'model',
    'brand',
    'varient',
    'unit',
    'quantity',
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
              private addDealerService: AddDealerService,
              private outletProductService: OutletProductService,
              private mFirestore: AngularFirestore,
              private inventoryService : InventoryService
  ) {
  }

  ngOnInit() {
    this.productList();
    this. DealerList();
  this.loadInventoryDaata()
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data) => {
        this.allDealers = data;
        this.dealerdataSource.data = data;
      });
    });
  }

  productList() {
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductList().subscribe((data) => {
        console.log("All outlet products:", data);
        this.allOutletProducts = data;   // keep all
        this.dataSource.data = [];       // empty table by default
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }


  onOutletChange(selectedOutlet: string) {
    if (!selectedOutlet) {
      this.dataSource.data = [];
      return;
    }

    // Find the dealer ID from the allDealers array
    const selectedDealer = this.allDealers.find((d: any) => d.name === selectedOutlet);
    const dealerId = selectedDealer?.id;

    if (!dealerId) {
      console.error('Error: Could not find dealer ID for selected outlet.');
      this.dataSource.data = [];
      return;
    }
    runInInjectionContext(this.injector, () => {
    // Call the service method to get data for the specific dealer
    this.inventoryService.getInventoryData(dealerId).subscribe((data: any[]) => {
      console.log('Inventory data for selected dealer:', data);
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    });
  }


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
inventoryData: any[] = [];
 loadInventoryDaata() {
   runInInjectionContext(this.injector, () => {
    this.inventoryService.getInventoryAllData().subscribe(data => {
      console.log('Inventory data:', data);
      this.inventoryData = data;
    });
    });
  }
}
