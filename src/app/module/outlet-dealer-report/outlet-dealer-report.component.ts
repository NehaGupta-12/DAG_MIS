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
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AddDealerService } from '../add-dealer.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';

import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";

interface ReadonlyFlags {
  name: boolean;
  outletType: boolean;
  category: boolean;
  division: boolean;
  country: boolean;
  town: boolean;
}

@Component({
  selector: 'app-outlet-dealer-report',
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
  templateUrl: './outlet-dealer-report.component.html',
  standalone: true,
  styleUrl: './outlet-dealer-report.component.scss',
})
export class OutletDealerReportComponent implements OnInit {
  isEditMode = false;
  dealerForm: FormGroup;
  dataSource: any[] = [];
  filteredProducts: any[] = [];

  // Filters
  nameFilter = new FormControl('');
  outletTypeFilter = new FormControl('');
  categoryFilter = new FormControl('');
  divisionFilter = new FormControl('');
  countryFilter = new FormControl('');
  townFilter = new FormControl('');

  search: any = {
    name: '',
    outletType: '',
    category: '',
    division: '',
    country: '',
    town: '',
  };

  options: any = {
    name: [],
    outletType: [],
    category: [],
    division: [],
    country: [],
    town: [],
  };

  filteredOptions: any = {
    name: [],
    outletType: [],
    category: [],
    division: [],
    country: [],
    town: [],
  };

  // 2) explicit readonly states to allow dot-access in template
  isReadonly: ReadonlyFlags = {
    name: false,
    outletType: false,
    category: false,
    division: false,
    country: false,
    town: false,
  };

  constructor(
    private fb: UntypedFormBuilder,
    private addDealerService: AddDealerService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private mDatabase: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dealerForm = this.fb.group({
      name: [''],
      country: [''],
      outletType: [''],
      division: [''],
      town: [''],
      category: [''],
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

    this.DealerList();

    // Hook filters to filtering logic + patch form value
    this.nameFilter.valueChanges.subscribe(val => {
      this.filterOptions('name', val || '');
      this.dealerForm.patchValue({ name: val });
    });

    this.outletTypeFilter.valueChanges.subscribe(val => {
      this.filterOptions('outletType', val || '');
      this.dealerForm.patchValue({ outletType: val });
    });

    this.categoryFilter.valueChanges.subscribe(val => {
      this.filterOptions('category', val || '');
      this.dealerForm.patchValue({ category: val });
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
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.addDealerService.getDealerList().subscribe((data: any) => {
        this.dataSource = data;
        this.filteredProducts = [];

        const names = Array.from(new Set(data.map((d: any) => d.name).filter(Boolean)));
        this.options.name = names;
        this.filteredOptions.name = [...names];
      });
    });
  }

  // Filter options logic
  filterOptions(field: string, value: string) {
    const searchTerm = value?.toLowerCase() || '';
    const matched = (this.options[field] || []).filter((item: string) =>
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
    this.filteredProducts = this.dataSource.filter((item: any) => {
      return (
        (!filters.name || item.name === filters.name) &&
        (!filters.outletType || item.outletType === filters.outletType) &&
        (!filters.category || item.category === filters.category) &&
        (!filters.division || item.division === filters.division) &&
        (!filters.country || item.country === filters.country) &&
        (!filters.town || item.town === filters.town)
      );
    });
    Swal.fire('Filtered', `${this.filteredProducts.length} record's found`, 'success');
  }

  // helper to safely get the FormControl for a field
  private getFilterControl(field: string): FormControl | undefined {
    const map: Record<string, FormControl> = {
      name: this.nameFilter,
      outletType: this.outletTypeFilter,
      category: this.categoryFilter,
      division: this.divisionFilter,
      country: this.countryFilter,
      town: this.townFilter,
    };
    return map[field];
  }

  // 3) after selecting an option → lock input and keep selected text
  onOptionSelected(field: string, value: string) {
    this.isReadonly[field as keyof ReadonlyFlags] = true;

    // put the selected value into both the form and its filter control
    this.dealerForm.patchValue({ [field]: value });

    // set the filter control value without triggering valueChanges
    const ctrl = this.getFilterControl(field);
    if (ctrl) ctrl.setValue(value, { emitEvent: false });

    // ensure filteredOptions shows only matched (or keep full list if you prefer)
    this.filteredOptions[field] = this.options[field] ? [...this.options[field]] : [];
  }

  // 4) open/close panel from the suffix arrow; show full list when readonly
  togglePanel(trigger: MatAutocompleteTrigger, field: string) {
    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      // ensure full list when readonly
      if (this.isReadonly[field as keyof ReadonlyFlags]) {
        this.filteredOptions[field] = [...(this.options[field] || [])];
      }
      trigger.openPanel();
    }
  }

  // 5) if the user focuses a readonly input, auto-open the list
  onInputFocus(trigger: MatAutocompleteTrigger, field: string) {
    if (this.isReadonly[field as keyof ReadonlyFlags]) {
      this.filteredOptions[field] = [...(this.options[field] || [])];
      trigger.openPanel();
    }
  }

  onCancel() {
    this.dealerForm.reset();
    this.filteredProducts = [];

    Object.keys(this.options).forEach(key => {
      this.filteredOptions[key] = [...this.options[key]];
    });

    this.nameFilter.reset();
    this.outletTypeFilter.reset();
    this.categoryFilter.reset();
    this.divisionFilter.reset();
    this.countryFilter.reset();
    this.townFilter.reset();

    // 🔁 unlock all inputs again
    Object.keys(this.isReadonly).forEach(k => (this.isReadonly[k as keyof ReadonlyFlags] = false));
  }

  exportToExcel() {
    Swal.fire('Info', 'Export to Excel triggered', 'info');
  }


}



