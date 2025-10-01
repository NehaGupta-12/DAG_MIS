import {Component, ElementRef, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIconButton, MatMiniFabButton} from "@angular/material/button";
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
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {AddDealerService} from "../add-dealer.service";
import {UserDataModel} from "../add-user/UserData.model";
import {ActivityLogService} from "../activity-log/activity-log.service";

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
    CommonModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatMiniFabButton
  ],
  templateUrl: './outlet-product-list.component.html',
  standalone: true,
  styleUrl: './outlet-product-list.component.scss'
})
export class OutletProductListComponent implements OnInit {
  @ViewChild('dealerSearchInput') dealerSearchInput!: ElementRef;
  @ViewChild('dealerSelect') dealerSelect: any;

  dataSource = new MatTableDataSource<any>();
  userData!: UserDataModel;
  filteredDealers: any[] = [];
  dealerSearchText: string = '';
  debounceTimer: any;
  allDealers: any[] = [];
  allOutletProducts: any[] = [];
  dealerdataSource = new MatTableDataSource<any>();

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
    'outlet',
    'name',
    'sku',
    'variant',
    'openingStock',
    // 'remark',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private outletProductService: OutletProductService,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    public authService : AuthService,
    private addDealerService: AddDealerService,
    private activityLogService: ActivityLogService,
  ) {}

  ngOnInit() {
    this.loadOutletProduct();
    this.DealerList();
    this.userData = JSON.parse(localStorage.getItem('userData')!) as UserDataModel;
    console.log(this.userData)
  }

// ✅ Load Outlet Product with loader
  loadOutletProduct() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductList().subscribe({
        next: (data: any) => {
          this.allOutletProducts = data;     // only store, don’t assign to table
          this.dataSource.data = [];         // keep table empty by default
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch outlet products', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data) => {
        this.allDealers = data;
        this.dealerdataSource.data = data;
        this.filteredDealers = [...this.allDealers]; // Initialize the filtered list
      });
    });
  }

  onDealerSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.dealerSearchText = '';
      this.filteredDealers = [...this.allDealers];
      setTimeout(() => {
        if (this.dealerSearchInput) {
          this.dealerSearchInput.nativeElement.value = '';
          this.dealerSearchInput.nativeElement.focus();
        }
      }, 0);
    } else {
      // Reset on close
      this.dealerSearchText = '';
      this.filteredDealers = [...this.allDealers];
      if (this.dealerSearchInput) {
        this.dealerSearchInput.nativeElement.value = '';
      }
    }
  }

  onDealerSearchChange(event: any) {
    const value = event.target.value;
    this.dealerSearchText = value;  // Keep the original value with spaces
    this.filterDealers();
    event.stopPropagation();
  }

  filterDealers() {
    if (!this.dealerSearchText) {
      this.filteredDealers = [...this.allDealers];
      return;
    }

    const searchText = this.dealerSearchText.toLowerCase();
    this.filteredDealers = this.allDealers.filter(dealer =>
      dealer.name.toLowerCase().includes(searchText)
    );
  }



