import {Component, EnvironmentInjector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
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
import {FeatherIconsComponent} from "@shared/components/feather-icons/feather-icons.component";
import Swal from "sweetalert2";
import {AuthService} from "../../../authentication/auth.service";
import {ActivityLogService} from "../../activity-log/activity-log.service";

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
    FeatherIconsComponent,
  ],
  templateUrl: './menu-list.component.html',
  standalone: true,
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private injector : EnvironmentInjector,
    private menuService: MenuService,
    public authService : AuthService,
    private mService: ActivityLogService,
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
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // ✅ ADD
  navigateToAddMenuList() {
    this.dialog.open(AddEditMenuListComponent, {
      width: '600px',
      disableClose: false,
      data: {}
    }).afterClosed().subscribe(result => {
      if (result) {
        // reload after add
        this.loadMenuList();

        // 👉 log activity
        this.mService.addLog({
          date: Date.now(),
          section: "Menu",
          action: "Add",
          description: `Added menu: ${result.menu_name}`,
        });
      }
    });
  }

  // ✅ EDIT
  editMenuList(row: Menus) {
    this.dialog.open(AddEditMenuListComponent, {
      width: '600px',
      disableClose: false,
      data: row
    }).afterClosed().subscribe(result => {
      if (result) {
        // reload after edit
        this.loadMenuList();

        // 👉 log activity
        this.mService.addLog({
          date: Date.now(),
          section: "Menu",
          action: "Edit",
          description: `Edited menu: ${row.menu_name}`,
        });
      }
    });
  }

  // ✅ DELETE
  deleteMenuList(row: Menus) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You will not be able to recover the menu "${row.menu_name}"!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      runInInjectionContext(this.injector, () => {
        this.menuService.deleteMenu(row.id!)
          .then(() => {
            this.loadMenuList();
            Swal.fire('Deleted!', 'Menu has been deleted.', 'success');

            // 👉 log activity
            this.mService.addLog({
              date: Date.now(),
              section: "Menu",
              action: "Delete",
              description: `Deleted menu: ${row.menu_name}`,
            });
          })
          .catch((err) => {
            console.error('Delete menu failed:', err);
            Swal.fire('Error', 'Failed to delete the menu. Please try again.', 'error');
          });
      });
    });
  }

}
