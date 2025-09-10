import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySaleViewComponent } from './daily-sale-view.component';

describe('DailySaleViewComponent', () => {
  let component: DailySaleViewComponent;
  let fixture: ComponentFixture<DailySaleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySaleViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailySaleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