// Triggered when user clicks Search
  onSearchClick(selectedDealerName: string) {
    if (!selectedDealerName) {
      Swal.fire('Warning', 'Please select an outlet first.', 'warning');
      return;
    }

    const filtered = this.allOutletProducts.filter(prod =>
      prod.dealerOutlet?.toLowerCase().includes(selectedDealerName.toLowerCase())
    );

    console.log("Filtered Products:", filtered);

    this.dataSource.data = filtered;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

// Triggered when user clicks Clear
  onClearClick(dealerSelect: MatSelect) {
    dealerSelect.value = null; // clear the dropdown
    this.dataSource.data = []; // clear the table
  }

  //
  // editloadOutletProduct(row: any) {
  //   this.router.navigate(['module/add-outlet-product'], {
  //     queryParams: {data: JSON.stringify(row)}
  //   });
  // }

  // 🔹 Edit Outlet Product
  editloadOutletProduct(row: any) {
    this.router.navigate(['module/add-outlet-product'], {
      queryParams: { data: JSON.stringify(row) }
    });


  }

  openDialog() {
    this.dialog.open(AddUserComponent, { autoFocus: false });
  }

  // navigateToAddloadOutletProduct() {
  //   this.router.navigate(['module/add-outlet-product']);
  // }
  // 🔹 Navigate to ADD Outlet Product
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

// // Delete with loader
//   deleteOutletProduct(row: any) {
//     console.log(row);
//     const outletId = row.outletId || row.dealerId;
//     const productId = row.id;
//     const dealerOutlet = row.dealerOutlet; //
//     console.log('outletId',outletId,'productId',productId ,'dealerOutlet',dealerOutlet)// 👈 you need this
//
//     if (!outletId || !productId || !dealerOutlet) {
//       Swal.fire('Error', 'Missing outletId, dealerOutlet or productId on this row.', 'error');
//       return;
//     }
//
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'You will not be able to recover this Dealer/Outlet Product!',
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
//         this.outletProductService.deleteOutletProductAndInventory(outletId, productId, dealerOutlet) // 👈 pass 3rd arg
//           .then(() => {
//             this.dataSource.data = this.dataSource.data.filter((p: any) => p.id !== productId);
//             Swal.fire('Deleted!', 'Dealer/Outlet Product has been deleted.', 'success');
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

  // 🔹 Delete Outlet Product
  // deleteOutletProduct(row: any) {
  //   console.log(row);
  //   const outletId = row.outletId || row.dealerId;
  //   const productId = row.id;
  //   const dealerOutlet = row.dealerOutlet;
  //
  //   if (!outletId || !productId || !dealerOutlet) {
  //     Swal.fire('Error', 'Missing outletId, dealerOutlet or productId on this row.', 'error');
  //     return;
  //   }
  //
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'You will not be able to recover this Dealer/Outlet Product!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'No, cancel',
  //   }).then((result) => {
  //     if (!result.isConfirmed) return;
  //
  //     this.loadingService.setLoading(true);
  //
  //     runInInjectionContext(this.injector, () => {
  //       this.outletProductService.deleteOutletProductAndInventory(outletId, productId, dealerOutlet)
  //         .then(() => {
  //           this.dataSource.data = this.dataSource.data.filter((p: any) => p.id !== productId);
  //           Swal.fire('Deleted!', 'Dealer/Outlet Product has been deleted.', 'success');
  //
  //           // 👉 Add log
  //           this.activityLogService.addLog({
  //             date: Date.now(),
  //             section: "Outlet Product",
  //             action: "Delete",
  //             description: `Deleted Product "${row.name}" (SKU: ${row.sku}) from Outlet "${dealerOutlet}"`
  //           });
  //         })
  //         .catch((err) => {
  //           console.error('Delete failed:', err);
  //           Swal.fire('Error', 'Failed to delete the product. Please try again.', 'error');
  //         })
  //         .finally(() => {
  //           this.loadingService.setLoading(false);
  //         });
  //     });
  //   });
  // }


  // 🔹 Delete Outlet Product
  deleteOutletProduct(row: any) {
    const outletId = row.outletId || row.dealerId;
    const productId = row.id;
    const dealerOutlet = row.dealerOutlet;

    if (!outletId || !productId || !dealerOutlet) {
      Swal.fire('Error', 'Missing outletId, dealerOutlet or productId on this row.', 'error');
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

      // 🔹 Start loader
      this.loadingService.setLoading(true);

      runInInjectionContext(this.injector, () => {
        this.outletProductService.deleteOutletProductAndInventory(outletId, productId, dealerOutlet)
          .then(() => {
            // 🔹 Remove deleted product from allOutletProducts & dataSource
            this.allOutletProducts = this.allOutletProducts.filter(p => p.id !== productId);
            this.dataSource.data = this.dataSource.data.filter(p => p.id !== productId);

            Swal.fire('Deleted!', 'Dealer/Outlet Product has been deleted.', 'success');

            // 🔹 Log activity
            this.activityLogService.addLog({
              date: Date.now(),
              section: "Outlet Product",
              action: "Delete",
              description: `Deleted Product "${row.name}" (SKU: ${row.sku}) from Outlet "${dealerOutlet}"`
            });

            // 🔹 Reapply current dealer filter automatically
            if (dealerOutlet) {
              const filtered = this.allOutletProducts.filter(prod =>
                prod.dealerOutlet?.toLowerCase().includes(dealerOutlet.toLowerCase())
              );
              this.dataSource.data = filtered;
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }
          })
          .catch((err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete the product. Please try again.', 'error');
          })
          .finally(() => {
            // 🔹 Stop loader
            this.loadingService.setLoading(false);
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

  onSelectDealerChange(e:any) {

  }
}
