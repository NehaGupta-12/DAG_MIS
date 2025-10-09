import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeformComponent } from './practiceform.component';

describe('PracticeformComponent', () => {
  let component: PracticeformComponent;
  let fixture: ComponentFixture<PracticeformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticeformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
