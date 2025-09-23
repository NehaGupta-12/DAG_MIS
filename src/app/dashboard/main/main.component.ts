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
  NgApexchartsModule,
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
import {MatOption, MatSelect} from "@angular/material/select";
import {LoadingService} from "../../Services/loading.service";
import {MatSort} from "@angular/material/sort";
import {AddDealerService} from "../../module/add-dealer.service";
import {MatPaginator} from "@angular/material/paginator";
import {BudgetService} from "../../module/budget.service";
import {MonthlyBudgetService} from "../../module/monthly-budget.service";

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
  ],
  standalone: true
})
export class MainComponent implements OnInit {
  @ViewChild('chart', { static: false }) chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  public chartOptions2!: Partial<ChartOptions>;
  public areaChartOptions!: Partial<ChartOptions>;
  public barChartOptions!: Partial<ChartOptions>;
  dataSource = new MatTableDataSource<any>();
  outletdataSource = new MatTableDataSource<any>([]);
  // Component properties
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
  _countriesTypes$!: Observable<string[]>;
  countryControl = new FormControl('All');
  dailyZeroSalesDataSource = new MatTableDataSource<any>([]);
  monthlyZeroSalesDataSource = new MatTableDataSource<any>([]);
  @ViewChild('dailyPaginator') dailyPaginator!: MatPaginator;
  @ViewChild('monthlyPaginator') monthlyPaginator!: MatPaginator;
  @ViewChild('countrySearchInput') countrySearchInput: ElementRef | undefined;
  _countriesTypes: string[] = []; // To hold the full list of countries
  filteredCountries: string[] = []; // To hold the filtered list for the dropdown
  countrySearchText: string = ''; // To store the search input text
  debounceTimer: any;
  currentMonthBudget: number = 0;
  lastMonthBudget: number = 0;
  currentMonthTarget: number = 0;
  lastMonthTarget: number = 0;

  displayedColumns: string[] = [
    'id',
    'name',
    'country',
    'division',
    'town',
  ];

  constructor(
    private dailySlaes: DailySalesService,
    private injector: EnvironmentInjector,
    private mDatabase: AngularFireDatabase,
    private loadingService : LoadingService,
    private addDealerService: AddDealerService,
    private budgetService: BudgetService,
    private monthlybudgetService: MonthlyBudgetService,
  ) {
    //constructor
    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );

    // Subscribe to the observable to populate the local array
    this._countriesTypes$.subscribe(countries => {
      this._countriesTypes = countries;
      this.filterCountries(); // Initialize the filtered list
    });
  }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.chart1();
    this.chart2();
    this.areachart();
    this.barchart();
    this.DealerList();
    this.loadbudget();
    this.loadMonthlyBudget();

    this.countryControl.valueChanges
      .pipe(startWith(this.countryControl.value))
      .subscribe((selectedCountry:any) => {
        this.loadSalesList(selectedCountry);
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
        country.toLowerCase().includes(this.countrySearchText.toLowerCase())
      );
    }
  }

// Handles the search input with debouncing
  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.countrySearchText = event.target.value;
      this.filterCountries();
    }, 300); // Adjust the delay as needed
  }

