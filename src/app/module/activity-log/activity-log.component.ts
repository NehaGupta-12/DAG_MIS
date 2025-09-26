// import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild, OnDestroy} from '@angular/core';
//
// import { Subject, takeUntil, map,pipe } from "rxjs";
// import { MatPaginator } from "@angular/material/paginator";
// import { MatSort } from "@angular/material/sort";
// import {
//   MatCell, MatCellDef,
//   MatColumnDef,
//   MatHeaderCell, MatHeaderCellDef,
//   MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef,
//   MatTable,
//   MatTableDataSource
// } from "@angular/material/table";
// import { ActivityLogService } from "./activity-log.service";
// import { AuthService } from "../../authentication/auth.service";
// import { Router } from "@angular/router";
// import { MatDialog } from "@angular/material/dialog";
// import {MatFormField, MatOption, MatSelect, MatSelectChange} from "@angular/material/select";
// import {MatCard} from "@angular/material/card";
// import {FormsModule} from "@angular/forms";
// import {MatInput, MatLabel} from "@angular/material/input";
// import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
// import {MatIconButton, MatMiniFabButton} from "@angular/material/button";
// import {MatTooltip} from "@angular/material/tooltip";
// import {CommonModule,   DatePipe} from "@angular/common";
// import {MatIcon} from "@angular/material/icon";
// import {MatNativeDateModule} from "@angular/material/core";
// // import { ChangesComponent } from "./changes.component"; // ✅ ensure path
//
// export interface ActivityLog {
//   id?: string;
//   date: number;
//   section: string;
//   action: string;
//   user?: string;
//   description?: string;
//   currentIp?: string;
//   changes?: any[]; // array
//   key?: string;
// }
//
//
// @Component({
//   selector: 'app-activity-log',
//   standalone: true,
//   imports: [
//     MatCard,
//     MatFormField,
//     MatSelect,
//     MatOption,
//     FormsModule,
//     MatInput,
//     MatDatepickerInput,
//     MatDatepickerToggle,
//     MatDatepicker,
//     MatMiniFabButton,
//     MatTooltip,
//     MatTable,
//     MatSort,
//     MatColumnDef,
//     MatHeaderCell,
//     MatCell,
//     DatePipe,
//     MatHeaderRow,
//     MatRow,
//     MatPaginator,
//     MatIconButton,
//     MatCellDef,
//     MatHeaderCellDef,
//     MatLabel,
//     CommonModule,
//     MatIcon,
//     MatNoDataRow,
//     MatRowDef,
//     MatNativeDateModule,
//
//     MatHeaderRowDef
//   ],
//   templateUrl: './activity-log.component.html',
//   styleUrls: ['./activity-log.component.scss']
// })
// export class ActivityLogComponent implements OnInit, OnDestroy {
//   startDateFilter: Date | null = null;
//   endDateFilter: Date | null = null;
//   private _destroyed$ = new Subject();
//
//   @ViewChild(MatPaginator) paginator1!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;
//
//   dataSource: MatTableDataSource<ActivityLog> = new MatTableDataSource<ActivityLog>([]);
//   data: ActivityLog[] = [];
//   filterdata: ActivityLog[] = [];
//
//   displayedColumns: string[] = ['date', 'section', 'action', 'user', 'description', 'currentIp'];
//   // dataSource = new MatTableDataSource<AuditLogElement>([]); // your data type
//
//
//   action: string[] = ['Delete', 'Login', 'Logout', 'Submit', 'Update', 'View'].sort((a, b) => a.localeCompare(b));
//   section: string[] = [
//     "Activity Log",
//     "Dashboard",
//     "Daily Sales",
//     "Daily Stock",
//     "Inventory List",
//     "Master",
//     "Menu List",
//     "Monthly Target",
//     "Operation",
//     "Outlet/Dealer",
//     "Outlet/Dealer Product List",
//     "Product",
//     "Product Master",
//     "Reports",
//     "Role & Permission",
//     "Sales Report",
//     "Stock Report",
//     "Stock Transfer",
//     "Type/Dropdown",
//     "User",
//     "Yearly Budget"
//   ].sort((a, b) => a.localeCompare(b));
//
//   filteredSection: string[] = [];
//   sectionSelected: string = '';
//   searchText: string = '';
//
//   filteredAction: string[] = [];
//   actionSelected: string = '';
//   searchActionText: string = '';
//
//   filterstring = '';
//
//   constructor(
//       private mService: ActivityLogService,
//       public authService: AuthService,
//       private router: Router,
//       private matdialog: MatDialog,
//       private injector : EnvironmentInjector
//   ) {}
//
//   ngOnInit(): void {
//     const hasAccess = this.authService.hasPermission('Activity Log', 'list');
//     if (!hasAccess) {
//       this.router.navigate(['/not-authorized']);
//       return;
//     }
//     runInInjectionContext(this.injector, () => {
//       this.mService.getLogsByCount(3000)
//         .pipe(
//           takeUntil(this._destroyed$),
//           map(changes =>
//             changes.map(c =>
//               ({ key: c.payload.key, ...c.payload.val() })
//             )
//           )
//         ).subscribe(res => {
//         console.log(res);
//         this.data = res.reverse();
//         this.dataSource = new MatTableDataSource<ActivityLog>(this.data);
//         this.dataSource.paginator = this.paginator1;
//         this.dataSource.sort = this.sort;
//       });
//     });
//
//
//     this.filteredSection = [...this.section];
//     this.filteredAction = [...this.action];
//   }
//
//   filterSection() {
//     const search = this.searchText.toLowerCase();
//     this.filteredSection = this.section.filter(item =>
//         item.toLowerCase().includes(search)
//     );
//   }
//
//   filterAction() {
//     const search = this.searchActionText.toLowerCase();
//     this.filteredAction = this.action.filter(item =>
//         item.toLowerCase().includes(search)
//     );
//   }
//
//   ngOnDestroy(): void {
//     this._destroyed$.next(true);
//     this._destroyed$.complete();
//   }
//
//   onAction($event: MatSelectChange) {
//     this.actionSelected = $event.value;
//     this.searchActionText = '';
//     this.filteredAction = [...this.action];
//
//     this.filterdata = ($event.value === 'All')
//         ? this.data
//         : this.data.filter(x => x.action === this.actionSelected);
//
//     this.dataSource.data = this.filterdata;
//   }
//
//   onSection($event: MatSelectChange) {
//     this.sectionSelected = $event.value;
//
//     this.filterdata = ($event.value === 'All')
//         ? this.data
//         : this.data.filter(x => x.section === this.sectionSelected);
//
//     this.dataSource.data = this.filterdata;
//     this.searchText = '';
//     this.filteredSection = [...this.section];
//   }
//
//   clearAll() {
//     this.actionSelected = 'All';
//     this.sectionSelected = 'All';
//     this.startDateFilter = null;
//     this.endDateFilter = null;
//     this.filterstring = '';
//     this.dataSource.data = this.data;
//     this.startDateFilter = null;
//     this.endDateFilter = null;
//     this.dataSource.filter = '';
//   }
//
//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();
//   }
//
//   // applyDateRangeFilter() {
//   //   if (this.startDateFilter && this.endDateFilter) {
//   //     this.filterdata = this.data.filter(x =>
//   //         x.date >= this.startDateFilter!.getTime() &&
//   //         x.date <= this.endDateFilter!.getTime()
//   //     );
//   //     this.dataSource.data = this.filterdata;
//   //   }
//   // }
//   applyDateRangeFilter() {
//     this.dataSource.filterPredicate = (data: ActivityLog) => {
//       const start = this.startDateFilter ? new Date(this.startDateFilter).setHours(0,0,0,0) : null;
//       const end = this.endDateFilter ? new Date(this.endDateFilter).setHours(23,59,59,999) : null;
//       const date = typeof data.date === 'number' ? data.date : new Date(data.date).getTime();
//
//       if (start && end) return date >= start && date <= end;
//       if (start) return date >= start;
//       if (end) return date <= end;
//       return true;
//     };
//
//     this.dataSource.filter = '' + Math.random(); // trigger filter
//   }
//
//
//   // clearAll() {
//   //   this.startDateFilter = null;
//   //   this.endDateFilter = null;
//   //   this.dataSource.filter = ''; // resets date filter
//   // }
//
//
// }
//
//
//

