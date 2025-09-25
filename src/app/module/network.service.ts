import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  onlineStatus$ = this.onlineStatus.asObservable();

  constructor(private zone: NgZone) {
    // Online event
    window.addEventListener('online', () => {
      console.log('✅ Online event triggered'); // <-- added log
      this.zone.run(() => this.onlineStatus.next(true));
    });

    // Offline event
    window.addEventListener('offline', () => {
      console.log('❌ Offline event triggered'); // <-- added log
      this.zone.run(() => this.onlineStatus.next(false));
    });
  }
}
