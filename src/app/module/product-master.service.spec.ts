import { TestBed } from '@angular/core/testing';

import { ProductMasterService } from './product-master.service';

describe('ProductMasterService', () => {
  let service: ProductMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
