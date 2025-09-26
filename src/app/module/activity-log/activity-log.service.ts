  import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { ActivityLog } from './activity-log.component';
  import {AngularFireDatabase} from "@angular/fire/compat/database";
  import {Observable} from "rxjs"; // adjust path

  @Injectable({
    providedIn: 'root',
  })
  export class ActivityLogService {
    currentIp = localStorage.getItem('currentip')!
    collectionName  = 'activityLog';

    constructor(
      private readonly mDatabase: AngularFireDatabase,
      private readonly mFirestore:AngularFirestore,
      private injector : EnvironmentInjector

    ) {

    }

    async addLog (activity:ActivityLog)  {debugger
      let email = await localStorage.getItem('userEmail')
      runInInjectionContext(this.injector, () => {
      activity.user = email!
      activity.description=activity.description + ' '+ email
      activity.currentIp = this.currentIp
        this.mDatabase.list(this.collectionName).push(activity)
        console.log('Log Added ', JSON.stringify(activity))
      });
    }
    getLogs(){
      runInInjectionContext(this.injector, () => {
      return this.mDatabase.list<ActivityLog>(this.collectionName).valueChanges()
      });
    }
    getLogsByCount(i:number): Observable<any[]> {
      return runInInjectionContext(this.injector, () => {
        return this.mDatabase.list<ActivityLog>(this.collectionName, ref => ref.limitToLast(i)).snapshotChanges();
      });
    }





  }
