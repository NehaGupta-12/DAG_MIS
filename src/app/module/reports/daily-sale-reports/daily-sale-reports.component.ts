import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import { MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import { CommonModule} from "@angular/common";
import {AddDealerService} from "../../add-dealer.service";
import {ActivatedRoute} from "@angular/router";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {map} from "rxjs/operators";
import Swal from "sweetalert2";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltip} from "@angular/material/tooltip";
import {ProductMasterService} from "../../product-master.service";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from "@angular/material/datepicker";
import {DailySalesService} from "../../daily-sales.service";
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import {AuthService} from "../../../authentication/auth.service";
import {LoadingService} from "../../../Services/loading.service";

@Component({
  selector: 'app-daily-sale-reports',
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
  ],
  providers: [{provide: MAT_DIALOG_DATA, useValue: {}}],
  templateUrl: './daily-sale-reports.component.html',
  standalone: true,
  styleUrl: './daily-sale-reports.component.scss'
})
export class DailySaleReportsComponent implements OnInit{
  isEditMode: boolean = false;
  dealerForm: FormGroup;
  dataSource: any[] = [];
  vehicledataSource: any[] = [];
  salesdataSource: any[] = [];
  filteredProducts: any[] = [];
  reportTitle: string = '';
  reportDate: string = '';
  selectedCountry: string = '';
  selectedOutlets: string[] = [];
  allOutletReports: { outlet: string; rows: any[] }[] = [];
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;
  @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;
  // @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;
  debounceTimer: any;


  // Filters
  nameFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');
  productFilter = new FormControl('');


  search: any = {
    name: '',
    division: '',
    country: '',
    town: '',
    product: '',
  };

  options: any = {
    name: [],
    division: [],
    country: [],
    town: [],
    product: [],
  };

  filteredOptions: any = {
    name: [],
    division: [],
    country: [],
    town: [],
    product: [],
  };

  constructor(
    private fb: UntypedFormBuilder,
    private addDealerService: AddDealerService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private mDatabase: AngularFireDatabase,
    private productService:ProductMasterService,
    private dailySlaes: DailySalesService,
    public authService : AuthService,
    private loadingService: LoadingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dealerForm = this.fb.group({
      name: this.fb.control([], Validators.required),   // ✅ fixed
      country: [''],
      division: [''],
      town: [''],
      product: [''],
      period: this.fb.group({   // ✅ date range group
        start: [''],
        end: [''],
      }),
    });

    // Load Firebase options
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Division').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.division = data; this.filteredOptions.division = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletType').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.outletType = data; this.filteredOptions.outletType = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletCategory').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.category = data; this.filteredOptions.category = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Countries').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.country = data; this.filteredOptions.country = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Town').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.town = data; this.filteredOptions.town = [...data]; });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        this.dealerForm.patchValue(rowData);
        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;
        }
      }
      this.townFilter.valueChanges.subscribe(val => {
        this.filterOptions('town', val || '');
        this.dealerForm.patchValue({ town: val }); // 🔹 keeps form in sync
      });

    });

    this.loadSalesList();
    this.DealerList();
    this.productList();

    // 🔹 Filter subscription
    // this.nameFilter.valueChanges.subscribe(val => this.filterOptions('name', val || ''));
    // this.outletTypeFilter.valueChanges.subscribe(val => this.filterOptions('outletType', val || ''));
    // this.categoryFilter.valueChanges.subscribe(val => this.filterOptions('category', val || ''));
    // this.divisionFilter.valueChanges.subscribe(val => this.filterOptions('division', val || ''));
    // this.countryFilter.valueChanges.subscribe(val => this.filterOptions('country', val || ''));
    // this.townFilter.valueChanges.subscribe(val => this.filterOptions('town', val || ''));

    // 🔹 Hook filters to filtering logic
    this.nameFilter.valueChanges.subscribe(val => {
      this.filterOptions('name', val || '');
      this.dealerForm.patchValue({ name: val });
    });


    this.divisionFilter.valueChanges.subscribe(val => {
      this.filterOptions('division', val || '');
      this.dealerForm.patchValue({ division: val });
    });

    this.countryFilter.valueChanges.subscribe(val => {
      this.filterOptions('country', val || '');
      this.dealerForm.patchValue({ country: val });
    });

    this.townFilter.valueChanges.subscribe(val => {
      this.filterOptions('town', val || '');
      this.dealerForm.patchValue({ town: val });
    });

    this.productFilter.valueChanges.subscribe(val => {
      this.filterOptions('product', val || '');
      this.dealerForm.patchValue({ product: val });
    });
  }

  loadSalesList() {
    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe((data) => {
        this.salesdataSource = data
        this.filteredProducts = [];
        console.log('daily sales',data);
      });
    });
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data: any) => {
        this.dataSource = data;

        const names = Array.from(new Set(data.map((d: any) => d.name).filter(Boolean)));
        this.options.name = names;
        this.filteredOptions.name = [...names];
      });
    });
  }

  // Country
  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchText = event.target.value.toLowerCase();
      this.filteredOptions.country = this.options.country.filter((c: string) =>
        c.toLowerCase().includes(searchText)
      );
    }, 300);
  }
  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.filteredOptions.country = [...this.options.country];
      setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
    }
  }

