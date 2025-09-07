import {Component, EnvironmentInjector, OnInit, runInInjectionContext} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatPaginator} from "@angular/material/paginator";
import {MatTooltip} from "@angular/material/tooltip";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {AddEditMenuListComponent} from "../add-edit-menu-list/add-edit-menu-list.component";
import {MenuService} from "../../../Services/menu.service";
import {Menus} from "../../../interfaces/menu.interface";

@Component({
  selector: 'app-menu-list',
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTable,
    MatTooltip,
    MatTooltip,
    MatHeaderCellDef,
  ],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent implements OnInit{
  dataSource = new MatTableDataSource<Menus>([]);
  displayedColumns: string[] = [
    'serial',
    'menu_name',
    'menu_url',
    // 'createdBy',
    // 'createdAt',
    'action'
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private injector : EnvironmentInjector,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.loadMenuList();
  }

  loadMenuList() {
    runInInjectionContext(this.injector, () => {
    this.menuService.fetchMenus().subscribe(menus => {
      this.dataSource.data = menus.map((menu: any, index: number) => ({
        ...menu,
        serial: index + 1,
        createdAt: menu.createdAt?.toDate
          ? menu.createdAt.toDate().toLocaleString()
          : menu.createdAt
      }));
      console.log(this.dataSource.data)
    });
    });
  }

  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  navigateToAddMenuList() {
    this.dialog.open(AddEditMenuListComponent, {
      width: '600px',
      disableClose: false,
      data: {}
    });
  }

  editMenuList(row: Menus) {
    this.dialog.open(AddEditMenuListComponent, {
      width: '600px',
      disableClose: false,
      data: row
    });
  }

  deleteMenuList(row: Menus) {
    if (confirm(`Are you sure you want to delete menu "${row.menu_name}"?`)) {
      this.menuService.deleteMenu(row.id!).then(() => {
        this.loadMenuList();
      });
    }
  }
}
