import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {GrnService} from "../grn.service";
import {AddUserComponent} from "../add-user/add-user.component";
import Swal from "sweetalert2";
import {OutletProductService} from "../outlet-product.service";
import {MatIcon} from "@angular/material/icon";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-outlet-product-list',
  imports: [
    MatIcon,
    FeatherIconsComponent,
    MatProgressSpinner,
    MatPaginator,
    MatTable
  ],
  templateUrl: './outlet-product-list.component.html',
  standalone: true,
  styleUrl: './outlet-product-list.component.scss'
})
export class OutletProductListComponent  implements OnInit {
  dataSource = new MatTableDataSource<any>();

  // Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'location', label: 'Location'},
    {def: 'openingStock', label: 'OpeningStock'},
    // {def: 'grnQuantity', label: 'GrnQuantity'},
    {def: 'products', label: 'Products'},
    {def: 'typeOfGrn', label: 'GrnType'},
  ];



  displayedColumns: string[] = [
    'serial',
    'location',
    'openingStock',
    // 'grnQuantity',
    'typeOfGrn',
    'quantityCount',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(private dialog: MatDialog,
              private router: Router,
              private grnService: OutletProductService,
              private injector: EnvironmentInjector,
  ) {
  }

  ngOnInit() {
    this.loadLocationList()
  }

  loadLocationList() {
    runInInjectionContext(this.injector, () => {
      this.grnService.getOutletProductList().subscribe((data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.dataSource.data)
      });
    });
  }

  editGrn(row: any) {
    this.router.navigate(['module/add-outlet-product'], {
      queryParams: {data: JSON.stringify(row)}
    });
  }


  openDialog() {
    this.dialog.open(AddUserComponent, {
      // width: '400px',   // set width
      autoFocus: false  // optional
    });
  }

  navigateToAddGrn() {
    this.router.navigate(['module/add-outlet-product']);
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


  getTotalQuantity(row: any): number {
    if (!row?.items) return 0;
    return row.items
      .map((i: any) => i.quantity || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
  }

}
