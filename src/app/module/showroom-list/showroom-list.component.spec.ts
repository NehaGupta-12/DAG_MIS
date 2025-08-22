import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowroomListComponent } from './showroom-list.component';

describe('ShowroomListComponent', () => {
  let component: ShowroomListComponent;
  let fixture: ComponentFixture<ShowroomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowroomListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowroomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
