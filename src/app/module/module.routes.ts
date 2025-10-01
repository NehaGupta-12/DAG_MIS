import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import {LocationComponent} from "./location/location.component";
import {UserListComponent} from "./user-list/user-list.component";
import {AddUserComponent} from "./add-user/add-user.component";
import {RoleComponent} from "./role/role.component";
import {AddRoleComponent} from "./add-role/add-role.component";
import {TypesComponent} from "./types/types.component";
import {DealerListComponent} from "./dealer-list/dealer-list.component";
import {AddDealerComponent} from "./add-dealer/add-dealer.component";
import {AddLocationProductComponent} from "./add-location-product/add-location-product.component";
import {LocationProductListComponent} from "./location-product-list/location-product-list.component";
import {AddLocationComponent} from "./add-location/add-location.component";
import {ProductMasterListComponent} from "./product-master-list/product-master-list.component";
import {AddProductMasterComponent} from "./add-product-master/add-product-master.component";
import {InventoryListComponent} from "./inventory-list/inventory-list.component";
import {AddInventoryComponent} from "./add-inventory/add-inventory.component";
import {DailySaleReportsComponent} from "./reports/daily-sale-reports/daily-sale-reports.component";
import {DailySalesListComponent} from "./daily-sales-list/daily-sales-list.component";
import {AddDailySalesComponent} from "./add-daily-sales/add-daily-sales.component";
import {GRNListComponent} from "./grn-list/grn-list.component";
import {AddGRNComponent} from "./add-grn/add-grn.component";
import {ShowroomListComponent} from "./showroom-list/showroom-list.component";
import {StockTransferListComponent} from "./stock-transfer-list/stock-transfer-list.component";
import {AddStockTransferComponent} from "./add-stock-transfer/add-stock-transfer.component";
import {AddOutletProductComponent} from "./add-outlet-product/add-outlet-product.component";
import {OutletProductListComponent} from "./outlet-product-list/outlet-product-list.component";
import {OutletDealerReportComponent} from "./outlet-dealer-report/outlet-dealer-report.component";
import {BudgetListComponent} from "./budget-list/budget-list.component";
import {AddBudgetComponent} from "./add-budget/add-budget.component";
import {StockTransferReportComponent} from "./stock-transfer-report/stock-transfer-report.component";
import {StockReportComponent} from "./reports/stock-report/stock-report.component";
import {AddMonthlyBudgetComponent} from "./add-monthly-budget/add-monthly-budget.component";
import {ViewMonthlyBudgetComponent} from "./view-monthly-budget/view-monthly-budget.component";
import {MonthlyBudgetListComponent} from "./monthly-budget-list/monthly-budget-list.component";
import {ViewUserComponent} from "./view-user/view-user.component";
import {MenuListComponent} from "./Menu list/menu-list/menu-list.component";
import {AddEditMenuListComponent} from "./Menu list/add-edit-menu-list/add-edit-menu-list.component";
import {AuthGuard} from "../authentication/auth.guard";
import {ActivityLogComponent} from "./activity-log/activity-log.component";
import {AutoFunctionUploadComponent} from "../auto-function-upload/auto-function-upload.component";


export const MODULES_ROUTE: Route[] = [
  {
    path: 'location',
    component: LocationComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-location',
    component: AddLocationComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'user-list',
    component: UserListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-user',
    component: AddUserComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'edit-user/:id',
    component: AddUserComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'view-user/:id',
    component: ViewUserComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'role-list',
    component: RoleComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'menu-list',
    component: MenuListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-menu',
    component: AddEditMenuListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-role',
    component: AddRoleComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'edit-role/:id',
    component: AddRoleComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'types',
    component: TypesComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'dealer-list',
    component: DealerListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-dealer',
    component: AddDealerComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'location-product-list',
    component: LocationProductListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-location-product',
    component: AddLocationProductComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'products-master-list',
    component: ProductMasterListComponent,
    canActivate:[AuthGuard]
  },

  {
    path:'activity-log',
    component:ActivityLogComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-products-master',
    component: AddProductMasterComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'inventory-list',
    component: InventoryListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-inventory',
    component: AddInventoryComponent,
    canActivate:[AuthGuard]
  },

  {
    path: 'daily-sales-list',
    component: DailySalesListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-daily-sales',
    component: AddDailySalesComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'grn-list',
    component: GRNListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-grn',
    component: AddGRNComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'daily-sale-reports',
    component: DailySaleReportsComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'stock-reports',
    component: StockReportComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'showroom-list',
    component: ShowroomListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'stock-transfer-list',
    component: StockTransferListComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-stock-transfer',
    component: AddStockTransferComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'add-outlet-product',
    component: AddOutletProductComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'outlet-product-list',
    component: OutletProductListComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'outlet-dealer-report',
    component: OutletDealerReportComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'budget-list',
    component: BudgetListComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'add-budget',
    component: AddBudgetComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'add-monthly-budget',
    component:AddMonthlyBudgetComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'view-monthly-budget',
    component: ViewMonthlyBudgetComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'monthly-budget-list',
    component: MonthlyBudgetListComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'product-master-list',
    component: ProductMasterListComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'auto-function-upload',
    component: AutoFunctionUploadComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'stock-transfer-report',
    component: StockTransferReportComponent,
    canActivate:[AuthGuard]
  },
  { path: '**', component: Page404Component },
];
