// import {
//   Component,
//   ElementRef,
//   EnvironmentInjector,
//   Inject,
//   OnInit,
//   runInInjectionContext,
//   ViewChild
// } from '@angular/core';
// import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
// import { MatButtonModule} from "@angular/material/button";
// import {
//   MatCell,
//   MatCellDef,
//   MatColumnDef,
//   MatHeaderCell,
//   MatHeaderRow,
//   MatHeaderRowDef,
//   MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
// } from "@angular/material/table";
// import { MatInputModule} from "@angular/material/input";
// import {CommonModule, Location, NgForOf} from "@angular/common";
// import {ActivatedRoute, Router} from "@angular/router";
// import {AddDealerService} from "../add-dealer.service";
// import {ProductMasterService} from "../product-master.service";
// import {MAT_DIALOG_DATA} from "@angular/material/dialog";
// import Swal from "sweetalert2";
// import {MatFormFieldModule} from "@angular/material/form-field";
// import {MatIconModule} from "@angular/material/icon";
// import {MatSelectModule} from "@angular/material/select";
// import {MatOptionModule} from "@angular/material/core";
// import {MatCheckboxModule} from "@angular/material/checkbox";
// import {StockTransferService} from "../stock-transfer.service";
// import {OutletProductService} from "../outlet-product.service";
// import {InventoryService} from "../add-inventory/inventory.service";
// import {LoadingService} from "../../Services/loading.service";
// import {ActivityLogService} from "../activity-log/activity-log.service";
// import {CountryService} from "../../Services/country.service";
//
// @Component({
//   selector: 'app-add-stock-transfer',
//   imports: [
//     FormsModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatIconModule,
//     MatSelectModule,
//     MatOptionModule,
//     MatCheckboxModule,
//     MatButtonModule,
//     NgForOf,
//     MatCell,
//     MatCellDef,
//     MatColumnDef,
//     MatHeaderCell,
//     MatHeaderRow,
//     MatHeaderRowDef,
//     MatRow,
//     MatRowDef,
//     MatTable,
//     CommonModule,
//     MatTableModule
//   ],
//   providers: [
//     {provide: MAT_DIALOG_DATA, useValue: {}}
//   ],
//   templateUrl: './add-stock-transfer.component.html',
//   standalone: true,
//   styleUrl: './add-stock-transfer.component.scss'
// })
// export class AddStockTransferComponent implements OnInit {
//
//   isEditMode: boolean = false;
//   stockTransferForm: FormGroup;
//   displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'unit', 'quantity', 'action'];
//   dealerdataSource = new MatTableDataSource<any>();
//   vehicledataSource = new MatTableDataSource<any>();
//   addedProducts: any[] = [];
//   dataSource = new MatTableDataSource<any>();
//   countryControl = new FormControl<string | null>(null);
//
//   @ViewChild('fromDealerSearchInput') fromDealerSearchInput!: ElementRef;
//   @ViewChild('toDealerSearchInput') toDealerSearchInput!: ElementRef;
//   @ViewChild('productSearchInput') productSearchInput!: ElementRef;
//   @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;
//
//   _allDealers: any[] = [];
//   filteredFromDealers: any[] = [];
//   filteredToDealers: any[] = [];
//   fromDealerSearchText: string = '';
//   toDealerSearchText: string = '';
//
//   _allProducts: any[] = [];
//   filteredProducts: any[] = [];
//   productSearchText: string = '';
//
//   _countriesTypes: string[] = [];
//   filteredCountries: string[] = [];
//   countrySearchText: string = '';
//
//   // Country-wise dealers mapping
//   dealersByCountry: { [key: string]: any[] } = {};
//
//   debounceTimer: any;
//
//   breadscrums = [
//     {
//       title: 'Examples',
//       items: ['Forms'],
//       active: 'Examples',
//     },
//   ];
//
//   constructor(
//     private fb: UntypedFormBuilder,
//     private dealer: Location,
//     private stockTransferService: StockTransferService,
//     private injector: EnvironmentInjector,
//     private route: ActivatedRoute,
//     private router: Router,
//     private addDealerService: AddDealerService,
//     private productService: ProductMasterService,
//     private outletProductService: OutletProductService,
//     private inventoryService: InventoryService,
//     private loadingService: LoadingService,
//     private mService: ActivityLogService,
//     private countryService: CountryService,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//   ) {
//     this.isEditMode = !!data?.id;
//     this.stockTransferForm = this.fb.group({
//       country: ['', [Validators.required]],
//       products: ['', [Validators.required]],
//       fromDealerOutlet: ['', [Validators.required]],
//       toDealerOutlet: ['', [Validators.required]],
//       items: this.fb.array([]),
//       remark: ['']
//     });
//   }
//
//   ngOnInit() {
//     this.DealerList();
//     this.productList();
//     this.loadInventoryDaata();
//
//     this.countryService.getCountries().subscribe(countries => {
//       this._countriesTypes = countries;
//       this.filteredCountries = [...this._countriesTypes];
//     });
//
//     this.stockTransferForm.get('products')?.disable();
//
//     // Country change handler
//     this.stockTransferForm.get('country')?.valueChanges.subscribe((country) => {
//       if (country) {
//         this.onCountryChange(country);
//       }
//     });
//
//     // From/To outlet change handlers
//     this.stockTransferForm.get('fromDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());
//     this.stockTransferForm.get('toDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());
//
//     this.route.queryParams.subscribe(params => {
//       if (params['data']) {
//         const rowData = JSON.parse(params['data']);
//         console.log('Received row data:', rowData);
//
//         this.stockTransferForm.patchValue({
//           country: rowData.country,
//           dealerOutlet: rowData.dealerOutlet,
//           openingStock: rowData.openingStock,
//           typeOfGrn: rowData.typeOfGrn
//         });
//
//         if (rowData.items && Array.isArray(rowData.items)) {
//           this.addedProducts = rowData.items.map((item: any) => ({
//             ...item,
//             varient: item.varient ?? item.variant,
//             quantity: item.quantity ?? 1
//           }));
//         }
//
//         if (rowData.id) {
//           this.isEditMode = true;
//           this.data = rowData;
//         }
//       }
//     });
//
//     this.stockTransferForm.valueChanges.subscribe(values => {
//       const fromOutlet = values.fromDealerOutlet;
//       const toOutlet = values.toDealerOutlet;
//
//       if (fromOutlet && toOutlet && fromOutlet === toOutlet) {
//         this.stockTransferForm.get('toDealerOutlet')?.setErrors({ sameOutlet: true });
//       } else {
//         if (this.stockTransferForm.get('toDealerOutlet')?.hasError('sameOutlet')) {
//           this.stockTransferForm.get('toDealerOutlet')?.setErrors(null);
//         }
//       }
//     });
//   }
//
//   // 🌍 Country change handler
//   onCountryChange(country: string) {
//     // Filter dealers by selected country
//     this.filteredFromDealers = this.dealersByCountry[country] || [];
//     this.filteredToDealers = this.dealersByCountry[country] || [];
//
//     // Reset outlet selections
//     this.stockTransferForm.patchValue({
//       fromDealerOutlet: '',
//       toDealerOutlet: ''
//     });
//
//     // Reset products
//     this.vehicledataSource.data = [];
//     this.filteredProducts = [];
//     this.stockTransferForm.get('products')?.reset();
//     this.stockTransferForm.get('products')?.disable();
//   }
//
//   // Filter countries search
//   filterCountries() {
//     const searchText = this.countrySearchText.toLowerCase();
//     this.filteredCountries = this._countriesTypes.filter(country =>
//       country.toLowerCase().includes(searchText)
//     );
//   }
//
//   onCountrySearchChange(event: any) {
//     clearTimeout(this.debounceTimer);
//     this.debounceTimer = setTimeout(() => {
//       this.countrySearchText = event.target.value;
//       this.filterCountries();
//     }, 300);
//   }
//
//   onCountrySelectOpened(isOpened: boolean) {
//     if (isOpened) {
//       this.countrySearchText = '';
//       this.filterCountries();
//       setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
//     }
//   }
//
//   toggleProducts() {
//     const fromOutletName = this.stockTransferForm.get('fromDealerOutlet')?.value;
//     const toOutletName = this.stockTransferForm.get('toDealerOutlet')?.value;
//
//     if (fromOutletName && toOutletName) {
//       // Get inventory items for both outlets
//       const fromOutletInventory = this.dataSource.data.filter((item: any) =>
//         item.dealerOutlet === fromOutletName
//       );
//
//       const toOutletInventory = this.dataSource.data.filter((item: any) =>
//         item.dealerOutlet === toOutletName
//       );
//
//       // Find products that exist in both outlets' inventory
//       const commonInventoryProducts = fromOutletInventory.filter((fromItem: any) =>
//         toOutletInventory.some((toItem: any) =>
//           fromItem.name === toItem.name || fromItem.sku === toItem.sku
//         )
//       );
//
//       // Map inventory products to actual product details
//       const availableProducts = commonInventoryProducts.map((inventoryItem: any) => {
//         const productDetail = this._allProducts.find((product: any) =>
//           product.name === inventoryItem.name || product.sku === inventoryItem.sku
//         );
//         return productDetail || inventoryItem;
//       }).filter((product, index, self) =>
//         index === self.findIndex(p => p.name === product.name || p.sku === product.sku)
//       );
//
//       this.vehicledataSource.data = availableProducts;
//       this.filteredProducts = [...availableProducts];
//       this.stockTransferForm.get('products')?.enable();
//     } else {
//       this.vehicledataSource.data = [];
//       this.filteredProducts = [];
//       this.stockTransferForm.get('products')?.disable();
//     }
//   }
//
//   DealerList() {
//     runInInjectionContext(this.injector, () => {
//       this.loadingService.setLoading(true);
//       this.addDealerService.getDealerList().subscribe({
//         next: (data) => {
//           console.log("Dealer data", data);
//           this.dealerdataSource.data = data;
//           this._allDealers = data;
//
//           // Group dealers by country
//           this.dealersByCountry = {};
//           data.forEach((dealer: any) => {
//             const country = dealer.country || 'Unknown';
//             if (!this.dealersByCountry[country]) {
//               this.dealersByCountry[country] = [];
//             }
//             this.dealersByCountry[country].push(dealer);
//           });
//
//           this.filteredFromDealers = [];
//           this.filteredToDealers = [];
//           this.loadingService.setLoading(false);
//         },
//         error: () => this.loadingService.setLoading(false)
//       });
//     });
//   }
//
//   productList() {
//     runInInjectionContext(this.injector, () => {
//       this.loadingService.setLoading(true);
//       this.productService.getProductList().subscribe({
//         next: (data) => {
//           this.vehicledataSource.data = data;
//           console.log(data, "data");
//           this._allProducts = data;
//           this.filteredProducts = [...data];
//           this.loadingService.setLoading(false);
//         },
//         error: () => this.loadingService.setLoading(false)
//       });
//     });
//   }
//
//   // --- From Dealer/Outlet Methods ---
//   filterFromDealers() {
//     const searchText = this.fromDealerSearchText.toLowerCase();
//     this.filteredFromDealers = (this.dealersByCountry[this.stockTransferForm.get('country')?.value] || []).filter(
//       dealer => dealer.name.toLowerCase().includes(searchText)
//     );
//   }
//
//   onFromDealerSearchChange(event: any) {
//     clearTimeout(this.debounceTimer);
//     this.debounceTimer = setTimeout(() => {
//       this.fromDealerSearchText = event.target.value;
//       this.filterFromDealers();
//     }, 300);
//   }
//
//   onFromDealerSelectOpened(isOpened: boolean) {
//     if (isOpened) {
//       this.fromDealerSearchText = '';
//       this.filterFromDealers();
//       setTimeout(() => this.fromDealerSearchInput.nativeElement.focus(), 0);
//     } else {
//       this.fromDealerSearchText = '';
//       this.filterFromDealers();
//     }
//   }
//
//   // --- To Dealer/Outlet Methods ---
//   filterToDealers() {
//     const searchText = this.toDealerSearchText.toLowerCase();
//     this.filteredToDealers = (this.dealersByCountry[this.stockTransferForm.get('country')?.value] || []).filter(
//       dealer => dealer.name.toLowerCase().includes(searchText)
//     );
//   }
//
//   onToDealerSearchChange(event: any) {
//     clearTimeout(this.debounceTimer);
//     this.debounceTimer = setTimeout(() => {
//       this.toDealerSearchText = event.target.value;
//       this.filterToDealers();
//     }, 300);
//   }
//
//   onToDealerSelectOpened(isOpened: boolean) {
//     if (isOpened) {
//       this.toDealerSearchText = '';
//       this.filterToDealers();
//       setTimeout(() => this.toDealerSearchInput.nativeElement.focus(), 0);
//     } else {
//       this.toDealerSearchText = '';
//       this.filterToDealers();
//     }
//   }
//
//   // --- Products Methods ---
//   filterProducts() {
//     const searchText = this.productSearchText.toLowerCase();
//     this.filteredProducts = this.vehicledataSource.data.filter(product =>
//       product.name.toLowerCase().includes(searchText) ||
//       product.sku.toLowerCase().includes(searchText) ||
//       product.brand.toLowerCase().includes(searchText) ||
//       product.model.toLowerCase().includes(searchText)
//     );
//   }
//
//   onProductSearchChange(event: any) {
//     clearTimeout(this.debounceTimer);
//     this.debounceTimer = setTimeout(() => {
//       this.productSearchText = event.target.value;
//       this.filterProducts();
//     }, 300);
//   }
//
//   toggleSelectAllProducts() {
//     const allProducts = this.filteredProducts.filter(p => !p.disabled);
//     const selectedProducts: any[] = this.stockTransferForm.get('products')?.value || [];
//
//     if (this.isAllProductsSelected()) {
//       this.stockTransferForm.get('products')?.setValue([]);
//     } else {
//       this.stockTransferForm.get('products')?.setValue(allProducts);
//     }
//   }
//
//   isAllProductsSelected(): boolean {
//     const selectedProducts: any[] = this.stockTransferForm.get('products')?.value || [];
//     const allEnabledProducts = this.filteredProducts.filter(p => !p.disabled);
//
//     return allEnabledProducts.length > 0 &&
//       allEnabledProducts.every(ap =>
//         selectedProducts.some(sp => sp.id === ap.id)
//       );
//   }
//
//   onProductSelectOpened(isOpened: boolean) {
//     if (isOpened) {
//       this.productSearchText = '';
//       this.filterProducts();
//       setTimeout(() => this.productSearchInput.nativeElement.focus(), 0);
//     } else {
//       this.productSearchText = '';
//       this.filterProducts();
//     }
//   }
//
//   loadInventoryDaata() {
//     runInInjectionContext(this.injector, () => {
//       this.loadingService.setLoading(true);
//       this.inventoryService.getInventoryAllData().subscribe({
//         next: (data) => {
//           console.log('Inventory data:', data);
//           this.dataSource.data = data;
//           this.loadingService.setLoading(false);
//         },
//         error: () => this.loadingService.setLoading(false)
//       });
//     });
//   }
//
//   isSubmitEnabled(): boolean {
//     const formValid =
//       this.stockTransferForm.get('country')?.valid &&
//       this.stockTransferForm.get('fromDealerOutlet')?.valid &&
//       this.stockTransferForm.get('toDealerOutlet')?.valid;
//
//     const hasProducts = this.addedProducts.length > 0;
//     const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);
//
//     return !!formValid && hasProducts && allQuantitiesValid;
//   }
//
//   addProduct() {
//     const selectedProductName = this.stockTransferForm.get('products')?.value;
//
//     if (!selectedProductName) {
//       Swal.fire('Error', 'Please select a product before adding.', 'error');
//       return;
//     }
//
//     const product = this.vehicledataSource.data.find(p => p.name === selectedProductName);
//
//     if (product) {
//       const exists = this.addedProducts.some(p => p.id === product.id);
//       if (exists) {
//         Swal.fire('Info', 'This product is already added.', 'info');
//         return;
//       }
//
//       this.addedProducts = [...this.addedProducts, { ...product, quantity: 1 }];
//     }
//
//     this.stockTransferForm.get('products')?.reset();
//   }
//
//   removeProduct(index: number, event?: Event) {
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//
//     try {
//       if (index < 0 || index >= this.addedProducts.length) {
//         console.error('Invalid index for product removal:', index);
//         return;
//       }
//
//       this.addedProducts = this.addedProducts.filter((_, i) => i !== index);
//       console.log('Product removed at index:', index);
//       console.log('Remaining products:', this.addedProducts.length);
//     } catch (error) {
//       console.error('Error removing product:', error);
//       Swal.fire('Error', 'Failed to remove product. Please try again.', 'error');
//     }
//   }
//
//   submitForm() {
//     try {
//       const formValues = this.stockTransferForm.getRawValue();
//       delete formValues.products;
//
//       const isMainFormValid =
//         this.stockTransferForm.get('country')?.valid &&
//         this.stockTransferForm.get('fromDealerOutlet')?.valid &&
//         this.stockTransferForm.get('toDealerOutlet')?.valid;
//
//       if (isMainFormValid && this.addedProducts.length > 0) {
//         Swal.fire({
//           title: this.isEditMode ? 'Update Stock Transfer?' : 'Add Stock Transfer?',
//           text: 'Are you sure you want to proceed?',
//           icon: 'question',
//           showCancelButton: true,
//           confirmButtonText: 'Yes',
//           cancelButtonText: 'No'
//         }).then((result: any) => {
//           if (result.isConfirmed) {
//             try {
//               const userData = JSON.parse(localStorage.getItem('userData') || '{}');
//               const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
//               const timestamp = Date.now();
//
//               const productNames = this.addedProducts.map(p => p.name).join(', ');
//
//               const transformedData: any = {
//                 ...formValues,
//                 items: this.addedProducts.map(p => ({
//                   id: p.id ?? '',
//                   sku: p.sku ?? '',
//                   name: p.name ?? '',
//                   brand: p.brand ?? '',
//                   model: p.model ?? '',
//                   variant: p.variant ?? p.varient ?? '',
//                   unit: p.unit ?? '',
//                   quantity: p.quantity ?? 0
//                 }))
//               };
//
//               runInInjectionContext(this.injector, async () => {
//                 try {
//                   this.loadingService.setLoading(true);
//
//                   if (this.isEditMode && this.data.id) {
//                     transformedData.updateBy = username;
//                     transformedData.updatedAt = timestamp;
//
//                     await this.stockTransferService.updateStockTransfer(this.data.id, transformedData);
//
//                     for (const item of transformedData.items) {
//                       await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
//                       await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
//                     }
//
//                     this.mService.addLog({
//                       date: timestamp,
//                       section: "Stock Transfer",
//                       action: "Update",
//                       user: username,
//                       description: `${username} updated stock transfer for products: ${productNames}`
//                     });
//
//                     Swal.fire('Updated!', 'Stock Transfer updated successfully.', 'success');
//                     this.goBack();
//                   } else {
//                     transformedData.status = 'Active';
//                     transformedData.createBy = username;
//                     transformedData.createdAt = timestamp;
//
//                     await this.stockTransferService.addStockTransfer(transformedData);
//
//                     for (const item of transformedData.items) {
//                       await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
//                       await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
//                     }
//
//                     this.mService.addLog({
//                       date: timestamp,
//                       section: "Stock Transfer",
//                       action: "Add",
//                       user: username,
//                       description: `${username} added new stock transfer for products: ${productNames}`
//                     });
//
//                     Swal.fire('Added!', 'Stock Transfer added successfully.', 'success');
//                     this.goBack();
//                   }
//                 } catch (innerErr) {
//                   console.error('Unexpected error during submission:', innerErr);
//                   Swal.fire('Error', 'Unexpected issue occurred.', 'error');
//                 } finally {
//                   this.loadingService.setLoading(false);
//                 }
//               });
//             } catch (innerErr) {
//               console.error('Unexpected error during submission:', innerErr);
//               Swal.fire('Error', 'Unexpected issue occurred.', 'error');
//             }
//           }
//         });
//       } else {
//         Swal.fire('Error', 'Please fill in Country, From/To dealers and add at least one product.', 'error');
//       }
//     } catch (err) {
//       console.error('Global submit error:', err);
//       Swal.fire('Error', 'Something went wrong while submitting.', 'error');
//     }
//   }
//
//   updateInventory(product: any, outletId: string, action: 'increase' | 'decrease'): Promise<void> {
//     const quantityChange = action === 'increase' ? product.quantity : -product.quantity;
//     return runInInjectionContext(this.injector, () =>
//       this.inventoryService.updateInventoryQuantity(outletId, product.sku, quantityChange)
//     );
//   }
//
//   goBack() {
//     this.router.navigate(["/module/stock-transfer-list"]);
//   }
// }

