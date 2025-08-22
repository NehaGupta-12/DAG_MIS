import { Component, EnvironmentInjector, runInInjectionContext, ViewChild } from '@angular/core';
import { DatePipe } from "@angular/common";
import {
  MatCell, MatColumnDef, MatHeaderCell, MatHeaderRow, MatRow,
  MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import { MatIconButton } from "@angular/material/button";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTooltip } from "@angular/material/tooltip";
import { FeatherIconsComponent } from "@shared/components/feather-icons/feather-icons.component";
import { DealerService } from '../add-dealer.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-dealer-list',
  imports: [
    MatCell,
    MatHeaderCell,
    MatHeaderRow,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatTable,
    MatTooltip,
    MatColumnDef,
    MatTableModule,
    DatePipe,
    FeatherIconsComponent
  ],
  templateUrl: './dealer-list.component.html',
  standalone: true,
  styleUrls: ['./dealer-list.component.scss']
})
export class DealerListComponent {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'serial',
    'name',
    'outletType',
    'division',
    'country',
    'town',
    'category',
    'location',
    'action'
  ];

  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private injector: EnvironmentInjector) {}

  ngOnInit() {
    this.loadDealers();
  }

  loadDealers() {
    this.isLoading = true;
    runInInjectionContext(this.injector, () => {
      const dealerService = this.injector.get(DealerService);
      dealerService.getDealerList().subscribe({
        next: (dealers) => {
          this.dataSource.data = dealers;
          this.isLoading = false;
        },
        error: (err) => {
          console.error("❌ Error fetching dealers:", err);
          this.isLoading = false;
        }
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editDealer(row: any) {
    console.log("Edit Dealer:", row);
  }

  deleteDealer(row: any) {
    runInInjectionContext(this.injector, () => {
      const dealerService = this.injector.get(DealerService);
      dealerService.deleteDealer(row.id).then(() => {
        console.log("✅ Dealer deleted:", row.id);
        this.loadDealers();
      });
    });
  }

  navigateToAddDealer() {
    runInInjectionContext(this.injector, () => {
      const router = this.injector.get(Router);
      router.navigate(['module/add-dealer']);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
