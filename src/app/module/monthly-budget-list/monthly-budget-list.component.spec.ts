import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyBudgetListComponent } from './monthly-budget-list.component';

describe('MonthlyBudgetListComponent', () => {
  let component: MonthlyBudgetListComponent;
  let fixture: ComponentFixture<MonthlyBudgetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyBudgetListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyBudgetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
