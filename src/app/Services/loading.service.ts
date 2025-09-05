import {Injectable, signal} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly _loading = signal(false);
  readonly isLoading = this._loading.asReadonly();

  setLoading(state: boolean) {
    this._loading.set(state);
  }
}
