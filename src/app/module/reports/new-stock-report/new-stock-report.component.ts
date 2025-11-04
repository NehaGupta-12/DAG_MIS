import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {CommonModule} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from "@angular/material/datepicker";
import {AddDealerService} from "../../add-dealer.service";
import {ActivatedRoute} from "@angular/router";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {ProductMasterService} from "../../product-master.service";
import {GrnService} from "../../grn.service";
import {AuthService} from "../../../authentication/auth.service";
import {LoadingService} from "../../../Services/loading.service";
import {CountryService} from "../../../Services/country.service";
import {ActivityLogService} from "../../activity-log/activity-log.service";
import {StockTransferService} from "../../stock-transfer.service";
import {InventoryService} from "../../add-inventory/inventory.service";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-new-stock-report',
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
  templateUrl: './new-stock-report.component.html',
  styleUrl: './new-stock-report.component.scss'
})
export class NewStockReportComponent implements OnInit{
  isEditMode: boolean = false;
  dealerForm: FormGroup;
  dataSource: any[] = [];
  vehicledataSource: any[] = [];
  salesdataSource: any[] = [];
  stockTransferDataSource: any[] = [];
  inventoryDataSource: any[] = [];
  filteredProducts: any[] = [];
  reportTitle: string = '';
  reportDate: string = '';
  selectedCountry: string = '';
  selectedOutlets: string[] = [];
  // allOutletReports: { outlet: string; rows: any[] }[] = [];
  maxDate: Date=new Date();
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;
  @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;
  // @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;
  debounceTimer: any;
  countryOptionsLoaded: boolean = false;
  allOutletReports = [
    {
      outlet: 'Outlet A',
      rows: [
        { product: 'Product 1', opening: 100, sales: 20, grn: 10, outgoing: 5, incoming: 0, total: 85 },
        { product: 'Product 2', opening: 150, sales: 30, grn: 5, outgoing: 10, incoming: 2, total: 117 },
      ]
    }
  ];



  // Filters
  nameFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');
  productFilter = new FormControl('');

