import {Component, EnvironmentInjector, Inject, runInInjectionContext} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import { MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import { CommonModule} from "@angular/common";
import {AddDealerService} from "../../add-dealer.service";
import {ActivatedRoute} from "@angular/router";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {map} from "rxjs/operators";
import Swal from "sweetalert2";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltip} from "@angular/material/tooltip";
import {ProductMasterService} from "../../product-master.service";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from "@angular/material/datepicker";
import {DailySalesService} from "../../daily-sales.service";
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-daily-sale-reports',
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
  providers: [{provide: MAT_DIALOG_DATA, useValue: {}}],
  templateUrl: './daily-sale-reports.component.html',
  standalone: true,
  styleUrl: './daily-sale-reports.component.scss'
})
export class DailySaleReportsComponent {
  isEditMode: boolean = false;
  dealerForm: FormGroup;
  dataSource: any[] = [];
  vehicledataSource: any[] = [];
  salesdataSource: any[] = [];
  filteredProducts: any[] = [];
  reportTitle: string = '';
  reportDate: string = '';


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
    private productService:ProductMasterService,
    private dailySlaes: DailySalesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dealerForm = this.fb.group({
      name: [''],
      country: [''],
      division: [''],
      town: [''],
      product: [''],
      period: this.fb.group({   // ✅ date range group
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

    // 🔹 Filter subscription
    // this.nameFilter.valueChanges.subscribe(val => this.filterOptions('name', val || ''));
    // this.outletTypeFilter.valueChanges.subscribe(val => this.filterOptions('outletType', val || ''));
    // this.categoryFilter.valueChanges.subscribe(val => this.filterOptions('category', val || ''));
    // this.divisionFilter.valueChanges.subscribe(val => this.filterOptions('division', val || ''));
    // this.countryFilter.valueChanges.subscribe(val => this.filterOptions('country', val || ''));
    // this.townFilter.valueChanges.subscribe(val => this.filterOptions('town', val || ''));

    // 🔹 Hook filters to filtering logic
    this.nameFilter.valueChanges.subscribe(val => {
      this.filterOptions('name', val || '');
      this.dealerForm.patchValue({ name: val });
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

  loadSalesList() {
    runInInjectionContext(this.injector, () => {
      this.dailySlaes.getDailySalesList().subscribe((data) => {
        this.salesdataSource = data
        this.filteredProducts = [];
        console.log('daily sales',data);
      });
    });
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data: any) => {
        this.dataSource = data;

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

  getDateRanges(currentDate: Date) {
    // Start of month
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Start of financial year (1st April)
    const fyStart = currentDate.getMonth() >= 3
      ? new Date(currentDate.getFullYear(), 3, 1)   // If Apr-Dec
      : new Date(currentDate.getFullYear() - 1, 3, 1); // If Jan-Mar

    return { monthStart, fyStart };
  }


  generateReport(filteredData: any[], reportDate: Date) {
    const { monthStart, fyStart } = this.getDateRanges(reportDate);
    const report: any = {};

    filteredData.forEach(item => {
      const product = item.name;   // 🔹 Match strictly by product name
      const qty = Number(item.quantity) || 0;

      // Handle Firestore timestamp
      const itemDate = item.createdAt?.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date(item.createdAt);

      if (!report[product]) {
        report[product] = { YTD: 0, Month: 0, Day: 0 };
      }

      // YTD
      if (itemDate >= fyStart && itemDate <= reportDate) {
        report[product].YTD += qty;
      }

      // Month
      if (itemDate >= monthStart && itemDate <= reportDate) {
        report[product].Month += qty;
      }

      // Day
      if (
        itemDate.getFullYear() === reportDate.getFullYear() &&
        itemDate.getMonth() === reportDate.getMonth() &&
        itemDate.getDate() === reportDate.getDate()
      ) {
        report[product].Day += qty;
      }
    });

    return report;
  }





  // Filter options logic
  filterOptions(field: string, value: string) {
    const searchTerm = value?.toLowerCase() || '';
    const matched = this.options[field].filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
    this.filteredOptions[field] = [...matched];
  }

// Display selected value in input
  displayFn(value: string) {
    return value ? value : '';
  }



  onSubmit() {
    const filters = this.dealerForm.value;

    let startDate = filters.period?.start ? new Date(filters.period.start) : null;
    let endDate = filters.period?.end ? new Date(filters.period.end) : new Date();
    const today = new Date();

    // ⏰ Normalize start date to 00:00:00
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }

    // ⏰ Normalize end date to 23:59:59
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    // 🔹 Filter sales data
    const filtered = this.salesdataSource.filter(item => {
      const itemDate = item.createdAt?.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date(item.createdAt);

      return (
        (!filters.country || item.country === filters.country) &&
        (!filters.name || item.dealerOutlet === filters.name) &&
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)
      );
    });

    // 🔹 Normal report (for Month + YTD)
    const report = this.generateReport(filtered, endDate);

    // 🔹 Day report
    let todayReport: any = {};
    const todayNormalized = new Date();
    todayNormalized.setHours(0, 0, 0, 0);

    if (todayNormalized >= (startDate || todayNormalized) && todayNormalized <= endDate) {
      todayReport = this.generateReport(filtered, today);
    }

    // 🔹 Check if single day selection (ignore time portion)
    const isSingleDay =
      startDate &&
      endDate &&
      startDate.toDateString() === endDate.toDateString();

    // 🔹 Step 1: Build raw rows
    let tempRows = this.vehicledataSource.map(prod => {
      const key = prod.name;
      const displayName = prod.model || prod.name;

      const day = isSingleDay
        ? report[key]?.Day || 0
        : todayReport[key]?.Day || 0;

      const month = isSingleDay
        ? report[key]?.Day || 0
        : report[key]?.Month || 0;

      const ytd = isSingleDay
        ? report[key]?.Day || 0
        : report[key]?.YTD || 0;

      return {
        product: displayName,  // 👈 use model name for grouping
        Day: day,
        Month: month,
        YTD: ytd,
      };
    });

    // 🔹 Step 2: Group by product (model) and sum values
    const grouped: any = {};
    tempRows.forEach(row => {
      if (!grouped[row.product]) {
        grouped[row.product] = { product: row.product, Day: 0, Month: 0, YTD: 0 };
      }
      grouped[row.product].Day += row.Day;
      grouped[row.product].Month += row.Month;
      grouped[row.product].YTD += row.YTD;
    });

    this.filteredProducts = Object.values(grouped);

    // 🔹 Totals row
    this.filteredProducts.push({
      product: 'TOTAL',
      Day: this.filteredProducts.reduce((s: number, r: any) => s + r.Day, 0),
      Month: this.filteredProducts.reduce((s: number, r: any) => s + r.Month, 0),
      YTD: this.filteredProducts.reduce((s: number, r: any) => s + r.YTD, 0),
    });

    // 🔹 Report title
    if (filters.name) {
      this.reportTitle = `Cumulative for the month - ${filters.name}`;
    } else if (filters.country) {
      this.reportTitle = `Cumulative for the month`;
    } else {
      this.reportTitle = `Sales Report`;
    }

    // 🔹 Report date display
    if (isSingleDay) {
      this.reportDate = endDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } else if (startDate) {
      const startStr = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const endStr = endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      this.reportDate = `${startStr} - ${endStr}`;
    } else {
      this.reportDate = endDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  }





  onCancel() {
    this.dealerForm.reset();
    this.filteredProducts = [];
    Object.keys(this.options).forEach(key => {
      this.filteredOptions[key] = [...this.options[key]];
    });
    this.nameFilter.reset();
    this.divisionFilter.reset();
    this.countryFilter.reset();
    this.townFilter.reset();
    this.productFilter.reset();
  }

  exportToExcel() {
    if (!this.filteredProducts || this.filteredProducts.length === 0) {
      Swal.fire('Info', 'No data available to export', 'info');
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    const colCount = this.filteredProducts.length + 1; // +1 for "Particulars"

    // 🔹 Report title row (yellow background)
    const titleRow = worksheet.addRow([this.reportTitle || 'Cumulative for the month']);
    worksheet.mergeCells(1, 1, 1, colCount);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.height = 20;
    titleRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' } // Yellow
      };
    });

    // 🔹 Report date row (yellow background)
    const dateRow = worksheet.addRow([this.reportDate || '']);
    worksheet.mergeCells(2, 1, 2, colCount);
    dateRow.alignment = { vertical: 'middle', horizontal: 'center' };
    dateRow.height = 20;
    dateRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' } // Yellow
      };
    });

    worksheet.addRow([]); // empty row

    // 🔹 Header row (orange background, products horizontally)
    const headers = ['Particulars', ...this.filteredProducts.map(p => p.product)];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.height = 40; // make room for wrapping
    headerRow.eachCell(c => {
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F4B083' } // Orange (you can change to ED7D31 for darker orange)
      };
    });

    // 🔹 Data rows
// 🔹 Data rows (new order: Day → Month → YTD)
    const dayRow   = worksheet.addRow(['Sales for the day', ...this.filteredProducts.map(p => p.Day)]);
    const monthRow = worksheet.addRow(['Cumulative for the month', ...this.filteredProducts.map(p => p.Month)]);
    const ytdRow   = worksheet.addRow(['YTD', ...this.filteredProducts.map(p => p.YTD)]);


    // 🔹 Apply border + center alignment to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber !== headerRow.number) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // 🔹 Adjust column widths
    worksheet.columns.forEach((col, index) => {
      col.width = index === 0 ? 25 : 12;
    });

    // 🔹 Save file
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `Sales_Report_${this.reportDate}.xlsx`);
    });
  }

}
