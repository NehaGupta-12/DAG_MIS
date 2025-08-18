import { Component, OnInit, ViewChild } from '@angular/core';

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
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  series2: ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  tooltip: ApexTooltip;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  labels: string[];
  responsive: ApexResponsive[];
};

@Component({
    selector: 'app-dashboard3',
    templateUrl: './dashboard3.component.html',
    styleUrls: ['./dashboard3.component.scss'],
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        NgApexchartsModule,
        MatCardModule,
        NgScrollbarModule,
        TableCardComponent,
    ]
})
export class Dashboard3Component implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public pieChartOptions!: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Angular',
          data: [45, 52, 38, 24, 33, 26, 21],
        },
        {
          name: 'Wordpress',
          data: [35, 41, 62, 42, 13, 18, 29],
        },
        {
          name: 'Java',
          data: [87, 57, 74, 99, 75, 38, 62],
        },
      ],
      chart: {
        height: 300,
        type: 'line',
        foreColor: '#9aa0ac',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 5,
        curve: 'straight',
        dashArray: [0, 8, 5],
      },

      legend: {
        tooltipHoverFormatter: function (val, opts) {
          return (
            val +
            ' - <strong>' +
            opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
            '</strong>'
          );
        },
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        labels: {
          trim: false,
        },
        categories: ['2010', '2011', '2012', '2013', '2014', '2015', '2016'],
      },
      tooltip: {
        theme: 'dark',
        y: [
          {
            title: {
              formatter: function (val: string) {
                return val + ' (mins)';
              },
            },
          },
          {
            title: {
              formatter: function (val: string) {
                return val + ' per session';
              },
            },
          },
          {
            title: {
              formatter: function (val: string) {
                return val;
              },
            },
          },
        ],
      },
      grid: {
        borderColor: '#f1f1f1',
      },
    };
  }

  // Line chert start
  public lineChartOptions = {
    responsive: !0,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            fontColor: '#bdb5b5',
          },
        },
      ],
      yAxes: [
        {
          display: true,
          ticks: {
            padding: 10,
            stepSize: 25,
            max: 100,
            min: 0,
            fontColor: '#bdb5b5',
          },
          gridLines: {
            display: true,
            draw1Border: !1,
            lineWidth: 0.5,
            zeroLineColor: 'transparent',
            drawBorder: false,
          },
        },
      ],
    },
  };
  lineChartData = [
    {
      data: [20, 60, 25, 75, 90, 40, 43],
      borderWidth: 3,
      borderColor: '#D07BED',
      pointBackgroundColor: '#D07BED',
      pointBorderColor: '#D07BED',
      pointHoverBackgroundColor: '#FFF',
      pointHoverBorderColor: '#D07BED',
      pointRadius: 5,
      pointHoverRadius: 6,
      fill: !1,
    },
    {
      data: [25, 20, 70, 58, 35, 80, 80],
      borderWidth: 3,
      borderColor: '#51CCA9',
      pointBackgroundColor: '#51CCA9',
      pointBorderColor: '#51CCA9',
      pointHoverBackgroundColor: '#FFF',
      pointHoverBorderColor: '#51CCA9',
      pointRadius: 5,
      pointHoverRadius: 6,
      fill: !1,
    },
  ];

  lineChartLabels = ['2001', '2002', '2003', '2004', '2005', '2006', '2007'];

  // Line chert end

  private smallChart2() {
    this.pieChartOptions = {
      series2: [44, 55, 13, 43, 22],
      chart: {
        type: 'donut',
        width: 250,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      labels: ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5'],
      responsive: [
        {
          breakpoint: 480,
          options: {},
        },
      ],
    };
  }

  ngOnInit() {
    this.smallChart2();
  }

  // projects

  projectData = [
    {
      projectName: 'Project A',
      employeesTeam: [
        { name: 'John Doe', avatar: 'user1.jpg' },
        { name: 'Jane Smith', avatar: 'user2.jpg' },
        { name: 'Bob Johnson', avatar: 'user3.jpg' },
        { name: 'Alice Williams', avatar: 'user4.jpg' },
      ],
      teamLeader: 'John Doe',
      priority: 'Medium',
      status: 'Pending',
      documents: 'Contract.pdf',
    },
    {
      projectName: 'Project B',
      employeesTeam: [
        { name: 'Sarah Smith', avatar: 'user7.jpg' },
        { name: 'Michael Johnson', avatar: 'user2.jpg' },
        { name: 'Emily Davis', avatar: 'user8.jpg' },
      ],
      teamLeader: 'Sarah Smith',
      priority: 'Low',
      status: 'In Progress',
      documents: 'Proposal.pdf',
    },
    {
      projectName: 'Project C',
      employeesTeam: [
        { name: 'Olivia Brown', avatar: 'user9.jpg' },
        { name: 'James Lee', avatar: 'user10.jpg' },
        { name: 'Sophia Wilson', avatar: 'user11.jpg' },
      ],
      teamLeader: 'Olivia Brown',
      priority: 'High',
      status: 'Completed',
      documents: 'Final_Report.pdf',
    },
    {
      projectName: 'Project D',
      employeesTeam: [
        { name: 'David Martinez', avatar: 'user2.jpg' },
        { name: 'Isabella Taylor', avatar: 'user8.jpg' },
        { name: 'Lucas White', avatar: 'user7.jpg' },
      ],
      teamLeader: 'David Martinez',
      priority: 'Low',
      status: 'Pending',
      documents: 'Initial_Design.pdf',
    },
    {
      projectName: 'Project E',
      employeesTeam: [
        { name: 'Ethan Green', avatar: 'user5.jpg' },
        { name: 'Mia Clark', avatar: 'user6.jpg' },
        { name: 'Daniel Harris', avatar: 'user9.jpg' },
        { name: 'Charlotte Lewis', avatar: 'user8.jpg' },
      ],
      teamLeader: 'Ethan Green',
      priority: 'Medium',
      status: 'Completed',
      documents: 'Budget_Sheet.xlsx',
    },
    {
      projectName: 'Project F',
      employeesTeam: [
        { name: 'Jack Robinson', avatar: 'user2.jpg' },
        { name: 'Lily Walker', avatar: 'user1.jpg' },
        { name: 'Henry Adams', avatar: 'user4.jpg' },
      ],
      teamLeader: 'Jack Robinson',
      priority: 'High',
      status: 'In Progress',
      documents: 'Timeline_GanttChart.xlsx',
    },
    {
      projectName: 'Project G',
      employeesTeam: [
        { name: 'Ava Scott', avatar: 'user2.jpg' },
        { name: 'David Moore', avatar: 'user5.jpg' },
        { name: 'Emma Taylor', avatar: 'user4.jpg' },
        { name: 'Lucas White', avatar: 'user7.jpg' },
        { name: 'Pankaj Patel', avatar: 'user3.jpg' },
      ],
      teamLeader: 'Ava Scott',
      priority: 'Low',
      status: 'Completed',
      documents: 'Research_Notes.pdf',
    },
    {
      projectName: 'Project H',
      employeesTeam: [
        { name: 'Sophia Miller', avatar: 'user10.jpg' },
        { name: 'Jackson Harris', avatar: 'user11.jpg' },
        { name: 'Ella Clark', avatar: 'user2.jpg' },
      ],
      teamLeader: 'Sophia Miller',
      priority: 'High',
      status: 'Completed',
      documents: 'User_Guide.pdf',
    },
  ];

  projectColumnDefinitions = [
    { def: 'projectName', label: 'Project Name', type: 'text' },
    { def: 'employeesTeam', label: 'Employee Team', type: 'team' },
    { def: 'teamLeader', label: 'Team Leaders', type: 'text' },
    { def: 'priority', label: 'Priority', type: 'priority' },
    { def: 'status', label: 'Status', type: 'text' },
    { def: 'documents', label: 'Documents', type: 'file' },
  ];
}
