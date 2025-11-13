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
import { BudgetService } from 'app/module/budget.service';
import {MonthlyBudgetService} from "../../monthly-budget.service";
import {combineLatest} from "rxjs";

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
  maxDate: Date = new Date();

  // ✅ NEW: Dynamic column header
  dayColumnHeader: string = 'Sales for the Day';
  displayedColumns: string[] = ['product','yearlyBudget','monthlyTarget', 'Day', 'Month', 'YTD'];

  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;
  @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;

  debounceTimer: any;
  countryOptionsLoaded: boolean = false;
  selectedSaleTypeLabel: string = '';

  nameFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');
  productFilter = new FormControl('');

  filteredDivisionsByCountry: string[] = [];
  filteredTownsByDivision: string[] = [];
  filteredOutletsByTown: string[] = [];
  filteredSalesByDivision: string[] = [];
  salesList: any[] = [];
  filteredSalesList: any[] = [];
  country: string = '';
  date: string = '';
  formattedDate: string = '';



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
    public authService: AuthService,
    private loadingService: LoadingService,
    private countryService: CountryService,
    private budgetService: BudgetService,
    private monthlyBudgetService: MonthlyBudgetService,
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
    // ✅ RESTORE STATE FIRST
    this.restoreState();
    this.loadReports();



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

    this.route.queryParams.subscribe(params => {
      this.country = params['country'] || '';
      this.date = params['date'] || '';

      if (this.date) {
        const dateObj = new Date(this.date);
        this.formattedDate = dateObj.toLocaleDateString('default', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        if (this.country && this.date) {
          this.waitForCountryOptionsAndPatch();
        }
      }
    });

    // Country dependency
    this.dealerForm.get('country')?.valueChanges.subscribe(selectedCountry => {
      if (!selectedCountry) {
        this.dealerForm.patchValue({ division: '', town: '', name: [] });
        this.filteredOptions.division = [];
        this.filteredOptions.town = [];
        this.filteredOptions.name = [];
        return;
      }

      this.filteredDivisionsByCountry = Array.from(new Set(
        this.dataSource
          .filter(d => d.country === selectedCountry && d.division && d.division !== 'NA')
          .map(d => d.division)
      ));
      this.filteredOptions.division = [...this.filteredDivisionsByCountry];

      this.filteredTownsByDivision = Array.from(new Set(
        this.dataSource
          .filter(d => d.country === selectedCountry && d.town && d.town !== 'NA')
          .map(d => d.town)
      ));
      this.filteredOptions.town = [...this.filteredTownsByDivision];

      const allOutlets = Array.from(new Set(
        this.dataSource
          .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...allOutlets];
    });

    this.dealerForm.get('division')?.valueChanges.subscribe(selectedDivision => {
      const selectedCountry = this.dealerForm.get('country')?.value;
      if (!selectedCountry) return;

      if (!selectedDivision) {
        const allOutlets = Array.from(new Set(
          this.dataSource
            .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
            .map(d => d.name)
        ));
        this.filteredOptions.name = [...allOutlets];
        return;
      }

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

    this.dealerForm.get('town')?.valueChanges.subscribe(selectedTown => {
      const selectedCountry = this.dealerForm.get('country')?.value;
      if (!selectedCountry) return;

      if (!selectedTown) {
        const allOutlets = Array.from(new Set(
          this.dataSource
            .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
            .map(d => d.name)
        ));
        this.filteredOptions.name = [...allOutlets];
        return;
      }

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

    this.nameFilter.valueChanges.subscribe(val => this.filterOutlet(val || ''));
    this.divisionFilter.valueChanges.subscribe(val => this.filterDivision(val || ''));
    this.countryFilter.valueChanges.subscribe(val => this.filterCountry(val || ''));
    this.townFilter.valueChanges.subscribe(val => this.filterTown(val || ''));
    this.productFilter.valueChanges.subscribe(val => this.filterOptions('product', val || ''));
  }









  // ✅ NEW: Save state before navigating away
  ngOnDestroy() {
    this.saveState();
  }

  // ✅ NEW: Save current state to localStorage
  private saveState() {
    const state = {
      formValues: this.dealerForm.value,
      allOutletReports: this.allOutletReports,
      dayColumnHeader: this.dayColumnHeader,
      selectedCountry: this.selectedCountry,
      selectedSaleTypeLabel: this.selectedSaleTypeLabel,
      reportTitle: this.reportTitle,
      reportDate: this.reportDate
    };
    localStorage.setItem('dailySalesState', JSON.stringify(state));
  }

  // ✅ NEW: Restore state from localStorage
  private restoreState() {
    const savedState = localStorage.getItem('dailySalesState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);

        // Restore form values (convert date strings back to Date objects)
        if (state.formValues) {
          const formValues = { ...state.formValues };
          if (formValues.period) {
            if (formValues.period.start) {
              formValues.period.start = new Date(formValues.period.start);
            }
            if (formValues.period.end) {
              formValues.period.end = new Date(formValues.period.end);
            }
          }
          this.dealerForm.patchValue(formValues);
        }

        // Restore report data
        this.allOutletReports = state.allOutletReports || [];
        this.dayColumnHeader = state.dayColumnHeader || 'Sales for the Day';
        this.selectedCountry = state.selectedCountry || '';
        this.selectedSaleTypeLabel = state.selectedSaleTypeLabel || '';
        this.reportTitle = state.reportTitle || '';
        this.reportDate = state.reportDate || '';
      } catch (error) {
        console.error('Error restoring state:', error);
      }
    }
  }

  // ✅ NEW: Update column header based on date selection
  private updateColumnHeader(startDate: Date | null, endDate: Date) {
    if (!startDate) {
      this.dayColumnHeader = 'Sales for the Day';
    } else if (startDate.toDateString() === endDate.toDateString()) {
      // Single day selected
      this.dayColumnHeader = `Sales for ${this.formatDate(startDate)}`;
    } else {
      // Date range selected
      this.dayColumnHeader = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
    }
  }

  // ✅ NEW: Format date helper
  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private waitForCountryOptionsAndPatch() {
    if (this.countryOptionsLoaded && this.options.country.length > 0) {
      this.patchDashboardData();
      return;
    }

    const checkInterval = setInterval(() => {
      if (this.countryOptionsLoaded && this.options.country.length > 0) {
        clearInterval(checkInterval);
        this.patchDashboardData();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this.countryOptionsLoaded) {
        console.error('Country options failed to load');
      }
    }, 5000);
  }

  private patchDashboardData() {
    if (!this.country || !this.date) return;

    const selectedDate = new Date(this.date);

    this.dealerForm.patchValue({
      country: this.country,
      period: {
        start: selectedDate,
        end: selectedDate
      }
    });

    setTimeout(() => {
      this.onSubmit();
    }, 500);
  }

  filterCountry(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.country = this.options.country
      .filter(c => c.toLowerCase().includes(searchText));
  }

  filterDivision(value: string) {
    const searchText = (value || '').toLowerCase();
    const selectedCountry = this.dealerForm.get('country')?.value;

    if (selectedCountry) {
      this.filteredOptions.division = this.filteredDivisionsByCountry
        .filter(d => d.toLowerCase().includes(searchText));
    } else {
      this.filteredOptions.division = this.options.division
        .filter(d => d.toLowerCase().includes(searchText));
    }
  }

  filterTown(value: string) {
    const searchText = (value || '').toLowerCase();
    const selectedCountry = this.dealerForm.get('country')?.value;

    if (selectedCountry) {
      this.filteredOptions.town = this.filteredTownsByDivision
        .filter(t => t.toLowerCase().includes(searchText));
    } else {
      this.filteredOptions.town = this.options.town
        .filter(t => t.toLowerCase().includes(searchText));
    }
  }

  filterSales(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.sale = this.options.sale
      .filter((s: string) => s.toLowerCase().includes(searchText));
  }

  filterOutlet(value: string) {
    const searchText = (value || '').toLowerCase();
    const selectedCountry = this.dealerForm.get('country')?.value;
    const selectedDivision = this.dealerForm.get('division')?.value;
    const selectedTown = this.dealerForm.get('town')?.value;

    let baseList: string[];

    if (selectedCountry || selectedDivision || selectedTown) {
      baseList = this.filteredOutletsByTown.length > 0
        ? this.filteredOutletsByTown
        : this.options.name;
    } else {
      baseList = this.options.name;
    }

    this.filteredOptions.name = baseList
      .filter(o => o.toLowerCase().includes(searchText));
  }

  filterOptions(field: string, value: string) {
    const searchTerm = (value || '').toLowerCase();
    this.filteredOptions[field] = this.options[field].filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
  }

  clearDashboardParams() {
    this.country = '';
    this.date = '';
    this.formattedDate = '';
  }

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
    this.dayColumnHeader = 'Sales for the Day'; // ✅ Reset header

    this.clearDashboardParams();
    localStorage.removeItem('dailySalesState');
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
        this.salesdataSource = data;
        this.filteredProducts = [];
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

        const productNames = Array.from(new Set(data.map((p: any) => p.name).filter(Boolean)));
        this.options.product = productNames;
        this.filteredOptions.product = [...productNames];
      });
    });
  }


  // loadDailySales() {
  //   this.dailySlaes.getDailySalesList().subscribe(salesData => {
  //     // Fetch yearly & monthly budgets in parallel
  //     this.budgetService.getBudgetList().subscribe(yearlyBudgets => {
  //       this.monthlyBudgetService.getBudgetList().subscribe(monthlyBudgets => {
  //
  //         // Map yearly and monthly budgets by product name
  //         const yearlyMap = new Map(
  //           yearlyBudgets.flatMap(b =>
  //             (b.products || []).map((p: any) => [p.model.toLowerCase(), p.targetQuantity])
  //           )
  //         );
  //
  //         const monthlyMap = new Map(
  //           monthlyBudgets.flatMap(b =>
  //             (b.products || []).map((p: any) => [p.model.toLowerCase(), p.targetQuantity])
  //           )
  //         );
  //
  //         // Merge data
  //         this.dataSource = salesData.map((row: any) => ({
  //           ...row,
  //           yearlyBudget: yearlyMap.get(row.product?.toLowerCase()) || '-',
  //           monthlyTarget: monthlyMap.get(row.product?.toLowerCase()) || '-'
  //         }));
  //       });
  //     });
  //   });
  // }

  loadReports() {
    combineLatest([
      this.dailySlaes.getDailySalesList(),
      this.budgetService.getBudgetList(),
      this.monthlyBudgetService.getBudgetList()
    ])
      .pipe(
        map(([dailySales, yearlyBudgets, monthlyTargets]) => {
          console.log('Daily Sales:', dailySales);
          console.log('Yearly Budgets:', yearlyBudgets);
          console.log('Monthly Targets:', monthlyTargets);

          const finalData = dailySales.map((sale: any) => {
            const yearly = yearlyBudgets.find((b: any) => b.year === sale.year && b.products?.some((p: any) => p.model?.toLowerCase() === sale.product?.toLowerCase()));
            const monthly = monthlyTargets.find((m: any) => m.year === sale.year && m.month === sale.month && m.products?.some((p: any) => p.model?.toLowerCase() === sale.product?.toLowerCase()));
            const yearlyBudget = yearly?.products?.find((p: any) => p.model?.toLowerCase() === sale.product?.toLowerCase())?.targetQuantity || '-';
            console.log(yearlyBudget)
            const monthlyTarget = monthly?.products?.find((p: any) => p.model?.toLowerCase() === sale.product?.toLowerCase())?.targetQuantity || '-';
             console.log(monthlyTarget)
            return {
              product: sale.product,
              yearlyBudget,
              monthlyTarget
            };
          });

          console.log('Final Combined Data:', finalData);
          return finalData;
        })
      )
      .subscribe({
        next: (finalData) => {
          this.dataSource = finalData;
          console.log(' Data Source Loaded:', this.dataSource);
        },
        error: (err) => {
          console.error(' Error loading reports:', err);
        }
      });
  }


  getDateRanges(currentDate: Date) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const fyStart = currentDate.getMonth() >= 3
      ? new Date(currentDate.getFullYear(), 3, 1)
      : new Date(currentDate.getFullYear() - 1, 3, 1);

    return { monthStart, fyStart };
  }

  generateReport(filteredData: any[], startDate: Date | null, endDate: Date, productsToShow: any[], selectedOutlets: string[] = []) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { monthStart, fyStart } = this.getDateRanges(today);

    const report: any = {};

    productsToShow.forEach((p: any) => {
      const model = (p.model || '').trim().toUpperCase();
      if (model) {
        report[model] = { YTD: 0, Month: 0, Day: 0 };
      }
    });

    let dayRangeStart: Date;
    let dayRangeEnd: Date;

    if (!startDate) {
      dayRangeStart = new Date(today);
      dayRangeEnd = new Date(today);
    } else if (startDate.toDateString() === endDate.toDateString()) {
      dayRangeStart = new Date(startDate);
      dayRangeEnd = new Date(startDate);
    } else {
      dayRangeStart = new Date(startDate);
      dayRangeEnd = new Date(endDate);
    }

    dayRangeStart.setHours(0, 0, 0, 0);
    dayRangeEnd.setHours(23, 59, 59, 999);

    this.salesdataSource.forEach(item => {
      const filters = this.dealerForm.value;
      const countriesToInclude: string[] = [];
      if (filters.country) {
        countriesToInclude.push(filters.country);
      } else {
        countriesToInclude.push(...this.options.country);
      }

      const matchesOutletFilter = selectedOutlets.length === 0 || selectedOutlets.includes(item.dealerOutlet);

      const matchesFilters = (
        (countriesToInclude.length === 0 || countriesToInclude.includes(item.country)) &&
        (!filters.town || item.town === filters.town) &&
        (!filters.division || item.division === filters.division) &&
        (!filters.sale || item.salesType === filters.sale) &&
        matchesOutletFilter
      );

      if (!matchesFilters) return;

      const model = (item.model || '').trim().toUpperCase();
      if (!report[model]) {
        report[model] = { YTD: 0, Month: 0, Day: 0 };
      }

      const qty = Number(item.quantity) || 0;

      const itemDate = item.salesDate
        ? new Date(item.salesDate)
        : (item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000) : new Date(item.createdAt));
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate >= fyStart && itemDate <= today) {
        report[model].YTD += qty;
      }

      if (itemDate >= monthStart && itemDate <= today) {
        report[model].Month += qty;
      }

      if (itemDate >= dayRangeStart && itemDate <= dayRangeEnd) {
        report[model].Day += qty;
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

  // onSubmit() {
  //   if (!this.countryOptionsLoaded) {
  //     this.loadingService.setLoading(false);
  //     return;
  //   }
  //
  //   this.loadingService.setLoading(true);
  //
  //   try {
  //     const filters = this.dealerForm.value;
  //
  //     this.selectedSaleTypeLabel = filters.sale ? `(${filters.sale})` : '';
  //
  //     const startDate = filters.period?.start ? new Date(filters.period.start) : null;
  //     const endDate = filters.period?.end ? new Date(filters.period.end) : new Date();
  //
  //     // ✅ UPDATE COLUMN HEADER
  //     this.updateColumnHeader(startDate, endDate);
  //
  //     if (startDate) startDate.setHours(0, 0, 0, 0);
  //     if (endDate) endDate.setHours(23, 59, 59, 999);
  //
  //     const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);
  //
  //     this.allOutletReports = [];
  //
  //     const countriesToInclude: string[] = [];
  //     if (filters.country) {
  //       countriesToInclude.push(filters.country);
  //     } else {
  //       countriesToInclude.push(...this.options.country);
  //     }
  //
  //     const productsToShow = filters.country
  //       ? this.getProductsByCountry(filters.country)
  //       : this.getProductsByCountries(this.options.country);
  //
  //     if (outlets.length === 0) {
  //       const report = this.generateReport([], startDate, endDate, productsToShow, []);
  //
  //       const tempRows = this.buildRows(report);
  //       const grouped = this.groupAndColorRows(tempRows);
  //
  //       this.allOutletReports.push({
  //         outlet: 'All Outlets',
  //         rows: grouped
  //       });
  //
  //     } else {
  //       outlets.forEach((outlet: string) => {
  //         const report = this.generateReport([], startDate, endDate, productsToShow, [outlet]);
  //
  //         const tempRows = this.buildRows(report);
  //         const grouped = this.groupAndColorRows(tempRows);
  //
  //         this.allOutletReports.push({
  //           outlet,
  //           rows: grouped
  //         });
  //       });
  //
  //       this.selectedCountry = filters.country || '';
  //     }
  //
  //     // ✅ SAVE STATE AFTER GENERATING REPORT
  //     this.saveState();
  //
  //   } finally {
  //     this.loadingService.setLoading(false);
  //   }
  // }
  //
  // private buildRows(report: any) {
  //   return Object.keys(report).map(key => {
  //     const displayModel = key.trim().toUpperCase();
  //     const { Day, Month, YTD } = report[key];
  //
  //     let rowColor = '';
  //     if (Day > 10 || Month > 10 || YTD > 10) {
  //       rowColor = 'green-row';
  //     } else if (Day >= 1 || Month >= 1 || YTD >= 1) {
  //       rowColor = 'yellow-row';
  //     } else {
  //       rowColor = 'red-row';
  //     }
  //
  //     return { product: displayModel, Day, Month, YTD, rowColor };
  //   });
  // }
  //
  // private groupAndColorRows(tempRows: any[]) {
  //   const grouped: Record<string, any> = {};
  //
  //   tempRows.forEach(row => {
  //     const key = row.product;
  //     if (!grouped[key]) {
  //       grouped[key] = { product: key, Day: 0, Month: 0, YTD: 0, rowColor: '' };
  //     }
  //     grouped[key].Day += row.Day;
  //     grouped[key].Month += row.Month;
  //     grouped[key].YTD += row.YTD;
  //   });
  //
  //   const rows = Object.values(grouped);
  //
  //   rows.forEach((row: any) => {
  //     if (row.Day > 10 || row.Month > 10 || row.YTD > 10) {
  //       row.rowColor = 'green-row';
  //     } else if (row.Day >= 1 || row.Month >= 1 || row.YTD >= 1) {
  //       row.rowColor = 'yellow-row';
  //     } else {
  //       row.rowColor = 'red-row';
  //     }
  //   });
  //
  //   rows.push({
  //     product: 'TOTAL',
  //     Day: rows.reduce((s: number, r: any) => s + r.Day, 0),
  //     Month: rows.reduce((s: number, r: any) => s + r.Month, 0),
  //     YTD: rows.reduce((s: number, r: any) => s + r.YTD, 0),
  //     rowColor: ''
  //   });
  //
  //   return rows;
  // }
  //
  // exportToExcel() {
  //   if (!this.allOutletReports || this.allOutletReports.length === 0) {
  //     Swal.fire('Info', 'No data available to export', 'info');
  //     return;
  //   }
  //
  //   const workbook = new Workbook();
  //   const worksheet = workbook.addWorksheet("Sales Report");
  //
  //   let currentRow = 1;
  //
  //   this.allOutletReports.forEach((outletReport, outletIndex) => {
  //     if (!outletReport || !outletReport.rows) return;
  //
  //     // === OUTLET TITLE ROW ===
  //     worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  //     worksheet.getCell(`A${currentRow}`).value = `Cumulative for the month - ${outletReport.outlet}`;
  //     worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center", vertical: "middle" };
  //     worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  //     worksheet.getCell(`A${currentRow}`).fill = {
  //       type: "pattern",
  //       pattern: "solid",
  //       fgColor: { argb: "FFFF00" },
  //     };
  //     worksheet.getRow(currentRow).height = 20;
  //     currentRow++;
  //
  //     // === DATE ROW ===
  //     worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  //     worksheet.getCell(`A${currentRow}`).value = `Date: ${new Date().toLocaleDateString()} ${this.selectedSaleTypeLabel}`;
  //     worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center", vertical: "middle" };
  //     worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  //     worksheet.getCell(`A${currentRow}`).fill = {
  //       type: "pattern",
  //       pattern: "solid",
  //       fgColor: { argb: "FFFF00" },
  //     };
  //     worksheet.getRow(currentRow).height = 20;
  //     currentRow += 2;
  //
  //     // === HEADER ROW === ✅ Use dynamic column header
  //     const headerRow = ["Product", this.dayColumnHeader, "Month", "YTD"];
  //     const headerExcelRow = worksheet.addRow(headerRow);
  //     headerExcelRow.font = { bold: true };
  //     headerExcelRow.height = 20;
  //     headerExcelRow.eachCell(cell => {
  //       cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  //       cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F4B083" } };
  //     });
  //     currentRow++;
  //
  //     // === DATA ROWS ===
  //     outletReport.rows.forEach((row: any) => {
  //       worksheet.addRow([row.product, row.Day, row.Month, row.YTD]);
  //       currentRow++;
  //     });
  //
  //     currentRow += 2; // add spacing before next outlet
  //   });
  //
  //   // === Borders + alignment ===
  //   worksheet.eachRow((row, rowNumber) => {
  //     row.eachCell(cell => {
  //       cell.border = {
  //         top: { style: "thin" },
  //         left: { style: "thin" },
  //         bottom: { style: "thin" },
  //         right: { style: "thin" },
  //       };
  //       if (rowNumber > 1) {
  //         cell.alignment = { vertical: "middle", horizontal: "center" };
  //       }
  //     });
  //   });
  //
  //   // === Column widths ===
  //   worksheet.columns.forEach((col, index) => {
  //     col.width = index === 0 ? 25 : 12;
  //   });
  //
  //   // === Save Excel file ===
  //   workbook.xlsx.writeBuffer().then(data => {
  //     const blob = new Blob([data], { type: "application/octet-stream" });
  //     FileSaver.saveAs(blob, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);
  //
  //     // ✅ Get username from localStorage
  //     const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  //     const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
  //
  //     // 🔹 Log activity after successful export
  //     const activity: ActivityLog = {
  //       action: 'Export',
  //       section: 'Sales Report',
  //       description: `${username} downloaded the sales report and mail is`,
  //       date: Date.now(),
  //       user: username,
  //       currentIp: '',
  //     };
  //
  //     this.mService.addLog(activity)
  //       .then(() => console.log('Export action logged.'))
  //       .catch(err => console.error('Failed to log export:', err));
  //   });
  // }


  // Replace your onSubmit() method with this updated version:

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

      this.updateColumnHeader(startDate, endDate);

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);

      this.allOutletReports = [];

      const countriesToInclude: string[] = [];
      if (filters.country) {
        countriesToInclude.push(filters.country);
      } else {
        countriesToInclude.push(...this.options.country);
      }

      const productsToShow = filters.country
        ? this.getProductsByCountry(filters.country)
        : this.getProductsByCountries(this.options.country);

      // ✅ FETCH BUDGET DATA BEFORE GENERATING REPORTS
      combineLatest([
        this.budgetService.getBudgetList(),
        this.monthlyBudgetService.getBudgetList()
      ]).subscribe({
        next: ([yearlyBudgets, monthlyTargets]) => {
          // Create budget maps
          const yearlyMap = new Map<string, number>();
          const monthlyMap = new Map<string, number>();

          // Map yearly budgets by product name (case-insensitive)
          yearlyBudgets.forEach((b: any) => {
            if (b.products && Array.isArray(b.products)) {
              b.products.forEach((p: any) => {
                const key = (p.model || '').trim().toUpperCase();
                if (key && p.targetQuantity !== undefined) {
                  yearlyMap.set(key, Number(p.targetQuantity) || 0);
                }
              });
            }
          });

          // Map monthly budgets by product name (case-insensitive)
          monthlyTargets.forEach((m: any) => {
            if (m.products && Array.isArray(m.products)) {
              m.products.forEach((p: any) => {
                const key = (p.model || '').trim().toUpperCase();
                if (key && p.targetQuantity !== undefined) {
                  monthlyMap.set(key, Number(p.targetQuantity) || 0);
                }
              });
            }
          });

          // Generate reports with budget data
          if (outlets.length === 0) {
            const report = this.generateReport([], startDate, endDate, productsToShow, []);
            const tempRows = this.buildRows(report, yearlyMap, monthlyMap);
            const grouped = this.groupAndColorRows(tempRows);

            this.allOutletReports.push({
              outlet: 'All Outlets',
              rows: grouped
            });
          } else {
            outlets.forEach((outlet: string) => {
              const report = this.generateReport([], startDate, endDate, productsToShow, [outlet]);
              const tempRows = this.buildRows(report, yearlyMap, monthlyMap);
              const grouped = this.groupAndColorRows(tempRows);

              this.allOutletReports.push({
                outlet,
                rows: grouped
              });
            });

            this.selectedCountry = filters.country || '';
          }

          this.saveState();
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Error fetching budget data:', err);
          this.loadingService.setLoading(false);
        }
      });

    } catch (error) {
      console.error('Error in onSubmit:', error);
      this.loadingService.setLoading(false);
    }
  }
