import { Component, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexYAxis,
  ApexTooltip,
  ApexMarkers,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexLegend,
  ApexDataLabels,
  ApexGrid,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReportCardWidgetComponent } from '@shared/components/report-card-widget/report-card-widget.component';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import {
  ProgressTableComponent,
  SubjectProgress,
} from '@shared/components/progress-table/progress-table.component';
import { EventCardComponent } from '@shared/components/event-card/event-card.component';
import { TodoWidgetComponent } from '@shared/components/todo-widget/todo-widget.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  labels: string[];
  stroke: ApexStroke;
  markers: ApexMarkers;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  grid: ApexGrid;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: string[];
  tooltip: ApexTooltip;
};

export type smallBarChart = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
};

interface Todo {
  title: string;
  done: boolean;
  priority: 'Low' | 'Normal' | 'High';
}

@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.scss'],
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    NgScrollbar,
    MatCardModule,
    ReportCardWidgetComponent,
    TableCardComponent,
    ProgressTableComponent,
    EventCardComponent,
    TodoWidgetComponent,
  ],
})
export class Dashboard2Component {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  public smallBarChart!: Partial<ChartOptions>;
  public sampleData = [
    31, 40, 28, 44, 60, 55, 68, 51, 42, 85, 77, 31, 40, 28, 44, 60, 55,
  ];

  public smallChart1Options!: Partial<ChartOptions>;
  public smallChart2Options!: Partial<ChartOptions>;
  public smallChart3Options!: Partial<ChartOptions>;
  public smallChart4Options!: Partial<ChartOptions>;
  public bannerChartOptions!: Partial<ChartOptions>;

  constructor() {
    this.chart1();
    this.smallChart();
    this.smallChart1();
    this.smallChart2();
    this.smallChart3();
    this.smallChart4();
    this.bannerChart();
  }

