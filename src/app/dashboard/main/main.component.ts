import {Component, ViewChild, OnInit, runInInjectionContext, EnvironmentInjector, ElementRef} from '@angular/core';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexTooltip,
  ApexLegend,
  NgApexchartsModule, ApexResponsive, ApexFill,
} from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { NgScrollbar } from 'ngx-scrollbar';
import { OrderInfoBoxComponent } from '@shared/components/order-info-box/order-info-box.component';
import { MatCardModule } from '@angular/material/card';
import { NewOrderListComponent } from '@shared/components/new-order-list/new-order-list.component';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import {DailySalesService} from "../../module/daily-sales.service";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {AsyncPipe, DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {LoadingService} from "../../Services/loading.service";
import {MatSort} from "@angular/material/sort";
import {AddDealerService} from "../../module/add-dealer.service";
import {MatPaginator} from "@angular/material/paginator";
import {BudgetService} from "../../module/budget.service";
import {MonthlyBudgetService} from "../../module/monthly-budget.service";
import {CountryService} from "../../Services/country.service";
import {MatCheckbox} from "@angular/material/checkbox";
import {GrnService} from "../../module/grn.service";
import {Router} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import { CountrySelectionService } from "../main/countryselection.service";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  fill?: ApexFill;
};

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    OrderInfoBoxComponent,
    MatCardModule,
    DecimalPipe,
    FormsModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    NgForOf,
    ReactiveFormsModule,
    MatTable,
    MatCell,
    MatHeaderCell,
    MatColumnDef,
    MatHeaderRow,
    MatRow,
    MatSort,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderCellDef,
    MatCellDef,
    MatPaginator,
    MatInput,
    NgIf,
    MatCheckbox,
    MatSelectModule,
    MatIcon
  ],
  standalone: true
})
export class MainComponent implements OnInit {
  @ViewChild('chart', { static: false }) chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  public chartOptions2!: Partial<ChartOptions>;
  public areaChartOptions!: Partial<ChartOptions>;
  public barChartOptions!: Partial<ChartOptions>;

  // Stock Chart Options
  public stockBarChartOptions!: Partial<ChartOptions>;
  public stockMonthlyChartOptions!: Partial<ChartOptions>;
  public stockYearlyChartOptions!: Partial<ChartOptions>;

  dataSource = new MatTableDataSource<any>();
  outletdataSource = new MatTableDataSource<any>([]);
  stockDataSource = new MatTableDataSource<any>([]);

  // Sales properties
  todaySales: number = 0;
  todayPercentage: string = '';
  monthlySales: number = 0;
  monthlyPercentage: string = '';
  totalSalesFY: number = 0;
  totalPercentageFY: string = '';
  fiscalYearTitle: string = '';
  currentYearSales: number = 0;
  lastYearSales: number = 0;
  currentMonthSales: number = 0;
  lastMonthSales: number = 0;
  monthlyChartData: number[] = [];
  monthlyChartLabels: string[] = [];
  yesterdaySales: number = 0;
  totalSalesQuantity: number = 0;
  last10DaysSales: number = 0;

  // Stock properties
  todayStock: number = 0;
  todayStockPercentage: string = '';
  monthlyStock: number = 0;
  monthlyStockPercentage: string = '';
  totalStockFY: number = 0;
  totalStockPercentageFY: string = '';
  stockFiscalYearTitle: string = '';
  currentYearStock: number = 0;
  lastYearStock: number = 0;
  currentMonthStock: number = 0;
  lastMonthStock: number = 0;
  monthlyStockChartData: number[] = [];
  monthlyStockChartLabels: string[] = [];
  yesterdayStock: number = 0;
  totalStockQuantity: number = 0;
  last10DaysStock: number = 0;

  _countriesTypes$!: Observable<string[]>;
  countryControl = new FormControl<string[] | null>([]);
  dailyZeroSalesDataSource = new MatTableDataSource<any>([]);
  monthlyZeroSalesDataSource = new MatTableDataSource<any>([]);
  @ViewChild('dailyPaginator') dailyPaginator!: MatPaginator;
  @ViewChild('monthlyPaginator') monthlyPaginator!: MatPaginator;
  @ViewChild('countrySearchInput') countrySearchInput: ElementRef | undefined;
  _countriesTypes: string[] = [];
  filteredCountries: string[] = [];
  countrySearchText: string = '';
  debounceTimer: any;
  currentMonthBudget: number = 0;
  lastMonthBudget: number = 0;
  currentMonthTarget: number = 0;
  lastMonthTarget: number = 0;
  lastSelectedValue: string[] = [];

  displayedColumns: string[] = [
    'id',
    'name',
    'country',
    'division',
    'town',
  ];

