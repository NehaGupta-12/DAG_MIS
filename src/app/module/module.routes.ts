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

export const MODULES_ROUTE: Route[] = [
  {
    path: 'location',
    component: LocationComponent
  },
  {
    path: 'add-location',
    component: AddLocationComponent
  },
  {
    path: 'user-list',
    component: UserListComponent
  },
  {
    path: 'add-user',
    component: AddUserComponent
  },
  {
    path: 'role-list',
    component: RoleComponent
  },
  {
    path: 'add-role',
    component: AddRoleComponent
  },
  {
    path: 'types',
    component: TypesComponent
  },
  {
    path: 'dealer-list',
    component: DealerListComponent
  },
  {
    path: 'add-dealer',
    component: AddDealerComponent
  },
  {
    path: 'location-product-list',
    component: LocationProductListComponent
  },
  {
    path: 'add-location-product',
    component: AddLocationProductComponent
  },
  {
    path: 'products-master-list',
    component: ProductMasterListComponent
  },
  {
    path: 'add-products-master',
    component: AddProductMasterComponent
  },
  {
    path: 'inventory-list',
    component: InventoryListComponent
  },
  {
    path: 'add-inventory',
    component: AddInventoryComponent
  },

  {
    path: 'daily-sales-list',
    component: DailySalesListComponent
  },
  {
    path: 'add-daily-sales',
    component: AddDailySalesComponent
  },
  {
    path: 'grn-list',
    component: GRNListComponent
  },
  {
    path: 'add-grn',
    component: AddGRNComponent
  },
  {
    path: 'daily-sale-reports',
    component: DailySaleReportsComponent
  },
  {
    path: 'showroom-list',
    component: ShowroomListComponent
  },
  {
    path: 'stock-transfer-list',
    component: StockTransferListComponent
  },
  {
    path: 'add-stock-transfer',
    component: AddStockTransferComponent
  },
  {
    path: 'add-outlet-product',
    component: AddOutletProductComponent
  },
  {
    path: 'outlet-product-list',
    component: OutletProductListComponent
  },
  {
    path:'budget-list',
    component: BudgetListComponent
  },
  {
    path:'add-budget',
    component: AddBudgetComponent
  },
  {
    path:'outlet-dealer-report',
    component: OutletDealerReportComponent
  },
  { path: '**', component: Page404Component },
];
