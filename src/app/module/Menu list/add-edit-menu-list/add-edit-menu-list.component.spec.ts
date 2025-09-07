import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditMenuListComponent } from './add-edit-menu-list.component';

describe('AddEditMenuListComponent', () => {
  let component: AddEditMenuListComponent;
  let fixture: ComponentFixture<AddEditMenuListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditMenuListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditMenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
