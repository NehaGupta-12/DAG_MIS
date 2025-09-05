import { TestBed } from '@angular/core/testing';

import { MonthlyBudgetService } from './monthly-budget.service';

describe('MonthlyBudgetService', () => {
  let service: MonthlyBudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlyBudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
