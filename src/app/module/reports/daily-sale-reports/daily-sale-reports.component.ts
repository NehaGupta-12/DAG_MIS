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
import {CountryService} from "../../../Services/country.service";
import {ActivityLogService} from "../../activity-log/activity-log.service";
import {ActivityLog} from "../../activity-log/activity-log.component";

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

  debounceTimer: any;
  countryOptionsLoaded: boolean = false;

  // Filters
  nameFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');
  productFilter = new FormControl('');

  filteredDivisionsByCountry: string[] = [];
  filteredTownsByDivision: string[] = [];
  filteredOutletsByTown: string[] = [];

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
    private productService: ProductMasterService,
    private dailySlaes: DailySalesService,
    public authService : AuthService,
    private loadingService: LoadingService,
    private countryService : CountryService,
    private mService: ActivityLogService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dealerForm = this.fb.group({
      name: this.fb.control(''),
      country: [''],
      division: [''],
      town: [''],
      product: [''],
      period: this.fb.group({
        start: [''],
        end: [''],
      }),
    });

    // Load Firebase options
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Division').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.division = data; this.filteredOptions.division = [...data]; });

    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletType').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.outletType = data; this.filteredOptions.outletType = [...data]; });

    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletCategory').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.category = data; this.filteredOptions.category = [...data]; });

    // COUNTRY LOADING
    this.countryService.getCountries().subscribe((data: string[]) => {
      this.options.country = data;
      this.filteredOptions.country = [...data];
      this.countryOptionsLoaded = true;
    });

    this.mDatabase.object<{ subcategories: string[] }>('typelist/Town').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.town = data; this.filteredOptions.town = [...data]; });
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
    });

    this.loadSalesList();
    this.DealerList();
    this.productList();

    // --- Cascading dropdowns (ignore NA, search ready) ---
    this.dealerForm.get('country')?.valueChanges.subscribe(selectedCountry => {
      this.filteredDivisionsByCountry = Array.from(new Set(
        this.dataSource
          .filter(d => (!selectedCountry || d.country === selectedCountry) && d.division && d.division !== 'NA')
          .map(d => d.division)
      ));
      this.filteredOptions.division = [...this.filteredDivisionsByCountry];

      this.dealerForm.patchValue({ division: '', town: '', name: [] });
      this.filteredOptions.town = [];
      this.filteredOptions.name = [];
    });

    this.dealerForm.get('division')?.valueChanges.subscribe(selectedDivision => {
      this.filteredTownsByDivision = Array.from(new Set(
        this.dataSource
          .filter(d => (!selectedDivision || d.division === selectedDivision) && d.town && d.town !== 'NA')
          .map(d => d.town)
      ));
      this.filteredOptions.town = [...this.filteredTownsByDivision];

      this.dealerForm.patchValue({ town: '', name: [] });
      this.filteredOptions.name = [];
    });

    this.dealerForm.get('town')?.valueChanges.subscribe(selectedTown => {
      this.filteredOutletsByTown = Array.from(new Set(
        this.dataSource
          .filter(d => (!selectedTown || d.town === selectedTown) && d.name && d.name !== 'NA')
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...this.filteredOutletsByTown];

      this.dealerForm.patchValue({ name: [] });
    });

    // --- Search filters ---
    this.nameFilter.valueChanges.subscribe(val => this.filterOutlet(val || ''));
    this.divisionFilter.valueChanges.subscribe(val => this.filterDivision(val || ''));
    this.countryFilter.valueChanges.subscribe(val => this.filterCountry(val || ''));
    this.townFilter.valueChanges.subscribe(val => this.filterTown(val || ''));
    this.productFilter.valueChanges.subscribe(val => this.filterOptions('product', val || ''));
  }

  // --- Filter methods for cascading + search ---
  filterCountry(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.country = this.options.country
      .filter(c => c.toLowerCase().includes(searchText));
  }

  filterDivision(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.division = this.filteredDivisionsByCountry
      .filter(d => d.toLowerCase().includes(searchText));
  }

  filterTown(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.town = this.filteredTownsByDivision
      .filter(t => t.toLowerCase().includes(searchText));
  }

  filterOutlet(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.name = this.filteredOutletsByTown
      .filter(o => o.toLowerCase().includes(searchText));
  }

  filterOptions(field: string, value: string) {
    const searchTerm = (value || '').toLowerCase();
    this.filteredOptions[field] = this.options[field].filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
  }

  // // --- Reset / cancel ---
  onCancel() {
    this.selectedOutlets = [];
    this.dealerForm.reset();
    this.nameFilter.reset();
    this.divisionFilter.reset();
    this.countryFilter.reset();
    this.townFilter.reset();
    this.productFilter.reset();
    Object.keys(this.options).forEach(key => {
      this.filteredOptions[key] = [...this.options[key]];
    });
    this.allOutletReports = [];
  }

  isAllOutletsSelected(): boolean {
    const selected: string[] = this.dealerForm.get('name')?.value || [];
    const all: string[] = this.filteredOptions.name || [];
    return all.length > 0 && all.every(o => selected.includes(o));
  }

  toggleSelectAllOutlets() {
    const all: string[] = this.filteredOptions.name || [];
    if (this.isAllOutletsSelected()) {
      this.dealerForm.patchValue({ name: [] });
      this.selectedOutlets = [];
    } else {
      this.dealerForm.patchValue({ name: [...all] });
      this.selectedOutlets = [...all];
    }
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
      const itemDate = item.salesDate
        ? new Date(item.salesDate)
        : (item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000) : new Date(item.createdAt));

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

  onSubmit() {

    // If the user clicks too early, stop here and inform them (optional).
    if (!this.countryOptionsLoaded) {
      // You can add a Swal.fire or similar notification here
      this.loadingService.setLoading(false); // Ensure loader stops if running
      return;
    }

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

      // Determine the list of countries to include in the filter
      const countriesToInclude: string[] = [];
      if (filters.country) {
        // Case 1: A specific country is selected
        countriesToInclude.push(filters.country);
      } else {
        // Case 2: No country selected, so include all countries returned by the service.
        // This is safe because countryOptionsLoaded is true.
        countriesToInclude.push(...this.options.country);
      }


      // Always fetch data (no disable)
      const filterFn = (item: any, outlet: string | null = null) => {
        const itemDate = item.salesDate
          ? new Date(item.salesDate)
          : (item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000) : new Date(item.createdAt));

        return (
          // Check if the item's country is in the calculated list
          (countriesToInclude.length === 0 || countriesToInclude.includes(item.country)) &&
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




  // onCancel() {
  //   // Clear the selectedOutlets array
  //   this.selectedOutlets = [];
  //
  //   // Reset the form
  //   this.dealerForm.reset();
  //
  //   // Reset the form controls that are tied to the filters
  //   this.nameFilter.reset();
  //   this.divisionFilter.reset();
  //   this.countryFilter.reset();
  //   this.townFilter.reset();
  //   this.productFilter.reset();
  //
  //   // Restore the filtered options to their original state
  //   Object.keys(this.options).forEach(key => {
  //     this.filteredOptions[key] = [...this.options[key]];
  //   });
  //
  //   // Clear the displayed reports
  //   this.allOutletReports = [];
  // }

  exportToExcel() {
    if (!this.allOutletReports || this.allOutletReports.length === 0) {
      Swal.fire('Info', 'No data available to export', 'info');
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");
    let currentRow = 1;


    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);

      // ✅ Log activity after successful export
      const activity: ActivityLog = {
        action: 'Export',
        section: 'Daily Sale Reports',
        description: 'User exported sales report to Excel',
        date: Date.now(),
        user: '',        // will be set inside addLog
        currentIp: '',   // will be set inside addLog
      };

      this.mService.addLog(activity).then(() => {
        console.log('Export action logged.');
      }).catch(err => console.error('Failed to log export:', err));
    });
  }




}
