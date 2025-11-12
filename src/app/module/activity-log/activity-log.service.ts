
  import {EnvironmentInjector, Injectable, isDevMode, runInInjectionContext} from '@angular/core';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { ActivityLog } from './activity-log.component';
  import { AngularFireDatabase } from "@angular/fire/compat/database";
  import { Observable, firstValueFrom } from "rxjs";
  import { IpService } from "../../Services/ip.service";
  import {environment} from "../../../environments/environment"; // adjust path

  @Injectable({
    providedIn: 'root',
  })
  export class ActivityLogService {
    env = isDevMode() ? environment.testCollections : environment.collections

    constructor(
      private readonly mDatabase: AngularFireDatabase,
      private readonly mFirestore: AngularFirestore,
      private injector: EnvironmentInjector,
      private ipService: IpService   //inject IpService
    ) {}

    async addLog(activity: ActivityLog) {
      let email = localStorage.getItem('userEmail') || 'Unknown User';

      // ✅ fetch IP dynamically
      let ip: string;
      try {
        const res: any = await firstValueFrom(this.ipService.getIpAddress());
        ip = res?.ip || 'N/A';
        localStorage.setItem('currentip', ip); // keep a copy
      } catch (err) {
        ip = 'N/A';
      }

      runInInjectionContext(this.injector, () => {
        activity.user = email;
        activity.description = (activity.description || '') + ' ' + email;
        activity.currentIp = ip;

        this.mDatabase.list(this.env.activityLog).push(activity);
        console.log('Log Added ', JSON.stringify(activity));
      });
    }

    getLogs() {
      return runInInjectionContext(this.injector, () => {
        return this.mDatabase.list<ActivityLog>(this.env.activityLog).valueChanges();
      });
    }

    getLogsByCount(i: number): Observable<any[]> {
      return runInInjectionContext(this.injector, () => {
        return this.mDatabase
          .list<ActivityLog>(this.env.activityLog, ref => ref.limitToLast(i))
          .snapshotChanges();
      });
    }
  }


