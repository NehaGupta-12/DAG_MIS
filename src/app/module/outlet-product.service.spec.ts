import { TestBed } from '@angular/core/testing';

import { OutletProductService } from './outlet-product.service';

describe('OutletProductService', () => {
  let service: OutletProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutletProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
