import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletProductComponent } from './outlet-product.component';

describe('OutletProductComponent', () => {
  let component: OutletProductComponent;
  let fixture: ComponentFixture<OutletProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutletProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutletProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
