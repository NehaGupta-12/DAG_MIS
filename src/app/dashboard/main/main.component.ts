import { Component, ViewChild, OnInit } from '@angular/core';

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
  ],
})
export class MainComponent implements OnInit {
  @ViewChild('chart', { static: false }) chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  public chartOptions2!: Partial<ChartOptions>;
  public areaChartOptions!: Partial<ChartOptions>;
  public barChartOptions!: Partial<ChartOptions>;

  constructor() {
    //constructor
  }

  ngOnInit() {
    this.chart1();
    this.chart2();
    this.areachart();
    this.barchart();
  }

  private areachart() {
    this.areaChartOptions = {
      series: [
        {
          name: 'New Clients',
          data: [31, 40, 28, 51, 42, 85, 77],
        },
        {
          name: 'Old Clients',
          data: [11, 32, 45, 32, 34, 52, 41],
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
      colors: ['#FC8380', '#6973C6'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '2018-09-19',
          '2018-09-20',
          '2018-09-21',
          '2018-09-22',
          '2018-09-23',
          '2018-09-24',
          '2018-09-25',
        ],
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

  private barchart() {
    this.barChartOptions = {
      series: [
        {
          name: 'Actual',
          data: [
            {
              x: '2011',
              y: 1292,
              goals: [
                {
                  name: 'Expected',
                  value: 1400,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
            {
              x: '2012',
              y: 4432,
              goals: [
                {
                  name: 'Expected',
                  value: 5400,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
            {
              x: '2013',
              y: 5423,
              goals: [
                {
                  name: 'Expected',
                  value: 5200,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
            {
              x: '2014',
              y: 6653,
              goals: [
                {
                  name: 'Expected',
                  value: 6500,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
            {
              x: '2015',
              y: 8133,
              goals: [
                {
                  name: 'Expected',
                  value: 6600,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
            {
              x: '2016',
              y: 7132,
              goals: [
                {
                  name: 'Expected',
                  value: 7500,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
            {
              x: '2017',
              y: 7332,
              goals: [
                {
                  name: 'Expected',
                  value: 8700,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
            {
              x: '2018',
              y: 6553,
              goals: [
                {
                  name: 'Expected',
                  value: 7300,
                  strokeWidth: 10,
                  strokeColor: '#fc8380',
                },
              ],
            },
          ],
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
        enabled: false,
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
        show: true,
        showForSingleSeries: true,
        offsetX: 0,
        offsetY: 0,
        position: 'top',
        customLegendItems: ['Actual', 'Expected'],
        markers: {
          fillColors: ['#6973c6', '#fc8380'],
        },
      },
    };
  }

  // Chart 1
  private chart1() {
    this.chartOptions = {
      series: [
        {
          name: 'High - 2013',
          data: [15, 13, 30, 23, 13, 32, 27],
        },
        {
          name: 'Low - 2013',
          data: [12, 25, 14, 18, 27, 13, 21],
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
      colors: ['#9F78FF', '#858585'],
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
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        title: {
          text: 'Month',
        },
      },
      yaxis: {
        min: 5,
        max: 40,
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

  // order data

  orderData = [
    {
      name: 'John Deo',
      orderDate: '15-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user8.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Jens Brincker',
      orderDate: '16-08-2019',
      status: 'Unpaid',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user2.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Mark Hay',
      orderDate: '18-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user3.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Anthony Davie',
      orderDate: '17-08-2019',
      status: 'Unpaid',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user4.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Alan Gilchrist',
      orderDate: '23-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user6.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Sue Woodger',
      orderDate: '26-08-2019',
      status: 'Pending',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user7.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'David Perry',
      orderDate: '29-08-2019',
      status: 'Unpaid',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user8.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Sneha Pandit',
      orderDate: '28-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      receiptIcon: 'far fa-file-pdf tbl-pdf',
      img: 'assets/images/user/user9.jpg',
      actionLink: '#/admin/orders/edit',
    },
  ];

  orderColumnDefinitions = [
    { def: 'name', label: 'Name', type: 'text' },
    { def: 'orderDate', label: 'Order Date', type: 'text' },
    { def: 'status', label: 'Status', type: 'badge' },
    { def: 'phone', label: 'Phone', type: 'phone' },
    { def: 'receiptIcon', label: 'Receipt', type: 'file' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];
}
