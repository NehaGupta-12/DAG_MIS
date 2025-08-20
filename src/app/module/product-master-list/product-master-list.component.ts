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
      DatePipe
    ],
  templateUrl: './product-master-list.component.html',
  styleUrl: './product-master-list.component.scss'
})
export class ProductMasterListComponent {

  users = [
    {
      id: 1,
      sku: 'SKU001',
      name: 'Swift VXI',
      model: '2022',
      category: 'Car',
      subCategory: 'Hatchback',
      brand: 'Maruti Suzuki'
    },
    {
      id: 2,
      sku: 'SKU002',
      name: 'Honda City ZX',
      model: '2023',
      category: 'Car',
      subCategory: 'Sedan',
      brand: 'Honda'
    },
    {
      id: 3,
      sku: 'SKU003',
      name: 'Hyundai Creta',
      model: '2021',
      category: 'Car',
      subCategory: 'SUV',
      brand: 'Hyundai'
    },
    {
      id: 4,
      sku: 'SKU004',
      name: 'Royal Enfield Classic 350',
      model: '2022',
      category: 'Bike',
      subCategory: 'Cruiser',
      brand: 'Royal Enfield'
    },
    {
      id: 5,
      sku: 'SKU005',
      name: 'KTM Duke 200',
      model: '2023',
      category: 'Bike',
      subCategory: 'Sports',
      brand: 'KTM'
    }
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
  ];

  displayedColumns: string[] = [
    'id',
    'sku',
    'name',
    'model',
    'brand',
    'category',
    'subCategory',
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