  constructor(
    private dailySlaes: DailySalesService,
    private grnService: GrnService,
    private injector: EnvironmentInjector,
    private mDatabase: AngularFireDatabase,
    private loadingService: LoadingService,
    private addDealerService: AddDealerService,
    private budgetService: BudgetService,
    private countryService: CountryService,
    private monthlybudgetService: MonthlyBudgetService,
    private countrySelectionService: CountrySelectionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.chart2();
    this.DealerList();
    this.loadbudget();
    this.loadMonthlyBudget();

    // this.countryService.getCountries().subscribe(countries => {
    //   this._countriesTypes = countries;
    //   this.filteredCountries = [...this._countriesTypes];
    //   this.countryControl.setValue(['All']);
    //   this.loadSalesList(this._countriesTypes);
    //   this.loadStockList(this._countriesTypes);
    // });

    // this.countryService.getCountries().subscribe(countries => {
    //   this._countriesTypes = countries;
    //   this.filteredCountries = [...this._countriesTypes];
    //
    //   // ✅ Select "All" and every country internally
    //   this.countryControl.setValue(['All', ...this._countriesTypes]);
    //
    //   this.loadSalesList(this._countriesTypes);
    //   this.loadStockList(this._countriesTypes);
    // });

    this.countryService.getCountries().subscribe(countries => {
      this._countriesTypes = countries;
      this.filteredCountries = [...this._countriesTypes];

      // ✅ Restore saved selection
      const savedSelection = this.countrySelectionService.getSelectedCountries();
      this.countryControl.setValue(savedSelection);
      this.lastSelectedValue = savedSelection;

      // Load data based on saved selection
      const countriesToLoad = savedSelection.includes('All') ? this._countriesTypes : savedSelection.filter(c => c !== 'All');
      this.loadSalesList(countriesToLoad);
      this.loadStockList(countriesToLoad);
    });


    // this.countryControl.valueChanges.subscribe((selected: string[] | null) => {
    //   if (!selected) return;
    //
    //   // If "All" is in the selection
    //   if (selected.includes('All')) {
    //     // If there are other countries selected along with "All"
    //     if (selected.length > 1) {
    //       // Remove "All" and keep only the other selected countries
    //       const filteredSelection = selected.filter(c => c !== 'All');
    //       this.countryControl.setValue(filteredSelection, { emitEvent: false });
    //       this.loadSalesList(filteredSelection);
    //       this.loadStockList(filteredSelection);
    //     } else {
    //       // Only "All" is selected
    //       this.countryControl.setValue(['All'], { emitEvent: false });
    //       this.loadSalesList(this._countriesTypes);
    //       this.loadStockList(this._countriesTypes);
    //     }
    //   } else if (selected.length === 0) {
    //     // No selection
    //     this.loadSalesList([]);
    //     this.loadStockList([]);
    //   } else {
    //     // Specific countries selected
    //     this.loadSalesList(selected);
    //     this.loadStockList(selected);
    //   }
    // });

    // this.countryControl.valueChanges.subscribe((selected: string[] | null) => {
    //   if (!selected) return;
    //
    //   // ✅ CASE 1: "All" selected
    //   if (selected.includes('All')) {
    //     // Mark all countries (and "All") as selected
    //     this.countryControl.setValue(['All', ...this._countriesTypes], { emitEvent: false });
    //     this.loadSalesList(this._countriesTypes);
    //     this.loadStockList(this._countriesTypes);
    //   }
    //
    //   // ✅ CASE 2: "All" unselected
    //   else if (!selected.includes('All') && selected.length === this._countriesTypes.length) {
    //     // if user manually unselects "All", remove all selections
    //     this.countryControl.setValue([], { emitEvent: false });
    //     this.loadSalesList([]);
    //     this.loadStockList([]);
    //   }
    //
    //   // ✅ CASE 3: No selection at all
    //   else if (selected.length === 0) {
    //     this.loadSalesList([]);
    //     this.loadStockList([]);
    //   }
    //
    //   // ✅ CASE 4: Some specific countries selected
    //   else {
    //     this.loadSalesList(selected);
    //     this.loadStockList(selected);
    //   }
    // });

    // Replace your existing countryControl.valueChanges subscription with this updated logic:

    // this.countryControl.valueChanges.subscribe((selected: string[] | null) => {
    //   if (!selected) return;
    //
    //   const previousSelection = this.lastSelectedValue || [];
    //
    //   // ✅ CASE 1: User clicked "All"
    //   if (selected.includes('All') && !previousSelection.includes('All')) {
    //     // Mark all countries (and "All") as selected
    //     this.countryControl.setValue(['All', ...this._countriesTypes], { emitEvent: false });
    //     this.lastSelectedValue = ['All', ...this._countriesTypes];
    //     this.loadSalesList(this._countriesTypes);
    //     this.loadStockList(this._countriesTypes);
    //     return;
    //   }
    //
    //   // ✅ CASE 2: User unchecked "All" directly
    //   if (!selected.includes('All') && previousSelection.includes('All')) {
    //     // Remove all selections
    //     this.countryControl.setValue([], { emitEvent: false });
    //     this.lastSelectedValue = [];
    //     this.loadSalesList([]);
    //     this.loadStockList([]);
    //     return;
    //   }
    //
    //   // ✅ CASE 3: User unchecked a specific country (while "All" was selected)
    //   if (previousSelection.includes('All') && selected.length < previousSelection.length) {
    //     // Remove "All" and keep only the remaining selected countries
    //     const remainingCountries = selected.filter(c => c !== 'All');
    //     this.countryControl.setValue(remainingCountries, { emitEvent: false });
    //     this.lastSelectedValue = remainingCountries;
    //     this.loadSalesList(remainingCountries);
    //     this.loadStockList(remainingCountries);
    //     return;
    //   }
    //
    //   // ✅ CASE 4: User manually selected all countries (without clicking "All")
    //   if (!selected.includes('All') && selected.length === this._countriesTypes.length) {
    //     // Auto-select "All" checkbox
    //     this.countryControl.setValue(['All', ...this._countriesTypes], { emitEvent: false });
    //     this.lastSelectedValue = ['All', ...this._countriesTypes];
    //     this.loadSalesList(this._countriesTypes);
    //     this.loadStockList(this._countriesTypes);
    //     return;
    //   }
    //
    //   // ✅ CASE 5: No selection at all
    //   if (selected.length === 0) {
    //     this.lastSelectedValue = [];
    //     this.loadSalesList([]);
    //     this.loadStockList([]);
    //     return;
    //   }
    //
    //   // ✅ CASE 6: Normal country selection/deselection
    //   this.lastSelectedValue = selected;
    //   this.loadSalesList(selected);
    //   this.loadStockList(selected);
    // });//neha


    this.countryControl.valueChanges.subscribe((selected: string[] | null) => {
      if (!selected) return;

      const previousSelection = this.lastSelectedValue || [];

      // CASE 1: User clicked "All"
      if (selected.includes('All') && !previousSelection.includes('All')) {
        const newSelection = ['All', ...this._countriesTypes];
        this.countryControl.setValue(newSelection, { emitEvent: false });
        this.lastSelectedValue = newSelection;
        this.countrySelectionService.setSelectedCountries(newSelection); // ✅ ADD THIS
        this.loadSalesList(this._countriesTypes);
        this.loadStockList(this._countriesTypes);
        return;
      }

      // CASE 2: User unchecked "All" directly
      if (!selected.includes('All') && previousSelection.includes('All')) {
        this.countryControl.setValue([], { emitEvent: false });
        this.lastSelectedValue = [];
        this.countrySelectionService.setSelectedCountries([]); // ✅ ADD THIS
        this.loadSalesList([]);
        this.loadStockList([]);
        return;
      }

      // CASE 3: User unchecked a specific country
      if (previousSelection.includes('All') && selected.length < previousSelection.length) {
        const remainingCountries = selected.filter(c => c !== 'All');
        this.countryControl.setValue(remainingCountries, { emitEvent: false });
        this.lastSelectedValue = remainingCountries;
        this.countrySelectionService.setSelectedCountries(remainingCountries); // ✅ ADD THIS
        this.loadSalesList(remainingCountries);
        this.loadStockList(remainingCountries);
        return;
      }

      // CASE 4: User manually selected all countries
      if (!selected.includes('All') && selected.length === this._countriesTypes.length) {
        const newSelection = ['All', ...this._countriesTypes];
        this.countryControl.setValue(newSelection, { emitEvent: false });
        this.lastSelectedValue = newSelection;
        this.countrySelectionService.setSelectedCountries(newSelection); // ✅ ADD THIS
        this.loadSalesList(this._countriesTypes);
        this.loadStockList(this._countriesTypes);
        return;
      }

      // CASE 5: No selection at all
      if (selected.length === 0) {
        this.lastSelectedValue = [];
        this.countrySelectionService.setSelectedCountries([]); // ✅ ADD THIS
        this.loadSalesList([]);
        this.loadStockList([]);
        return;
      }

      // CASE 6: Normal country selection/deselection
      this.lastSelectedValue = selected;
      this.countrySelectionService.setSelectedCountries(selected); // ✅ ADD THIS
      this.loadSalesList(selected);
      this.loadStockList(selected);
    });

  }