  private smallChart1() {
    this.smallChart1Options = {
      series: [
        {
          name: 'Sales',
          data: [
            50, 61, 80, 50, 72, 52, 60, 41, 30, 45, 70, 40, 93, 63, 50, 62,
          ],
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#9c27b0'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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

  private smallChart2() {
    this.smallChart2Options = {
      series: [
        {
          name: 'Revenue',
          data: [5, 6, 8, 5, 7, 5, 6, 4, 3, 4, 7, 4, 9, 6, 5, 6],
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#ff9800'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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

  private smallChart3() {
    this.smallChart3Options = {
      series: [
        {
          name: 'New Orders',
          data: [
            50, 61, 80, 50, 72, 52, 60, 41, 30, 45, 70, 40, 93, 63, 50, 62,
          ],
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#28c76f'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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

  private smallChart4() {
    this.smallChart4Options = {
      series: [
        {
          name: 'New Customer',
          data: [
            150, 161, 180, 150, 172, 152, 160, 141, 130, 145, 170, 140, 193,
            163, 150, 162,
          ],
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#2196f3'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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

  private bannerChart() {
    this.bannerChartOptions = {
      series: [
        {
          name: 'New Customer',
          data: [
            150, 161, 180, 150, 172, 152, 160, 141, 130, 145, 170, 140, 193,
            163, 150, 162,
          ],
        },
      ],
      chart: {
        height: 120,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#2196f3'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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

  private chart1() {
    this.chartOptions = {
      series: [
        {
          name: 'Project A',
          type: 'column',
          data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
        },
        {
          name: 'Project B',
          type: 'area',
          data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
        },
        {
          name: 'Project C',
          type: 'line',
          data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
        },
      ],
      chart: {
        height: 440,
        type: 'line',
        stacked: false,
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      stroke: {
        width: [0, 2, 5],
        curve: 'smooth',
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
        },
      },

      fill: {
        opacity: [0.85, 0.25, 1],
        gradient: {
          inverseColors: false,
          shade: 'light',
          type: 'vertical',
          opacityFrom: 0.85,
          opacityTo: 0.55,
        },
      },
      labels: [
        '01/01/2003',
        '02/01/2003',
        '03/01/2003',
        '04/01/2003',
        '05/01/2003',
        '06/01/2003',
        '07/01/2003',
        '08/01/2003',
        '09/01/2003',
        '10/01/2003',
        '11/01/2003',
      ],
      markers: {
        size: 0,
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        title: {
          text: 'dollers',
        },
        min: 0,
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
  private smallChart() {
    this.smallBarChart = {
      chart: {
        type: 'bar',
        width: 250,
        height: 70,
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '40%',
        },
      },
      series: [
        {
          name: 'visitors',
          data: this.sampleData,
        },
      ],
      tooltip: {
        theme: 'dark',
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },
        y: {},
        marker: {
          show: false,
        },
      },
    };
  }

  // Recent order data
  orderData = [
    {
      name: 'John Doe',
      item: 'iPhone X',
      status: 'Placed',
      quantity: 2,
      progress: 62, // Progress in percentage
      img: 'assets/images/user/user1.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Sarah Smith',
      item: 'Pixel 2',
      status: 'Shipped',
      quantity: 1,
      progress: 40,
      img: 'assets/images/user/user2.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Airi Satou',
      item: 'OnePlus',
      status: 'Pending',
      quantity: 2,
      progress: 72,
      img: 'assets/images/user/user3.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Angelica Ramos',
      item: 'Galaxy',
      status: 'Delivered',
      quantity: 3,
      progress: 95,
      img: 'assets/images/user/user4.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Ashton Cox',
      item: 'Moto Z2',
      status: 'Placed',
      quantity: 4,
      progress: 87,
      img: 'assets/images/user/user5.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Cara Stevens',
      item: 'Nokia',
      status: 'Placed',
      quantity: 6,
      progress: 62,
      img: 'assets/images/user/user6.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'David Lee',
      item: 'MacBook Pro',
      status: 'Shipped',
      quantity: 1,
      progress: 50,
      img: 'assets/images/user/user7.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Olivia Green',
      item: 'Samsung Note 20',
      status: 'Delivered',
      quantity: 2,
      progress: 95,
      img: 'assets/images/user/user8.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Michael Brown',
      item: 'iPad Pro',
      status: 'Pending',
      quantity: 3,
      progress: 30,
      img: 'assets/images/user/user9.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'Sophia Johnson',
      item: 'Google Pixel 6',
      status: 'Shipped',
      quantity: 2,
      progress: 60,
      img: 'assets/images/user/user10.jpg',
      actionLink: '#/admin/orders/edit',
    },
    {
      name: 'James White',
      item: 'Huawei P30',
      status: 'Placed',
      quantity: 1,
      progress: 90,
      img: 'assets/images/user/user11.jpg',
      actionLink: '#/admin/orders/edit',
    },
  ];

  orderColumnDefinitions = [
    { def: 'name', label: 'Name', type: 'text' },
    { def: 'item', label: 'Item', type: 'text' },
    { def: 'status', label: 'Status', type: 'badge' },
    { def: 'quantity', label: 'Quantity', type: 'number' },
    { def: 'progress', label: 'Progress', type: 'progressBar' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  // Progress table data

  subjects: SubjectProgress[] = [
    { subject: 'Project A', progress: 30, duration: '2 Months' },
    { subject: 'Project B', progress: 55, duration: '3 Months' },
    { subject: 'Project C', progress: 67, duration: '1 Month' },
    { subject: 'Project D', progress: 70, duration: '2 Months' },
    { subject: 'Project E', progress: 24, duration: '3 Months' },
    { subject: 'Project F', progress: 77, duration: '4 Months' },
    { subject: 'Project G', progress: 41, duration: '2 Months' },
  ];

  // Events
  events = [
    {
      day: 'Tuesday',
      date: 4,
      month: 'Jan',
      title: 'Science Fair',
      timeStart: '11:00 AM',
      timeEnd: '12:30 PM',
      status: 'Today',
    },
    {
      day: 'Friday',
      date: 12,
      month: 'Jan',
      title: 'Guest Speaker',
      timeStart: '11:00 AM',
      timeEnd: '12:30 PM',
      status: 'In 8 days',
    },
    {
      day: 'Sunday',
      date: 18,
      month: 'Jan',
      title: 'Art Exhibition Opening',
      timeStart: '01:00 PM',
      timeEnd: '02:30 PM',
      status: 'In 11 days',
    },
    {
      day: 'Wednesday',
      date: 25,
      month: 'Jan',
      title: 'Music Concert',
      timeStart: '07:00 PM',
      timeEnd: '09:00 PM',
      status: 'In 16 days',
    },
    {
      day: 'Saturday',
      date: 28,
      month: 'Jan',
      title: 'Cooking Workshop',
      timeStart: '10:00 AM',
      timeEnd: '01:00 PM',
      status: 'In 19 days',
    },
    {
      day: 'Monday',
      date: 30,
      month: 'Jan',
      title: 'Charity Run',
      timeStart: '08:00 AM',
      timeEnd: '11:00 AM',
      status: 'In 21 days',
    },
  ];

  // TODO start
  tasks: Todo[] = [
    { title: 'Buy groceries', done: false, priority: 'Normal' },
    { title: 'Finish project report', done: false, priority: 'High' },
    { title: 'Clean the house', done: true, priority: 'Low' },
    { title: 'Call the bank', done: false, priority: 'Normal' },
    { title: 'Read a book', done: false, priority: 'Low' },
    { title: 'Schedule doctor appointment', done: false, priority: 'High' },
    { title: 'Prepare for presentation', done: false, priority: 'Normal' },
    { title: 'Exercise for 30 minutes', done: false, priority: 'Normal' },
    { title: 'Finish laundry', done: true, priority: 'Low' },
    { title: 'Write blog post', done: false, priority: 'High' },
    { title: 'Organize workspace', done: false, priority: 'Normal' },
    { title: 'Plan weekend trip', done: false, priority: 'High' },
    { title: 'Buy gifts for friends', done: false, priority: 'Low' },
  ];

  onTodoToggled(todo: any) {
    console.log('Todo toggled:', todo);
  }

  onTodosUpdated(updatedTodos: any[]) {
    console.log('Todos updated:', updatedTodos);
  }
  // TODO end
}
