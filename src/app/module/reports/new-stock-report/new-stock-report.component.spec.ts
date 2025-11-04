import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStockReportComponent } from './new-stock-report.component';

describe('NewStockReportComponent', () => {
  let component: NewStockReportComponent;
  let fixture: ComponentFixture<NewStockReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewStockReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewStockReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
