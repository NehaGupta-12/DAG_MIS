import { TestBed } from '@angular/core/testing';

import { DailySalesService } from './daily-sales.service';

describe('DailySalesService', () => {
  let service: DailySalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailySalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
