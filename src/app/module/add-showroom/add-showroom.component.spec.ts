import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShowroomComponent } from './add-showroom.component';

describe('AddShowroomComponent', () => {
  let component: AddShowroomComponent;
  let fixture: ComponentFixture<AddShowroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddShowroomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddShowroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
