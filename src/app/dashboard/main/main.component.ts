import {Component, ViewChild, OnInit, runInInjectionContext, EnvironmentInjector} from '@angular/core';

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
import {AsyncPipe, DecimalPipe, NgForOf} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {MatError, MatFormField, MatLabel} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {LoadingService} from "../../Services/loading.service";
import {MatSort} from "@angular/material/sort";
import {AddDealerService} from "../../module/add-dealer.service";
import {MatPaginator} from "@angular/material/paginator";

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
    NgScrollbar,
    MatButtonModule,
    OrderInfoBoxComponent,
    MatCardModule,
    NewOrderListComponent,
    TableCardComponent,
    DecimalPipe,
    AsyncPipe,
    FormsModule,
    MatError,
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
  monthlyChartData: number[] = [];
  monthlyChartLabels: string[] = [];
  yesterdaySales: number = 0;
  totalSalesQuantity: number = 0;
  _countriesTypes$!: Observable<string[]>;
  countryControl = new FormControl('All');
  dailyZeroSalesDataSource = new MatTableDataSource<any>([]);
  monthlyZeroSalesDataSource = new MatTableDataSource<any>([]);
  @ViewChild('dailyPaginator') dailyPaginator!: MatPaginator;
  @ViewChild('monthlyPaginator') monthlyPaginator!: MatPaginator;

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
  ) {
    //constructor
    this._countriesTypes$ = this.mDatabase
      .object<{ subcategories: string[] }>('typelist/Countries')
      .valueChanges()
      .pipe(
        map(data => data?.subcategories || [])
      );
  }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.chart1();
    this.chart2();
    this.areachart();
    this.barchart();
    this.DealerList();
    // this.loadSalesList();

    // Subscribe to country dropdown changes
    this.countryControl.valueChanges
      .pipe(startWith(this.countryControl.value)) // Trigger an initial load
      .subscribe((selectedCountry:any) => {
        this.loadSalesList(selectedCountry);
      });

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
        this.totalSalesQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
        this.calculateDailySales(filteredData);
        this.calculateMonthlySales(filteredData);
        this.calculateFiscalYearSales(filteredData);
        this.calculateLast12MonthsSales(filteredData);

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


  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data: any[]) => {
        this.outletdataSource.data = data;   // ✅ correct
        console.log("All Dealers:", data);
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

  calculateDailySales(data: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let todayQuantity = 0;
    let yesterdayQuantity = 0;

    data.forEach(item => {
      const itemDate = new Date(item.createdAt.seconds * 1000);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        todayQuantity += item.quantity;
      } else if (itemDate.getTime() === yesterday.getTime()) {
        yesterdayQuantity += item.quantity;
      }
    });

    this.todaySales = todayQuantity;
    this.yesterdaySales = yesterdayQuantity; // 👈 store it here

    // Optional percentage message
    if (yesterdayQuantity === 0) {
      this.todayPercentage = todayQuantity > 0 ? '100% Higher Than Yesterday' : 'No sales yesterday';
    } else {
      const percentage = ((todayQuantity - yesterdayQuantity) / yesterdayQuantity) * 100;
      this.todayPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Yesterday`;
    }
  }



  calculateMonthlySales(data: any[]) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let currentMonthQuantity = 0;
    let lastMonthQuantity = 0;

    data.forEach(item => {
      const itemDate = new Date(item.createdAt.seconds * 1000);

      if (itemDate >= currentMonthStart) {
        currentMonthQuantity += item.quantity;
      } else if (itemDate >= lastMonthStart && itemDate <= lastMonthEnd) {
        lastMonthQuantity += item.quantity;
      }
    });

    this.monthlySales = currentMonthQuantity;
    if (lastMonthQuantity === 0) {
      this.monthlyPercentage = currentMonthQuantity > 0 ? '100% Higher Than Last Month' : 'No sales last month';
    } else {
      const percentage = ((currentMonthQuantity - lastMonthQuantity) / lastMonthQuantity) * 100;
      this.monthlyPercentage = `${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? 'Higher' : 'Lower'} Than Last Month`;
    }
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
      const itemDate = new Date(item.createdAt.seconds * 1000);
      if (itemDate >= currentFYStart) {
        currentFYQuantity += item.quantity;
      } else if (itemDate >= lastFYStart && itemDate <= lastFYEnd) {
        lastFYQuantity += item.quantity;
      }
    });

    this.totalSalesFY = currentFYQuantity;
    this.currentYearSales = currentFYQuantity; // Assign to new property
    this.lastYearSales = lastFYQuantity; // Assign to new property

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

    // Initialize a map for the last 5 years with a quantity of 0
    for (let i = 0; i < 5; i++) {
      yearlySalesMap.set(now.getFullYear() - i, 0);
    }

    // Iterate through the data and sum quantities by year
    data.forEach(item => {
      // Ensure the data has a valid createdAt timestamp
      if (item.createdAt && item.createdAt.seconds) {
        const itemYear = new Date(item.createdAt.seconds * 1000).getFullYear();
        if (yearlySalesMap.has(itemYear)) {
          yearlySalesMap.set(itemYear, yearlySalesMap.get(itemYear)! + item.quantity);
        }
      }
    });

    // Convert the map to sorted arrays for the chart
    const sortedYears = Array.from(yearlySalesMap.keys()).sort((a, b) => a - b);
    const sortedQuantities = sortedYears.map(year => yearlySalesMap.get(year)!);

    // Return a formatted object with years and quantities
    return {
      years: sortedYears.map(String),
      quantities: sortedQuantities
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
      if (item.createdAt && item.createdAt.seconds) {
        const itemDate = new Date(item.createdAt.seconds * 1000);
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

    // Initialize map for the last 12 months with 0 sales
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYearStr = `${d.getFullYear()}-${d.getMonth() + 1}`;
      salesByMonth.set(monthYearStr, 0);
    }

    // Aggregate sales data by month
    data.forEach(item => {
      if (item.createdAt && item.createdAt.seconds) {
        const itemDate = new Date(item.createdAt.seconds * 1000);
        const monthYearStr = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}`;
        if (salesByMonth.has(monthYearStr)) {
          salesByMonth.set(monthYearStr, salesByMonth.get(monthYearStr)! + item.quantity);
        }
      }
    });

    // Extract and sort the data for the chart
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
    const salesByOutlet = new Map<string, { daily: number, monthly: number }>();

    salesData.forEach(item => {
      const outlet = item.dealerOutlet;
      const itemDate = new Date(item.createdAt.seconds * 1000);
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


}
