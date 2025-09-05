import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMonthlyBudgetComponent } from './add-monthly-budget.component';

describe('AddMonthlyBudgetComponent', () => {
  let component: AddMonthlyBudgetComponent;
  let fixture: ComponentFixture<AddMonthlyBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMonthlyBudgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMonthlyBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
