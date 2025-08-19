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
    component: ProductMasterListComponent
  },
  {
    path: 'add-daily-sales',
    component: AddProductMasterComponent
  },
  {
    path: 'grn-list',
    component: InventoryListComponent
  },
  {
    path: 'add-grn',
    component: AddInventoryComponent
  },
  { path: '**', component: Page404Component },
];
