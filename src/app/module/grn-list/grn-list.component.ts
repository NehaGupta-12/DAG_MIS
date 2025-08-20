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
import {MatIcon} from "@angular/material/icon";
import {MatPaginator} from "@angular/material/paginator";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";

@Component({
  selector: 'app-grn-list',
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
  templateUrl: './grn-list.component.html',
  styleUrl: './grn-list.component.scss'
})
export class GRNListComponent {

  users = [
    {
      id: 1,
      location: 'Mumbai Central',
      products: 'Swift VXI',
      openingStock: 25,
      grnQuantity: 10,
      typeOfGrn: 'Purchase Order'
    },
    {
      id: 2,
      location: 'Pune East',
      products: 'Honda City ZX',
      openingStock: 15,
      grnQuantity: 8,
      typeOfGrn: 'Non-PO Receipts'
    },
    {
      id: 3,
      location: 'Nagpur Central',
      products: 'Hyundai Creta',
      openingStock: 30,
      grnQuantity: 12,
      typeOfGrn: 'Purchase Order'
    },
    {
      id: 4,
      location: 'Amravati Depot',
      products: 'Royal Enfield Classic 350',
      openingStock: 20,
      grnQuantity: 6,
      typeOfGrn: 'Non-PO Receipts'
    },
    {
      id: 5,
      location: 'Mumbai Central',
      products: 'KTM Duke 200',
      openingStock: 18,
      grnQuantity: 7,
      typeOfGrn: 'Purchase Order'
    },
    {
      id: 6,
      location: 'Pune East',
      products: 'Swift VXI',
      openingStock: 22,
      grnQuantity: 5,
      typeOfGrn: 'Purchase Order'
    },
    {
      id: 7,
      location: 'Nagpur Central',
      products: 'Honda City ZX',
      openingStock: 12,
      grnQuantity: 9,
      typeOfGrn: 'Non-PO Receipts'
    },
    {
      id: 8,
      location: 'Amravati Depot',
      products: 'Hyundai Creta',
      openingStock: 28,
      grnQuantity: 11,
      typeOfGrn: 'Purchase Order'
    },
    {
      id: 9,
      location: 'Mumbai Central',
      products: 'Royal Enfield Classic 350',
      openingStock: 14,
      grnQuantity: 4,
      typeOfGrn: 'Non-PO Receipts'
    },
    {
      id: 10,
      location: 'Pune East',
      products: 'KTM Duke 200',
      openingStock: 19,
      grnQuantity: 6,
      typeOfGrn: 'Purchase Order'
    }
  ];


  dataSource = new MatTableDataSource<any>(this.users);

  // Define columns
  columnDefinitions = [
    { def: 'id', label: 'ID' },
    { def: 'location', label: 'Location' },
    { def: 'products', label: 'Products' },
    { def: 'openingStock', label: 'Opening Stock' },
    { def: 'grnQuantity', label: 'GRN Quantity' },
    { def: 'typeOfGrn', label: 'Type Of GRN' },
  ];

  displayedColumns: string[] = [
    'id',
    'location',
    'products',
    'openingStock',
    'grnQuantity',
    'typeOfGrn',
    'action',
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

  navigateToAddGrn(){
    this.router.navigate(['module/add-grn']);
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
