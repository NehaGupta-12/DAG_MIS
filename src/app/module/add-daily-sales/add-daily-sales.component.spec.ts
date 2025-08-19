import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDailySalesComponent } from './add-daily-sales.component';

describe('AddDailySalesComponent', () => {
  let component: AddDailySalesComponent;
  let fixture: ComponentFixture<AddDailySalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDailySalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDailySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