  filteredDivisionsByCountry: string[] = [];
  filteredTownsByDivision: string[] = [];
  filteredOutletsByTown: string[] = [];


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
    // private dailySlaes: DailySalesService, // Already commented
    private grnService: GrnService,
    public authService : AuthService,
    private loadingService: LoadingService,
    private countryService : CountryService,
    private mService: ActivityLogService,
    private stockTransferService: StockTransferService,
    private inventoryService : InventoryService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dealerForm = this.fb.group({
      name: this.fb.control(''),
      country: [''], // Initialized to empty string
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

    // 🌟 UPDATED COUNTRY LOADING: Set flag on complete
    this.countryService.getCountries().subscribe((data: string[]) => {
      this.options.country = data;
      this.filteredOptions.country = [...data];
      this.countryOptionsLoaded = true; // ✅ Set flag here
    });

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

    this.loadGrnList();
    this.DealerList();
    this.productList();
    this.stockStransferList();
    this.inventoryData();

    // 🔹 COUNTRY → mandatory, controls everything
    this.dealerForm.get('country')?.valueChanges.subscribe(selectedCountry => {
      if (!selectedCountry) {
        // Clear all fields if no country selected
        this.dealerForm.patchValue({
          division: '',
          town: '',
          name: '',
          sale: '',
          product: '',
          period: { start: '', end: '' }
        });

        this.filteredOptions.division = [];
        this.filteredOptions.town = [];
        this.filteredOptions.name = [];
        return;
      }

      // ✅ Once country selected → independently load all dropdowns
      const filteredByCountry = this.dataSource.filter(
        d => d.country === selectedCountry
      );

      // Get unique division, town, and outlet lists for that country
      this.filteredOptions.division = Array.from(new Set(
        filteredByCountry
          .filter(d => d.division && d.division !== 'NA')
          .map(d => d.division)
      ));

      this.filteredOptions.town = Array.from(new Set(
        filteredByCountry
          .filter(d => d.town && d.town !== 'NA')
          .map(d => d.town)
      ));

      this.filteredOptions.name = Array.from(new Set(
        filteredByCountry
          .filter(d => d.name && d.name !== 'NA')
          .map(d => d.name)
      ));
    });

    // 🔹 Division change → no longer cascades, just updates internal form
    this.dealerForm.get('division')?.valueChanges.subscribe(() => {
      // no dependent filtering now — keep other dropdowns independent
    });

    // 🔹 Town change → independent now
    this.dealerForm.get('town')?.valueChanges.subscribe(() => {
      // independent now, no changes to other fields
    });

    // 🔹 Outlet name change → independent as well
    this.dealerForm.get('name')?.valueChanges.subscribe(() => {
      // independent now
    });

    // 🔹 Search filters (unchanged)
    this.nameFilter.valueChanges.subscribe(val => this.filterOutlet(val || ''));
    this.divisionFilter.valueChanges.subscribe(val => this.filterDivision(val || ''));
    this.countryFilter.valueChanges.subscribe(val => this.filterCountry(val || ''));
    this.townFilter.valueChanges.subscribe(val => this.filterTown(val || ''));
    this.productFilter.valueChanges.subscribe(val => this.filterOptions('product', val || ''));
  }

  // --- Filter methods for cascading + search ---
  filterCountry(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.country = this.options.country
      .filter(c => c.toLowerCase().includes(searchText));
  }

  filterDivision(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.division = this.filteredDivisionsByCountry
      .filter(d => d.toLowerCase().includes(searchText));
  }

  filterTown(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.town = this.filteredTownsByDivision
      .filter(t => t.toLowerCase().includes(searchText));
  }

  filterOutlet(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.name = this.filteredOutletsByTown
      .filter(o => o.toLowerCase().includes(searchText));
  }

  // Filter options logic
  filterOptions(field: string, value: string) {
    const searchTerm = value?.toLowerCase() || '';
    const matched = this.options[field].filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
    this.filteredOptions[field] = [...matched];
  }

  loadGrnList() {
    runInInjectionContext(this.injector, () => {
      this.grnService.getGrnList().subscribe((data) => {
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

  stockStransferList() {
    this.loadingService.setLoading(true);
    runInInjectionContext(this.injector, () => {
      this.stockTransferService.getStockTransferList().subscribe({
        next: (data: any) => {
          this.stockTransferDataSource = data;
        },
        error: (err) => {
          console.error('Failed to fetch stock transfer list', err);
        }
      });
    });
  }

  // inventoryData() {
  //   runInInjectionContext(this.injector, () => {
  //     // Call the service method to get data for the specific dealer
  //     this.inventoryService.getCountryWiseStock().subscribe((data: any[]) => {
  //       console.log('Inventory data:', data);
  //       this.inventoryDataSource = data;
  //     });
  //   });
  // }

  inventoryData() {
    this.loadingService.setLoading(true);

    runInInjectionContext(this.injector, () => {
      this.inventoryService.getCountryWiseStock().subscribe({
        next: (data) => {
          console.log('Inventory data:', data);
          this.inventoryDataSource = data;
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.error('Inventory fetch error', err);
          this.loadingService.setLoading(false);
        }
      });
    });
  }


  isAllOutletsSelected(): boolean {
    const selected: string[] = this.dealerForm.get('name')?.value || [];
    const all: string[] = this.filteredOptions.name || [];
    return all.length > 0 && all.every(o => selected.includes(o));
  }

  toggleSelectAllOutlets() {
    const all: string[] = this.filteredOptions.name || [];
    if (this.isAllOutletsSelected()) {
      this.dealerForm.patchValue({ name: [] });
      this.selectedOutlets = [];
    } else {
      this.dealerForm.patchValue({ name: [...all] });
      this.selectedOutlets = [...all];
    }
  }


}
