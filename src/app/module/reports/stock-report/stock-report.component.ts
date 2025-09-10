import {Component, ElementRef, EnvironmentInjector, Inject, runInInjectionContext, ViewChild} from '@angular/core';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableModule
} from "@angular/material/table";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatInput, MatInputModule, MatLabel, MatSuffix} from "@angular/material/input";
import {MatButtonModule, MatMiniFabButton} from "@angular/material/button";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder} from "@angular/forms";
import {AddDealerService} from "../../add-dealer.service";
import {ActivatedRoute} from "@angular/router";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {ProductMasterService} from "../../product-master.service";
import {DailySalesService} from "../../daily-sales.service";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {map} from "rxjs/operators";
import Swal from "sweetalert2";
import {Workbook} from "exceljs";
import * as FileSaver from "file-saver";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltip} from "@angular/material/tooltip";
import {InventoryService} from "../../add-inventory/inventory.service";
import {AuthService} from "../../../authentication/auth.service";


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
    MatTableModule
  ],
  providers: [{provide: MAT_DIALOG_DATA, useValue: {}}],
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
  inventorydataSource: any[] = [];
  filteredProducts: any[] = [];
  reportTitle: string = '';
  reportDate: string = '';
  finalTableData: any[] = [];
  productHeaders: string[] = [];
  tableColumns: string[] = [];
  userData: any;
  userRole: string = '';
  totalRow: any = {};
  footerColumns: string[] = [];
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
    private productService:ProductMasterService,
    private dailySlaes: DailySalesService,
    private inventoryService : InventoryService,
    public authService : AuthService,
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
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        this.userData = JSON.parse(storedUser);

        // store role in a separate variable
        this.userRole = this.userData.role;

        console.log('User Data:', this.userData);
        console.log('User Role:', this.userRole);
      }
    });

    this.loadSalesList();
    this.DealerList();
    this.productList();
    this.loadInventoryDaata();

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

  // Country
  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const val = event.target.value.toLowerCase();
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
      const val = event.target.value.toLowerCase();
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
      const val = event.target.value.toLowerCase();
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

