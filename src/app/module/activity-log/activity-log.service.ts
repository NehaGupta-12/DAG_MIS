import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivityLog } from './activity-log.component'; // adjust path

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  private collectionName = 'activity-log';

  constructor(private afs: AngularFirestore) {}

  addLog(log: { date: number; currentIp: string; action: string; description: string; section: string }) {debugger
    return this.afs.collection<ActivityLog>(this.collectionName).add(<ActivityLog>log);
  }

  getLogsByCount(limit: number) {
    return this.afs.collection<ActivityLog>(
        this.collectionName,
        ref => ref.orderBy('date', 'desc').limit(limit)
    ).snapshotChanges();
  }
}
