import {Component, ViewChild} from '@angular/core';
import {DatePipe} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";

@Component({
  selector: 'app-product-master-list',
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
  templateUrl: './product-master-list.component.html',
  styleUrl: './product-master-list.component.scss'
})
export class ProductMasterListComponent {

  users = [
    { id: 1, name: 'Bajaj Pulsar 150', sku: 'SKU001', brand: 'Bajaj', model: 'Pulser', category: 'SHOWROOM', varient: 'NS160', engineCc: '150cc', unit: 'Nos', subCategory: '2W' },
    { id: 2, name: 'Bajaj Pulsar NS200', sku: 'SKU002', brand: 'Bajaj', model: 'Pulser', category: 'SHOWROOM', varient: 'NS200', engineCc: '200cc', unit: 'Nos', subCategory: '2W' },
    { id: 3, name: 'Bajaj Dominar 400', sku: 'SKU003', brand: 'Bajaj', model: 'Pulser', category: 'SHOWROOM', varient: 'NS200', engineCc: '470cc', unit: 'Nos', subCategory: '2W' },
    { id: 4, name: 'Bajaj Platina 100', sku: 'SKU004', brand: 'Bajaj', model: 'Platina', category: 'DEALER', varient: 'Platina 100', engineCc: '100cc', unit: 'Nos', subCategory: '2W' },
    { id: 5, name: 'Bajaj Boxer BM150', sku: 'SKU005', brand: 'Bajaj', model: 'Boxer', category: 'DOCO', varient: 'BM150', engineCc: '150cc', unit: 'Nos', subCategory: '2W' },
    { id: 6, name: 'Bajaj CT 125X', sku: 'SKU006', brand: 'Bajaj', model: 'CT', category: 'COCO', varient: 'CT125X', engineCc: '125cc', unit: 'Nos', subCategory: '2W' },
    { id: 7, name: 'Bajaj RE Auto', sku: 'SKU007', brand: 'Bajaj', model: 'RE', category: 'OUTLET', varient: 'RE Compact', engineCc: '198cc', unit: 'Nos', subCategory: '3W' },
    { id: 8, name: 'Bajaj Maxima Cargo', sku: 'SKU008', brand: 'Bajaj', model: 'Maxima', category: 'DEALER', varient: 'Maxima Cargo', engineCc: '236cc', unit: 'Nos', subCategory: '3W' },
    { id: 9, name: 'Bajaj Qute Quadricycle', sku: 'SKU009', brand: 'Bajaj', model: 'Qute', category: 'SHOWROOM', varient: 'Maxima Cargo', engineCc: '216cc', unit: 'Nos', subCategory: '4W' },
    { id: 10, name: 'Bajaj Pulsar NS160', sku: 'SKU010', brand: 'Bajaj', model: 'Pulser', category: 'DOCO', varient: 'NS160', engineCc: '160cc', unit: 'Nos', subCategory: '2W' }
  ];



  dataSource = new MatTableDataSource<any>(this.users);

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'sku', label: 'Sku' },
    { def: 'name', label: 'Name' },
    { def: 'model', label: 'Model' },
    { def: 'brand', label: 'Brand' },
    { def: 'category', label: 'Category' },
    { def: 'subCategory', label: 'Sub Category' },
    { def: 'varient', label: 'Varient' },
    { def: 'engineCc', label: 'Engine CC' },
    { def: 'unit', label: 'Unit' },
  ];

  displayedColumns: string[] = [
    'id',
    'sku',
    'name',
    'model',
    'brand',
    'category',
    'subCategory',
    'varient',
    'engineCc',
    'unit',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  // ✅ Data source
  // dataSource = new MatTableDataSource<AdvanceTable>([]);
  // isLoading = false;


  constructor(private dialog: MatDialog, private router: Router) {
  }

  ngOnInit() {
    // this.loadDummyData();
  }

  // ✅ Dynamically get columns to display
  // getDisplayedColumns(): string[] {
  //   return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  // }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',   // set width
      autoFocus: false  // optional
    });
  }

  navigateToAddProductMaster(){
    this.router.navigate(['module/add-products-master']);
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



}
