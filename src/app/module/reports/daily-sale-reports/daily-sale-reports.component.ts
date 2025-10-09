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
  maxDate: Date = new Date(); // today


  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;
  @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;

  debounceTimer: any;
  countryOptionsLoaded: boolean = false;
  selectedSaleTypeLabel: string = ''; // Add at the class level


  // Filters
  nameFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');
  productFilter = new FormControl('');

  filteredDivisionsByCountry: string[] = [];
  filteredTownsByDivision: string[] = [];
  filteredOutletsByTown: string[] = [];
  filteredSalesByDivision: string[] = [];
  salesList: any[] = [];   // raw data from Firestore
  filteredSalesList: any[] = [];

  search: any = {
    name: '',
    division: '',
    country: '',
    town: '',
    sale: '',
    product: '',
  };

  options: any = {
    name: [],
    division: [],
    country: [],
    town: [],
    sale: [],
    product: [],
  };

  filteredOptions: any = {
    name: [],
    division: [],
    country: [],
    town: [],
    sale: [],
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
      sale: [''],
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

    this.mDatabase.object<{ subcategories: string[] }>('typelist/SalesType').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.sale = data; this.filteredOptions.sale = [...data]; });
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

    // === ✅ Make COUNTRY mandatory and control visibility ===
    this.dealerForm.get('country')?.valueChanges.subscribe(selectedCountry => {
      if (!selectedCountry) {
        // If no country selected, clear and disable others
        this.dealerForm.patchValue({ division: '', town: '', name: [] });
        this.filteredOptions.division = [];
        this.filteredOptions.town = [];
        this.filteredOptions.name = [];
        return;
      }

      // When country is selected, enable others and make them independent
      this.filteredDivisionsByCountry = Array.from(new Set(
        this.dataSource
          .filter(d => d.country === selectedCountry && d.division && d.division !== 'NA')
          .map(d => d.division)
      ));
      this.filteredOptions.division = [...this.filteredDivisionsByCountry];

      // For towns (independent of division now)
      this.filteredTownsByDivision = Array.from(new Set(
        this.dataSource
          .filter(d => d.country === selectedCountry && d.town && d.town !== 'NA')
          .map(d => d.town)
      ));
      this.filteredOptions.town = [...this.filteredTownsByDivision];

      // For outlets (independent of both division & town)
      const allOutlets = Array.from(new Set(
        this.dataSource
          .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...allOutlets];
    });

    // === ✅ Division Independent Filtering ===
    this.dealerForm.get('division')?.valueChanges.subscribe(selectedDivision => {
      const selectedCountry = this.dealerForm.get('country')?.value;
      if (!selectedCountry) return; // country mandatory

      if (!selectedDivision) {
        // Reset outlet list to all of the selected country
        const allOutlets = Array.from(new Set(
          this.dataSource
            .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
            .map(d => d.name)
        ));
        this.filteredOptions.name = [...allOutlets];
        return;
      }

      // Filter only those outlets which match selected division (still within country)
      const outlets = Array.from(new Set(
        this.dataSource
          .filter(d =>
            d.country === selectedCountry &&
            d.division === selectedDivision &&
            d.name &&
            d.name !== 'NA'
          )
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...outlets];
    });

    // === ✅ Town Independent Filtering ===
    this.dealerForm.get('town')?.valueChanges.subscribe(selectedTown => {
      const selectedCountry = this.dealerForm.get('country')?.value;
      if (!selectedCountry) return; // country mandatory

      if (!selectedTown) {
        // Reset outlets for whole country if town cleared
        const allOutlets = Array.from(new Set(
          this.dataSource
            .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
            .map(d => d.name)
        ));
        this.filteredOptions.name = [...allOutlets];
        return;
      }

      // Filter outlets by town only (still within country)
      const outlets = Array.from(new Set(
        this.dataSource
          .filter(d =>
            d.country === selectedCountry &&
            d.town === selectedTown &&
            d.name &&
            d.name !== 'NA'
          )
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...outlets];
    });

    // === Search filters (unchanged) ===
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

  filterSales(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.sale = this.options.sale
      .filter((s: string) => s.toLowerCase().includes(searchText));
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




  // --- Reset / cancel ---
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



  generateReport(filteredData: any[], startDate: Date | null, endDate: Date, productsToShow: any[]) {
    const { monthStart, fyStart } = this.getDateRanges(endDate);
    const report: any = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Detect if it's a single-day report
    const isSingleDay =
      startDate &&
      endDate &&
      startDate.toDateString() === endDate.toDateString();

    // ✅ Initialize report with all products (even if no sales)
    productsToShow.forEach((p: any) => {
      const model = (p.model || '').trim().toUpperCase();
      if (model) {
        report[model] = { YTD: 0, Month: 0, Day: 0 };
      }
    });

    // ✅ Add sales data
    filteredData.forEach(item => {
      const model = (item.model || '').trim().toUpperCase();
      if (!report[model]) {
        report[model] = { YTD: 0, Month: 0, Day: 0 };
      }

      const qty = Number(item.quantity) || 0;

      const itemDate = item.salesDate
        ? new Date(item.salesDate)
        : (item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000) : new Date(item.createdAt));
      itemDate.setHours(0, 0, 0, 0);

      // Skip if outside selected range
      if ((startDate && itemDate < startDate) || (endDate && itemDate > endDate)) {
        return;
      }

      // YTD
      if (itemDate >= fyStart && itemDate <= endDate) {
        report[model].YTD += qty;
      }

      // Month
      if (itemDate >= monthStart && itemDate <= endDate) {
        report[model].Month += qty;
      }

      // ✅ Day (handle both single-day & multi-day range properly)
      if (isSingleDay) {
        // For same-day range → count only that date
        if (itemDate.getTime() === startDate.getTime()) {
          report[model].Day += qty;
        }
      } else {
        // For other cases → count only today's date if inside range
        if (
          itemDate.getTime() === today.getTime() &&
          today >= (startDate || today) &&
          today <= endDate
        ) {
          report[model].Day += qty;
        }
      }
    });

    return report;
  }



  getProductsByCountry(countryName: string): any[] {
    if (!countryName) {
      return [];
    }

    return this.vehicledataSource.filter(product =>
      product.availableIn &&
      Array.isArray(product.availableIn) &&
      product.availableIn.includes(countryName)
    );
  }

  /**
   * Filter products by multiple countries (user's assigned countries)
   * Returns products that are available in ANY of the specified countries
   */
  getProductsByCountries(countries: string[]): any[] {
    if (!countries || countries.length === 0) {
      return [];
    }

    return this.vehicledataSource.filter(product =>
      product.availableIn &&
      Array.isArray(product.availableIn) &&
      product.availableIn.some(country => countries.includes(country))
    );
  }

// ... inside DailySaleReportsComponent class

// ... (other methods)

  onSubmit() {
    if (!this.countryOptionsLoaded) {
      this.loadingService.setLoading(false);
      return;
    }

    this.loadingService.setLoading(true);

    try {
      const filters = this.dealerForm.value;

      this.selectedSaleTypeLabel = filters.sale ? `(${filters.sale})` : '';

      const startDate = filters.period?.start ? new Date(filters.period.start) : null;
      const endDate = filters.period?.end ? new Date(filters.period.end) : new Date();

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);

      this.allOutletReports = [];

      // Determine which countries to include in the filter
      const countriesToInclude: string[] = [];
      if (filters.country) {
        // Specific country selected
        countriesToInclude.push(filters.country);
      } else {
        // No country selected - use all user's assigned countries
        countriesToInclude.push(...this.options.country);
      }

      // ✅ CRITICAL: Filter products based on user's assigned countries or selected country
      const productsToShow = filters.country
        ? this.getProductsByCountry(filters.country)  // Single country
        : this.getProductsByCountries(this.options.country); // User's assigned countries

      console.log('Countries to include:', countriesToInclude);
      console.log('User assigned countries:', this.options.country);
      console.log('Products to show:', productsToShow.length);
      console.log('Product models:', productsToShow.map(p => p.model));

      // 🎯 MODIFIED: Include check for filters.sale
      const filterFn = (item: any, outlet: string | null = null) => {
        const itemDate = item.salesDate
          ? new Date(item.salesDate)
          : (item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000) : new Date(item.createdAt));

        return (
          (countriesToInclude.length === 0 || countriesToInclude.includes(item.country)) &&
          (!filters.town || item.town === filters.town) &&
          (!filters.division || item.division === filters.division) &&
          (!outlet || item.dealerOutlet === outlet) &&
          // --- New Sales Type Filter ---
          (!filters.sale || item.salesType === filters.sale) &&
          // -----------------------------
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate)
        );
      };

      // Case 1: No outlet selected → show merged report
      if (outlets.length === 0) {
        const filtered = this.salesdataSource.filter(item => filterFn(item));
        console.log('Filtered sales data:', filtered.length);

        const report = this.generateReport(filtered, startDate, endDate, productsToShow);

        const tempRows = this.buildRows(report);
        const grouped = this.groupAndColorRows(tempRows);

        this.allOutletReports.push({
          outlet: 'All Outlets',
          rows: grouped
        });

      } else {
        // Case 2: One or more outlets selected
        outlets.forEach((outlet: string) => {
          const filtered = this.salesdataSource.filter(item => filterFn(item, outlet));
          const report = this.generateReport(filtered, startDate, endDate, productsToShow);

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
      this.loadingService.setLoading(false);
    }
  }

// ... (other methods)

// ✅ Helper to build rows
  private buildRows(report: any) {
    return Object.keys(report).map(key => {
      const displayModel = key.trim().toUpperCase();
      const { Day, Month, YTD } = report[key];

      let rowColor = '';
      if (Day > 10 || Month > 10 || YTD > 10) {
        rowColor = 'green-row';
      } else if (Day >= 1 || Month >= 1 || YTD >= 1) {
        rowColor = 'yellow-row';
      } else {
        rowColor = 'red-row';
      }

      return { product: displayModel, Day, Month, YTD, rowColor };
    });
  }

// ✅ Helper to group and add totals
// ✅ Group rows + add a TOTAL row
  private groupAndColorRows(tempRows: any[]) {
    const grouped: Record<string, any> = {};

    tempRows.forEach(row => {
      const key = row.product;
      if (!grouped[key]) {
        grouped[key] = { product: key, Day: 0, Month: 0, YTD: 0, rowColor: '' };
      }
      grouped[key].Day += row.Day;
      grouped[key].Month += row.Month;
      grouped[key].YTD += row.YTD;
    });

    const rows = Object.values(grouped);

    // Apply row colors consistently
    rows.forEach((row: any) => {
      if (row.Day > 10 || row.Month > 10 || row.YTD > 10) {
        row.rowColor = 'green-row';
      } else if (row.Day >= 1 || row.Month >= 1 || row.YTD >= 1) {
        row.rowColor = 'yellow-row';
      } else {
        row.rowColor = 'red-row';
      }
    });

    // Add TOTAL row ✅
    rows.push({
      product: 'TOTAL',
      Day: rows.reduce((s: number, r: any) => s + r.Day, 0),
      Month: rows.reduce((s: number, r: any) => s + r.Month, 0),
      YTD: rows.reduce((s: number, r: any) => s + r.YTD, 0),
      rowColor: ''
    });

    return rows;
  }

  exportToExcel() {
    if (!this.allOutletReports || this.allOutletReports.length === 0) {
      Swal.fire('Info', 'No data available to export', 'info');
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    let currentRow = 1;

    this.allOutletReports.forEach((outletReport, outletIndex) => {
      if (!outletReport || !outletReport.rows) return;

      // === OUTLET TITLE ROW ===
      // FIXED: Merging A to D to match the 4 data columns (Product, Day, Month, YTD)
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = `Cumulative for the month - ${outletReport.outlet}`;
      worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
      worksheet.getCell(`A${currentRow}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = `Date: ${new Date().toLocaleDateString()} ${this.selectedSaleTypeLabel}`;
      worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
      worksheet.getCell(`A${currentRow}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      worksheet.getRow(currentRow).height = 20;
      currentRow += 2;


      // === HEADER ROW ===
      const headerRow = ["Product", "Day", "Month", "YTD"];
      const headerExcelRow = worksheet.addRow(headerRow);
      headerExcelRow.font = { bold: true };
      headerExcelRow.height = 20;
      headerExcelRow.eachCell(cell => {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F4B083" } };
      });
      currentRow++;

      // === DATA ROWS ===
      outletReport.rows.forEach((row: any) => {
        worksheet.addRow([row.product, row.Day, row.Month, row.YTD]);
        currentRow++;
      });

      currentRow += 2; // add spacing before next outlet
    });

    // === Borders + alignment ===
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowNumber > 1) {
          // This alignment applies to all data/header cells, including the merged title/date cells
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });
    });

    // === Column widths ===
    // Only 4 columns are relevant now (0 to 3)
    worksheet.columns.forEach((col, index) => {
      col.width = index === 0 ? 25 : 12;
    });

    // === Save Excel file ===
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);

      // ✅ Get username from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
      // 🔹 Log activity after successful export
      const activity: ActivityLog = {
        action: 'Export',
        section: 'Sales Report',
        description: `${username} downloaded the sales report and mail is`,
        date: Date.now(),
        user: username,  // optional field if your model supports
        currentIp: '',   // fill with IP if needed
      };

      this.mService.addLog(activity)
        .then(() => console.log('Export action logged.'))
        .catch(err => console.error('Failed to log export:', err));
    });
  }

}
