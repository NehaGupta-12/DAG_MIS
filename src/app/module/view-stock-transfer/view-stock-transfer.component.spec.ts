import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStockTransferComponent } from './view-stock-transfer.component';

describe('ViewStockTransferComponent', () => {
  let component: ViewStockTransferComponent;
  let fixture: ComponentFixture<ViewStockTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStockTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStockTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
