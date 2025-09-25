
import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterModule } from '@angular/router';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import {IpService} from "./Services/ip.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {Observable} from "rxjs";
@Component({
  selector: 'app-root',
  imports: [RouterModule, PageLoaderComponent, HttpClientModule],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentUrl!: string;
  ipAddress: string = '';
  constructor(public _router: Router,
              private http: HttpClient,
              private ipService : IpService) {
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        /* empty */
      }
      window.scrollTo(0, 0);
    });
    this.ipService.getIpAddress().subscribe((response: any) => {
      this.ipAddress = response.ip;
      localStorage.setItem('currentip', this.ipAddress);
    });

  }


}
