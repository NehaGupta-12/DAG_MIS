import { Component } from '@angular/core';
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatPaginator} from "@angular/material/paginator";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {AddEditMenuListComponent} from "../add-edit-menu-list/add-edit-menu-list.component";

@Component({
  selector: 'app-menu-list',
  imports: [
    FeatherIconsComponent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
    MatTooltip,
    NgIf,
    MatTooltip,
    MatHeaderCellDef
  ],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'serial',
    'name',
    'sku',
    'variant',
    'dealerOutlet',
    'quantity',
    'typeOfGrn',
    'action'
  ];

   constructor(private router : Router,
               private dialog : MatDialog,) {
   }
  applyFilter($event: KeyboardEvent) {
  }
  navigateToAddMenuList() {
    this.dialog.open(AddEditMenuListComponent, {
      width: '600px',
      disableClose: false,
      data: {}                 // optional: you can pass data to the dialog here
    });
  }
  editMenuList(row:any) {

  }

  deleteMenuList(row:any) {

  }
}
