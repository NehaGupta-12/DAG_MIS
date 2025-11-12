import { TestBed } from '@angular/core/testing';

import { CountryselectionService } from './countryselection.service';

describe('CountryselectionService', () => {
  let service: CountryselectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountryselectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