Fv
// ✅ UPDATE buildRows() to accept and use budget maps:
  private buildRows(report: any, yearlyMap: Map<string, number>, monthlyMap: Map<string, number>) {
    return Object.keys(report).map(key => {
      const displayModel = key.trim().toUpperCase();
      const { Day, Month, YTD } = report[key];

      // ✅ GET BUDGET DATA FROM MAPS
      const yearlyBudget = yearlyMap.get(displayModel) || '-';
      const monthlyTarget = monthlyMap.get(displayModel) || '-';

      let rowColor = '';
      if (Day > 10 || Month > 10 || YTD > 10) {
        rowColor = 'green-row';
      } else if (Day >= 1 || Month >= 1 || YTD >= 1) {
        rowColor = 'yellow-row';
      } else {
        rowColor = 'red-row';
      }

      return {
        product: displayModel,
        yearlyBudget,      // ✅ ADD THIS
        monthlyTarget,     // ✅ ADD THIS
        Day,
        Month,
        YTD,
        rowColor
      };
    });
  }

// ✅ UPDATE groupAndColorRows() to preserve budget data:
  private groupAndColorRows(tempRows: any[]) {
    const grouped: Record<string, any> = {};

    tempRows.forEach(row => {
      const key = row.product;
      if (!grouped[key]) {
        grouped[key] = {
          product: key,
          yearlyBudget: row.yearlyBudget,    // ✅ PRESERVE
          monthlyTarget: row.monthlyTarget,  // ✅ PRESERVE
          Day: 0,
          Month: 0,
          YTD: 0,
          rowColor: ''
        };
      }
      grouped[key].Day += row.Day;
      grouped[key].Month += row.Month;
      grouped[key].YTD += row.YTD;
    });

    const rows = Object.values(grouped);

    rows.forEach((row: any) => {
      if (row.Day > 10 || row.Month > 10 || row.YTD > 10) {
        row.rowColor = 'green-row';
      } else if (row.Day >= 1 || row.Month >= 1 || row.YTD >= 1) {
        row.rowColor = 'yellow-row';
      } else {
        row.rowColor = 'red-row';
      }
    });

    // Add total row
    rows.push({
      product: 'TOTAL',
      yearlyBudget: '-',
      monthlyTarget: '-',
      Day: rows.reduce((s: number, r: any) => s + r.Day, 0),
      Month: rows.reduce((s: number, r: any) => s + r.Month, 0),
      YTD: rows.reduce((s: number, r: any) => s + r.YTD, 0),
      rowColor: ''
    });

    return rows;
  }

