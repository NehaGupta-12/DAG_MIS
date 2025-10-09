import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from "@angular/material/autocomplete";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import { MatInput, MatInputModule, MatLabel, MatSuffix } from "@angular/material/input";
import { MatButtonModule, MatMiniFabButton } from "@angular/material/button";
import { CommonModule, NgForOf, NgIf } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from "@angular/forms";
import { AddDealerService } from "../../add-dealer.service";
import { ActivatedRoute } from "@angular/router";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { ProductMasterService } from "../../product-master.service";
import { DailySalesService } from "../../daily-sales.service";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { Workbook } from "exceljs";
import * as FileSaver from "file-saver";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltip } from "@angular/material/tooltip";
import { InventoryService } from "../../add-inventory/inventory.service";
import { AuthService } from "../../../authentication/auth.service";
import { GrnService } from "../../grn.service";
import {LoadingService} from "../../../Services/loading.service";
import {CountryService} from "../../../Services/country.service";
import {ActivityLogService} from "../../activity-log/activity-log.service";
import {ActivityLog} from "../../activity-log/activity-log.component";


@Component({
  selector: 'app-stock-report',
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
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
  templateUrl: './stock-report.component.html',
  standalone: true,
  styleUrl: './stock-report.component.scss'
})
export class StockReportComponent implements OnInit{
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
    maxDate: Date=new Date();
    @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
    @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
    @ViewChild('townSearchInput') townSearchInput!: ElementRef;
    @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;
    // @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;
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
      private productService:ProductMasterService,
      // private dailySlaes: DailySalesService, // Already commented
      private grnService: GrnService,
      public authService : AuthService,
      private loadingService: LoadingService,
      private countryService : CountryService,
      private mService: ActivityLogService,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.dealerForm = this.fb.group({
        name: this.fb.control(''),
        country: [''], // Initialized to empty string
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
        .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.division = data; this.filteredOptions.division = [...data]; });
      this.mDatabase.object<{ subcategories: string[] }>('typelist/outletType').valueChanges()
        .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.outletType = data; this.filteredOptions.outletType = [...data]; });
      this.mDatabase.object<{ subcategories: string[] }>('typelist/outletCategory').valueChanges()
        .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.category = data; this.filteredOptions.category = [...data]; });

      // 🌟 UPDATED COUNTRY LOADING: Set flag on complete
      this.countryService.getCountries().subscribe((data: string[]) => {
        this.options.country = data;
        this.filteredOptions.country = [...data];
        this.countryOptionsLoaded = true; // ✅ Set flag here
      });

      this.mDatabase.object<{ subcategories: string[] }>('typelist/Town').valueChanges()
        .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.town = data; this.filteredOptions.town = [...data]; });
    }

    // ngOnInit() {
    //   this.route.queryParams.subscribe(params => {
    //     if (params['data']) {
    //       const rowData = JSON.parse(params['data']);
    //       this.dealerForm.patchValue(rowData);
    //       if (rowData.id) {
    //         this.isEditMode = true;
    //         this.data = rowData;
    //       }
    //     }
    //   });
    //
    //   this.loadGrnList();
    //   this.DealerList();
    //   this.productList();
    //
    //   // --- Cascading dropdowns (ignore NA, search ready) ---
    //   this.dealerForm.get('country')?.valueChanges.subscribe(selectedCountry => {
    //     this.filteredDivisionsByCountry = Array.from(new Set(
    //       this.dataSource
    //         .filter(d => (!selectedCountry || d.country === selectedCountry) && d.division && d.division !== 'NA')
    //         .map(d => d.division)
    //     ));
    //     this.filteredOptions.division = [...this.filteredDivisionsByCountry];
    //
    //     this.dealerForm.patchValue({ division: '', town: '', name: [] });
    //     this.filteredOptions.town = [];
    //     this.filteredOptions.name = [];
    //   });
    //
    //   this.dealerForm.get('division')?.valueChanges.subscribe(selectedDivision => {
    //     this.filteredTownsByDivision = Array.from(new Set(
    //       this.dataSource
    //         .filter(d => (!selectedDivision || d.division === selectedDivision) && d.town && d.town !== 'NA')
    //         .map(d => d.town)
    //     ));
    //     this.filteredOptions.town = [...this.filteredTownsByDivision];
    //
    //     this.dealerForm.patchValue({ town: '', name: [] });
    //     this.filteredOptions.name = [];
    //   });
    //
    //   this.dealerForm.get('town')?.valueChanges.subscribe(selectedTown => {
    //     this.filteredOutletsByTown = Array.from(new Set(
    //       this.dataSource
    //         .filter(d => (!selectedTown || d.town === selectedTown) && d.name && d.name !== 'NA')
    //         .map(d => d.name)
    //     ));
    //     this.filteredOptions.name = [...this.filteredOutletsByTown];
    //
    //     this.dealerForm.patchValue({ name: [] });
    //   });
    //
    //   // --- Search filters ---
    //   this.nameFilter.valueChanges.subscribe(val => this.filterOutlet(val || ''));
    //   this.divisionFilter.valueChanges.subscribe(val => this.filterDivision(val || ''));
    //   this.countryFilter.valueChanges.subscribe(val => this.filterCountry(val || ''));
    //   this.townFilter.valueChanges.subscribe(val => this.filterTown(val || ''));
    //   this.productFilter.valueChanges.subscribe(val => this.filterOptions('product', val || ''));
    // }

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

    this.loadGrnList();
    this.DealerList();
    this.productList();

    // 🔹 COUNTRY → mandatory, controls everything
    this.dealerForm.get('country')?.valueChanges.subscribe(selectedCountry => {
      if (!selectedCountry) {
        // Clear all fields if no country selected
        this.dealerForm.patchValue({
          division: '',
          town: '',
          name: '',
          sale: '',
          product: '',
          period: { start: '', end: '' }
        });

        this.filteredOptions.division = [];
        this.filteredOptions.town = [];
        this.filteredOptions.name = [];
        return;
      }

      // ✅ Once country selected → independently load all dropdowns
      const filteredByCountry = this.dataSource.filter(
        d => d.country === selectedCountry
      );

      // Get unique division, town, and outlet lists for that country
      this.filteredOptions.division = Array.from(new Set(
        filteredByCountry
          .filter(d => d.division && d.division !== 'NA')
          .map(d => d.division)
      ));

      this.filteredOptions.town = Array.from(new Set(
        filteredByCountry
          .filter(d => d.town && d.town !== 'NA')
          .map(d => d.town)
      ));

      this.filteredOptions.name = Array.from(new Set(
        filteredByCountry
          .filter(d => d.name && d.name !== 'NA')
          .map(d => d.name)
      ));
    });

    // 🔹 Division change → no longer cascades, just updates internal form
    this.dealerForm.get('division')?.valueChanges.subscribe(() => {
      // no dependent filtering now — keep other dropdowns independent
    });

    // 🔹 Town change → independent now
    this.dealerForm.get('town')?.valueChanges.subscribe(() => {
      // independent now, no changes to other fields
    });

    // 🔹 Outlet name change → independent as well
    this.dealerForm.get('name')?.valueChanges.subscribe(() => {
      // independent now
    });

    // 🔹 Search filters (unchanged)
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

    // filterOptions(field: string, value: string) {
    //   const searchTerm = (value || '').toLowerCase();
    //   this.filteredOptions[field] = this.options[field].filter((item: string) =>
    //     item.toLowerCase().includes(searchTerm)
    //   );
    // }

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

    loadGrnList() {
      runInInjectionContext(this.injector, () => {
        this.grnService.getGrnList().subscribe((data) => {
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




    getDateRanges(selectedStart?: Date, selectedEnd?: Date) {
      const startDate = selectedStart ? new Date(selectedStart) : new Date();
      const endDate = selectedEnd ? new Date(selectedEnd) : new Date();

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return { startDate, endDate };
    }

    private normalizeDate(item: any): Date {
      let itemDate: Date;

      if (item.salesDate) {
        itemDate = new Date(item.salesDate);
      } else if (item.stockDate) {
        itemDate = new Date(item.stockDate); // ✅ Fix for GRN
      } else if (item.createdAt?.seconds) {
        itemDate = new Date(item.createdAt.seconds * 1000);
      } else {
        itemDate = new Date(item.createdAt);
      }

      itemDate.setHours(0, 0, 0, 0); // normalize to midnight
      return itemDate;
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


    // generateReport(filteredData: any[], start?: Date, end?: Date) {
    //   const { startDate, endDate } = this.getDateRanges(start, end);
    //   const report: any = {};
    //
    //   filteredData.forEach(item => {
    //     const product = item.name;
    //     const qty = Number(item.quantity) || 0;
    //     const itemDate = this.normalizeDate(item);
    //
    //     if (!report[product]) report[product] = { YTD: 0, Month: 0, Day: 0 };
    //
    //     if (itemDate >= startDate && itemDate <= endDate) {
    //       report[product].Day += qty;
    //       report[product].Month += qty;
    //       report[product].YTD += qty;
    //     }
    //   });
    //
    //   return report;
    // }


    // onSubmit() {
    //   // 🛑 STEP 1: PREVENT RACE CONDITION (Ensures this.options.country is stable)
    //   if (!this.countryOptionsLoaded) {
    //     // If data isn't ready, ensure the loader stops and exit the function.
    //     this.loadingService.setLoading(false);
    //     console.warn('Country data is still loading. Please wait and try again.');
    //     return;
    //   }
    //
    //   this.loadingService.setLoading(true);
    //
    //   try {
    //     const filters = this.dealerForm.value;
    //
    //     const startDate = filters.period?.start ? new Date(filters.period.start) : undefined;
    //     const endDate = filters.period?.end ? new Date(filters.period.end) : undefined;
    //
    //     if (startDate) startDate.setHours(0, 0, 0, 0);
    //     if (endDate) endDate.setHours(23, 59, 59, 999);
    //
    //     const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);
    //     this.allOutletReports = [];
    //
    //     // 🌟 STEP 2: Determine the list of countries to include
    //     const countriesToInclude: string[] = [];
    //     if (filters.country) {
    //       // Case A: Specific country selected
    //       countriesToInclude.push(filters.country);
    //     } else {
    //       // Case B: No country selected -> use all available countries from the service
    //       // This is safe because of the check at the start of onSubmit().
    //       countriesToInclude.push(...this.options.country);
    //     }
    //     // If countriesToInclude is empty here, it means the service returned no countries.
    //
    //
    //     const filterFn = (item: any, outlet: string | null = null) => {
    //       const itemDate = this.normalizeDate(item);
    //
    //       return (
    //         // 🌟 STEP 3: Apply the dynamic country filter
    //         // Filters only by the countries in countriesToInclude array.
    //         (countriesToInclude.length === 0 || countriesToInclude.includes(item.country)) &&
    //         (!filters.town || item.town === filters.town) &&
    //         (!filters.division || item.division === filters.division) &&
    //         (!outlet || item.dealerOutlet === outlet) &&
    //         (!startDate || itemDate >= startDate) &&
    //         (!endDate || itemDate <= endDate)
    //       );
    //     };
    //
    //     if (outlets.length === 0) {
    //       const filtered = this.salesdataSource.filter(item => filterFn(item));
    //       const report = this.generateReport(filtered, startDate, endDate);
    //
    //       const tempRows = this.buildRows(report);
    //       const grouped = this.groupAndColorRows(tempRows);
    //
    //       this.allOutletReports.push({ outlet: 'All Outlets', rows: grouped });
    //
    //     } else {
    //       outlets.forEach((outlet: string) => {
    //         const filtered = this.salesdataSource.filter(item => filterFn(item, outlet));
    //         const report = this.generateReport(filtered, startDate, endDate);
    //
    //         const tempRows = this.buildRows(report);
    //         const grouped = this.groupAndColorRows(tempRows);
    //
    //         this.allOutletReports.push({ outlet, rows: grouped });
    //       });
    //
    //       this.selectedCountry = filters.country || '';
    //     }
    //   } finally {
    //     this.loadingService.setLoading(false);
    //   }
    // }


  generateReport(filteredData: any[], start?: Date, end?: Date, productsToShow?: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ ALWAYS use current date for Month and YTD calculations
    const { startDate: monthStart, endDate: fyStart } = this.getDateRanges();

    // Calculate month start and FY start based on today
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentFYStart = today.getMonth() >= 3
      ? new Date(today.getFullYear(), 3, 1)   // If Apr-Dec
      : new Date(today.getFullYear() - 1, 3, 1); // If Jan-Mar
    currentFYStart.setHours(0, 0, 0, 0);

    const report: any = {};

    // ✅ Initialize report with all products (even if no stock entries)
    if (productsToShow && productsToShow.length > 0) {
      productsToShow.forEach((p: any) => {
        const productName = p.name;
        if (productName) {
          report[productName] = { YTD: 0, Month: 0, Day: 0 };
        }
      });
    }

    // ✅ Determine the "Day" range based on selection
    let dayRangeStart: Date;
    let dayRangeEnd: Date;

    if (!start) {
      // No date selected → use today's date for "Day"
      dayRangeStart = new Date(today);
      dayRangeEnd = new Date(today);
    } else if (start.toDateString() === end?.toDateString()) {
      // Single day selected → use that day for "Day"
      dayRangeStart = new Date(start);
      dayRangeEnd = new Date(start);
    } else {
      // Date range selected → sum all days in the range for "Day"
      dayRangeStart = new Date(start);
      dayRangeEnd = end ? new Date(end) : new Date(today);
    }

    dayRangeStart.setHours(0, 0, 0, 0);
    dayRangeEnd.setHours(23, 59, 59, 999);

    // ✅ Process ALL stock data (not filtered by date range) for Month and YTD
    this.salesdataSource.forEach(item => {
      // First check if this item matches the other filters (country, division, town, outlet)
      const filters = this.dealerForm.value;
      const countriesToInclude: string[] = [];
      if (filters.country) {
        countriesToInclude.push(filters.country);
      } else {
        countriesToInclude.push(...this.options.country);
      }

      // Apply non-date filters
      const matchesFilters = (
        (countriesToInclude.length === 0 || countriesToInclude.includes(item.country)) &&
        (!filters.town || item.town === filters.town) &&
        (!filters.division || item.division === filters.division)
      );

      if (!matchesFilters) return;

      const product = item.name;
      const qty = Number(item.quantity) || 0;
      const itemDate = this.normalizeDate(item);

      // ✅ Initialize if not present
      if (!report[product]) {
        report[product] = { YTD: 0, Month: 0, Day: 0 };
      }

      // ✅ YTD - ALWAYS from current financial year start to TODAY
      if (itemDate >= currentFYStart && itemDate <= today) {
        report[product].YTD += qty;
      }

      // ✅ Month - ALWAYS from current month start to TODAY
      if (itemDate >= currentMonthStart && itemDate <= today) {
        report[product].Month += qty;
      }

      // ✅ Day - based on the selected date range (or today if no selection)
      if (itemDate >= dayRangeStart && itemDate <= dayRangeEnd) {
        report[product].Day += qty;
      }
    });

    return report;
  }


  onSubmit() {
    if (!this.countryOptionsLoaded) {
      this.loadingService.setLoading(false);
      console.warn('Country data is still loading. Please wait and try again.');
      return;
    }

    this.loadingService.setLoading(true);

    try {
      const filters = this.dealerForm.value;

      const startDate = filters.period?.start ? new Date(filters.period.start) : undefined;
      const endDate = filters.period?.end ? new Date(filters.period.end) : undefined;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);
      this.allOutletReports = [];

      // Determine the list of countries to include
      const countriesToInclude: string[] = [];
      if (filters.country) {
        countriesToInclude.push(filters.country);
      } else {
        countriesToInclude.push(...this.options.country);
      }

      // ✅ Get filtered products based on selected country OR user's assigned countries
      const productsToShow = filters.country
        ? this.getProductsByCountry(filters.country)
        : this.getProductsByCountries(this.options.country);

      console.log('Countries to include:', countriesToInclude);
      console.log('User assigned countries:', this.options.country);
      console.log('Products to show:', productsToShow.length);
      console.log('Product names:', productsToShow.map(p => p.name));

      const filterFn = (item: any, outlet: string | null = null) => {
        const itemDate = this.normalizeDate(item);

        return (
          (countriesToInclude.length === 0 || countriesToInclude.includes(item.country)) &&
          (!filters.town || item.town === filters.town) &&
          (!filters.division || item.division === filters.division) &&
          (!outlet || item.dealerOutlet === outlet) &&
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate)
        );
      };

      if (outlets.length === 0) {
        const filtered = this.salesdataSource.filter(item => filterFn(item));
        const report = this.generateReport(filtered, startDate, endDate, productsToShow);

        // ✅ Pass filtered products to buildRows
        const tempRows = this.buildRows(report, productsToShow);
        const grouped = this.groupAndColorRows(tempRows);

        this.allOutletReports.push({ outlet: 'All Outlets', rows: grouped });

      } else {
        outlets.forEach((outlet: string) => {
          const filtered = this.salesdataSource.filter(item => filterFn(item, outlet));
          const report = this.generateReport(filtered, startDate, endDate);

          // ✅ Pass filtered products to buildRows
          const tempRows = this.buildRows(report, productsToShow);
          const grouped = this.groupAndColorRows(tempRows);

          this.allOutletReports.push({ outlet, rows: grouped });
        });

        this.selectedCountry = filters.country || '';
      }
    } finally {
      this.loadingService.setLoading(false);
    }
  }


    // Filter options logic
    filterOptions(field: string, value: string) {
      const searchTerm = value?.toLowerCase() || '';
      const matched = this.options[field].filter((item: string) =>
        item.toLowerCase().includes(searchTerm)
      );
      this.filteredOptions[field] = [...matched];
    }

  // ✅ Helper to build rows
  //   private buildRows(report: any) {
  //     return this.vehicledataSource.map((prod: any) => {
  //       const key = prod.name;
  //       const displayName = (prod.model || prod.name).toUpperCase();
  //       const daySales = report[key]?.Day || 0;
  //       const monthSales = report[key]?.Month || 0;
  //       const ytdSales = report[key]?.YTD || 0;
  //
  //       let rowColor = '';
  //       if (daySales > 10 || monthSales > 10 || ytdSales > 10) {
  //         rowColor = 'green-row';
  //       } else if (daySales >= 1 || monthSales >= 1 || ytdSales >= 1) {
  //         rowColor = 'yellow-row';
  //       } else {
  //         rowColor = 'red-row';
  //       }
  //
  //       return { product: displayName, Day: daySales, Month: monthSales, YTD: ytdSales, rowColor };
  //     });
  //   }

  private buildRows(report: any, productsToShow: any[]) {
    // ✅ Use productsToShow instead of this.vehicledataSource
    return productsToShow.map((prod: any) => {
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
    //   // clear outlets
    //   this.selectedOutlets = [];
    //
    //   // reset form with proper defaults (empty strings / arrays, not null)
    //   this.dealerForm.reset({
    //     name: [],
    //     country: '',
    //     division: '',
    //     town: '',
    //     product: '',
    //     period: {
    //       start: '',
    //       end: ''
    //     }
    //   });
    //
    //   // reset filters
    //   this.nameFilter.setValue('', { emitEvent: false });
    //   this.divisionFilter.setValue('', { emitEvent: false });
    //   this.countryFilter.setValue('', { emitEvent: false });
    //   this.townFilter.setValue('', { emitEvent: false });
    //   this.productFilter.setValue('', { emitEvent: false });
    //
    //   // restore filteredOptions
    //   Object.keys(this.options).forEach(key => {
    //     this.filteredOptions[key] = [...this.options[key]];
    //   });
    //
    //   // clear reports + headers
    //   this.allOutletReports = [];
    //   this.reportTitle = '';
    //   this.reportDate = '';
    //   this.selectedCountry = '';
    // }


    // exportToExcel() {
    //   if (!this.allOutletReports || this.allOutletReports.length === 0) {
    //     Swal.fire('Info', 'No data available to export', 'info');
    //     return;
    //   }
    //
    //   const workbook = new Workbook();
    //   const worksheet = workbook.addWorksheet("Stock Report");
    //   let currentRow = 1;
    //
    //   // 🔹 Build date text
    //   let reportDateText = '';
    //   if (this.dealerForm.value.period?.start && this.dealerForm.value.period?.end) {
    //     const start = new Date(this.dealerForm.value.period.start).toLocaleDateString();
    //     const end = new Date(this.dealerForm.value.period.end).toLocaleDateString();
    //     reportDateText = `${start} - ${end}`;
    //   } else if (this.dealerForm.value.period?.start) {
    //     reportDateText = new Date(this.dealerForm.value.period.start).toLocaleDateString();
    //   } else {
    //     reportDateText = new Date().toLocaleDateString();
    //   }
    //
    //   this.allOutletReports.forEach((report, index) => {
    //     const colCount = report.rows.length + 1;
    //
    //     // 🔹 Title row
    //     const titleRow = worksheet.addRow([`Cumulative for the month - ${report.outlet}`]);
    //     worksheet.mergeCells(currentRow, 1, currentRow, colCount);
    //     titleRow.font = { bold: true, size: 14 };
    //     titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    //     titleRow.height = 20;
    //     titleRow.eachCell(cell => {
    //       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    //     });
    //     currentRow++;
    //
    //     // 🔹 Date row
    //     const country = this.dealerForm.value.country || '';
    //     const dateText = `Date: ${reportDateText}${country ? ' | Country: ' + country : ''}`;
    //     const dateRow = worksheet.addRow([dateText]);
    //     worksheet.mergeCells(currentRow, 1, currentRow, colCount);
    //     dateRow.alignment = { vertical: 'middle', horizontal: 'center' };
    //     dateRow.height = 20;
    //     dateRow.eachCell(cell => {
    //       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    //     });
    //     currentRow++;
    //
    //     // 🔹 Header row
    //     const headers = ['Products Name', ...report.rows.map(p => p.product.toUpperCase())];
    //     const headerRow = worksheet.addRow(headers);
    //     headerRow.font = { bold: true };
    //     headerRow.height = 40;
    //     headerRow.eachCell(c => {
    //       c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    //       c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F4B083' } };
    //     });
    //     currentRow++;
    //
    //     // 🔹 Data rows
    //     worksheet.addRow(['Stock for the day', ...report.rows.map(p => p.Day)]); currentRow++;
    //     worksheet.addRow(['Cumulative for the month', ...report.rows.map(p => p.Month)]); currentRow++;
    //     worksheet.addRow(['YTD', ...report.rows.map(p => p.YTD)]); currentRow++;
    //
    //     // 🔹 Spacer row
    //     if (index < this.allOutletReports.length - 1) {
    //       worksheet.addRow([]);
    //       currentRow++;
    //     }
    //   });
    //
    //   // 🔹 Borders + alignment
    //   worksheet.eachRow((row, rowNumber) => {
    //     row.eachCell(cell => {
    //       cell.border = {
    //         top: { style: 'thin' },
    //         left: { style: 'thin' },
    //         bottom: { style: 'thin' },
    //         right: { style: 'thin' },
    //       };
    //       if (rowNumber > 1) {
    //         cell.alignment = { vertical: 'middle', horizontal: 'center' };
    //       }
    //     });
    //   });
    //
    //   // 🔹 Column widths
    //   worksheet.columns.forEach((col, index) => {
    //     col.width = index === 0 ? 25 : 12;
    //   });
    //
    //   // 🔹 Save Excel file
    //   workbook.xlsx.writeBuffer().then(data => {
    //     const blob = new Blob([data], { type: 'application/octet-stream' });
    //     FileSaver.saveAs(blob, `Stock_Report_${reportDateText}.xlsx`);
    //
    //     // 🔹 Log activity after successful export
    //     const activity: ActivityLog = {
    //       action: 'Export',
    //       section: 'Stock Reports',
    //       description: 'User exported stock report to Excel',
    //       date: Date.now(),
    //       user: '',       // fill with current user
    //       currentIp: '',  // fill with IP if needed
    //     };
    //
    //     this.mService.addLog(activity).then(() => {
    //       console.log('Export action logged.');
    //     }).catch(err => console.error('Failed to log export:', err));
    //   });
    // }



  exportToExcel() {
    if (!this.allOutletReports || this.allOutletReports.length === 0) {
      Swal.fire('Info', 'No data available to export', 'info');
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Stock Report");
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
      reportDateText = new Date().toLocaleDateString();
    }

    this.allOutletReports.forEach((report, index) => {
      const colCount = report.rows.length + 1;

      // 🔹 Title row
      const titleRow = worksheet.addRow([`Cumulative for the month - ${report.outlet}`]);
      worksheet.mergeCells(currentRow, 1, currentRow, colCount);
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
      titleRow.height = 20;
      titleRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
      });
      currentRow++;

      // 🔹 Date row
      const country = this.dealerForm.value.country || '';
      const dateText = `Date: ${reportDateText}${country ? ' | Country: ' + country : ''}`;
      const dateRow = worksheet.addRow([dateText]);
      worksheet.mergeCells(currentRow, 1, currentRow, colCount);
      dateRow.alignment = { vertical: 'middle', horizontal: 'center' };
      dateRow.height = 20;
      dateRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
      });
      currentRow++;

      // 🔹 Header row
      const headers = ['Products Name', ...report.rows.map(p => p.product.toUpperCase())];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.height = 40;
      headerRow.eachCell(c => {
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F4B083' } };
      });
      currentRow++;

      // 🔹 Data rows
      worksheet.addRow(['Stock for the day', ...report.rows.map(p => p.Day)]); currentRow++;
      worksheet.addRow(['Cumulative for the month', ...report.rows.map(p => p.Month)]); currentRow++;
      worksheet.addRow(['YTD', ...report.rows.map(p => p.YTD)]); currentRow++;

      // 🔹 Spacer row
      if (index < this.allOutletReports.length - 1) {
        worksheet.addRow([]);
        currentRow++;
      }
    });

    // 🔹 Borders + alignment
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
      FileSaver.saveAs(blob, `Stock_Report_${reportDateText}.xlsx`);

      // ✅ Get username from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
      // 🔹 Log activity after successful export
      const activity: ActivityLog = {
        action: 'Export',
        section: 'Stock Report',
        description: `${username} downloaded the stock report and mail is`,
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
