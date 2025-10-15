import {Component, ElementRef, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton, MatMiniFabButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe, NgForOf, NgIf, SlicePipe} from "@angular/common";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {AddDealerService} from "../add-dealer.service";
import Swal from "sweetalert2";
import {LoadingService} from "../../Services/loading.service";
import {AuthService} from "../../authentication/auth.service";
import {ActivityLogService} from "../activity-log/activity-log.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder} from "@angular/forms";
import {MatCheckbox} from "@angular/material/checkbox";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect, MatSelectTrigger} from "@angular/material/select";
import {map} from "rxjs/operators";
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {CountryService} from "../../Services/country.service";

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
    FeatherIconsComponent,
    FormsModule,
    MatCheckbox,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatFormField,
    MatInput,
    MatLabel,
    MatMiniFabButton,
    MatOption,
    MatSelect,
    MatSelectTrigger,
    MatStartDate,
    MatSuffix,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SlicePipe,

  ],
  templateUrl: './dealer-list.component.html',
  standalone: true,
  styleUrls: ['./dealer-list.component.scss']
})
export class DealerListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();

// Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'name', label: 'Name'},
    {def: 'outletType', label: 'Outlet Type'},
    {def: 'country', label: 'Country'},
    {def: 'division', label: 'Division'},
    {def: 'town', label: 'Town'},
    // {def: 'category', label: 'category'},
    // {def: 'location', label: 'Location '},
  ];

  displayedColumns: string[] = [
    'serial',
    'code',
    'name',
    'outletType',
    'country',
    'division',
    'town',
    // 'category',
    // 'location',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
  @ViewChild('divisionSearchInput') divisionSearchInput!: ElementRef;
  @ViewChild('townSearchInput') townSearchInput!: ElementRef;
  @ViewChild('outletSearchInput') outletSearchInput!: ElementRef;

  filteredDivisionsByCountry: string[] = [];
  filteredTownsByDivision: string[] = [];
  filteredOutletsByTown: string[] = [];
  dealerForm:FormGroup;
  countryOptionsLoaded: boolean = false;

  selectedOutlets: string[] = [];

  nameFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');
  productFilter = new FormControl('');
  dataSourceBackup: any[] = [];


  search: any = {
    name: '',
    division: '',
    country: '',
    town: '',
    sale: '',
    product: '',
  };

  options: any = {
    name: [],
    division: [],
    country: [],
    town: [],
    sale: [],
    product: [],
  };

  filteredOptions: any = {
    name: [],
    division: [],
    country: [],
    town: [],
    sale: [],
    product: [],
  };

  constructor(
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private router: Router,
    private addDealerService: AddDealerService,
    private mDatabase: AngularFireDatabase,
    private injector: EnvironmentInjector,
    private loadingService: LoadingService,
    private countryService : CountryService,
    private mFirestore:AngularFirestore,
    public authService: AuthService,
    private mService: ActivityLogService,
  )  {
    this.dealerForm = this.fb.group({
      name: this.fb.control(''),
      country: [''],
      division: [''],
      town: [''],
      sale: [''],
      product: [''],
      period: this.fb.group({
        start: [''],
        end: [''],
      }),
    });

    // Load Firebase options
    this.mDatabase.object<{ subcategories: string[] }>('typelist/Division').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.division = data; this.filteredOptions.division = [...data]; });

    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletType').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.outletType = data; this.filteredOptions.outletType = [...data]; });

    this.mDatabase.object<{ subcategories: string[] }>('typelist/outletCategory').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.category = data; this.filteredOptions.category = [...data]; });

    // COUNTRY LOADING
    this.countryService.getCountries().subscribe((data: string[]) => {
      this.options.country = data;
      this.filteredOptions.country = [...data];
      this.countryOptionsLoaded = true;
    });

    this.mDatabase.object<{ subcategories: string[] }>('typelist/Town').valueChanges()
      .pipe(map(d => d?.subcategories || []))
      .subscribe(data => { this.options.town = data; this.filteredOptions.town = [...data]; });


  }

  ngOnInit() {
    this.DealerList();
    // === ✅ Make COUNTRY mandatory and control visibility ===
    this.dealerForm.get('country')?.valueChanges.subscribe(selectedCountry => {
      if (!selectedCountry) {
        this.dealerForm.patchValue({ division: '', town: '', name: [] });
        this.filteredOptions.division = [];
        this.filteredOptions.town = [];
        this.filteredOptions.name = [];
        return;
      }

      this.filteredDivisionsByCountry = Array.from(new Set(
        (this.dataSource.data || [])
          .filter(d => d.country === selectedCountry && d.division && d.division !== 'NA')
          .map(d => d.division)
      ));
      this.filteredOptions.division = [...this.filteredDivisionsByCountry];

      this.filteredTownsByDivision = Array.from(new Set(
        (this.dataSource.data || [])
          .filter(d => d.country === selectedCountry && d.town && d.town !== 'NA')
          .map(d => d.town)
      ));
      this.filteredOptions.town = [...this.filteredTownsByDivision];

      const allOutlets = Array.from(new Set(
        (this.dataSource.data || [])
          .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...allOutlets];
    });


    // === ✅ Division Independent Filtering ===
    this.dealerForm.get('division')?.valueChanges.subscribe(selectedDivision => {
      const selectedCountry = this.dealerForm.get('country')?.value;
      if (!selectedCountry) return; // country mandatory

      if (!selectedDivision) {
        // Reset outlet list to all of the selected country
        const allOutlets = Array.from(new Set(
          (this.dataSource.data || [])
            .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
            .map(d => d.name)
        ));
        this.filteredOptions.name = [...allOutlets];
        return;
      }

      // Filter only those outlets which match selected division (still within country)
      const outlets = Array.from(new Set(
        (this.dataSource.data || [])
          .filter(d =>
            d.country === selectedCountry &&
            d.division === selectedDivision &&
            d.name &&
            d.name !== 'NA'
          )
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...outlets];
    });

    // === ✅ Town Independent Filtering ===
    this.dealerForm.get('town')?.valueChanges.subscribe(selectedTown => {
      const selectedCountry = this.dealerForm.get('country')?.value;
      if (!selectedCountry) return; // country mandatory

      if (!selectedTown) {
        // Reset outlets for whole country if town cleared
        const allOutlets = Array.from(new Set(
          (this.dataSource.data || [])
            .filter(d => d.country === selectedCountry && d.name && d.name !== 'NA')
            .map(d => d.name)
        ));
        this.filteredOptions.name = [...allOutlets];
        return;
      }

      // Filter outlets by town only (still within country)
      const outlets = Array.from(new Set(
        (this.dataSource.data || [])
          .filter(d =>
            d.country === selectedCountry &&
            d.town === selectedTown &&
            d.name &&
            d.name !== 'NA'
          )
          .map(d => d.name)
      ));
      this.filteredOptions.name = [...outlets];
    });

    // === Search filters (unchanged) ===
    this.nameFilter.valueChanges.subscribe(val => this.filterOutlet(val || ''));
    this.divisionFilter.valueChanges.subscribe(val => this.filterDivision(val || ''));
    this.countryFilter.valueChanges.subscribe(val => this.filterCountry(val || ''));
    this.townFilter.valueChanges.subscribe(val => this.filterTown(val || ''));
    this.productFilter.valueChanges.subscribe(val => this.filterOptions('product', val || ''));
  }


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

  filterSales(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.sale = this.options.sale
      .filter((s: string) => s.toLowerCase().includes(searchText));
  }

  filterOutlet(value: string) {
    const searchText = (value || '').toLowerCase();
    this.filteredOptions.name = this.filteredOutletsByTown
      .filter(o => o.toLowerCase().includes(searchText));
  }

  filterOptions(field: string, value: string) {
    const searchTerm = (value || '').toLowerCase();
    this.filteredOptions[field] = this.options[field].filter((item: string) =>
      item.toLowerCase().includes(searchTerm)
    );
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


  onSubmit() {
    this.loadingService.setLoading(true);

    try {
      const filters = this.dealerForm.value;
      const allDealers = (this.dataSourceBackup || this.dataSource.data || []); // keep backup if you already have it

      // 🧩 Apply filters if any are selected
      const filtered = allDealers.filter(d => {
        const countryMatch = !filters.country || d.country === filters.country;
        const divisionMatch = !filters.division || d.division === filters.division;
        const townMatch = !filters.town || d.town === filters.town;

        let outletMatch = true;
        if (filters.name && filters.name.length > 0) {
          outletMatch = filters.name.includes(d.name);
        }

        return countryMatch && divisionMatch && townMatch && outletMatch;
      });

      // 🟢 If no filters are applied, show all
      const result = (filters.country || filters.division || filters.town || (filters.name?.length > 0))
        ? filtered
        : allDealers;

      // Update table data
      this.dataSource.data = result;
      console.log('Filtered Dealers:', result.length);

    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      this.loadingService.setLoading(false);
    }
  }


  onCancel() {
    this.loadingService.setLoading(true);

    try {
      this.dealerForm.reset();

      // reset all filter dropdown options
      Object.keys(this.options).forEach(key => {
        this.filteredOptions[key] = [...this.options[key]];
      });

      // restore all dealers
      this.dataSource.data = this.dataSourceBackup || this.dataSource.data;

      // clear UI filters
      this.selectedOutlets = [];
      this.nameFilter.reset();
      this.divisionFilter.reset();
      this.countryFilter.reset();
      this.townFilter.reset();
      this.productFilter.reset();

      console.log('Filters cleared. Showing all dealers.');

    } finally {
      this.loadingService.setLoading(false);
    }
  }



  DealerList() {
    this.loadingService.setLoading(true); // ✅ start loader
    runInInjectionContext(this.injector, () => {

      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;


          // ✅ Initialize backup for filtering/reset
          this.dataSourceBackup = [...data];

          console.log(this.dataSource.data);
          this.loadingService.setLoading(false); // ✅ stop loader on success
        },
        error: (err) => {
          console.error('Error fetching Dealer list:', err);
          this.loadingService.setLoading(false); // ✅ stop loader on error
        }
      });
    });
  }

  // editDealer(row: any) {
  //   this.router.navigate(['module/add-dealer'], {
  //     queryParams: {data: JSON.stringify(row)}
  //   });
  // }

  editDealer(row: any) {
    this.router.navigate(['module/add-dealer'], {
      queryParams: {data: JSON.stringify(row)}
    });


  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',
      autoFocus: false
    });
  }

  // navigateToAddDealer() {
  //   this.router.navigate(['module/add-dealer']);
  // }

  navigateToAddDealer() {
    this.router.navigate(['module/add-dealer']);


  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDisplayedColumns() {
    return this.columnDefinitions.map(c => c.def);
  }

// Filtering
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isLoading: any;


  deleteDealer(data: any) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Dealer/Outlet!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.setLoading(true);
        runInInjectionContext(this.injector, () => {
          // Use correct id field for deletion
          const dealerId = data.outletId;
          const showroomName = data.name || 'Unknown Showroom';

          this.addDealerService.deleteDealer(dealerId)
            .then(() => {
              this.DealerList();
              Swal.fire('Deleted!', 'Dealer/Outlet has been deleted.', 'success');

              // ✅ Activity log with proper username
              this.mService.addLog({
                date: Date.now(),
                section: "Outlet/Dealer",
                action: "Delete",
                user: username,
                description: `${username} has deleted showroom ${showroomName}`
              });
            })
            .catch((err) => {
              console.error('Delete failed:', err);
              Swal.fire('Error', 'Failed to delete Dealer/Outlet. Please try again.', 'error');
            })
            .finally(() => {
              this.loadingService.setLoading(false);
            });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Dealer/Outlet data is safe.', 'info');
      }
    });
  }

}
