import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySaleReportsComponent } from './daily-sale-reports.component';

describe('DailySaleReportsComponent', () => {
  let component: DailySaleReportsComponent;
  let fixture: ComponentFixture<DailySaleReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySaleReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailySaleReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
