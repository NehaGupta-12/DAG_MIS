import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBudgetProductComponent } from './view-budget-product.component';

describe('ViewBudgetProductComponent', () => {
  let component: ViewBudgetProductComponent;
  let fixture: ComponentFixture<ViewBudgetProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBudgetProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBudgetProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
