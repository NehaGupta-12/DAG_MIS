import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
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
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {AddDealerService} from "../add-dealer.service";
import Swal from "sweetalert2";
import {GrnService} from "../grn.service";
import {Validators} from "@angular/forms";

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
    DatePipe,
    FeatherIconsComponent
  ],
  templateUrl: './grn-list.component.html',
  standalone: true,
  styleUrl: './grn-list.component.scss'
})
export class GRNListComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();

  // Define columns
  columnDefinitions = [
    {def: 'serial', label: 'Serial'},
    {def: 'location', label: 'Location'},
    {def: 'products', label: 'Products'},
    {def: 'openingStock', label: 'OpeningStock'},
    {def: 'grnQuantity', label: 'GrnQuantity'},
    {def: 'typeOfGrn', label: 'GrnType'},
  ];



  displayedColumns: string[] = [
    'serial',
    'location',
    'products',
    'openingStock',
    'grnQuantity',
    'typeOfGrn',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(private dialog: MatDialog,
              private router: Router,
              private grnService: GrnService,
              private injector: EnvironmentInjector,
  ) {
  }

  ngOnInit() {
    this.loadLocationList()
  }

  loadLocationList() {
    runInInjectionContext(this.injector, () => {
      this.grnService.getGrnList().subscribe((data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.dataSource.data)
      });
    });
  }

  editGrn(row: any) {
    this.router.navigate(['module/add-grn'], {
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

  deleteGrn(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Installation!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deletion
        runInInjectionContext(this.injector, () => {
          this.grnService.deleteGrn(id).then(() => {
            this.loadLocationList();


            // Optional: Show success alert
            Swal.fire('Deleted!', 'Installation has been deleted.', 'success');
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Installation is safe.', 'info');
      }
    });
  }


}
