import { Component, ElementRef, EnvironmentInjector, Inject, runInInjectionContext, ViewChild } from '@angular/core';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from "@angular/material/autocomplete";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import { MatInput, MatInputModule, MatLabel, MatSuffix } from "@angular/material/input";
import { MatButtonModule, MatMiniFabButton } from "@angular/material/button";
import { CommonModule, NgForOf, NgIf } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from "@angular/forms";
import { AddDealerService } from "../../add-dealer.service";
import { ActivatedRoute } from "@angular/router";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { ProductMasterService } from "../../product-master.service";
import { DailySalesService } from "../../daily-sales.service";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { Workbook } from "exceljs";
import * as FileSaver from "file-saver";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltip } from "@angular/material/tooltip";
import { InventoryService } from "../../add-inventory/inventory.service";
import { AuthService } from "../../../authentication/auth.service";
import { GrnService } from "../../grn.service";


@Component({
  selector: 'app-stock-report',
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
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
  templateUrl: './stock-report.component.html',
  standalone: true,
  styleUrl: './stock-report.component.scss'
})
export class StockReportComponent {
  isEditMode: boolean = false;
  dealerForm: FormGroup;
  dataSource: any[] = [];
  vehicledataSource: any[] = [];
  salesdataSource: any[] = [];
  grnDataSource: any[] = [];
  filteredProducts: any[] = [];
  reportTitle: string = '';
  reportDate: string = '';
  finalTableData: any[] = [];
  selectedCountry: string = '';
  productHeaders: string[] = [];
  tableColumns: string[] = [];
  allOutletReports: { outlet: string; rows: any[] }[] = [];

  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;
  @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;

  debounceTimer: any;

  // Filters
  nameFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');
  productFilter = new FormControl('');

  search: any = {
    name: '',
    division: '',
    country: '',
    town: '',
    product: '',
  };

  options: any = {
    name: [],
    division: [],
    country: [],
    town: [],
    product: [],
  };

