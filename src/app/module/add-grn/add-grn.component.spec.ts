import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGRNComponent } from './add-grn.component';

describe('AddGRNComponent', () => {
  let component: AddGRNComponent;
  let fixture: ComponentFixture<AddGRNComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGRNComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGRNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
