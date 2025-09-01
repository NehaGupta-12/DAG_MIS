import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletDealerReportComponent } from './outlet-dealer-report.component';

describe('OutletDealerReportComponent', () => {
  let component: OutletDealerReportComponent;
  let fixture: ComponentFixture<OutletDealerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutletDealerReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutletDealerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
