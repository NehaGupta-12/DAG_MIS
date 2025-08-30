import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule, DatePipe, NgIf} from "@angular/common";
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
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
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AddUserComponent} from "../add-user/add-user.component";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-view-stock-transfer',
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
    CommonModule
  ],
  templateUrl: './view-stock-transfer.component.html',
  styleUrl: './view-stock-transfer.component.scss'
})
export class ViewStockTransferComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);

  columnDefinitions = [
    { def: 'srNo', label: 'SrNo' },
    { def: 'sku', label: 'SKU' },
    { def: 'name', label: 'Name' },
    { def: 'brand', label: 'Brand' },
    { def: 'model', label: 'Model' },
    { def: 'variant', label: 'Variant' },
    { def: 'quantity', label: 'Quantity' },
    { def: 'unit', label: 'Unit' },
  ];

  displayedColumns: string[] = this.columnDefinitions.map(c => c.def);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log("Received data:", this.data);

    if (this.data?.items) {
      this.dataSource = new MatTableDataSource(this.data.items);
    }
  }

  getDisplayedColumns() {
    return this.columnDefinitions.map(c => c.def);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  isLoading: any;

}
