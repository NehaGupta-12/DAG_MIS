import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOutletProductComponent } from './add-outlet-product.component';

describe('AddOutletProductComponent', () => {
  let component: AddOutletProductComponent;
  let fixture: ComponentFixture<AddOutletProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOutletProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOutletProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
