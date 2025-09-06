import {
  Component,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from '@angular/material/table';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { StockTransferService } from '../stock-transfer.service';
import { AddDealerService } from '../add-dealer.service';
import {LoadingService} from "../../Services/loading.service";

@Component({
  selector: 'app-stock-transfer-report',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    AsyncPipe,
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
  ],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
  templateUrl: './stock-transfer-report.component.html',
  standalone: true,
  styleUrl: './stock-transfer-report.component.scss',
})
export class StockTransferReportComponent implements OnInit {
  stockTransferForm: FormGroup;
  dealerdataSource = new MatTableDataSource<any>();
  stockTransfers: any[] = [];
  filteredTransfers: any[] = [];
  isLoading: any; // ✅ loader flag

  constructor(
    private fb: UntypedFormBuilder,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private addDealerService: AddDealerService,
    private stockTransferService: StockTransferService,
    private mDatabase: AngularFireDatabase,
    private loadingService: LoadingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.stockTransferForm = this.fb.group({
      fromDealerOutlet: [''],
      toDealerOutlet: [''],
      createdAt: [''],
    });
  }

// Form Controls
  fromDealerFilter = new FormControl('');
  toDealerFilter = new FormControl('');

// Filtered lists
  filteredFromDealers: any[] = [];
  filteredToDealers: any[] = [];

  ngOnInit() {
    this.filteredTransfers = []; // start empty on init

    this.DealerList();
    this.loadStockTransfers();

    this.filteredFromDealers = this.dealerdataSource.data;
    this.filteredToDealers = this.dealerdataSource.data;

    this.fromDealerFilter.valueChanges.subscribe(val => {
      this.filteredFromDealers = this._filterDealers(val || "");
    });

    this.toDealerFilter.valueChanges.subscribe(val => {
      this.filteredToDealers = this._filterDealers(val || "");
    });
  }

// Open dropdown with full list on first click
  openFromDealerDropdown() {
    if (!this.fromDealerFilter.value) {
      this.filteredFromDealers = this.dealerdataSource.data;
    }
  }

  openToDealerDropdown() {
    if (!this.toDealerFilter.value) {
      this.filteredToDealers = this.dealerdataSource.data;
    }
  }

// Filtering logic
  private _filterDealers(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';
    return this.dealerdataSource.data.filter((dealer: any) =>
      dealer.name.toLowerCase().includes(filterValue)
    );
  }

// Show name after selection
  displayDealerFn(dealer: any): string {
    return dealer && dealer.name ? dealer.name : '';
  }

// ✅ Dealer list with loader
  DealerList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe({
        next: (data: any) => {
          this.dealerdataSource.data = data;
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch dealer list', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

// ✅ Stock transfers list with loader
  loadStockTransfers() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.stockTransferService.getStockTransferList().subscribe({
        next: (data: any) => {
          this.stockTransfers = data;
          this.filteredTransfers = []; // keep empty until search
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Failed to fetch stock transfers', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }

  submitForm() {
    const filters = this.stockTransferForm.value;

    if (!filters.fromDealerOutlet && !filters.toDealerOutlet && !filters.createdAt) {
      this.filteredTransfers = [...this.stockTransfers];
    } else {
      this.filteredTransfers = this.stockTransfers.filter((item: any) => {
        const matchFrom = !filters.fromDealerOutlet || item.fromDealerOutlet === filters.fromDealerOutlet;
        const matchTo = !filters.toDealerOutlet || item.toDealerOutlet === filters.toDealerOutlet;
        const matchDate =
          !filters.createdAt ||
          (item.createdAt?.toDate?.().toDateString() === new Date(filters.createdAt).toDateString());

        return matchFrom && matchTo && matchDate;
      });
    }

    Swal.fire('Filtered', `${this.filteredTransfers.length} record(s) found`, 'success');
  }

  onCancel() {
    this.stockTransferForm.reset();
    this.filteredTransfers = [];
  }

// ✅ Delete stock transfer with loader
  deleteStockTransfer(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This record will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(result => {
      if (result.isConfirmed) {
        this.loadingService.setLoading(true); // start loader

        runInInjectionContext(this.injector, () => {
          this.stockTransferService.deleteStockTransfer(id)
            .then(() => {
              Swal.fire('Deleted!', 'Record deleted successfully.', 'success');
              this.loadStockTransfers();
            })
            .catch((err) => {
              console.error('Delete failed', err);
              Swal.fire('Error', 'Failed to delete record.', 'error');
            })
            .finally(() => {
              this.loadingService.setLoading(false); // stop loader
            });
        });
      }
    });
  }

  exportToExcel() {
    if (this.filteredTransfers.length === 0) {
      Swal.fire('No Data', 'No records available to export', 'info');
      return;
    }
    // implement Excel export logic here
  }

}
