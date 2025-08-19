import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySalesListComponent } from './daily-sales-list.component';

describe('DailySalesListComponent', () => {
  let component: DailySalesListComponent;
  let fixture: ComponentFixture<DailySalesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySalesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailySalesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
