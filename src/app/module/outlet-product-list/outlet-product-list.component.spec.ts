import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletProductListComponent } from './outlet-product-list.component';

describe('OutletProductListComponent', () => {
  let component: OutletProductListComponent;
  let fixture: ComponentFixture<OutletProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutletProductListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutletProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
