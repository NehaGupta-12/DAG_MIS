import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountrySelectionService {
  private selectedCountriesSubject = new BehaviorSubject<string[]>(['All']);
  public selectedCountries$: Observable<string[]> = this.selectedCountriesSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('selectedCountries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.selectedCountriesSubject.next(parsed);
      } catch (e) {
        console.error('Error parsing saved countries:', e);
      }
    }
  }

  setSelectedCountries(countries: string[]): void {
    this.selectedCountriesSubject.next(countries);
    localStorage.setItem('selectedCountries', JSON.stringify(countries));
  }

  getSelectedCountries(): string[] {
    return this.selectedCountriesSubject.value;
  }

  clearSelection(): void {
    this.selectedCountriesSubject.next(['All']);
    localStorage.removeItem('selectedCountries');
  }
}
