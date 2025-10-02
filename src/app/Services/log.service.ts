import {Injectable, isDevMode} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {where} from "@angular/fire/firestore";
import {environmentProduction} from "../../environments/environment.production";

export interface ActivityLog {
  date: number,
  section: string,
  action: string,
  user?: string,
  description: string
  currentIp: string
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  currentIp = localStorage.getItem('currentip')!
  collectionName='activityLog'

  constructor(
    private readonly mDatabase: AngularFireDatabase,
    private readonly mFirestore:AngularFirestore

  ) {

  }

  async addLog (activity:ActivityLog)  {
    // activity.currentIp =this.currentIp
    let email =await localStorage.getItem('userEmail')
    // alert(email)
    activity.user=   email!
    activity.description=activity.description + ' '+ email
    activity.currentIp = this.currentIp
    this.mDatabase.list('activityLog').push(activity)
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
