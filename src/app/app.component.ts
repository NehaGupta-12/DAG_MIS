import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterModule } from '@angular/router';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import {IpService} from "./Services/ip.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {Observable} from "rxjs";
import { NetworkService } from "./module/network.service";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, PageLoaderComponent, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent {
  currentUrl!: string;
  ipAddress: string = '';
  constructor(public _router: Router,
              private http: HttpClient,
              private ipService : IpService,
              private networkService: NetworkService,
              private snackBar: MatSnackBar
  ) {
    // ✅ Router Events
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

    // ✅ Network Events
    this.networkService.onlineStatus$.subscribe((isOnline) => {
      console.log('Network status:', isOnline ? 'ONLINE ✅' : 'OFFLINE ❌');

      if (!isOnline) {
        this.snackBar.open('⚠️ Network is disconnected', 'Dismiss', {
          duration: 5000,
          panelClass: ['snackbar-error'],
          verticalPosition: 'top', // <-- Add this
          horizontalPosition: 'center', // optional: center it horizontally
        });
      } else {
        // When back online
        this.snackBar.open('✅ Back Online', 'OK', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          verticalPosition: 'top', // <-- Add this
          horizontalPosition: 'center',
        });
      }
    });

    this.ipService.getIpAddress().subscribe((response: any) => {
      this.ipAddress = response.ip;
      localStorage.setItem('currentip', this.ipAddress);
    });

  }


}
