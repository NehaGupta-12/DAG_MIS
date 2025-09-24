import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

// export interface ActivityLog {
//   date: number,
//   section: string,
//   action: string,
//   user?: string,
//   description: string
//   currentIp: string
// }

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {

  constructor(private firestore: AngularFirestore) {}
  private collectionName = "activity-log";

  // currentIp = localStorage.getItem('currentip')!
  // env = isDevMode() ? environment.testMode : environment.productionMode
  //
  // constructor(
  //   private readonly mDatabase: AngularFireDatabase,
  //   private readonly mFirestore:AngularFirestore
  //
  // ) {
  //
  // }
  //
  // async addLog (activity:ActivityLog)  {
  //   // activity.currentIp =this.currentIp
  //   let email =await localStorage.getItem('userEmail')
  //   // alert(email)
  //   activity.user=   email!
  //   activity.description=activity.description + ' '+ email
  //   activity.currentIp = this.currentIp
  //   this.mDatabase.list(this.env.activityLog).push(activity)
  //   console.log('Log Added ',JSON.stringify(activity))
  // }
  // getLogs(){
  //   return this.mDatabase.list<ActivityLog>(this.env.activityLog).valueChanges()
  // }
  // getLogsByCount(i:number){
  //   return this.mDatabase.list<ActivityLog>(this.env.activityLog,ref => ref.limitToLast(i)).snapshotChanges()
  //   // return this.mDatabase.list<ActivityLog>('activityLog').snapshotChanges()
  // }




}
