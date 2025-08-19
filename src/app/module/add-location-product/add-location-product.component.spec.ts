import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocationProductComponent } from './add-location-product.component';

describe('AddLocationProductComponent', () => {
  let component: AddLocationProductComponent;
  let fixture: ComponentFixture<AddLocationProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLocationProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLocationProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
