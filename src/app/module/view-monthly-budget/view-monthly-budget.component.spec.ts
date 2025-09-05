import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMonthlyBudgetComponent } from './view-monthly-budget.component';

describe('ViewMonthlyBudgetComponent', () => {
  let component: ViewMonthlyBudgetComponent;
  let fixture: ComponentFixture<ViewMonthlyBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMonthlyBudgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMonthlyBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