import {
  Component,
  ElementRef,
  EnvironmentInjector,
  Inject,
  OnInit,
  runInInjectionContext,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from "@angular/forms";
import { MatButtonModule} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import { MatInputModule} from "@angular/material/input";
import {CommonModule, Location, NgForOf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {AddDealerService} from "../add-dealer.service";
import {ProductMasterService} from "../product-master.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import Swal from "sweetalert2";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {StockTransferService} from "../stock-transfer.service";
import {OutletProductService} from "../outlet-product.service";
import {InventoryService} from "../add-inventory/inventory.service";
import {LoadingService} from "../../Services/loading.service";
import {ActivityLogService} from "../activity-log/activity-log.service";
import {CountryService} from "../../Services/country.service";
import {MatTab, MatTabContent, MatTabGroup} from "@angular/material/tabs";

@Component({
  selector: 'app-add-stock-transfer',
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
    NgForOf,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    CommonModule,
    MatTableModule,
    MatTabGroup,
    MatTab,
    MatTabContent
  ],
  providers: [
    {provide: MAT_DIALOG_DATA, useValue: {}}
  ],
  templateUrl: './add-stock-transfer.component.html',
  standalone: true,
  styleUrl: './add-stock-transfer.component.scss'
})
export class AddStockTransferComponent implements OnInit {

  isEditMode: boolean = false;
  stockTransferForm: FormGroup;
  displayedColumns: string[] = ['sku', 'name', 'brand', 'model', 'unit', 'quantity', 'action'];
  dealerdataSource = new MatTableDataSource<any>();
  vehicledataSource = new MatTableDataSource<any>();
  addedProducts: any[] = [];
  dataSource = new MatTableDataSource<any>();
  countryControl = new FormControl<string | null>(null);

  @ViewChild('fromDealerSearchInput') fromDealerSearchInput!: ElementRef;
  @ViewChild('toDealerSearchInput') toDealerSearchInput!: ElementRef;
  @ViewChild('productSearchInput') productSearchInput!: ElementRef;
  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef;

  _allDealers: any[] = [];
  filteredFromDealers: any[] = [];
  filteredToDealers: any[] = [];
  fromDealerSearchText: string = '';
  toDealerSearchText: string = '';

  _allProducts: any[] = [];
  filteredProducts: any[] = [];
  productSearchText: string = '';

  _countriesTypes: string[] = [];
  filteredCountries: string[] = [];
  countrySearchText: string = '';

  // Country-wise dealers mapping
  dealersByCountry: { [key: string]: any[] } = {};

  debounceTimer: any;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private dealer: Location,
    private stockTransferService: StockTransferService,
    private injector: EnvironmentInjector,
    private route: ActivatedRoute,
    private router: Router,
    private addDealerService: AddDealerService,
    private productService: ProductMasterService,
    private outletProductService: OutletProductService,
    private inventoryService: InventoryService,
    private loadingService: LoadingService,
    private mService: ActivityLogService,
    private countryService: CountryService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isEditMode = !!data?.id;
    this.stockTransferForm = this.fb.group({
      country: ['', [Validators.required]],
      products: ['', [Validators.required]],
      fromDealerOutlet: ['', [Validators.required]],
      toDealerOutlet: ['', [Validators.required]],
      items: this.fb.array([]),
      remark: ['']
    });
  }

  ngOnInit() {
    this.DealerList();
    this.productList();
    this.loadInventoryDaata();

    this.countryService.getCountries().subscribe(countries => {
      this._countriesTypes = countries;
      this.filteredCountries = [...this._countriesTypes];
    });

    this.stockTransferForm.get('products')?.disable();

    // Country change handler
    this.stockTransferForm.get('country')?.valueChanges.subscribe((country) => {
      if (country) {
        this.onCountryChange(country);
      }
    });

    // From/To outlet change handlers
    this.stockTransferForm.get('fromDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());
    this.stockTransferForm.get('toDealerOutlet')?.valueChanges.subscribe(() => this.toggleProducts());

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const rowData = JSON.parse(params['data']);
        console.log('Received row data:', rowData);

        this.stockTransferForm.patchValue({
          country: rowData.country,
          dealerOutlet: rowData.dealerOutlet,
          openingStock: rowData.openingStock,
          typeOfGrn: rowData.typeOfGrn
        });

        if (rowData.items && Array.isArray(rowData.items)) {
          this.addedProducts = rowData.items.map((item: any) => ({
            ...item,
            varient: item.varient ?? item.variant,
            quantity: item.quantity ?? 1
          }));
        }

        if (rowData.id) {
          this.isEditMode = true;
          this.data = rowData;
        }
      }
    });

    this.stockTransferForm.valueChanges.subscribe(values => {
      const fromOutlet = values.fromDealerOutlet;
      const toOutlet = values.toDealerOutlet;

      if (fromOutlet && toOutlet && fromOutlet === toOutlet) {
        this.stockTransferForm.get('toDealerOutlet')?.setErrors({ sameOutlet: true });
      } else {
        if (this.stockTransferForm.get('toDealerOutlet')?.hasError('sameOutlet')) {
          this.stockTransferForm.get('toDealerOutlet')?.setErrors(null);
        }
      }
    });
  }

  // 🌍 Country change handler
  onCountryChange(country: string) {
    // Filter dealers by selected country
    this.filteredFromDealers = this.dealersByCountry[country] || [];
    this.filteredToDealers = this.dealersByCountry[country] || [];

    // Reset outlet selections
    this.stockTransferForm.patchValue({
      fromDealerOutlet: '',
      toDealerOutlet: ''
    });

    // Reset products
    this.vehicledataSource.data = [];
    this.filteredProducts = [];
    this.stockTransferForm.get('products')?.reset();
    this.stockTransferForm.get('products')?.disable();
  }

  // Filter countries search
  filterCountries() {
    const searchText = this.countrySearchText.toLowerCase();
    this.filteredCountries = this._countriesTypes.filter(country =>
      country.toLowerCase().includes(searchText)
    );
  }

  onCountrySearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.countrySearchText = event.target.value;
      this.filterCountries();
    }, 300);
  }


  onCountrySelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.countrySearchText = '';
      this.filterCountries();
      setTimeout(() => this.countrySearchInput.nativeElement.focus(), 0);
    }else{
      this.countrySearchText = '';
      this.filterCountries();
    }
  }



  toggleProducts() {
    const fromOutletName = this.stockTransferForm.get('fromDealerOutlet')?.value;
    const toOutletName = this.stockTransferForm.get('toDealerOutlet')?.value;

    if (fromOutletName && toOutletName) {
      // Get inventory items for both outlets
      const fromOutletInventory = this.dataSource.data.filter((item: any) =>
        item.dealerOutlet === fromOutletName
      );

      const toOutletInventory = this.dataSource.data.filter((item: any) =>
        item.dealerOutlet === toOutletName
      );

      // Find products that exist in both outlets' inventory
      const commonInventoryProducts = fromOutletInventory.filter((fromItem: any) =>
        toOutletInventory.some((toItem: any) =>
          fromItem.name === toItem.name || fromItem.sku === toItem.sku
        )
      );

      // Map inventory products to actual product details
      const availableProducts = commonInventoryProducts.map((inventoryItem: any) => {
        const productDetail = this._allProducts.find((product: any) =>
          product.name === inventoryItem.name || product.sku === inventoryItem.sku
        );
        return productDetail || inventoryItem;
      }).filter((product, index, self) =>
        index === self.findIndex(p => p.name === product.name || p.sku === product.sku)
      );

      this.vehicledataSource.data = availableProducts;
      this.filteredProducts = [...availableProducts];
      this.stockTransferForm.get('products')?.enable();
    } else {
      this.vehicledataSource.data = [];
      this.filteredProducts = [];
      this.stockTransferForm.get('products')?.disable();
    }
  }

  DealerList() {
    runInInjectionContext(this.injector, () => {
      this.loadingService.setLoading(true);
      this.addDealerService.getDealerList().subscribe({
        next: (data) => {
          console.log("Dealer data", data);
          this.dealerdataSource.data = data;
          this._allDealers = data;

          // Group dealers by country
          this.dealersByCountry = {};
          data.forEach((dealer: any) => {
            const country = dealer.country || 'Unknown';
            if (!this.dealersByCountry[country]) {
              this.dealersByCountry[country] = [];
            }
            this.dealersByCountry[country].push(dealer);
          });

          this.filteredFromDealers = [];
          this.filteredToDealers = [];
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  productList() {
    runInInjectionContext(this.injector, () => {
      this.loadingService.setLoading(true);
      this.productService.getProductList().subscribe({
        next: (data) => {
          this.vehicledataSource.data = data;
          console.log(data, "data");
          this._allProducts = data;
          this.filteredProducts = [...data];
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }

  // --- From Dealer/Outlet Methods ---
  filterFromDealers() {
    const searchText = this.fromDealerSearchText.toLowerCase();
    this.filteredFromDealers = (this.dealersByCountry[this.stockTransferForm.get('country')?.value] || []).filter(
      dealer => dealer.name.toLowerCase().includes(searchText)
    );
  }

  onFromDealerSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fromDealerSearchText = event.target.value;
      this.filterFromDealers();
    }, 300);
  }

  onFromDealerSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.fromDealerSearchText = '';
      this.filterFromDealers();
      setTimeout(() => this.fromDealerSearchInput.nativeElement.focus(), 0);
    } else {
      this.fromDealerSearchText = '';
      this.filterFromDealers();
    }
  }

  // --- To Dealer/Outlet Methods ---
  filterToDealers() {
    const searchText = this.toDealerSearchText.toLowerCase();
    this.filteredToDealers = (this.dealersByCountry[this.stockTransferForm.get('country')?.value] || []).filter(
      dealer => dealer.name.toLowerCase().includes(searchText)
    );
  }

  onToDealerSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.toDealerSearchText = event.target.value;
      this.filterToDealers();
    }, 300);
  }

  onToDealerSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.toDealerSearchText = '';
      this.filterToDealers();
      setTimeout(() => this.toDealerSearchInput.nativeElement.focus(), 0);
    } else {
      this.toDealerSearchText = '';
      this.filterToDealers();
    }
  }

  // --- Products Methods ---
  filterProducts() {
    const searchText = this.productSearchText.toLowerCase();
    this.filteredProducts = this.vehicledataSource.data.filter(product =>
      product.name.toLowerCase().includes(searchText) ||
      product.sku.toLowerCase().includes(searchText) ||
      product.brand.toLowerCase().includes(searchText) ||
      product.model.toLowerCase().includes(searchText)
    );
  }

  onProductSearchChange(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.productSearchText = event.target.value;
      this.filterProducts();
    }, 300);
  }

  toggleSelectAllProducts() {
    const allProducts = this.filteredProducts.filter(p => !p.disabled);
    const selectedProducts: any[] = this.stockTransferForm.get('products')?.value || [];

    if (this.isAllProductsSelected()) {
      this.stockTransferForm.get('products')?.setValue([]);
    } else {
      this.stockTransferForm.get('products')?.setValue(allProducts);
    }
  }

  isAllProductsSelected(): boolean {
    const selectedProducts: any[] = this.stockTransferForm.get('products')?.value || [];
    const allEnabledProducts = this.filteredProducts.filter(p => !p.disabled);

    return allEnabledProducts.length > 0 &&
      allEnabledProducts.every(ap =>
        selectedProducts.some(sp => sp.id === ap.id)
      );
  }

  onProductSelectOpened(isOpened: boolean) {
    if (isOpened) {
      this.productSearchText = '';
      this.filterProducts();
      setTimeout(() => this.productSearchInput.nativeElement.focus(), 0);
    } else {
      this.productSearchText = '';
      this.filterProducts();
    }
  }

  loadInventoryDaata() {
    runInInjectionContext(this.injector, () => {
      this.loadingService.setLoading(true);
      this.inventoryService.getInventoryAllData().subscribe({
        next: (data) => {
          console.log('Inventory data:', data);
          this.dataSource.data = data;
          this.loadingService.setLoading(false);
        },
        error: () => this.loadingService.setLoading(false)
      });
    });
  }





  addProduct() {
    const selectedProducts: any[] = this.stockTransferForm.get('products')?.value || [];

    if (!selectedProducts || selectedProducts.length === 0) {
      Swal.fire('Error', 'Please select at least one product before adding.', 'error');
      return;
    }

    selectedProducts.forEach(selected => {
      // Use 'id' or 'sku' to match actual product object
      const product = this.vehicledataSource.data.find(p => p.id === selected.id || p.sku === selected.sku);

      if (product) {
        const exists = this.addedProducts.some(p => p.id === product.id);
        if (!exists) {
          this.addedProducts.push({ ...product, quantity: 1 });
        }
      }
    });

    // Reset the products select after adding
    this.stockTransferForm.get('products')?.reset();
  }


  removeProduct(index: number, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      if (index < 0 || index >= this.addedProducts.length) {
        console.error('Invalid index for product removal:', index);
        return;
      }

      this.addedProducts = this.addedProducts.filter((_, i) => i !== index);
      console.log('Product removed at index:', index);
      console.log('Remaining products:', this.addedProducts.length);
    } catch (error) {
      console.error('Error removing product:', error);
      Swal.fire('Error', 'Failed to remove product. Please try again.', 'error');
    }
  }

  isSubmitEnabled(): boolean {
    const formValid =
      this.stockTransferForm.get('country')?.valid &&
      this.stockTransferForm.get('fromDealerOutlet')?.valid &&
      this.stockTransferForm.get('toDealerOutlet')?.valid;

    const hasProducts = this.addedProducts.length > 0;
    const allQuantitiesValid = this.addedProducts.every(p => p.quantity && p.quantity > 0);

    return !!formValid && hasProducts && allQuantitiesValid;
  }

  submitForm() {
    try {
      const formValues = this.stockTransferForm.getRawValue();
      delete formValues.products;

      const isMainFormValid =
        this.stockTransferForm.get('country')?.valid &&
        this.stockTransferForm.get('fromDealerOutlet')?.valid &&
        this.stockTransferForm.get('toDealerOutlet')?.valid;

      if (isMainFormValid && this.addedProducts.length > 0) {
        Swal.fire({
          title: this.isEditMode ? 'Update Stock Transfer?' : 'Add Stock Transfer?',
          text: 'Are you sure you want to proceed?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result: any) => {
          if (result.isConfirmed) {
            try {
              const userData = JSON.parse(localStorage.getItem('userData') || '{}');
              const username = `${userData.first || ''} ${userData.last || ''}`.trim() || 'Unknown User';
              const timestamp = Date.now();

              const productNames = this.addedProducts.map(p => p.name).join(', ');

              const transformedData: any = {
                ...formValues,
                items: this.addedProducts.map(p => ({
                  id: p.id ?? '',
                  sku: p.sku ?? '',
                  name: p.name ?? '',
                  brand: p.brand ?? '',
                  model: p.model ?? '',
                  variant: p.variant ?? p.varient ?? '',
                  unit: p.unit ?? '',
                  quantity: p.quantity ?? 0
                }))
              };

              runInInjectionContext(this.injector, async () => {
                try {
                  this.loadingService.setLoading(true);

                  if (this.isEditMode && this.data.id) {
                    transformedData.updateBy = username;
                    transformedData.updatedAt = timestamp;

                    await this.stockTransferService.updateLinkedStockTransfer(
                      this.data.ref.id,
                      transformedData.status,
                      'outgoing'  // or 'incoming' depending on context
                    );


                    for (const item of transformedData.items) {
                      await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
                      await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
                    }

                    this.mService.addLog({
                      date: timestamp,
                      section: "Stock Transfer",
                      action: "Update",
                      user: username,
                      description: `${username} updated stock transfer for products: ${productNames}`
                    });

                    Swal.fire('Updated!', 'Stock Transfer updated successfully.', 'success');
                    this.goBack();
                  } else {
                    transformedData.status = 'Active';
                    transformedData.createBy = username;
                    transformedData.createdAt = timestamp;

                    await this.stockTransferService.addStockTransferWithIncoming(transformedData);

                    if (transformedData.status === 'Approved') {
                      for (const item of transformedData.items) {
                        await this.updateInventory(item, formValues.fromDealerOutlet, 'decrease');
                        await this.updateInventory(item, formValues.toDealerOutlet, 'increase');
                      }
                    }



                    this.mService.addLog({
                      date: timestamp,
                      section: "Stock Transfer",
                      action: "Add",
                      user: username,
                      description: `${username} added new stock transfer for products: ${productNames}`
                    });

                    Swal.fire('Added!', 'Stock Transfer added successfully.', 'success');
                    this.goBack();
                  }
                } catch (innerErr) {
                  console.error('Unexpected error during submission:', innerErr);
                  Swal.fire('Error', 'Unexpected issue occurred.', 'error');
                } finally {
                  this.loadingService.setLoading(false);
                }
              });
            } catch (innerErr) {
              console.error('Unexpected error during submission:', innerErr);
              Swal.fire('Error', 'Unexpected issue occurred.', 'error');
            }
          }
        });
      } else {
        Swal.fire('Error', 'Please fill in Country, From/To dealers and add at least one product.', 'error');
      }
    } catch (err) {
      console.error('Global submit error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    }
  }

  updateInventory(product: any, outletId: string, action: 'increase' | 'decrease'): Promise<void> {
    const quantityChange = action === 'increase' ? product.quantity : -product.quantity;
    return runInInjectionContext(this.injector, () =>
      this.inventoryService.updateInventoryQuantity(outletId, product.sku, quantityChange)
    );
  }

  goBack() {
    this.router.navigate(["/module/stock-transfer-list"]);
  }
}

