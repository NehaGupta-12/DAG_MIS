import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivityLog } from './activity-log.component';
import {AngularFireDatabase} from "@angular/fire/compat/database"; // adjust path

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  currentIp = localStorage.getItem('currentip')!
  collectionName  = 'activityLog';

  constructor(
    private readonly mDatabase: AngularFireDatabase,
    private readonly mFirestore:AngularFirestore

  ) {

  }

  async addLog (activity:ActivityLog)  {debugger
    // activity.currentIp =this.currentIp
    let email = await localStorage.getItem('userEmail')
    // alert(email)
    activity.user = email!
    activity.description=activity.description + ' '+ email
    activity.currentIp = this.currentIp
    this.mDatabase.list(this.collectionName).push(activity)
    console.log('Log Added ',JSON.stringify(activity))
  }
  getLogs(){
    return this.mDatabase.list<ActivityLog>(this.collectionName).valueChanges()
  }
  getLogsByCount(i:number){
    return this.mDatabase.list<ActivityLog>(this.collectionName,ref => ref.limitToLast(i)).snapshotChanges()
    // return this.mDatabase.list<ActivityLog>('activityLog').snapshotChanges()
  }





}