// Division
  onDivisionSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchText = event.target.value.toLowerCase();
      this.filteredOptions.division = this.options.division.filter((d: string) =>
        d.toLowerCase().includes(searchText)
      );
    }, 300);
  }
  onDivisionSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.filteredOptions.division = [...this.options.division];
      setTimeout(() => this.divisionSearchInput.nativeElement.focus(), 0);
    }
  }

// Town
  onTownSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchText = event.target.value.toLowerCase();
      this.filteredOptions.town = this.options.town.filter((t: string) =>
        t.toLowerCase().includes(searchText)
      );
    }, 300);
  }
  onTownSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.filteredOptions.town = [...this.options.town];
      setTimeout(() => this.townSearchInput.nativeElement.focus(), 0);
    }
  }

// Outlet(s)
// search + debounce
  onOutletSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchText = (event.target.value || '').toLowerCase();
      this.filteredOptions.name = this.options.name.filter((o: string) =>
        o.toLowerCase().includes(searchText)
      );
    }, 300);
  }
  // reset + focus when opened
  onOutletSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.filteredOptions.name = [...this.options.name];
      setTimeout(() => {
        try {
          this.outletSearchInput.nativeElement.focus();
        } catch {}
      }, 0);
    }
  }

  productList() {
    runInInjectionContext(this.injector, () => {
      this.productService.getProductList().subscribe((data) => {
        (this.productService as any).cachedProducts = data;
        this.vehicledataSource = data;

        // Extract product names for dropdown
        const productNames = Array.from(new Set(data.map((p: any) => p.name).filter(Boolean)));
        this.options.product = productNames;
        this.filteredOptions.product = [...productNames];

        console.log("All Products:", data);
      });
    });
  }

  getDateRanges(currentDate: Date) {
    // Start of month
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Start of financial year (1st April)
    const fyStart = currentDate.getMonth() >= 3
      ? new Date(currentDate.getFullYear(), 3, 1)   // If Apr-Dec
      : new Date(currentDate.getFullYear() - 1, 3, 1); // If Jan-Mar

    return { monthStart, fyStart };
  }


  generateReport(filteredData: any[], reportDate: Date) {
    const { monthStart, fyStart } = this.getDateRanges(reportDate);
    const report: any = {};

    filteredData.forEach(item => {
      const product = item.name;   // 🔹 Match strictly by product name
      const qty = Number(item.quantity) || 0;

      // Handle Firestore timestamp
      const itemDate = item.createdAt?.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date(item.createdAt);

      if (!report[product]) {
        report[product] = { YTD: 0, Month: 0, Day: 0 };
      }

      // YTD
      if (itemDate >= fyStart && itemDate <= reportDate) {
        report[product].YTD += qty;
      }

      // Month
      if (itemDate >= monthStart && itemDate <= reportDate) {
        report[product].Month += qty;
      }

      // Day
      if (
        itemDate.getFullYear() === reportDate.getFullYear() &&
        itemDate.getMonth() === reportDate.getMonth() &&
        itemDate.getDate() === reportDate.getDate()
      ) {
        report[product].Day += qty;
      }
    });

    return report;
  }





  // Filter options logic
  filterOptions(field: string, value: string) {
    const searchTerm = value?.toLowerCase() || '';
    const matched = this.options[field].filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
    this.filteredOptions[field] = [...matched];
  }



  //
  // onSubmit() {
  //   // Start loader
  //   this.loadingService.setLoading(true);
  //
  //   try {
  //     const filters = this.dealerForm.value;
  //     const startDate = filters.period?.start ? new Date(filters.period.start) : null;
  //     const endDate = filters.period?.end ? new Date(filters.period.end) : new Date();
  //
  //     if (startDate) startDate.setHours(0, 0, 0, 0);
  //     if (endDate) endDate.setHours(23, 59, 59, 999);
  //
  //     const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);
  //
  //     this.allOutletReports = [];
  //
  //     // Case 1: No outlet selected → show merged report
  //     if (outlets.length === 0) {
  //       const filtered = this.salesdataSource.filter(item => {
  //         const itemDate = item.createdAt?.seconds
  //           ? new Date(item.createdAt.seconds * 1000)
  //           : new Date(item.createdAt);
  //         return (
  //           (!filters.country || item.country === filters.country) &&
  //           (!filters.town || item.town === filters.town) &&
  //           (!filters.division || item.division === filters.division) &&
  //           (!startDate || itemDate >= startDate) &&
  //           (!endDate || itemDate <= endDate)
  //         );
  //       });
  //
  //       const report = this.generateReport(filtered, endDate);
  //
  //       let tempRows = this.vehicledataSource.map(prod => {
  //         const key = prod.name;
  //         const displayName = (prod.model || prod.name).toUpperCase();
  //         const daySales = report[key]?.Day || 0;
  //         const monthSales = report[key]?.Month || 0;
  //         const ytdSales = report[key]?.YTD || 0;
  //
  //         let rowColor = '';
  //         if (daySales > 10 || monthSales > 10 || ytdSales > 10) {
  //           rowColor = 'green-row';
  //         } else if (daySales >= 1 || monthSales >= 1 || ytdSales >= 1) {
  //           rowColor = 'yellow-row';
  //         } else {
  //           rowColor = 'red-row';
  //         }
  //
  //         return {
  //           product: displayName,
  //           Day: daySales,
  //           Month: monthSales,
  //           YTD: ytdSales,
  //           rowColor: rowColor
  //         };
  //       });
  //
  //       // Group + totals
  //       const grouped: any = {};
  //       tempRows.forEach(row => {
  //         if (!grouped[row.product]) {
  //           grouped[row.product] = { product: row.product, Day: 0, Month: 0, YTD: 0, rowColor: '' };
  //         }
  //         grouped[row.product].Day += row.Day;
  //         grouped[row.product].Month += row.Month;
  //         grouped[row.product].YTD += row.YTD;
  //       });
  //
  //       const mergedReport = Object.values(grouped);
  //       mergedReport.forEach((row: any) => {
  //         if (row.product !== 'TOTAL') {
  //           if (row.Day > 10 || row.Month > 10 || row.YTD > 10) {
  //             row.rowColor = 'green-row';
  //           } else if (row.Day >= 1 || row.Month >= 1 || row.YTD >= 1) {
  //             row.rowColor = 'yellow-row';
  //           } else {
  //             row.rowColor = 'red-row';
  //           }
  //         }
  //       });
  //
  //       mergedReport.push({
  //         product: 'TOTAL',
  //         Day: mergedReport.reduce((s: number, r: any) => s + r.Day, 0),
  //         Month: mergedReport.reduce((s: number, r: any) => s + r.Month, 0),
  //         YTD: mergedReport.reduce((s: number, r: any) => s + r.YTD, 0),
  //         rowColor: ''
  //       });
  //
  //       this.allOutletReports.push({
  //         outlet: 'All Outlets',
  //         rows: mergedReport
  //       });
  //
  //     } else {
  //       // Case 2: One or more outlets selected
  //       outlets.forEach((outlet: any) => {
  //         const filtered = this.salesdataSource.filter(item => {
  //           const itemDate = item.createdAt?.seconds
  //             ? new Date(item.createdAt.seconds * 1000)
  //             : new Date(item.createdAt);
  //           return (
  //             (!filters.country || item.country === filters.country) &&
  //             (!filters.town || item.town === filters.town) &&
  //             (!filters.division || item.division === filters.division) &&
  //             item.dealerOutlet === outlet &&
  //             (!startDate || itemDate >= startDate) &&
  //             (!endDate || itemDate <= endDate)
  //           );
  //         });
  //
  //         const report = this.generateReport(filtered, endDate);
  //
  //         let tempRows = this.vehicledataSource.map(prod => {
  //           const key = prod.name;
  //           const displayName = (prod.model || prod.name).toUpperCase();
  //           const daySales = report[key]?.Day || 0;
  //           const monthSales = report[key]?.Month || 0;
  //           const ytdSales = report[key]?.YTD || 0;
  //
  //           let rowColor = '';
  //           if (daySales > 10 || monthSales > 10 || ytdSales > 10) {
  //             rowColor = 'green-row';
  //           } else if (daySales >= 1 || monthSales >= 1 || ytdSales >= 1) {
  //             rowColor = 'yellow-row';
  //           } else {
  //             rowColor = 'red-row';
  //           }
  //
  //           return {
  //             product: displayName,
  //             Day: daySales,
  //             Month: monthSales,
  //             YTD: ytdSales,
  //             rowColor: rowColor
  //           };
  //         });
  //
  //         const grouped: any = {};
  //         tempRows.forEach(row => {
  //           if (!grouped[row.product]) {
  //             grouped[row.product] = { product: row.product, Day: 0, Month: 0, YTD: 0, rowColor: '' };
  //           }
  //           grouped[row.product].Day += row.Day;
  //           grouped[row.product].Month += row.Month;
  //           grouped[row.product].YTD += row.YTD;
  //         });
  //
  //         const outletReport = Object.values(grouped);
  //         outletReport.forEach((row: any) => {
  //           if (row.product !== 'TOTAL') {
  //             if (row.Day > 10 || row.Month > 10 || row.YTD > 10) {
  //               row.rowColor = 'green-row';
  //             } else if (row.Day >= 1 || row.Month >= 1 || row.YTD >= 1) {
  //               row.rowColor = 'yellow-row';
  //             } else {
  //               row.rowColor = 'red-row';
  //             }
  //           }
  //         });
  //
  //         outletReport.push({
  //           product: 'TOTAL',
  //           Day: outletReport.reduce((s: number, r: any) => s + r.Day, 0),
  //           Month: outletReport.reduce((s: number, r: any) => s + r.Month, 0),
  //           YTD: outletReport.reduce((s: number, r: any) => s + r.YTD, 0),
  //           rowColor: ''
  //         });
  //
  //         this.allOutletReports.push({
  //           outlet,
  //           rows: outletReport
  //         });
  //
  //         this.selectedCountry = this.dealerForm.value.country || '';
  //       });
  //     }
  //   } finally {
  //     // Stop loader
  //     this.loadingService.setLoading(false);
  //   }
  // }


  onSubmit() {
    // Start loader
    this.loadingService.setLoading(true);

    try {
      const filters = this.dealerForm.value;
      const startDate = filters.period?.start ? new Date(filters.period.start) : null;
      const endDate = filters.period?.end ? new Date(filters.period.end) : new Date();

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);

      this.allOutletReports = [];

      // Always fetch data (no disable)
      const filterFn = (item: any, outlet: string | null = null) => {
        const itemDate = item.createdAt?.seconds
          ? new Date(item.createdAt.seconds * 1000)
          : new Date(item.createdAt);

        return (
          (!filters.country || item.country === filters.country) &&
          (!filters.town || item.town === filters.town) &&
          (!filters.division || item.division === filters.division) &&
          (!outlet || item.dealerOutlet === outlet) &&
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate)
        );
      };

      // Case 1: No outlet selected → show merged report
      if (outlets.length === 0) {
        const filtered = this.salesdataSource.filter(item => filterFn(item));
        const report = this.generateReport(filtered, endDate);

        const tempRows = this.buildRows(report);

        // Group + totals
        const grouped = this.groupAndColorRows(tempRows);

        this.allOutletReports.push({
          outlet: 'All Outlets',
          rows: grouped
        });

      } else {
        // Case 2: One or more outlets selected
        outlets.forEach((outlet: string) => {
          const filtered = this.salesdataSource.filter(item => filterFn(item, outlet));
          const report = this.generateReport(filtered, endDate);

          const tempRows = this.buildRows(report);
          const grouped = this.groupAndColorRows(tempRows);

          this.allOutletReports.push({
            outlet,
            rows: grouped
          });
        });

        this.selectedCountry = filters.country || '';
      }
    } finally {
      // Stop loader
      this.loadingService.setLoading(false);
    }
  }