// ✅ Also update exportToExcel() to include the new columns:
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

      // Outlet title
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
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

      // Date row
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
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

      // ✅ UPDATED HEADER with budget columns
      const headerRow = ["Product", "Yearly Budget", "Monthly Target", this.dayColumnHeader, "Month", "YTD"];
      const headerExcelRow = worksheet.addRow(headerRow);
      headerExcelRow.font = { bold: true };
      headerExcelRow.height = 20;
      headerExcelRow.eachCell(cell => {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F4B083" } };
      });
      currentRow++;

      // ✅ DATA ROWS with budget values
      outletReport.rows.forEach((row: any) => {
        worksheet.addRow([
          row.product,
          row.yearlyBudget,
          row.monthlyTarget,
          row.Day,
          row.Month,
          row.YTD
        ]);
        currentRow++;
      });

      currentRow += 2;
    });

    // Borders and styling
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });
    });

    // Column widths
    worksheet.columns = [
      { width: 25 }, // Product
      { width: 15 }, // Yearly Budget
      { width: 15 }, // Monthly Target
      { width: 12 }, // Day
      { width: 12 }, // Month
      { width: 12 }  // YTD
    ];

    // Save file
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';

      const activity: ActivityLog = {
        action: 'Export',
        section: 'Sales Report',
        description: `${username} downloaded the sales report`,
        date: Date.now(),
        user: username,
        currentIp: '',
      };

      this.mService.addLog(activity)
        .then(() => console.log('Export action logged.'))
        .catch(err => console.error('Failed to log export:', err));
    });
  }
}
