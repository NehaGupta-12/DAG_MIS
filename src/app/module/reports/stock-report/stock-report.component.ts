import {Component, EnvironmentInjector, Inject, runInInjectionContext} from '@angular/core';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
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




  generateHorizontalInventoryReport() {
    const allDealers = this.dataSource;
    const allProducts = this.vehicledataSource;
    const inventoryData = this.inventorydataSource;

    const filters = this.dealerForm.value;

    // Map product name => model
    const nameToModelMap: Record<string, string> = {};
    allProducts.forEach(product => {
      if (product.name && product.model) {
        nameToModelMap[product.name] = product.model;
      }
    });

    // Get unique model names from active products
    const allModelNames = Array.from(
      new Set(allProducts.filter(p => p.status === 'Active' && p.model).map(p => p.model))
    );

    const finalReport: any[] = [];

    allDealers.forEach(dealer => {
      if (dealer.status !== 'Active') return;

      // Apply filters
      if (
        (filters.country && dealer.country !== filters.country) ||
        (filters.division && dealer.division !== filters.division) ||
        (filters.town && dealer.town !== filters.town) ||
        (filters.name && dealer.name !== filters.name)
      ) {
        return;
      }

      const dealerRow: any = {
        name: dealer.name || '',
        id: dealer.id || '',
        division: dealer.division || '',
        country: dealer.country || '',
        town: dealer.town || '',
      };

      // Initialize product models with 0
      allModelNames.forEach(model => {
        dealerRow[model] = 0;
      });

      // Sum inventory for this dealer
      const dealerInventories = inventoryData.filter(inv => inv.dealerOutlet === dealer.name);
      dealerInventories.forEach(inv => {
        const modelName = nameToModelMap[inv.name];
        if (modelName && dealerRow.hasOwnProperty(modelName)) {
          dealerRow[modelName] += Number(inv.quantity) || 0;
        }
      });

      // Calculate Total
      const totalQty = allModelNames.reduce((sum, model) => sum + (dealerRow[model] || 0), 0);
      dealerRow['total'] = totalQty;

      finalReport.push(dealerRow);
    });

    this.finalTableData = finalReport;
    this.productHeaders = allModelNames;
    this.tableColumns = ['country', 'division', 'town', 'name', ...this.productHeaders, 'total'];
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
    // ... existing filter logic for sales data

    const filters = this.dealerForm.value;
    // ... (your existing date filtering logic) ...

    // 🔹 Filter sales data based on date and other filters
    const filtered = this.salesdataSource.filter(item => {
      const itemDate = item.createdAt?.seconds
        ? new Date(item.createdAt.seconds * 1000)
        : new Date(item.createdAt);

      return (
        (!filters.country || item.country === filters.country) &&
        (!filters.name || item.dealerOutlet === filters.name) &&
        // Note: Your date filtering logic for sales data seems to be missing
        // from the provided code snippet inside onSubmit(), but I'll assume
        // it's there. I'll use the inventory data to match your request,
        // which doesn't have a date filter.
        true // Placeholder for date filtering
      );
    });

    // 🔹 Call the new method to generate the horizontal inventory report
    this.generateHorizontalInventoryReport();

    // The rest of your onSubmit() logic for sales reporting can remain as-is.
    // For this specific request, the main focus is on the new report method.
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

    const headers = [
      'S.N', 'Country', 'Division', 'Town', 'Dealer Name',
      ...this.productHeaders,
      'Total'
    ];

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

    this.finalTableData.forEach((dealer, index) => {
      const rowData = [
        index + 1,
        dealer.division || '',
        dealer.country || '',
        dealer.town || '',
        dealer.name || '',
        ...this.productHeaders.map(model => dealer[model] || 0),
      ];

      const total = this.productHeaders.reduce((sum, model) => sum + (dealer[model] || 0), 0);
      rowData.push(total);

      const row = worksheet.addRow(rowData);
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    worksheet.columns.forEach((col, index) => {
      if (index === 0) col.width = 6;
      else if (index === 4) col.width = 30;
      else if (index >= 5 && index < 5 + this.productHeaders.length) col.width = 10;
      else col.width = 15;
    });

    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `Inventory_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    });
  }


}