// ✅ Helper to build rows
  private buildRows(report: any) {
    return this.vehicledataSource.map((prod: any) => {
      const key = prod.name;
      const displayName = (prod.model || prod.name).toUpperCase();
      const daySales = report[key]?.Day || 0;
      const monthSales = report[key]?.Month || 0;
      const ytdSales = report[key]?.YTD || 0;

      let rowColor = '';
      if (daySales > 10 || monthSales > 10 || ytdSales > 10) {
        rowColor = 'green-row';
      } else if (daySales >= 1 || monthSales >= 1 || ytdSales >= 1) {
        rowColor = 'yellow-row';
      } else {
        rowColor = 'red-row';
      }

      return { product: displayName, Day: daySales, Month: monthSales, YTD: ytdSales, rowColor };
    });
  }

// ✅ Helper to group and add totals
  private groupAndColorRows(tempRows: any[]) {
    const grouped: any = {};
    tempRows.forEach(row => {
      if (!grouped[row.product]) {
        grouped[row.product] = { product: row.product, Day: 0, Month: 0, YTD: 0, rowColor: '' };
      }
      grouped[row.product].Day += row.Day;
      grouped[row.product].Month += row.Month;
      grouped[row.product].YTD += row.YTD;
    });

    const rows = Object.values(grouped);
    rows.forEach((row: any) => {
      if (row.product !== 'TOTAL') {
        if (row.Day > 10 || row.Month > 10 || row.YTD > 10) {
          row.rowColor = 'green-row';
        } else if (row.Day >= 1 || row.Month >= 1 || row.YTD >= 1) {
          row.rowColor = 'yellow-row';
        } else {
          row.rowColor = 'red-row';
        }
      }
    });

    rows.push({
      product: 'TOTAL',
      Day: rows.reduce((s: number, r: any) => s + r.Day, 0),
      Month: rows.reduce((s: number, r: any) => s + r.Month, 0),
      YTD: rows.reduce((s: number, r: any) => s + r.YTD, 0),
      rowColor: ''
    });

    return rows;
  }




  onCancel() {
    // Clear the selectedOutlets array
    this.selectedOutlets = [];

    // Reset the form
    this.dealerForm.reset();

    // Reset the form controls that are tied to the filters
    this.nameFilter.reset();
    this.divisionFilter.reset();
    this.countryFilter.reset();
    this.townFilter.reset();
    this.productFilter.reset();

    // Restore the filtered options to their original state
    Object.keys(this.options).forEach(key => {
      this.filteredOptions[key] = [...this.options[key]];
    });

    // Clear the displayed reports
    this.allOutletReports = [];
  }

  exportToExcel() {
    if (!this.allOutletReports || this.allOutletReports.length === 0) {
      Swal.fire('Info', 'No data available to export', 'info');
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    let currentRow = 1;

    // 🔹 Build date text
    let reportDateText = '';
    if (this.dealerForm.value.period?.start && this.dealerForm.value.period?.end) {
      const start = new Date(this.dealerForm.value.period.start).toLocaleDateString();
      const end = new Date(this.dealerForm.value.period.end).toLocaleDateString();
      reportDateText = `${start} - ${end}`;
    } else if (this.dealerForm.value.period?.start) {
      reportDateText = new Date(this.dealerForm.value.period.start).toLocaleDateString();
    } else {
      reportDateText = new Date().toLocaleDateString(); // default today
    }

    this.allOutletReports.forEach((report, index) => {
      const colCount = report.rows.length + 1; // +1 for "Particulars"

      // 🔹 Title row
      const titleRow = worksheet.addRow([`Cumulative for the month - ${report.outlet}`]);
      worksheet.mergeCells(currentRow, 1, currentRow, colCount);
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
      titleRow.height = 20;
      titleRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }
        };
      });
      currentRow++;

      // 🔹 Date row (always filled now)
      const country = this.dealerForm.value.country || '';
      const dateText = `Date: ${reportDateText}${country ? ' | Country: ' + country : ''}`;
      const dateRow = worksheet.addRow([dateText]);

      worksheet.mergeCells(currentRow, 1, currentRow, colCount);
      dateRow.alignment = { vertical: 'middle', horizontal: 'center' };
      dateRow.height = 20;
      dateRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }
        };
      });
      currentRow++;

      // 🔹 Header row
      const headers = ['Products Name', ...report.rows.map(p => p.product.toUpperCase())];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.height = 40;
      headerRow.eachCell(c => {
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F4B083' }
        };
      });
      currentRow++;

      // 🔹 Data rows
      worksheet.addRow(['Sales for the day', ...report.rows.map(p => p.Day)]); currentRow++;
      worksheet.addRow(['Cumulative for the month', ...report.rows.map(p => p.Month)]); currentRow++;
      worksheet.addRow(['YTD', ...report.rows.map(p => p.YTD)]); currentRow++;

      // 🔹 Spacer row only between outlets
      if (index < this.allOutletReports.length - 1) {
        worksheet.addRow([]);
        currentRow++;
      }
    });

    // 🔹 Borders + alignment for all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // 🔹 Column widths
    worksheet.columns.forEach((col, index) => {
      col.width = index === 0 ? 25 : 12;
    });

    // 🔹 Save Excel file
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `Sales_Report_${reportDateText}.xlsx`);
    });
  }




  toggleOutletSelection(outlet: string, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedOutlets.includes(outlet)) {
        this.selectedOutlets.push(outlet);
      }
    } else {
      this.selectedOutlets = this.selectedOutlets.filter(d => d !== outlet);
    }

    // Patch the form with the array of selected outlets
    this.dealerForm.patchValue({ name: this.selectedOutlets });

    // Update the input field to display the selected outlets as a comma-separated string
    this.nameFilter.setValue(this.selectedOutlets.join(', '), { emitEvent: false });
  }
  displayFn = (): string => {
    if (!this.dealerForm) return '';
    const selectedValues = this.dealerForm.get('name')?.value;
    return Array.isArray(selectedValues) ? selectedValues.join(', ') : '';
  }


  displayCountry = (value: string): string => value ? value : '';
  displayTown = (value: string): string => value ? value : '';
  displayDivision = (value: string): string => value ? value : '';


}