  filteredOptions: any = {
    name: [],
    division: [],
    country: [],
    town: [],
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
    private grnService: GrnService,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // initialize name as array because outlets select is multiple
    this.dealerForm = this.fb.group({
      name: this.fb.control([]),
      country: [''],
      division: [''],
      town: [''],
      product: [''],
      period: this.fb.group({
        start: [''],
        end: [''],
      }),
    });

    // Load Firebase options
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Division').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.division = data; this.filteredOptions.division = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletType').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.outletType = data; this.filteredOptions.outletType = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletCategory').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.category = data; this.filteredOptions.category = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Countries').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.country = data; this.filteredOptions.country = [...data]; });
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Town').valueChanges()
      .pipe(map(d => d?.subcategories || [])).subscribe(data => { this.options.town = data; this.filteredOptions.town = [...data]; });
  }

  ngOnInit() {
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
    this.loadGrnData();

    // Hook filters to filtering logic
    this.nameFilter.valueChanges.subscribe(val => {
      this.filterOptions('name', val || '');
      // For search input only; actual form value for outlets is array
    });

    this.divisionFilter.valueChanges.subscribe(val => {
      this.filterOptions('division', val || '');
      this.dealerForm.patchValue({ division: val });
    });

    this.countryFilter.valueChanges.subscribe(val => {
      this.filterOptions('country', val || '');
      this.dealerForm.patchValue({ country: val });
    });

    this.townFilter.valueChanges.subscribe(val => {
      this.filterOptions('town', val || '');
      this.dealerForm.patchValue({ town: val });
    });

    this.productFilter.valueChanges.subscribe(val => {
      this.filterOptions('product', val || '');
      this.dealerForm.patchValue({ product: val });
    });
  }

  // Country
  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const val = (event.target.value || '').toLowerCase();
      this.filteredOptions.country = this.options.country.filter((c: string) =>
        c.toLowerCase().includes(val)
      );
    }, 300);
  }
  onCountrySelectOpened(open: boolean) {
    if (open) {
      this.filteredOptions.country = [...this.options.country];
      setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
    }
  }

  // Division
  onDivisionSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const val = (event.target.value || '').toLowerCase();
      this.filteredOptions.division = this.options.division.filter((d: string) =>
        d.toLowerCase().includes(val)
      );
    }, 300);
  }
  onDivisionSelectOpened(open: boolean) {
    if (open) {
      this.filteredOptions.division = [...this.options.division];
      setTimeout(() => this.divisionSearchInput.nativeElement.focus(), 0);
    }
  }

  // Town
  onTownSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const val = (event.target.value || '').toLowerCase();
      this.filteredOptions.town = this.options.town.filter((t: string) =>
        t.toLowerCase().includes(val)
      );
    }, 300);
  }
  onTownSelectOpened(open: boolean) {
    if (open) {
      this.filteredOptions.town = [...this.options.town];
      setTimeout(() => this.townSearchInput.nativeElement.focus(), 0);
    }
  }

  loadSalesList() {
    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe((data) => {
        this.salesdataSource = data;
        this.filteredProducts = [];
        console.log('daily sales', data);
      });
    });
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data: any) => {
        this.dataSource = data;
        console.log("All Dealers:", data);
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
        // Extract product names for dropdown
        const productNames = Array.from(new Set(data.map((p: any) => p.name).filter(Boolean)));
        this.options.product = productNames;
        this.filteredOptions.product = [...productNames];
        console.log("All Products:", data);
      });
    });
  }

  loadGrnData() {
    runInInjectionContext(this.injector, () => {
      this.grnService.getGrnList().subscribe(data => {
        console.log('GRN Data:', data);
        this.grnDataSource = data;
      });
    });
  }

  getDateRanges(currentDate: Date) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const fyStart = currentDate.getMonth() >= 3
      ? new Date(currentDate.getFullYear(), 3, 1)
      : new Date(currentDate.getFullYear() - 1, 3, 1);
    return { monthStart, fyStart };
  }

  // Filter options logic
  filterOptions(field: string, value: string) {
    const searchTerm = value?.toLowerCase() || '';
    const matched = this.options[field].filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
    this.filteredOptions[field] = [...matched];
  }

  // Outlet(s) helpers (search + open)
  onOutletSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchText = (event.target.value || '').toLowerCase();
      this.filteredOptions.name = this.options.name.filter((o: string) =>
        o.toLowerCase().includes(searchText)
      );
    }, 300);
  }
  onOutletSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.filteredOptions.name = [...this.options.name];
      setTimeout(() => {
        try {
          this.outletSearchInput.nativeElement.focus();
        } catch { }
      }, 0);
    }
  }

  // Build rows for a single outlet (aggregate inventory per product)
  private buildStockRowsForInventory(inventoryItems: any[]) {
    // Map products (use model if available)
    const productKeyToDisplay: Record<string, string> = {};
    this.vehicledataSource.forEach((p: any) => {
      if (p.name) productKeyToDisplay[p.name] = (p.model || p.name).toUpperCase();
    });

    // Aggregate quantities by product name
    const agg: Record<string, number> = {};
    inventoryItems.forEach(item => {
      const key = item.name || 'UNKNOWN';
      agg[key] = (agg[key] || 0) + (Number(item.quantity) || 0);
    });

    // Convert to rows array using the product master order (so all products appear)
    const rows: any[] = this.vehicledataSource.map((p: any) => {
      const key = p.name;
      const qty = agg[key] || 0;
      let rowColor = '';
      if (qty > 10) rowColor = 'green-row';
      else if (qty >= 1) rowColor = 'yellow-row';
      else rowColor = 'red-row';
      return { product: (p.model || p.name).toUpperCase(), Qty: qty, rowColor };
    });

    // Add TOTAL row
    rows.push({
      product: 'TOTAL',
      Qty: rows.reduce((s, r) => s + (r.Qty || 0), 0),
      rowColor: ''
    });

    return rows;
  }

  // onSubmit: produce allOutletReports (mirrors DailySaleReportsComponent logic)
  onSubmit() {
    const filters = this.dealerForm.value;
    const startDate = filters.period?.start ? new Date(filters.period.start) : null;
    const endDate = filters.period?.end ? new Date(filters.period.end) : new Date();

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    const outlets = Array.isArray(filters.name) ? filters.name : (filters.name ? [filters.name] : []);

    this.allOutletReports = [];
    this.reportTitle = 'Stock Report';
    this.selectedCountry = filters.country || '';

    const inventoryFilterFn = (inv: any, outlet: string | null = null) => {
      // date of inventory record
      const invDate = inv?.stockDate
        ? new Date(inv.stockDate)
        : (inv?.createdAt?.seconds ? new Date(inv.createdAt.seconds * 1000) : (inv?.createdAt ? new Date(inv.createdAt) : null));

      if (filters.country && inv.country && inv.country !== filters.country) return false;
      if (filters.division && inv.division && inv.division !== filters.division) return false;
      if (filters.town && inv.town && inv.town !== filters.town) return false;

      if (outlet && inv.dealerOutlet !== outlet) return false;
      // if outlet not provided, we'll still filter dealer info when grouping by dealers below

      if (startDate && invDate && invDate < startDate) return false;
      if (endDate && invDate && invDate > endDate) return false;

      return true;
    };

    // Case 1: no outlet selected => aggregated "All Outlets"
    if (outlets.length === 0) {
      // Filter GRN/inventory globally (respecting country/division/town/date)
      const filtered = this.grnDataSource.filter(inv => {
        // also ensure dealerOutlet exists
        return inventoryFilterFn(inv, null);
      });

      // aggregated across all dealers
      const rows = this.buildStockRowsForInventory(filtered);
      this.allOutletReports.push({ outlet: 'All Outlets', rows });

      // set reportDate text for UI
      this.reportDate = this.getReportDateText(startDate, endDate);
    } else {
      // Case 2: one or more outlets selected -> create a report for each
      outlets.forEach((outlet: string) => {
        const filtered = this.grnDataSource.filter(inv => inventoryFilterFn(inv, outlet));
        const rows = this.buildStockRowsForInventory(filtered);
        this.allOutletReports.push({ outlet, rows });
      });
      this.reportDate = this.getReportDateText(startDate, endDate);
    }
  }

  private getReportDateText(startDate?: Date | null, endDate?: Date | null) {
    let reportDateText = '';
    if (startDate && endDate) {
      const s = startDate.toLocaleDateString();
      const e = endDate.toLocaleDateString();
      reportDateText = `${s} - ${e}`;
    } else if (startDate) {
      reportDateText = new Date(startDate).toLocaleDateString();
    } else {
      reportDateText = new Date().toLocaleDateString();
    }
    return reportDateText;
  }

  onCancel() {
    // Reset
    this.dealerForm.reset();
    // reset name to empty array
    this.dealerForm.patchValue({ name: [] });
    this.filteredProducts = [];
    this.finalTableData = [];
    this.allOutletReports = [];
    Object.keys(this.options).forEach(key => {
      this.filteredOptions[key] = [...this.options[key]];
    });
    this.nameFilter.reset();
    this.divisionFilter.reset();
    this.countryFilter.reset();
    this.townFilter.reset();
    this.productFilter.reset();
    this.reportDate = '';
    this.selectedCountry = '';
    this.reportTitle = '';
  }

  exportToExcel() {
    if (!this.allOutletReports || this.allOutletReports.length === 0) {
      Swal.fire('Info', 'No data available to export', 'info');
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Stock Report");

    let currentRow = 1;
    const reportDateText = this.reportDate || this.getReportDateText(null, null);
    const country = this.dealerForm.value.country || '';

    this.allOutletReports.forEach((report, index) => {
      // Title
      const titleRow = worksheet.addRow([`Stock Report - ${report.outlet}`]);
      worksheet.mergeCells(currentRow, 1, currentRow, 4);
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
      currentRow++;

      // Date / Country row
      const dateRow = worksheet.addRow([`Date: ${reportDateText}${country ? ' | Country: ' + country : ''}`]);
      worksheet.mergeCells(currentRow, 1, currentRow, 4);
      dateRow.alignment = { vertical: 'middle', horizontal: 'center' };
      currentRow++;

      // Header
      const headerRow = worksheet.addRow(['Product', 'Qty']);
      headerRow.font = { bold: true };
      headerRow.eachCell(c => {
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      currentRow++;

      // Data rows
      report.rows.forEach(r => {
        const row = worksheet.addRow([r.product, r.Qty]);
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        currentRow++;
      });

      // spacer
      if (index < this.allOutletReports.length - 1) {
        worksheet.addRow([]);
        currentRow++;
      }
    });

    // column widths
    worksheet.columns.forEach((col, index) => {
      col.width = index === 0 ? 40 : 12;
    });

    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `Stock_Report_${reportDateText}.xlsx`);
    });
  }

  // Display helpers
  displayFn(value: string) {
    return value ? value : '';
  }

}
