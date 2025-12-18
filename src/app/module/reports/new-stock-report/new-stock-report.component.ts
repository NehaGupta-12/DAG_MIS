import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject, isDevMode,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule} from "@angular/material/dialog";
import {CommonModule} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from "@angular/material/table";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from "@angular/material/datepicker";
import {AddDealerService} from "../../add-dealer.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {ProductMasterService} from "../../product-master.service";
import {GrnService} from "../../grn.service";
import {AuthService} from "../../../authentication/auth.service";
import {LoadingService} from "../../../Services/loading.service";
import {CountryService} from "../../../Services/country.service";
import {ActivityLogService} from "../../activity-log/activity-log.service";
import {StockTransferService} from "../../stock-transfer.service";
import {InventoryService} from "../../add-inventory/inventory.service";
import {map} from "rxjs/operators";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {OutletProductService} from "../../outlet-product.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AddUserComponent} from "../../add-user/add-user.component";
import Swal from "sweetalert2";
import {AddShowroomComponent} from "../../add-showroom/add-showroom.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {DailySalesService} from "../../daily-sales.service";
import {environment} from "../../../../environments/environment";
import {StockReportService} from "../../stock-report.service";
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-new-stock-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    MatTooltip,
    MatHeaderRow,
    MatTable,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatRow,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginator,
    MatProgressSpinner,
  ],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
  templateUrl: './new-stock-report.component.html',
  styleUrl: './new-stock-report.component.scss'
})
export class NewStockReportComponent implements OnInit{
  allOutletReports: any[] = [];
  isSearchPerformed = false;


  @ViewChild('dealerSearchInput') dealerSearchInput!: ElementRef;

  filteredDealers: any[] = [];
  dealerSearchText: string = '';
  debounceTimer: any;
  private isAutoSaveRunning = false;
  selectedOutlet: string | null = null;
  selectedDate: Date | null = null;


  dataSource = new MatTableDataSource<any>();
  stockDataSource = new MatTableDataSource<any>();
  dealerdataSource = new MatTableDataSource<any>();
  allOutletProducts: any[] = [];
  allDealers: any[] = [];
  salesdataSource: any[] = [];
  filteredProducts: any[] = [];
  filteredSales: any[] = [];
  stockTransferDataSource: any[] = [];
  grnDataSource: any[] = [];
  salesDataSource: any[] = [];
  allInventoryData: any[] = [];
  maxDate: Date = new Date();
  env = isDevMode() ? environment.testCollections : environment.collections;

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
    'openingStock',
    'quantity',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog,
              private router: Router,
              private productService: ProductMasterService,
              private injector: EnvironmentInjector,
              private addDealerService: AddDealerService,
              private outletProductService: OutletProductService,
              private mFirestore: AngularFirestore,
              private inventoryService : InventoryService,
              private grnService: GrnService,
              private stockTransferService: StockTransferService,
              private loadingService: LoadingService,
              private dailySlaes: DailySalesService,
              private stockReportService: StockReportService,
  ) {
  }

// Update ngOnInit to ensure data loads in correct order
  ngOnInit() {

    // 🧹 CLEAR OLD DAY DATA FIRST
    this.clearPreviousDayStockReportsIfDateChanged();

    this.DealerList();
    this.loadGrnList();
    this.stockStransferList();
    this.loadSalesList();
    this.loadAllInventoryData();
    this.loadStockReportData();

    this.scheduleAutoSave();

    // this.allOutletReports = [];
  }


// Helper function to get date string in YYYY-MM-DD format
  getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

// Helper function to get yesterday's date string
  getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.getDateString(yesterday);
  }

// Helper function to get today's date string
  getTodayDateString(): string {
    return this.getDateString(new Date());
  }

  getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

