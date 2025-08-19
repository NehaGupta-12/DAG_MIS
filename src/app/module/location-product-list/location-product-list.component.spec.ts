import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationProductListComponent } from './location-product-list.component';

describe('LocationProductListComponent', () => {
  let component: LocationProductListComponent;
  let fixture: ComponentFixture<LocationProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationProductListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