// Outlet
  onOutletSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const val = event.target.value.toLowerCase();
      this.filteredOptions.name = this.options.name.filter((o: string) =>
        o.toLowerCase().includes(val)
      );
    }, 300);
  }
  onOutletSelectOpened(open: boolean) {
    if (open) {
      this.filteredOptions.name = [...this.options.name];
      setTimeout(() => this.outletSearchInput.nativeElement.focus(), 0);
    }
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

  loadInventoryDaata() {
    runInInjectionContext(this.injector, () => {
      this.inventoryService.getInventoryAllData().subscribe(data => {
        console.log('Inventory data:', data);
        this.inventorydataSource = data;
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




  generateHorizontalInventoryReport(selectedOutlets: string[] = [], countryFilter: string | null, divisionFilter: string | null, townFilter: string | null) {
    const allDealers = this.dataSource;
    const allProducts = this.vehicledataSource;
    const inventoryData = this.inventorydataSource;

    const filteredDealers = allDealers.filter(dealer => {
      if (dealer.status !== 'Active') return false;
      if (countryFilter && dealer.country !== countryFilter) return false;
      if (divisionFilter && dealer.division !== divisionFilter) return false;
      if (townFilter && dealer.town !== townFilter) return false;
      if (selectedOutlets.length > 0 && !selectedOutlets.includes(dealer.name)) return false;
      return true;
    });

    const nameToModelMap: Record<string, string> = {};
    allProducts.forEach(product => {
      if (product.name && product.model) {
        nameToModelMap[product.name] = product.model;
      }
    });

    const allModelNames = Array.from(
      new Set(allProducts.filter(p => p.status === 'Active' && p.model).map(p => p.model))
    );

    const finalReport: any[] = [];
    const verticalTotals: Record<string, number> = {};

    // Initialize vertical totals for each model
    allModelNames.forEach(model => {
      verticalTotals[model] = 0;
    });

    filteredDealers.forEach(dealer => {
      const dealerRow: any = {
        name: dealer.name || '',
        id: dealer.id || '',
        division: dealer.division || '',
        country: dealer.country || '',
        town: dealer.town || '',
      };

      allModelNames.forEach(model => {
        dealerRow[model] = 0;
      });

      const dealerInventories = inventoryData.filter(inv => inv.dealerOutlet === dealer.name);
      dealerInventories.forEach(inv => {
        const modelName = nameToModelMap[inv.name];
        const quantity = Number(inv.quantity) || 0;
        if (modelName && dealerRow.hasOwnProperty(modelName)) {
          dealerRow[modelName] += quantity;
          // Accumulate for vertical total
          verticalTotals[modelName] += quantity;
        }
      });

      const totalQty = allModelNames.reduce((sum, model) => sum + (dealerRow[model] || 0), 0);
      dealerRow['total'] = totalQty;

      finalReport.push(dealerRow);
    });

    // Create and populate the total row
    this.totalRow = {
      country: 'Total', // Label for the footer row
      division: '',
      town: '',
      name: '',
    };
    allModelNames.forEach(model => {
      this.totalRow[model] = verticalTotals[model];
    });
    const grandTotal = allModelNames.reduce((sum, model) => sum + verticalTotals[model], 0);
    this.totalRow['total'] = grandTotal;

    this.finalTableData = finalReport; // Set the table data
    this.productHeaders = allModelNames;
    this.tableColumns = ['country', 'division', 'town', 'name', ...this.productHeaders, 'total'];

    // 🆕 Define the new footer columns
    const footerProductColumns = this.productHeaders.map(col => `footer_${col}`);
    this.footerColumns = ['mergedTotalFooter', ...footerProductColumns, 'footer_total'];
  }

  generateCEOReport(countryFilter: string) {
    const allDealers = this.dataSource;
    const allProducts = this.vehicledataSource;
    const inventoryData = this.inventorydataSource;

    const filteredDealers = allDealers.filter(dealer => {
      return dealer.status === 'Active' && dealer.country === countryFilter;
    });

    const nameToModelMap: Record<string, string> = {};
    allProducts.forEach(product => {
      if (product.name && product.model) {
        nameToModelMap[product.name] = product.model;
      }
    });

    const allModelNames = Array.from(
      new Set(allProducts.filter(p => p.status === 'Active' && p.model).map(p => p.model))
    );

    const countryReport: any = {
      country: countryFilter,
      total: 0
    };

    allModelNames.forEach(model => {
      countryReport[model] = 0;
    });

    filteredDealers.forEach(dealer => {
      const dealerInventories = inventoryData.filter(inv => inv.dealerOutlet === dealer.name);
      dealerInventories.forEach(inv => {
        const modelName = nameToModelMap[inv.name];
        const quantity = Number(inv.quantity) || 0;
        if (modelName && countryReport.hasOwnProperty(modelName)) {
          countryReport[modelName] += quantity;
        }
      });
    });

    countryReport.total = allModelNames.reduce((sum, model) => sum + countryReport[model], 0);

    this.finalTableData = [countryReport];
    this.productHeaders = allModelNames;
    this.tableColumns = ['country', ...this.productHeaders, 'total'];
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

    if (this.userRole === 'CEO') {
      if (filters.country) {
        this.generateCEOReport(filters.country);
      } else {
        // Handle the case where a CEO user doesn't select a country
        this.finalTableData = [];
        this.productHeaders = [];
        this.tableColumns = [];
        Swal.fire('Info', 'Please select a country to view the CEO report.', 'info');
      }
    } else {
      // Existing logic for other roles
      const selectedOutlets: string[] = filters.name || [];
      this.generateHorizontalInventoryReport(selectedOutlets, filters.country, filters.division, filters.town);
    }
  }






  onCancel() {
    this.dealerForm.reset();
    this.filteredProducts = [];
    this.finalTableData = []; // <- clear table
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
    if (!this.finalTableData || this.finalTableData.length === 0) {
      Swal.fire('Info', 'No data available to export', 'info');
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Inventory Report');

    let headers: string[];
    let dataRows: any[];

    if (this.userRole === 'CEO') {
      headers = ['Country', ...this.productHeaders, 'Total'];
      // The finalTableData for CEO is already consolidated, so we use it directly
      dataRows = this.finalTableData;
    } else {
      headers = [
        'S.N', 'Country', 'Division', 'Town', 'Dealer Name',
        ...this.productHeaders,
        'Total'
      ];
      dataRows = this.finalTableData;
    }

    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F4B083' },
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });

    dataRows.forEach((row, index) => {
      let rowData: any[];

      if (this.userRole === 'CEO') {
        // For the CEO report, we don't need 'S.N', or location data
        rowData = [
          row.country || '',
          ...this.productHeaders.map(model => row[model] || 0),
          row.total,
        ];
      } else {
        // For other roles, include all columns
        rowData = [
          index + 1,
          row.country || '',
          row.division || '',
          row.town || '',
          row.name || '',
          ...this.productHeaders.map(model => row[model] || 0),
          row.total,
        ];
      }

      const excelRow = worksheet.addRow(rowData);
      excelRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // Adjust column widths based on the number of columns
    worksheet.columns.forEach((col, index) => {
      if (this.userRole === 'CEO') {
        if (index === 0) col.width = 15;
        else if (index > 0 && index <= this.productHeaders.length) col.width = 10;
        else if (index === this.productHeaders.length + 1) col.width = 10;
      } else {
        if (index === 0) col.width = 6;
        else if (index === 4) col.width = 30;
        else if (index >= 5 && index < 5 + this.productHeaders.length) col.width = 10;
        else col.width = 15;
      }
    });

    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `Inventory_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    });
  }

}