// Resets the search when the dropdown is opened
  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened && this.countrySearchInput) {
      this.countrySearchText = ''; // Clear search text
      this.filterCountries(); // Reset the filtered list
      setTimeout(() => {
        this.countrySearchInput?.nativeElement.focus();
      }, 0);
    }
  }

  ngAfterViewInit() {
    this.dailyZeroSalesDataSource.paginator = this.dailyPaginator;
    this.monthlyZeroSalesDataSource.paginator = this.monthlyPaginator;
  }

  loadSalesList(selectedCountry: string) {
    this.loadingService.setLoading(true);

    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe((data) => {
        let filteredData = data;
        let filteredOutlets = this.outletdataSource.data; // Store a mutable copy

        if (selectedCountry && selectedCountry !== 'All') {
          filteredData = data.filter(item => item.country === selectedCountry);
          filteredOutlets = this.outletdataSource.data.filter(outlet => outlet.country === selectedCountry);
        }

        this.dataSource.data = filteredData;

        // ... (your existing recalculation logic) ...

        // 🔹 Recalculate sales summaries
        // 🔹 Recalculate sales summaries
        this.totalSalesQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
        this.calculateDailySales(filteredData);
        this.calculateLast12MonthsSales(filteredData); // fill monthlyChartData first
        this.calculateMonthlySalesFromChart(); // update info box
        this.calculateFiscalYearSales(filteredData);


        // 🔹 Update charts
        this.chart1();
        const dailySalesData = this.getLast10DaysSales(filteredData);
        this.barchart(dailySalesData);
        const yearlyData = this.calculateYearlySales(filteredData);
        this.areachart(yearlyData.years, yearlyData.quantities);

        // 🔹 Update the zero-sales outlets using the filtered list
        this.calculateZeroSales(filteredData, filteredOutlets);

        this.loadingService.setLoading(false);
      });
    });
  }

  calculateMonthlySalesFromChart() {
    const lastIndex = this.monthlyChartData.length - 1;
    const secondLastIndex = this.monthlyChartData.length - 2;

    this.currentMonthSales = this.monthlyChartData[lastIndex] || 0;
    const lastMonthSales = this.monthlyChartData[secondLastIndex] || 0;

    this.monthlySales = this.currentMonthSales; // ✅ info box value

    if (lastMonthSales === 0) {
      this.monthlyPercentage = this.currentMonthSales > 0
        ? '100% Higher Than Last Month'
        : 'No sales last month';
    } else {
      const percentage = ((this.currentMonthSales - lastMonthSales) / lastMonthSales) * 100;
      this.monthlyPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Month`;
    }

    console.log(`Info Box → Monthly Sales: ${this.monthlySales}, Percentage: ${this.monthlyPercentage}`);
  }



  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data: any[]) => {
        this.outletdataSource.data = data;   // ✅ correct
      });
    });
  }


  loadbudget() {
    runInInjectionContext(this.injector, () => {
      this.budgetService.getBudgetList().subscribe({
        next: (data: any[]) => {
          console.log("Raw Data:", data);
          this.calculateCurrentMonthTarget(data);
        },
      });
    });
  }

  loadMonthlyBudget() {
    runInInjectionContext(this.injector, () => {
      this.monthlybudgetService.getBudgetList().subscribe({
        next: (data: any[]) => {
          console.log("Monthly Raw Data:", data);
          this.calculateMonthlyBudgetTargets(data);
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

    if (yesterdayQuantity === 0) {
      this.todayPercentage = todayQuantity > 0 ? '100% Higher Than Yesterday' : 'No sales yesterday';
    } else {
      const percentage = ((todayQuantity - yesterdayQuantity) / yesterdayQuantity) * 100;
      this.todayPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Yesterday`;
    }

    console.log(`Today: ${this.todaySales}, Yesterday: ${this.yesterdaySales}, Last 10 Days: ${this.last10DaysSales}`);
  }



  calculateMonthlySales(data: any[]) {
    // First, update last 12 months data
    this.calculateLast12MonthsSales(data);

    // Set current month and last month sales from monthlyChartData
    const lastIndex = this.monthlyChartData.length - 1;
    const secondLastIndex = this.monthlyChartData.length - 2;

    this.currentMonthSales = this.monthlyChartData[lastIndex] || 0;
    const lastMonthSales = this.monthlyChartData[secondLastIndex] || 0;

    // Calculate percentage difference
    if (lastMonthSales === 0) {
      this.monthlyPercentage = this.currentMonthSales > 0
        ? '100% Higher Than Last Month'
        : 'No sales last month';
    } else {
      const percentage = ((this.currentMonthSales - lastMonthSales) / lastMonthSales) * 100;
      this.monthlyPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Month`;
    }

    console.log(`Dashboard Monthly Sales: ${this.currentMonthSales}, Last Month: ${lastMonthSales}`);
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

  private barchart(dailySalesData: { x: string; y: number }[] = []) {
    this.barChartOptions = {
      series: [
        {
          name: 'Daily Sales',
          data: dailySalesData,
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
        foreColor: '#9aa0ac',
      },
      plotOptions: {
        bar: {
          columnWidth: '60%',
        },
      },
      colors: ['#6973c6'],
      dataLabels: {
        enabled: true,
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
      legend: {
        show: false,
      },
      xaxis: {
        title: {
          text: 'Days',
        },
      },
      yaxis: {
        title: {
          text: 'Sale Quantity',
        },
      },
    };
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

  calculateCurrentMonthTarget(budgetData: any[]) {
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
      ? `${currentYear - 1}-${currentYear}` // If Jan, last month is Dec in prev FY
      : currentFY;

    console.log(`Current FY: ${currentFY}, Current Month: ${currentMonthName}, Last Month: ${lastMonthName}`);

    // Find current month budget
    const currentMonthBudget = budgetData.find(b =>
      b.year === currentFY && b.month === currentMonthName && b.status === 'Active'
    );

    if (currentMonthBudget && currentMonthBudget.products) {
      this.currentMonthBudget = currentMonthBudget.products.reduce(
        (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
      );
    } else {
      this.currentMonthBudget = 0;
    }

    // Find last month budget
    const lastMonthBudget = budgetData.find(b =>
      b.year === lastMonthFY && b.month === lastMonthName && b.status === 'Active'
    );

    if (lastMonthBudget && lastMonthBudget.products) {
      this.lastMonthBudget = lastMonthBudget.products.reduce(
        (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
      );
    } else {
      this.lastMonthBudget = 0;
    }

    console.log(`Current Target: ${this.currentMonthBudget}, Last Target: ${this.lastMonthBudget}`);
  }


  private calculateMonthlyBudgetTargets(budgetData: any[]) {
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
      ? `${currentYear - 1}-${currentYear}` // If Jan, last month is Dec in prev FY
      : currentFY;

    console.log(`Current FY: ${currentFY}, Current Month: ${currentMonthName}, Last Month: ${lastMonthName}`);

    // ---- Current Month ----
    const currentMonthBudget = budgetData.find(b =>
      b.year === currentFY && b.month === currentMonthName && b.status === 'Active'
    );

    if (currentMonthBudget && currentMonthBudget.products) {
      this.currentMonthTarget = currentMonthBudget.products.reduce(
        (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
      );
    } else {
      this.currentMonthTarget = 0;
    }

    // ---- Last Month ----
    const lastMonthBudget = budgetData.find(b =>
      b.year === lastMonthFY && b.month === lastMonthName && b.status === 'Active'
    );

    if (lastMonthBudget && lastMonthBudget.products) {
      this.lastMonthTarget = lastMonthBudget.products.reduce(
        (sum: number, p: any) => sum + (p.targetQuantity || 0), 0
      );
    } else {
      this.lastMonthTarget = 0;
    }

    console.log(`Monthly → Current Target: ${this.currentMonthTarget}, Last Target: ${this.lastMonthTarget}`);
  }



}