  filterCountries() {
    const sortedCountries = [...this._countriesTypes].sort((a, b) =>
      a.trim().toLowerCase().localeCompare(b.trim().toLowerCase())
    );

    if (!this.countrySearchText) {
      this.filteredCountries = sortedCountries;
    } else {
      this.filteredCountries = sortedCountries.filter(country =>
        country.toLowerCase().includes(this.countrySearchText.toLowerCase()) ||
        (this.countryControl.value?.includes(country) ?? false)
      );

    }
  }

  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.countrySearchText = event.target.value;
      this.filterCountries();
    }, 300);
  }

  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened && this.countrySearchInput) {
      this.countrySearchText = '';
      this.filterCountries();
      setTimeout(() => {
        this.countrySearchInput?.nativeElement.focus();
      }, 0);
    }
  }


  ngAfterViewInit() {
    this.dailyZeroSalesDataSource.paginator = this.dailyPaginator;
    this.monthlyZeroSalesDataSource.paginator = this.monthlyPaginator;
  }

  loadSalesList(selectedCountries: string[] = []) {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe((data: any[]) => {
        let filteredData: any[] = [];
        let filteredOutlets: any[] = [];

        if (selectedCountries.length === 0) {
          filteredData = [];
          filteredOutlets = [];
        } else {
          filteredData = data.filter(item => selectedCountries.includes(item.country));
          filteredOutlets = this.outletdataSource.data.filter(outlet =>
            selectedCountries.includes(outlet.country)
          );
        }

        this.dataSource.data = filteredData;
        this.totalSalesQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
        this.calculateDailySales(filteredData);
        this.calculateLast12MonthsSales(filteredData);
        this.calculateMonthlySalesFromChart();
        this.calculateFiscalYearSales(filteredData);

        this.chart1();
        this.barchart();
        const yearlyData = this.calculateYearlySales(filteredData);
        this.areachart(yearlyData.years, yearlyData.quantities);

        this.loadbudget(selectedCountries);
        this.loadMonthlyBudget(selectedCountries);
        this.calculateZeroSales(filteredData, filteredOutlets);
        this.loadingService.setLoading(false);
      });
    });
  }

  loadStockList(selectedCountries: string[] = []) {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.grnService.getGrnList().subscribe((data: any[]) => {
        console.log("Stock data", data);
        let filteredData: any[] = [];

        if (selectedCountries.length === 0) {
          filteredData = [];
        } else {
          filteredData = data.filter(item => selectedCountries.includes(item.country));
        }

        // ✅ Store the filtered data
        this.stockDataSource.data = filteredData;

        this.totalStockQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);

        // Calculate stock metrics
        this.calculateDailyStock(filteredData);
        this.calculateLast12MonthsStock(filteredData);
        this.calculateMonthlyStockFromChart();
        this.calculateFiscalYearStock(filteredData);

        // Update stock charts
        this.stockMonthlyChart();
        this.stockDailyBarChart();
        const yearlyStockData = this.calculateYearlyStock(filteredData);
        this.stockYearlyAreaChart(yearlyStockData.years, yearlyStockData.quantities);

        this.loadingService.setLoading(false);
      });
    });
  }

  // Get stock date (similar to sales date)
  getStockDate(item: any): Date {
    if (item.stockDate) {
      return new Date(item.stockDate);
    } else if (item.createdAt?.seconds) {
      return new Date(item.createdAt.seconds * 1000);
    }
    return new Date();
  }

  // Calculate daily stock
  calculateDailyStock(data: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let todayQuantity = 0;
    let yesterdayQuantity = 0;
    let last10DaysQuantity = 0;

    const last10DaysStart = new Date(today);
    last10DaysStart.setDate(today.getDate() - 9);

    data.forEach(item => {
      const itemDate = this.getStockDate(item);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        todayQuantity += item.quantity;
      } else if (itemDate.getTime() === yesterday.getTime()) {
        yesterdayQuantity += item.quantity;
      }

      if (itemDate.getTime() >= last10DaysStart.getTime() && itemDate.getTime() <= today.getTime()) {
        last10DaysQuantity += item.quantity;
      }
    });

    this.todayStock = todayQuantity;
    this.yesterdayStock = yesterdayQuantity;
    this.last10DaysStock = last10DaysQuantity;

    if (yesterdayQuantity === 0) {
      this.todayStockPercentage = todayQuantity > 0 ? '100% Higher Than Yesterday' : 'No stock yesterday';
    } else {
      const percentage = ((todayQuantity - yesterdayQuantity) / yesterdayQuantity) * 100;
      this.todayStockPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Yesterday`;
    }

    console.log(`Today Stock: ${this.todayStock}, Yesterday: ${this.yesterdayStock}, Last 10 Days: ${this.last10DaysStock}`);
  }

  // Calculate last 12 months stock
  calculateLast12MonthsStock(data: any[]) {
    const stockByMonth = new Map<string, number>();
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYearStr = `${d.getFullYear()}-${d.getMonth() + 1}`;
      stockByMonth.set(monthYearStr, 0);
    }

    data.forEach(item => {
      const itemDate = this.getStockDate(item);
      const monthYearStr = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}`;
      if (stockByMonth.has(monthYearStr)) {
        stockByMonth.set(monthYearStr, stockByMonth.get(monthYearStr)! + item.quantity);
      }
    });

    const sortedMonths = Array.from(stockByMonth.keys()).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    this.monthlyStockChartLabels = sortedMonths.map(str => {
      const [year, month] = str.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleString('default', { month: 'short' });
    });

    this.monthlyStockChartData = sortedMonths.map(str => stockByMonth.get(str)!);
  }

  // Calculate monthly stock from chart
  calculateMonthlyStockFromChart() {
    const lastIndex = this.monthlyStockChartData.length - 1;
    const secondLastIndex = this.monthlyStockChartData.length - 2;

    this.currentMonthStock = this.monthlyStockChartData[lastIndex] || 0;
    const lastMonthStock = this.monthlyStockChartData[secondLastIndex] || 0;

    this.monthlyStock = this.currentMonthStock;

    if (lastMonthStock === 0) {
      this.monthlyStockPercentage = this.currentMonthStock > 0
        ? '100% Higher Than Last Month'
        : 'No stock last month';
    } else {
      const percentage = ((this.currentMonthStock - lastMonthStock) / lastMonthStock) * 100;
      this.monthlyStockPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Month`;
    }

    console.log(`Monthly Stock: ${this.monthlyStock}, Percentage: ${this.monthlyStockPercentage}`);
  }

  // Calculate fiscal year stock
  calculateFiscalYearStock(data: any[]) {
    const now = new Date();
    let currentFYStart: Date;
    let lastFYStart: Date;
    let lastFYEnd: Date;

    const currentYear = now.getFullYear();

    if (now.getMonth() >= 3) {
      currentFYStart = new Date(currentYear, 3, 1);
      lastFYStart = new Date(currentYear - 1, 3, 1);
      lastFYEnd = new Date(currentYear, 2, 31);
      this.stockFiscalYearTitle = `Total Stock FY-${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
    } else {
      currentFYStart = new Date(currentYear - 1, 3, 1);
      lastFYStart = new Date(currentYear - 2, 3, 1);
      lastFYEnd = new Date(currentYear - 1, 2, 31);
      this.stockFiscalYearTitle = `Total Stock FY-${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
    }

    let currentFYQuantity = 0;
    let lastFYQuantity = 0;

    data.forEach(item => {
      const itemDate = this.getStockDate(item);
      if (itemDate >= currentFYStart) {
        currentFYQuantity += item.quantity;
      } else if (itemDate >= lastFYStart && itemDate <= lastFYEnd) {
        lastFYQuantity += item.quantity;
      }
    });

    this.totalStockFY = currentFYQuantity;
    this.currentYearStock = currentFYQuantity;
    this.lastYearStock = lastFYQuantity;

    if (lastFYQuantity === 0) {
      this.totalStockPercentageFY = currentFYQuantity > 0 ? '100% Higher Than Last Year' : 'No stock last year';
    } else {
      const percentage = ((currentFYQuantity - lastFYQuantity) / lastFYQuantity) * 100;
      this.totalStockPercentageFY = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Year`;
    }
  }

  // Calculate yearly stock
  calculateYearlyStock(data: any[]): { years: string[], quantities: number[] } {
    const now = new Date();
    const yearlyStockMap = new Map<number, number>();

    for (let i = 0; i < 5; i++) {
      yearlyStockMap.set(now.getFullYear() - i, 0);
    }

    data.forEach(item => {
      const itemDate = this.getStockDate(item);
      const itemYear = itemDate.getFullYear();

      if (yearlyStockMap.has(itemYear)) {
        yearlyStockMap.set(itemYear, yearlyStockMap.get(itemYear)! + item.quantity);
      }
    });

    const sortedYears = Array.from(yearlyStockMap.keys()).sort((a, b) => a - b);
    const sortedQuantities = sortedYears.map(year => yearlyStockMap.get(year)!);

    return {
      years: sortedYears.map(String),
      quantities: sortedQuantities,
    };
  }

  // Get last 10 days stock country-wise
  getLast10DaysStockCountryWise(data: any[]): {
    categories: string[],
    seriesData: { name: string, data: number[] }[]
  } {
    const now = new Date();
    const last10Days: string[] = [];
    const stockByCountryAndDate = new Map<string, Map<string, number>>();

    // Prepare last 10 days array
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateKey = date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0');

      last10Days.push(dateKey);
    }

    // Initialize country-date map
    const countries = new Set<string>();
    data.forEach(item => {
      if (item.country) {
        countries.add(item.country);
      }
    });

    countries.forEach(country => {
      const dateMap = new Map<string, number>();
      last10Days.forEach(date => dateMap.set(date, 0));
      stockByCountryAndDate.set(country, dateMap);
    });

    // Aggregate stock data
    data.forEach(item => {
      if (!item.country) return;

      const itemDate = this.getStockDate(item);
      itemDate.setHours(0, 0, 0, 0);
      const itemKey = itemDate.getFullYear() + '-' +
        (itemDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
        itemDate.getDate().toString().padStart(2, '0');

      const countryMap = stockByCountryAndDate.get(item.country);
      if (countryMap && countryMap.has(itemKey)) {
        countryMap.set(itemKey, countryMap.get(itemKey)! + item.quantity);
      }
    });

    // Format categories (x-axis labels)
    const categories = last10Days.map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    });

    // Format series data
    const seriesData = Array.from(stockByCountryAndDate.entries()).map(([country, dateMap]) => ({
      name: country,
      data: last10Days.map(date => dateMap.get(date) || 0)
    }));

    return { categories, seriesData };
  }

  // Stock Daily Bar Chart
  private stockDailyBarChart() {
    // ✅ Use the stored data instead of calling the service
    const stockData = this.getLast10DaysStockCountryWise(this.stockDataSource.data);

    this.stockBarChartOptions = {
      series: stockData.seriesData,
      chart: {
        height: 350,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -5,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '13px',
                fontWeight: 900
              }
            }
          }
        },
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      xaxis: {
        categories: stockData.categories,
        title: {
          text: 'Days',
        },
        labels: {
          style: {
            colors: '#9aa0ac',
          },
        },
      },
      yaxis: {
        title: {
          text: 'Stock Quantity',
        },
        labels: {
          style: {
            colors: ['#9aa0ac'],
          },
        },
      },
      legend: {
        position: 'bottom',
        offsetY: 5,
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function (val: number) {
            return val + ' Products';
          },
        },
      },
    };
  }

  // Stock Monthly Chart
  private stockMonthlyChart() {
    this.stockMonthlyChartOptions = {
      series: [
        {
          name: 'Monthly Stock',
          data: this.monthlyStockChartData,
        },
      ],
      chart: {
        height: 250,
        type: 'line',
        foreColor: '#9aa0ac',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ['#00E396'],
      stroke: {
        curve: 'smooth',
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      markers: {
        size: 3,
      },
      xaxis: {
        categories: this.monthlyStockChartLabels,
        title: {
          text: 'Month',
        },
      },
      yaxis: {
        title: {
          text: 'Stock Quantity',
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  // Stock Yearly Area Chart
  private stockYearlyAreaChart(years: string[] = [], quantities: number[] = []) {
    this.stockYearlyChartOptions = {
      series: [
        {
          name: 'Total Stock',
          data: quantities,
        },
      ],
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#FEB019'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'category',
        categories: years,
        title: {
          text: 'Year',
        },
      },
      yaxis: {
        title: {
          text: 'Stock Quantity',
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        offsetX: 0,
        offsetY: 0,
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  // Existing methods remain the same...
  // (Keep all your existing sales calculation methods)

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data: any[]) => {
        this.outletdataSource.data = data;
      });
    });
  }

  loadbudget(selectedCountries: string[] = []) {
    runInInjectionContext(this.injector, () => {
      this.budgetService.getBudgetList().subscribe({
        next: (data: any[]) => {
          console.log("Raw Budget Data:", data);
          this.calculateCurrentMonthTarget(data, selectedCountries);
        },
      });
    });
  }

  loadMonthlyBudget(selectedCountries: string[] = []) {
    runInInjectionContext(this.injector, () => {
      this.monthlybudgetService.getBudgetList().subscribe({
        next: (data: any[]) => {
          console.log("Monthly Raw Data:", data);
          this.calculateMonthlyBudgetTargets(data, selectedCountries);
        },
      });
    });
  }



  processSalesData(data: any[]) {
    this.dataSource.data = data;
    this.calculateDailySales(data);
    this.calculateMonthlySales(data);
    this.calculateFiscalYearSales(data);
    console.log('Updated Sales Data:', {
      todaySales: this.todaySales,
      todayPercentage: this.todayPercentage,
      monthlySales: this.monthlySales,
      monthlyPercentage: this.monthlyPercentage,
      totalSalesFY: this.totalSalesFY,
      totalPercentageFY: this.totalPercentageFY,
      fiscalYearTitle: this.fiscalYearTitle
    });
  }

  // Get the correct sales date
  getItemDate(item: any): Date {
    if (item.salesDate) {
      return new Date(item.salesDate); // Already in ms
    } else if (item.createdAt?.seconds) {
      return new Date(item.createdAt.seconds * 1000); // Firestore timestamp
    }
    return new Date(); // fallback
  }


  calculateDailySales(data: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let todayQuantity = 0;
    let yesterdayQuantity = 0;
    let last10DaysQuantity = 0;

    // Start date = 9 days before today
    const last10DaysStart = new Date(today);
    last10DaysStart.setDate(today.getDate() - 9);

    data.forEach(item => {
      const itemDate = this.getItemDate(item);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        todayQuantity += item.quantity;
      } else if (itemDate.getTime() === yesterday.getTime()) {
        yesterdayQuantity += item.quantity;
      }

      // ✅ Include sales within the last 10 days (including today)
      if (itemDate.getTime() >= last10DaysStart.getTime() && itemDate.getTime() <= today.getTime()) {
        last10DaysQuantity += item.quantity;
      }
    });

    this.todaySales = todayQuantity;
    this.yesterdaySales = yesterdayQuantity;
    this.last10DaysSales = last10DaysQuantity; // <-- new field

    if (todayQuantity === 0) {
      this.todayPercentage = yesterdayQuantity > 0 ? '100% Higher Than Today' : 'No sales today';
    } else {
      const percentage = ((yesterdayQuantity - todayQuantity) / todayQuantity) * 100;
      this.todayPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Today`;
    }

  }



  calculateMonthlySales(data: any[]) {
    // First, update last 12 months data
    this.calculateLast12MonthsSales(data);

    // Set current month and last month sales from monthlyChartData
    const lastIndex = this.monthlyChartData.length - 1;
    const secondLastIndex = this.monthlyChartData.length - 2;

    this.currentMonthSales = this.monthlyChartData[lastIndex] || 0;
    this.lastMonthSales = this.monthlyChartData[secondLastIndex] || 0;

    // ✅ ADD THIS LINE - Set monthlySales to currentMonthSales for the card display
    this.monthlySales = this.currentMonthSales;

    // Calculate percentage difference
    if (this.lastMonthSales === 0) {
      this.monthlyPercentage = this.currentMonthSales > 0
        ? '100% Higher Than Last Month'
        : 'No sales last month';
    } else {
      const percentage = ((this.currentMonthSales - this.lastMonthSales) / this.lastMonthSales) * 100;
      this.monthlyPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Month`;
    }

    console.log(`Dashboard Monthly Sales: ${this.monthlySales}, Current Month: ${this.currentMonthSales}, Last Month: ${this.lastMonthSales}`);
  }

  calculateFiscalYearSales(data: any[]) {
    const now = new Date();
    let currentFYStart: Date;
    let lastFYStart: Date;
    let lastFYEnd: Date;

    const currentYear = now.getFullYear();

    if (now.getMonth() >= 3) {
      currentFYStart = new Date(currentYear, 3, 1);
      lastFYStart = new Date(currentYear - 1, 3, 1);
      lastFYEnd = new Date(currentYear, 2, 31);
      this.fiscalYearTitle = `Total Sales FY-${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
    } else {
      currentFYStart = new Date(currentYear - 1, 3, 1);
      lastFYStart = new Date(currentYear - 2, 3, 1);
      lastFYEnd = new Date(currentYear - 1, 2, 31);
      this.fiscalYearTitle = `Total Sales FY-${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
    }

    let currentFYQuantity = 0;
    let lastFYQuantity = 0;

    data.forEach(item => {
      const itemDate = this.getItemDate(item);
      if (itemDate >= currentFYStart) {
        currentFYQuantity += item.quantity;
      } else if (itemDate >= lastFYStart && itemDate <= lastFYEnd) {
        lastFYQuantity += item.quantity;
      }
    });

    this.totalSalesFY = currentFYQuantity;
    this.currentYearSales = currentFYQuantity;
    this.lastYearSales = lastFYQuantity;

    if (lastFYQuantity === 0) {
      this.totalPercentageFY = currentFYQuantity > 0 ? '100% Higher Than Last Year' : 'No sales last year';
    } else {
      const percentage = ((currentFYQuantity - lastFYQuantity) / lastFYQuantity) * 100;
      this.totalPercentageFY = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Year`;
    }
  }


  calculateYearlySales(data: any[]): { years: string[], quantities: number[] } {
    const now = new Date();
    const yearlySalesMap = new Map<number, number>();

    // Initialize last 5 years with 0
    for (let i = 0; i < 5; i++) {
      yearlySalesMap.set(now.getFullYear() - i, 0);
    }

    data.forEach(item => {
      const itemDate = this.getItemDate(item);
      const itemYear = itemDate.getFullYear();

      if (yearlySalesMap.has(itemYear)) {
        yearlySalesMap.set(itemYear, yearlySalesMap.get(itemYear)! + item.quantity);
      }
    });

    const sortedYears = Array.from(yearlySalesMap.keys()).sort((a, b) => a - b);
    const sortedQuantities = sortedYears.map(year => yearlySalesMap.get(year)!);

    return {
      years: sortedYears.map(String),
      quantities: sortedQuantities,
    };
  }


  calculateMonthlySalesFromChart() {
    const lastIndex = this.monthlyChartData.length - 1;
    const secondLastIndex = this.monthlyChartData.length - 2;

    this.currentMonthSales = this.monthlyChartData[lastIndex] || 0;
    this.lastMonthSales = this.monthlyChartData[secondLastIndex] || 0;

    // ✅ Set monthlySales for the widget card
    this.monthlySales = this.currentMonthSales;

    if (this.lastMonthSales === 0) {
      this.monthlyPercentage = this.currentMonthSales > 0
        ? '100% Higher Than Last Month'
        : 'No sales last month';
    } else {
      const percentage = ((this.currentMonthSales - this.lastMonthSales) / this.lastMonthSales) * 100;
      this.monthlyPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Month`;
    }

    console.log(`Monthly Sales: ${this.monthlySales}, Percentage: ${this.monthlyPercentage}`);
  }


  getLast10DaysSales(data: any[]): { x: string; y: number }[] {
    const salesMap = new Map<string, number>();
    const now = new Date();

    // Prepare last 10 days map using local time
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0); // Reset time to start of day

      const dateKey = date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0');

      salesMap.set(dateKey, 0);
    }

    // Sum up quantities for each day
    data.forEach((item) => {
      let itemDate: Date | null = null;

      if (item.salesDate) {
        itemDate = new Date(item.salesDate); // already ms
      } else if (item.createdAt?.seconds) {
        itemDate = new Date(item.createdAt.seconds * 1000);
      }

      if (itemDate) {
        itemDate.setHours(0, 0, 0, 0); // Reset to midnight local time

        const itemKey = itemDate.getFullYear() + '-' +
          (itemDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
          itemDate.getDate().toString().padStart(2, '0');

        if (salesMap.has(itemKey)) {
          salesMap.set(itemKey, salesMap.get(itemKey)! + item.quantity);
        }
      }
    });

    // Format final array for chart (e.g., Sep 05)
    return Array.from(salesMap.entries()).map(([dateStr, quantity]) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const label = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });

      return {
        x: label,
        y: quantity,
      };
    });
  }


  calculateLast12MonthsSales(data: any[]) {
    const salesByMonth = new Map<string, number>();
    const now = new Date();

    // Initialize last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYearStr = `${d.getFullYear()}-${d.getMonth() + 1}`;
      salesByMonth.set(monthYearStr, 0);
    }

    data.forEach(item => {
      const itemDate = this.getItemDate(item);
      const monthYearStr = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}`;
      if (salesByMonth.has(monthYearStr)) {
        salesByMonth.set(monthYearStr, salesByMonth.get(monthYearStr)! + item.quantity);
      }
    });

    const sortedMonths = Array.from(salesByMonth.keys()).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    this.monthlyChartLabels = sortedMonths.map(str => {
      const [year, month] = str.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleString('default', { month: 'short' });
    });

    this.monthlyChartData = sortedMonths.map(str => salesByMonth.get(str)!);
  }


  private areachart(years: string[] = [], quantities: number[] = []) {
    this.areaChartOptions = {
      series: [
        {
          name: 'Total Sales',
          data: quantities,
        },
      ],
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#6973C6'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'category',
        categories: years,
        title: {
          text: 'Year', // Added x-axis title
        },
      },
      yaxis: {
        title: {
          text: 'Sale Quantity', // Added y-axis title
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        offsetX: 0,
        offsetY: 0,
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  private barchart(dailySalesData?: { x: string; y: number }[]) {
    const countryData = this.getLast10DaysCountryWiseSales(this.dataSource.data);

    // 📌 Store date mapping for click events
    const dateMapping = this.getDateMappingForCategories(countryData.categories);

    this.barChartOptions = {
      series: countryData.seriesData,
      chart: {
        height: 350,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
        events: {
          // 👇 Add click event handler
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const seriesIndex = config.seriesIndex;
            const dataPointIndex = config.dataPointIndex;

            // Get the country name from the series
            const countryName = countryData.seriesData[seriesIndex].name;

            // Get the date from the category
            const categoryLabel = countryData.categories[dataPointIndex];
            const actualDate = dateMapping[dataPointIndex];

            console.log('Clicked:', {
              country: countryName,
              date: actualDate,
              label: categoryLabel
            });

            // Navigate to detail component with query params
            this.router.navigate(['module/daily-sale-reports'], {
              queryParams: {
                country: countryName,
                date: actualDate
              }
            });
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -5,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '13px',
                fontWeight: 900
              }
            }
          }
        },
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      xaxis: {
        categories: countryData.categories,
        title: {
          text: 'Days',
        },
        labels: {
          style: {
            colors: '#9aa0ac',
          },
        },
      },
      yaxis: {
        title: {
          text: 'Sale Quantity',
        },
        labels: {
          style: {
            colors: ['#9aa0ac'],
          },
        },
      },
      legend: {
        position: 'bottom',
        offsetY: 5,
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function (val: number) {
            return val + ' Products';
          },
        },
      },
    };
  }



// Helper method to attach hover listeners
  private attachBarHoverListeners(chartContext: any, countryData: any, dailyTotals: number[]) {
    const allBars = document.querySelectorAll('.apexcharts-bar-area');

    allBars.forEach((bar: any) => {
      // Remove old listeners
      bar.removeEventListener('mouseenter', bar._hoverHandler);
      bar.removeEventListener('mouseleave', bar._leaveHandler);

      // Hover handler
      bar._hoverHandler = () => {
        const seriesIndex = parseInt(bar.getAttribute('i'));
        const dataPointIndex = parseInt(bar.getAttribute('j'));

        if (!isNaN(seriesIndex) && !isNaN(dataPointIndex)) {
          const hoveredValue = countryData.seriesData[seriesIndex].data[dataPointIndex];

          // Find and update the total label for this column
          const totalLabels = document.querySelectorAll('.apexcharts-datalabel-value');
          if (totalLabels[dataPointIndex]) {
            totalLabels[dataPointIndex].textContent = String(hoveredValue);
          }
        }
      };

      // Leave handler
      bar._leaveHandler = () => {
        const dataPointIndex = parseInt(bar.getAttribute('j'));

        if (!isNaN(dataPointIndex)) {
          // Restore original total
          const totalLabels = document.querySelectorAll('.apexcharts-datalabel-value');
          if (totalLabels[dataPointIndex]) {
            totalLabels[dataPointIndex].textContent = String(dailyTotals[dataPointIndex]);
          }
        }
      };

      bar.addEventListener('mouseenter', bar._hoverHandler);
      bar.addEventListener('mouseleave', bar._leaveHandler);
    });
  }




  // 📌 Helper method to map categories to actual dates
  private getDateMappingForCategories(categories: string[]): string[] {
    const now = new Date();
    const dateMapping: string[] = [];

    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Format as YYYY-MM-DD for easy parsing
      const dateStr = date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0');

      dateMapping.push(dateStr);
    }

    return dateMapping;
  }


  // Chart 1
  private chart1() {
    this.chartOptions = {
      series: [
        {
          name: 'Monthly Sales',
          data: this.monthlyChartData,
        },
      ],
      chart: {
        height: 250,
        type: 'line',
        foreColor: '#9aa0ac',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ['#9F78FF'], // Use a single color since there's one data series
      stroke: {
        curve: 'smooth',
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      markers: {
        size: 3,
      },
      xaxis: {
        categories: this.monthlyChartLabels, // Use the new labels
        title: {
          text: 'Month',
        },
      },
      yaxis: {
        title: {
          text: 'Sale Quantity',
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  // Chart 2
  private chart2() {
    this.chartOptions2 = {
      series: [
        {
          name: 'blue',
          data: [
            {
              x: 'Team A',
              y: [1, 5],
            },
            {
              x: 'Team B',
              y: [4, 6],
            },
            {
              x: 'Team C',
              y: [5, 8],
            },
          ],
        },
        {
          name: 'green',
          data: [
            {
              x: 'Team A',
              y: [2, 6],
            },
            {
              x: 'Team B',
              y: [1, 3],
            },
            {
              x: 'Team C',
              y: [7, 8],
            },
          ],
        },
      ],
      chart: {
        type: 'rangeBar',
        height: 250,
        foreColor: '#9aa0ac',
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      dataLabels: {
        enabled: true,
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }


  calculateZeroSales(salesData: any[], allOutlets: any[]) {
    // If the allOutlets list is empty, we can't do anything.
    if (!allOutlets || allOutlets.length === 0) {
      this.dailyZeroSalesDataSource.data = [];
      this.monthlyZeroSalesDataSource.data = [];
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Group sales by dealerOutlet
    const salesByOutlet = new Map<string, { daily: number; monthly: number }>();

    salesData.forEach(item => {
      const outlet = item.dealerOutlet;
      const itemDate = this.getItemDate(item);  // ✅ use helper
      itemDate.setHours(0, 0, 0, 0);

      if (!salesByOutlet.has(outlet)) {
        salesByOutlet.set(outlet, { daily: 0, monthly: 0 });
      }

      const current = salesByOutlet.get(outlet)!;

      if (itemDate.getTime() === today.getTime()) {
        current.daily += item.quantity;
      }

      if (itemDate >= monthStart) {
        current.monthly += item.quantity;
      }
    });

    // Filter the provided list of outlets
    const dailyZero = allOutlets.filter((outlet: any) => {
      const sales = salesByOutlet.get(outlet.name);
      return !sales || sales.daily === 0;
    });

    const monthlyZero = allOutlets.filter((outlet: any) => {
      const sales = salesByOutlet.get(outlet.name);
      return !sales || sales.monthly === 0;
    });

    this.dailyZeroSalesDataSource.data = dailyZero;
    this.monthlyZeroSalesDataSource.data = monthlyZero;
  }

  calculateCurrentMonthTarget(budgetData: any[], selectedCountries: string[] = []) { // 💡 Added selectedCountries
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based

    // Determine FY
    let currentFY: string;
    if (currentMonth >= 3) {
      currentFY = `${currentYear}-${currentYear + 1}`;
    } else {
      currentFY = `${currentYear - 1}-${currentYear}`;
    }

    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentMonthName = monthNames[currentMonth];
    const lastMonthName = monthNames[(currentMonth - 1 + 12) % 12];
    const lastMonthFY = (currentMonth === 0)
      ? `${currentYear - 1}-${currentYear}`
      : currentFY;

    const isAllSelected = selectedCountries.includes('All') || selectedCountries.length === 0;

    console.log(`Current FY: ${currentFY}, Current Month: ${currentMonthName}, Last Month: ${lastMonthName}`);

    // Filter and Aggregate Current Month Budget
    const currentMonthBudgets = budgetData.filter(b =>
      b.year === currentFY &&
      b.month === currentMonthName &&
      b.status === 'Active' &&
      (isAllSelected || selectedCountries.includes(b.country)) // 💡 Apply Country Filter
    );

    this.currentMonthBudget = currentMonthBudgets.reduce((totalSum: number, budgetItem: any) => {
      if (budgetItem.products) {
        const productSum = budgetItem.products.reduce(
          (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
        );
        return totalSum + productSum;
      }
      return totalSum;
    }, 0);


    // Filter and Aggregate Last Month Budget
    const lastMonthBudgets = budgetData.filter(b =>
      b.year === lastMonthFY &&
      b.month === lastMonthName &&
      b.status === 'Active' &&
      (isAllSelected || selectedCountries.includes(b.country)) // 💡 Apply Country Filter
    );

    this.lastMonthBudget = lastMonthBudgets.reduce((totalSum: number, budgetItem: any) => {
      if (budgetItem.products) {
        const productSum = budgetItem.products.reduce(
          (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
        );
        return totalSum + productSum;
      }
      return totalSum;
    }, 0);

    console.log(`Current Target: ${this.currentMonthBudget}, Last Target: ${this.lastMonthBudget}`);
  }

// 💡 3. Updated calculateMonthlyBudgetTargets to filter and aggregate targets
  private calculateMonthlyBudgetTargets(budgetData: any[], selectedCountries: string[] = []) { // 💡 Added selectedCountries
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based

    // Determine FY
    let currentFY: string;
    if (currentMonth >= 3) {
      currentFY = `${currentYear}-${currentYear + 1}`;
    } else {
      currentFY = `${currentYear - 1}-${currentYear}`;
    }

    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentMonthName = monthNames[currentMonth];
    const lastMonthName = monthNames[(currentMonth - 1 + 12) % 12];
    const lastMonthFY = (currentMonth === 0)
      ? `${currentYear - 1}-${currentYear}`
      : currentFY;

    // Check if we should filter by country
    const isAllSelected = selectedCountries.includes('All') || selectedCountries.length === 0;


    console.log(`Current FY: ${currentFY}, Current Month: ${currentMonthName}, Last Month: ${lastMonthName}`);

    // ====================================================================
    // AGGREGATION LOGIC for Current Month
    // ====================================================================

    // 1. Filter all budget entries for the current month, FY, status, AND country
    const currentMonthBudgets = budgetData.filter(b =>
      b.year === currentFY &&
      b.month === currentMonthName &&
      b.status === 'Active' &&
      (isAllSelected || selectedCountries.includes(b.country)) // 💡 Apply Country Filter
    );

    // 2. Aggregate the targetQuantity from all filtered entries
    this.currentMonthTarget = currentMonthBudgets.reduce((totalSum: number, budgetItem: any) => {
      if (budgetItem.products) {
        const productSum = budgetItem.products.reduce(
          (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
        );
        return totalSum + productSum;
      }
      return totalSum;
    }, 0);


    // ====================================================================
    // AGGREGATION LOGIC for Last Month
    // ====================================================================

    // 1. Filter all budget entries for the last month, FY, status, AND country
    const lastMonthBudgets = budgetData.filter(b =>
      b.year === lastMonthFY &&
      b.month === lastMonthName &&
      b.status === 'Active' &&
      (isAllSelected || selectedCountries.includes(b.country)) // 💡 Apply Country Filter
    );

    // 2. Aggregate the targetQuantity from all filtered entries
    this.lastMonthTarget = lastMonthBudgets.reduce((totalSum: number, budgetItem: any) => {
      if (budgetItem.products) {
        const productSum = budgetItem.products.reduce(
          (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
        );
        return totalSum + productSum;
      }
      return totalSum;
    }, 0);

    console.log(`Monthly → Current Target: ${this.currentMonthTarget}, Last Target: ${this.lastMonthTarget}`);
  }

  // Toggle select/unselect all countries
  toggleSelectAllCountries() {
    const allCountries = [...this._countriesTypes];
    const selectedCountries: string[] = this.countryControl.value || [];

    if (this.isAllCountriesSelected()) {
      // Unselect all
      this.countryControl.setValue([]);
    } else {
      // Select all
      this.countryControl.setValue(allCountries);
    }
  }

// Check if all countries are selected
  isAllCountriesSelected(): boolean {
    const selectedCountries: string[] = this.countryControl.value || [];
    return this._countriesTypes.length > 0 &&
      this._countriesTypes.every(c => selectedCountries.includes(c));
  }


  getLast10DaysCountryWiseSales(data: any[]): {
    categories: string[],
    seriesData: { name: string, data: number[] }[]
  } {
    const now = new Date();
    const last10Days: string[] = [];
    const salesByCountryAndDate = new Map<string, Map<string, number>>();

    // Prepare last 10 days array
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateKey = date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0');

      last10Days.push(dateKey);
    }

    // Initialize country-date map
    const countries = new Set<string>();
    data.forEach(item => {
      if (item.country) {
        countries.add(item.country);
      }
    });

    countries.forEach(country => {
      const dateMap = new Map<string, number>();
      last10Days.forEach(date => dateMap.set(date, 0));
      salesByCountryAndDate.set(country, dateMap);
    });

    // Aggregate sales data
    data.forEach(item => {
      if (!item.country) return;

      let itemDate: Date | null = null;
      if (item.salesDate) {
        itemDate = new Date(item.salesDate);
      } else if (item.createdAt?.seconds) {
        itemDate = new Date(item.createdAt.seconds * 1000);
      }

      if (itemDate) {
        itemDate.setHours(0, 0, 0, 0);
        const itemKey = itemDate.getFullYear() + '-' +
          (itemDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
          itemDate.getDate().toString().padStart(2, '0');

        const countryMap = salesByCountryAndDate.get(item.country);
        if (countryMap && countryMap.has(itemKey)) {
          countryMap.set(itemKey, countryMap.get(itemKey)! + item.quantity);
        }
      }
    });

    // Format categories (x-axis labels)
    const categories = last10Days.map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    });

    // Format series data
    const seriesData = Array.from(salesByCountryAndDate.entries()).map(([country, dateMap]) => ({
      name: country,
      data: last10Days.map(date => dateMap.get(date) || 0)
    }));

    return { categories, seriesData };
  }

  clearCountrySelection(event: MouseEvent) {
    event.stopPropagation();  // prevent dropdown from opening
    this.countryControl.setValue([]);  // clear selection
    this.countrySearchText = '';       // optional: clear search input
  }





}