import {
  Component,
  EnvironmentInjector,
  OnInit,
  runInInjectionContext,
  ViewChild,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { Subject, takeUntil, map } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivityLogService } from "./activity-log.service";
import { AuthService } from "../../authentication/auth.service";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";

// Angular Material Modules
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";

export interface ActivityLog {
  id?: string;
  date: number;
  section: string;
  action: string;
  user?: string;
  description?: string;
  currentIp?: string;
  changes?: any[];
  key?: string;
}

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    DatePipe
  ],
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent implements OnInit, AfterViewInit, OnDestroy {
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;
  private _destroyed$ = new Subject();

  @ViewChild(MatPaginator) paginator1!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<ActivityLog> = new MatTableDataSource<ActivityLog>([]);
  data: ActivityLog[] = [];
  filterdata: ActivityLog[] = [];

  displayedColumns: string[] = ['date', 'section', 'action', 'user', 'description', 'currentIp'];

  action: string[] = ['Delete', 'Login', 'Logout', 'Submit', 'Update', 'View'].sort((a, b) => a.localeCompare(b));
  section: string[] = [
    "Activity Log","Dashboard","Daily Sales","Daily Stock","Inventory List",
    "Master","Menu List","Monthly Target","Operation","Outlet/Dealer",
    "Outlet/Dealer Product List","Product","Product Master","Reports",
    "Role & Permission","Sales Report","Stock Report","Stock Transfer",
    "Type/Dropdown","User","Yearly Budget"
  ].sort((a,b) => a.localeCompare(b));

  filteredSection: string[] = [];
  sectionSelected: string = '';
  searchText: string = '';

  filteredAction: string[] = [];
  actionSelected: string = '';
  searchActionText: string = '';

  constructor(
    private mService: ActivityLogService,
    public authService: AuthService,
    private router: Router,
    private matdialog: MatDialog,
    private injector : EnvironmentInjector
  ) {}

  ngOnInit(): void {
    const hasAccess = this.authService.hasPermission('Activity Log', 'list');
    if (!hasAccess) {
      this.router.navigate(['/not-authorized']);
      return;
    }

    runInInjectionContext(this.injector, () => {
      this.mService.getLogsByCount(3000)
        .pipe(
          takeUntil(this._destroyed$),
          map(changes =>
            changes.map(c =>
              ({ key: c.payload.key, ...c.payload.val() })
            )
          )
        ).subscribe(res => {
        this.data = res.reverse();
        this.dataSource.data = this.data;
      });
    });

    this.filteredSection = [...this.section];
    this.filteredAction = [...this.action];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator1;
    this.dataSource.sort = this.sort;
  }

  filterSection() {
    const search = this.searchText.toLowerCase();
    this.filteredSection = this.section.filter(item =>
      item.toLowerCase().includes(search)
    );
  }

  filterAction() {
    const search = this.searchActionText.toLowerCase();
    this.filteredAction = this.action.filter(item =>
      item.toLowerCase().includes(search)
    );
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  onAction($event: MatSelectChange) {
    this.actionSelected = $event.value;
    // this.searchActionText = '';
    // this.filteredAction = [...this.action];
    //
    // this.filterdata = ($event.value === 'All')
    //   ? this.data
    //   : this.data.filter(x => x.action === this.actionSelected);
    //
    // this.dataSource.data = this.filterdata;
    this.applyFilters();
  }

  onSection($event: MatSelectChange) {
    this.sectionSelected = $event.value;

    // this.filterdata = ($event.value === 'All')
    //   ? this.data
    //   : this.data.filter(x => x.section === this.sectionSelected);
    //
    // this.dataSource.data = this.filterdata;
    // this.searchText = '';
    // this.filteredSection = [...this.section];
    this.applyFilters();
  }

  // clearAll() {
  //   this.actionSelected = 'All';
  //   this.sectionSelected = 'All';
  //   this.startDateFilter = null;
  //   this.endDateFilter = null;
  //   this.filterdata = [];
  //   this.dataSource.data = this.data;
  // }

  clearAll() {
    this.sectionSelected = 'All';
    this.actionSelected = 'All';
    this.startDateFilter = null;
    this.endDateFilter = null;
    this.searchText = '';
    this.searchActionText = '';
    this.dataSource.data = this.data;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilters() {
    this.dataSource.data = this.data.filter(item => {
      const sectionMatch = !this.sectionSelected || this.sectionSelected === 'All' || item.section === this.sectionSelected;
      const actionMatch = !this.actionSelected || this.actionSelected === 'All' || item.action === this.actionSelected;

      const start = this.startDateFilter ? new Date(this.startDateFilter).setHours(0,0,0,0) : null;
      const end = this.endDateFilter ? new Date(this.endDateFilter).setHours(23,59,59,999) : null;
      const date = typeof item.date === 'number' ? item.date : new Date(item.date).getTime();
      const dateMatch = (!start || date >= start) && (!end || date <= end);

      return sectionMatch && actionMatch && dateMatch;
    });

  }
  applyDateRangeFilter() {
    this.applyFilters();
  }


}
