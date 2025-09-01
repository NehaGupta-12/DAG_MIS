import { TestBed } from '@angular/core/testing';

import { OutletReportService } from './outlet-report.service';

describe('OutletReportService', () => {
  let service: OutletReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutletReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
