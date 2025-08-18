import { Route } from "@angular/router";
import { MaterialComponent } from "./material/material.component";
import { FontAwesomeComponent } from "./font-awesome/font-awesome.component";
import { Page404Component } from "app/authentication/page404/page404.component";
import { SimpleLineComponent } from "./simple-line/simple-line.component";
import { ThemifyComponent } from "./themify/themify.component";
export const ICONS_ROUTE: Route[] = [
  {
    path: "",
    redirectTo: "material",
    pathMatch: "full",
  },
  {
    path: "material",
    component: MaterialComponent,
  },
  {
    path: 'simple-line',
    component: SimpleLineComponent
  },
  {
    path: "font-awesome",
    component: FontAwesomeComponent,
  },
  {
    path: 'themify',
    component: ThemifyComponent
  },
  { path: '**', component: Page404Component },
];