// Add this helper method to get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getDateFromFirestoreTimestamp(createdAt: any): string {
    if (!createdAt?.seconds) return '';

    const date = new Date(createdAt.seconds * 1000);
    date.setHours(0, 0, 0, 0); // normalize
    return date.toISOString().split('T')[0];
  }

  isSameLocalDay(createdAt: any, selectedDate: string): boolean {
    if (!createdAt?.seconds) return false;

    const created = new Date(createdAt.seconds * 1000);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return (
      created.getTime() >= startOfDay.getTime() &&
      created.getTime() <= endOfDay.getTime()
    );
  }



  loadGrnList() {
    runInInjectionContext(this.injector, () => {
      this.grnService.getGrnList().subscribe((data) => {
        this.grnDataSource = data;
        console.log('GRN Data Loaded:', data);
        this.checkAndGenerateAllReports();
      });
    });
  }

// Update loadSalesList method:
  loadSalesList() {
    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe((data) => {
        console.log('Daily sales loaded:', data);
        this.salesDataSource = data;
        this.checkAndGenerateAllReports();
      });
    });
  }

// Update stockStransferList method:
  stockStransferList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.stockTransferService.getStockTransferList().subscribe({
        next: (data: any) => {
          console.log("Transfer data", data);
          this.stockTransferDataSource = data;
          this.loadingService.setLoading(false);
          this.checkAndGenerateAllReports();
        },
        error: (err) => {
          console.error('Failed to fetch stock transfer list', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

// Load ALL inventory data
  loadAllInventoryData() {
    runInInjectionContext(this.injector, () => {
      this.inventoryService.getInventoryAllData().subscribe((data: any[]) => {
        console.log('All Inventory Data Loaded:', data);
        this.allInventoryData = data;
        this.checkAndGenerateAllReports();
      });
    });
  }

  getAllowedOutletNames(): Set<string> {
    return new Set(this.allDealers.map(d => d.name));
  }

  getAllowedOutletSet(): Set<string> {
    return new Set(
      this.allDealers
        .filter(d => d.status === 'Active')
        .map(d => d.name.trim())
    );
  }


// Check if all data is loaded and generate reports
  checkAndGenerateAllReports() {
    if (this.allInventoryData.length > 0 && this.allDealers.length > 0) {
      console.log('All data loaded, generating reports for all outlets...');
      this.generateAllOutletsReports();
    }
  }

  // Generate reports for ALL outlets
  generateAllOutletsReports() {
    console.log('=== Generating Reports for Dealer-Approved Outlets ===');

    const allowedOutlets = this.getAllowedOutletSet();

    const uniqueOutlets = [
      ...new Set(
        this.allInventoryData
          .map(item => item.dealerOutlet?.trim())
          .filter(outlet => allowedOutlets.has(outlet))
      )
    ];


    const allReports: any[] = [];

    uniqueOutlets.forEach(outlet => {
      const report = this.calculateStockReportForOutlet(
        outlet,
        this.getTodayDateString()
      );
      if (report) {
        allReports.push(report);
      }
    });

    this.saveAllReportsToLocalStorage(allReports, this.getTodayDateString());

    console.log(`Reports generated for ${allReports.length} valid outlets`);
  }



  getLockedOpeningStock(
    outletName: string,
    sku: string,
    inventoryQuantity: number
  ): number {

    const today = this.getTodayDateString();

    // STEP 1: If today's report already exists → LOCK opening
    const todayReport = this.loadReportFromLocalStorage(outletName, today);
    if (todayReport?.rows) {
      const todayProduct = todayReport.rows.find((r: any) => r.sku === sku);
      if (todayProduct && todayProduct.opening !== undefined) {
        return Number(todayProduct.opening);
      }
    }

    //  STEP 2: Check yesterday's Firestore report
    const yesterdayDate = this.getYesterdayDate();
    const yesterdayReportKey = `${outletName.replace(/\s+/g, '_')}_${yesterdayDate}`;

    const yesterdayReport = this.stockDataSource.data.find(
      (r: any) => r.id === yesterdayReportKey
    );

    if (yesterdayReport?.rows) {
      const yesterdayProduct = yesterdayReport.rows.find((r: any) => r.sku === sku);
      if (yesterdayProduct) {
        return Number(yesterdayProduct.total) || 0;
      }
    }

    //  STEP 3: No previous data → take inventory quantity (FIRST & ONLY TIME)
    return Number(inventoryQuantity) || 0;
  }


// Check if today's opening stock is already initialized in localStorage
  getTodayOpeningStockFromStorage(outletName: string, sku: string): number | null {
    const todayReport = this.loadReportFromLocalStorage(outletName, this.getTodayDateString());

    if (todayReport && todayReport.rows) {
      const product = todayReport.rows.find((row: any) => row.sku === sku);
      if (product && product.opening !== undefined) {
        // Today's opening stock already set, use it
        return product.opening;
      }
    }

    return null;
  }

// Calculate stock report for a specific outlet for a specific date
  calculateStockReportForOutlet(outletName: string, dateString: string) {

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const targetTime = targetDate.getTime();

    const outletInventory = this.allInventoryData.filter(
      item => item.dealerOutlet?.trim() === outletName.trim()
    );

    if (outletInventory.length === 0) return null;

    const productStockMap = new Map<string, any>();

    //  STEP 1: INITIALIZE WITH LOCKED OPENING STOCK
    outletInventory.forEach((product: any) => {

      const openingStock = this.getLockedOpeningStock(
        outletName,
        product.sku,
        product.quantity
      );

      productStockMap.set(product.sku, {
        product: product.name,
        sku: product.sku,
        brand: product.brand,
        model: product.model,
        variant: product.variant,
        opening: openingStock,
        sales: 0,
        grn: 0,
        outgoing: 0,
        incoming: 0,
        total: openingStock
      });
    });

    //  STEP 2: SALES
    this.salesDataSource.forEach((sale: any) => {
      if (sale.dealerOutlet?.trim() === outletName.trim()) {
        const saleDate = new Date(sale.salesDate);
        saleDate.setHours(0, 0, 0, 0);

        if (saleDate.getTime() === targetTime) {
          const p = productStockMap.get(sale.sku);
          if (p) p.sales += sale.quantity || 0;
        }
      }
    });

    //  STEP 3: GRN
    this.grnDataSource.forEach((grn: any) => {
      if (grn.dealerOutlet?.trim() === outletName.trim()) {
        const grnDate = grn.stockDate ? new Date(grn.stockDate) : null;
        if (grnDate) {
          grnDate.setHours(0, 0, 0, 0);
          if (grnDate.getTime() === targetTime) {
            const p = productStockMap.get(grn.sku);
            if (p) p.grn += grn.quantity || 0;
          }
        }
      }
    });

    //  STEP 4: STOCK TRANSFERS
    this.stockTransferDataSource.forEach((transfer: any) => {
      if (transfer.status === 'Approved' && transfer.items) {
        const transferDate = transfer.createdAt?.seconds
          ? new Date(transfer.createdAt.seconds * 1000)
          : null;

        if (transferDate) {
          transferDate.setHours(0, 0, 0, 0);

          if (transferDate.getTime() === targetTime) {
            transfer.items.forEach((item: any) => {
              const p = productStockMap.get(item.sku);

              if (transfer.fromDealerOutlet?.trim() === outletName.trim() && p) {
                p.outgoing += item.quantity || 0;
              }

              if (transfer.toDealerOutlet?.trim() === outletName.trim()) {
                if (p) {
                  p.incoming += item.quantity || 0;
                } else {
                  const opening = this.getLockedOpeningStock(
                    outletName,
                    item.sku,
                    0
                  );

                  productStockMap.set(item.sku, {
                    product: item.name,
                    sku: item.sku,
                    brand: item.brand,
                    model: item.model,
                    variant: item.variant,
                    opening,
                    sales: 0,
                    grn: 0,
                    outgoing: 0,
                    incoming: item.quantity || 0,
                    total: opening
                  });
                }
              }
            });
          }
        }
      }
    });

    //  STEP 5: FINAL CLOSING STOCK
    productStockMap.forEach(p => {
      p.total = p.opening - p.sales + p.grn - p.outgoing + p.incoming;
    });

    return {
      outlet: outletName,
      date: dateString,
      rows: Array.from(productStockMap.values())
    };
  }


// Save all reports to localStorage for a specific date
  saveAllReportsToLocalStorage(allReports: any[], dateString: string) {

    const timestamp = Date.now();

    allReports.forEach(report => {

      const existing = this.loadReportFromLocalStorage(report.outlet, dateString);

      const mergedRows = report.rows.map((row: any) => {
        const existingRow = existing?.rows?.find((r: any) => r.sku === row.sku);
        return {
          ...row,
          opening: existingRow?.opening ?? row.opening
        };
      });

      const storageKey = `stock_report_${report.outlet}_${dateString}`;

      const reportToSave = {
        outlet: report.outlet,
        date: dateString,
        timestamp,
        rows: mergedRows
      };

      localStorage.setItem(storageKey, JSON.stringify(reportToSave));
    });
  }




  // Add these methods to your component class
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

  onDealerSearchChange(event: any) {
    const value = event.target.value;
    this.dealerSearchText = value;
    this.filterDealers();
    event.stopPropagation();
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

  // Prevent panel close when clicking on search input
  onSearchClick(event: Event) {
    event.stopPropagation();
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          //  Store all dealers
          this.allDealers = data || [];
          this.dealerdataSource.data = this.allDealers;
          this.filteredDealers = [...this.allDealers];

          console.log('All Dealers Loaded:', this.allDealers);

          // Ensure inventory is already loaded before proceeding
          if (!this.allInventoryData || this.allInventoryData.length === 0) {
            console.warn('Inventory not loaded yet. Dealer reports will generate later.');
            return;
          }

          // For EACH active dealer → ensure report exists
          this.allDealers
            .filter(d => d.status === 'Active' && d.name)
            .forEach(dealer => {
              const outletName = dealer.name.trim();

              // Auto-create missing localStorage + Firestore entry
              this.saveSingleOutletIfMissing(outletName);
            });

          // Also regenerate full outlet reports (safe)
          this.generateAllOutletsReports();
        },

        error: (err) => {
          console.error('Error loading dealers:', err);
        }
      });
    });
  }


  productList(id:any) {
    runInInjectionContext(this.injector, () => {
      this.outletProductService.getOutletProductById(id).subscribe((data) => {
        console.log("All outlet products:", data);
        this.allOutletProducts = data; // keep all// empty table by default
        this.dataSource.paginator =   this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }


// Update onOutletChange to show report for selected outlet
//   onOutletChange(selectedOutlet: any) {
//     if (!selectedOutlet) {
//       this.allOutletReports = [];
//       return;
//     }
//
//     const selectedDealer = this.allDealers.find((d: any) => d.name === selectedOutlet);
//
//     if (!selectedDealer) {
//       console.error('Error: Could not find dealer for selected outlet.');
//       this.allOutletReports = [];
//       return;
//     }
//
//     // Try to load today's report from localStorage
//     const savedReport = this.loadReportFromLocalStorage(selectedOutlet, this.getTodayDateString());
//
//     if (savedReport) {
//       this.allOutletReports = [savedReport];
//       console.log(`Loaded report for ${selectedOutlet} from localStorage`);
//     } else {
//       // Generate today's report on-the-fly
//       const report = this.calculateStockReportForOutlet(selectedOutlet, this.getTodayDateString());
//       this.allOutletReports = report ? [report] : [];
//       console.log(`Generated new report for ${selectedOutlet}`);
//     }
//   }

  onOutletChange(outlet: string) {
    this.selectedOutlet = outlet;
  }

  getLocalDateString(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSearch() {

    this.isSearchPerformed = true;

    /* ===============================
       1. VALIDATION
       =============================== */
    if (!this.selectedOutlet) {
      Swal.fire('Required', 'Please select an outlet', 'warning');
      return;
    }

    /* ===============================
       2. DATE NORMALIZATION (LOCAL)
       =============================== */
    const todayStr = this.getLocalDateString(new Date());

    const selectedDateStr = this.selectedDate
      ? this.getLocalDateString(this.selectedDate)
      : todayStr;

    const isToday = selectedDateStr === todayStr;

    console.log('Searching for:', {
      outlet: this.selectedOutlet,
      selectedDateStr,
      isToday
    });

    /* ===============================
       3. TODAY → LOCAL STORAGE
       =============================== */
    if (isToday) {

      const localReport = this.loadReportFromLocalStorage(
        this.selectedOutlet,
        todayStr
      );

      if (localReport) {
        this.allOutletReports = [localReport];
        console.log('✔ TODAY data loaded from localStorage');
        return;
      }

      // Safety fallback (should rarely happen)
      const generated = this.calculateStockReportForOutlet(
        this.selectedOutlet,
        todayStr
      );

      if (generated) {
        this.allOutletReports = [generated];
        console.warn('⚠ LocalStorage missing, generated report');
        return;
      }
    }

    /* ===============================
       4. PAST DATE → FIRESTORE
       =============================== */
    const firestoreReports = this.stockDataSource.data.filter((r: any) => {
      return (
        r.outlet?.trim() === this.selectedOutlet?.trim() &&
        this.isSameLocalDay(r.createdAt, selectedDateStr)
      );
    });

    if (firestoreReports.length > 0) {
      this.allOutletReports = firestoreReports;
      console.log('✔ Past date data loaded from Firestore');
    } else {
      this.allOutletReports = [];
      Swal.fire('No Data', 'No stock report found for selected date', 'info');
    }
  }



  onClear() {

    this.selectedOutlet = null;
    this.selectedDate = null;

    this.allOutletReports = [];
    this.isSearchPerformed = false;

    this.dealerSearchText = '';
    this.filteredDealers = [...this.allDealers];

    if (this.dealerSearchInput) {
      this.dealerSearchInput.nativeElement.value = '';
    }
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
            // this.productList();

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


// Add this method to your NewStockReportComponent class

  calculateStockReport(selectedOutlet: string) {
    if (!selectedOutlet) {
      console.error('No outlet selected');
      return;
    }

    console.log('=== Calculating Stock Report for:', selectedOutlet);
    console.log('Sales Data:', this.salesDataSource);
    console.log('GRN Data:', this.grnDataSource);
    console.log('Transfer Data:', this.stockTransferDataSource);

    // Get today's date at start of day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // Filter inventory data for selected outlet
    const outletInventory = this.dataSource.data.filter(
      (item: any) => item.dealerOutlet === selectedOutlet
    );

    console.log('Outlet Inventory:', outletInventory);

    // Create a map to store calculated data for each product
    const productStockMap = new Map<string, any>();

    // Step 1: Initialize with Opening Stock from Inventory
    outletInventory.forEach((product: any) => {
      const key = product.sku; // Using SKU as unique identifier

      productStockMap.set(key, {
        product: product.name,
        sku: product.sku,
        brand: product.brand,
        model: product.model,
        variant: product.variant,
        opening: product.quantity || 0, // Current quantity is opening stock
        sales: 0,
        grn: 0,
        outgoing: 0,
        incoming: 0,
        total: product.quantity || 0
      });
    });

    console.log('Initial Product Map:', Array.from(productStockMap.values()));

    // Step 2: Calculate Sales (subtract from opening)
    let salesCount = 0;
    this.salesDataSource.forEach((sale: any) => {
      if (sale.dealerOutlet?.trim() === selectedOutlet.trim()) {
        // Check if sale is from today
        const saleDate = new Date(sale.salesDate);
        saleDate.setHours(0, 0, 0, 0);

        console.log('Processing Sale:', sale.name, 'Date:', saleDate, 'Today:', today);

        if (saleDate.getTime() === todayTime) {
          const key = sale.sku;
          if (productStockMap.has(key)) {
            const product = productStockMap.get(key);
            product.sales += sale.quantity || 0;
            salesCount++;
            console.log('Added sale for', sale.name, 'Quantity:', sale.quantity);
          } else {
            console.log('Product not found in map:', sale.sku, sale.name);
          }
        }
      }
    });

    console.log('Total sales processed:', salesCount);

    // Step 3: Calculate GRN (add to stock)
    let grnCount = 0;
    this.grnDataSource.forEach((grn: any) => {
      if (grn.dealerOutlet?.trim() === selectedOutlet.trim()) {
        // Check if GRN is from today
        const grnDate = grn.stockDate ? new Date(grn.stockDate) : null;
        if (grnDate) {
          grnDate.setHours(0, 0, 0, 0);

          console.log('Processing GRN:', grn.name, 'Date:', grnDate, 'Today:', today);

          if (grnDate.getTime() === todayTime) {
            const key = grn.sku;
            if (productStockMap.has(key)) {
              const product = productStockMap.get(key);
              product.grn += grn.quantity || 0;
              grnCount++;
              console.log('Added GRN for', grn.name, 'Quantity:', grn.quantity);
            } else {
              console.log('Product not found in map for GRN:', grn.sku, grn.name);
            }
          }
        }
      }
    });

    console.log('Total GRN processed:', grnCount);

    // Step 4: Calculate Stock Transfers
    let transferCount = 0;
    this.stockTransferDataSource.forEach((transfer: any) => {
      // Only process approved transfers
      if (transfer.status === 'Approved' && transfer.items) {
        // Check if transfer is from today
        const transferDate = transfer.createdAt?.seconds
          ? new Date(transfer.createdAt.seconds * 1000)
          : null;

        if (transferDate) {
          transferDate.setHours(0, 0, 0, 0);

          console.log('Processing Transfer from:', transfer.fromDealerOutlet, 'to:', transfer.toDealerOutlet, 'Date:', transferDate);

          if (transferDate.getTime() === todayTime) {
            transfer.items.forEach((item: any) => {
              const key = item.sku;

              // Outgoing: Current outlet is sending stock
              if (transfer.fromDealerOutlet?.trim() === selectedOutlet.trim()) {
                if (productStockMap.has(key)) {
                  const product = productStockMap.get(key);
                  product.outgoing += item.quantity || 0;
                  transferCount++;
                  console.log('Outgoing transfer for', item.name, 'Quantity:', item.quantity);
                }
              }

              // Incoming: Current outlet is receiving stock
              if (transfer.toDealerOutlet?.trim() === selectedOutlet.trim()) {
                if (productStockMap.has(key)) {
                  const product = productStockMap.get(key);
                  product.incoming += item.quantity || 0;
                  transferCount++;
                  console.log('Incoming transfer for', item.name, 'Quantity:', item.quantity);
                } else {
                  // Product might not exist in inventory yet, create entry
                  productStockMap.set(key, {
                    product: item.name,
                    sku: item.sku,
                    brand: item.brand,
                    model: item.model,
                    variant: item.variant,
                    opening: 0,
                    sales: 0,
                    grn: 0,
                    outgoing: 0,
                    incoming: item.quantity || 0,
                    total: 0
                  });
                  transferCount++;
                  console.log('Created new product entry for incoming transfer:', item.name);
                }
              }
            });
          }
        }
      }
    });

    console.log('Total transfers processed:', transferCount);

    // Step 5: Calculate Total for each product
    // Formula: Opening - Sales + GRN - Outgoing + Incoming
    productStockMap.forEach((product, key) => {
      product.total =
        product.opening -
        product.sales +
        product.grn -
        product.outgoing +
        product.incoming;
    });

    // Convert map to array
    const reportRows = Array.from(productStockMap.values());

    console.log('Final Report Rows:', reportRows);

    // Update the report
    this.allOutletReports = [{
      outlet: selectedOutlet,
      rows: reportRows
    }];

    // Save to localStorage with timestamp
    this.saveReportToLocalStorage(selectedOutlet, reportRows);

    console.log('Stock Report Generated:', this.allOutletReports);
  }


// Save report to localStorage
  saveReportToLocalStorage(outlet: string, reportData: any[]) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `stock_report_${outlet}_${today}`;

    const reportToSave = {
      outlet: outlet,
      date: today,
      timestamp: new Date().getTime(),
      rows: reportData
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(reportToSave));
      console.log('Report saved to localStorage:', storageKey);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async saveAllReportsToFirestore(allReports: any[], dateString: string) {

    // BLOCK ALL UNSCHEDULED SAVES
    if (!this.isAutoSaveRunning) {
      console.warn('Firestore save blocked (not scheduled auto-save time)');
      return;
    }

    const collectionName = this.env.stockReport;
    console.log(`Saving reports to Firestore collection: ${collectionName}`);

    return runInInjectionContext(this.injector, async () => {

      const batch = this.mFirestore.firestore.batch();
      let successCount = 0;

      for (const report of allReports) {
        try {
          const docId = `${report.outlet.replace(/\s+/g, '_')}_${dateString}`;
          const docRef = this.mFirestore
            .collection(collectionName)
            .doc(docId)
            .ref;

          const firestoreData = {
            outlet: report.outlet,
            date: dateString,
            timestamp: Date.now(),
            createdAt: new Date(),
            rows: report.rows.map((row: any) => ({
              product: row.product,
              sku: row.sku,
              brand: row.brand,
              model: row.model,
              variant: row.variant,
              opening: row.opening,
              sales: row.sales,
              grn: row.grn,
              outgoing: row.outgoing,
              incoming: row.incoming,
              total: row.total
            }))
          };

          batch.set(docRef, firestoreData, { merge: true });
          successCount++;

        } catch (error) {
          console.error(`Error preparing Firestore save for ${report.outlet}`, error);
        }
      }

      try {
        await batch.commit();

        console.log(`Successfully saved ${successCount} reports to Firestore`);

        // SUCCESS ALERT ONLY AT AUTO-SAVE TIME
        Swal.fire({
          title: 'Success!',
          text: `Stock reports saved to database: ${successCount} outlets`,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error('Error committing batch to Firestore:', error);

        Swal.fire({
          title: 'Error!',
          text: 'Failed to save some reports to database',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }


// Schedule daily save at 11 PM
  scheduleAutoSave() {
    const scheduleNextSave = () => {
      const now = new Date();
      const scheduledTime = new Date();

      // YOUR PROVIDED TIME (UNCHANGED)
      scheduledTime.setHours(23, 59, 0, 0); // 11:59 PM

      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilSave = scheduledTime.getTime() - now.getTime();

      setTimeout(async () => {
        console.log('Auto-save triggered at 11 PM');

        // ALLOW DB SAVE ONLY FROM SCHEDULER
        this.isAutoSaveRunning = true;

        try {
          const allowedOutlets = this.getAllowedOutletSet();

          const uniqueOutlets = [
            ...new Set(
              this.allInventoryData
                .map(item => item.dealerOutlet?.trim())
                .filter(outlet => allowedOutlets.has(outlet))
            )
          ];

          const allReports: any[] = [];

          uniqueOutlets.forEach(outlet => {
            if (outlet) {
              const report = this.calculateStockReportForOutlet(
                outlet,
                this.getTodayDateString()
              );
              if (report) {
                allReports.push(report);
              }
            }
          });

          if (allReports.length > 0) {
            // localStorage save (UNCHANGED)
            this.saveAllReportsToLocalStorage(allReports, this.getTodayDateString());

            // Firestore save (ONLY HERE)
            await this.saveAllReportsToFirestore(
              allReports,
              this.getTodayDateString()
            );

            console.log(`Daily save completed: ${allReports.length} outlets saved`);
          } else {
            console.warn('No reports generated for auto-save');
          }

        } catch (error) {
          console.error('Error during auto-save:', error);
        } finally {
          // BLOCK DB SAVE AFTER AUTO-SAVE
          this.isAutoSaveRunning = false;
        }

        // schedule next day
        scheduleNextSave();

      }, timeUntilSave);

      console.log(`Next auto-save scheduled for: ${scheduledTime.toLocaleString()}`);
    };

    scheduleNextSave();
  }


// Load report from localStorage for a specific outlet and date
  loadReportFromLocalStorage(outlet: string, date?: string): any {
    const dateStr = date || this.getTodayDateString();
    const storageKey = `stock_report_${outlet}_${dateStr}`;

    try {
      const savedReport = localStorage.getItem(storageKey);
      if (savedReport) {
        return JSON.parse(savedReport);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }

    return null;
  }

// Update loadStockReportData to trigger report generation after loading
  loadStockReportData() {
    runInInjectionContext(this.injector, () => {
      this.stockReportService.getStockList().subscribe((data) => {
        this.stockDataSource.data = data;
        console.log("Stock Report Data loaded from Firestore:", data);
        // After loading stock report data, check if we can generate reports
        this.checkAndGenerateAllReports();
      });
    });
  }

  saveSingleOutletIfMissing(outletName: string) {
    const today = this.getTodayDateString();
    const storageKey = `stock_report_${outletName}_${today}`;

    if (!localStorage.getItem(storageKey)) {
      const report = this.calculateStockReportForOutlet(outletName, today);
      if (report) {
        this.saveAllReportsToLocalStorage([report], today);
        this.saveAllReportsToFirestore([report], today);
        console.log(`New outlet auto-saved: ${outletName}`);
      }
    }
  }


  clearPreviousDayStockReportsIfDateChanged(): void {
    const today = this.getTodayDateString(); // YYYY-MM-DD
    const storedDateKey = 'stock_report_active_date';

    const lastActiveDate = localStorage.getItem(storedDateKey);

    // Same day → DO NOTHING
    if (lastActiveDate === today) {
      return;
    }

    console.warn(`Date changed (${lastActiveDate} → ${today}), clearing old stock reports`);

    // Remove all previous stock report entries
    Object.keys(localStorage).forEach(key => {

      if (
        key.startsWith('stock_report_') ||
        key.startsWith('stock_reports_index_')
      ) {
        localStorage.removeItem(key);
      }
    });

    // Save today as active date
    localStorage.setItem(storedDateKey, today);

    console.log('Previous day stock reports cleared. Fresh day started.');
  }

  exportToExcel() {

    if (!this.allOutletReports || this.allOutletReports.length === 0) {
      Swal.fire('No Data', 'No stock report available to export', 'warning');
      return;
    }

    const workbook = new Workbook();

    this.allOutletReports.forEach((report, index) => {

      const sheetName = report.outlet
        ? report.outlet.substring(0, 30)
        : `Outlet_${index + 1}`;

      const worksheet = workbook.addWorksheet(sheetName);

      /* ===========================
         TITLE
      ============================ */
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'Stock Report';
      worksheet.getCell('A1').font = { bold: true, size: 14 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:G2');
      worksheet.getCell('A2').value = `Outlet : ${report.outlet}`;
      worksheet.getCell('A2').font = { bold: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      worksheet.addRow([]);

      /* ===========================
         HEADER (EXACT LIKE IMAGE)
      ============================ */
      const headerRow = worksheet.addRow([
        'Products Name',
        'Opening Stock',
        'Sales',
        'GRN',
        'Outgoing Stock',
        'Incoming Stock',
        'Closing Stock'
      ]);

      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      /* ===========================
         DATA ROWS
      ============================ */
      report.rows.forEach((row: any) => {

        const dataRow = worksheet.addRow([
          row.product,
          row.opening,
          row.sales,
          row.grn,
          row.outgoing,
          row.incoming,
          row.total
        ]);

        dataRow.eachCell(cell => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      /* ===========================
         COLUMN WIDTH (MATCH UI)
      ============================ */
      worksheet.columns = [
        { width: 30 }, // Product
        { width: 15 },
        { width: 10 },
        { width: 10 },
        { width: 18 },
        { width: 18 },
        { width: 15 }
      ];
    });

    /* ===========================
       DOWNLOAD
    ============================ */
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob(
        [buffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      FileSaver.saveAs(
        blob,
        `Stock_Report_${this.getTodayDateString()}.xlsx`
      );
    });
  }



}
