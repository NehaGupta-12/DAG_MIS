import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import {LocationComponent} from "./location/location.component";

export const MODULES_ROUTE: Route[] = [
  {
    path: 'location',
    component: LocationComponent
  },
  { path: '**', component: Page404Component },
];
