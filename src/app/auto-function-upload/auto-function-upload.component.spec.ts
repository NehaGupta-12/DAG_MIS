import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoFunctionUploadComponent } from './auto-function-upload.component';

describe('AutoFunctionUploadComponent', () => {
  let component: AutoFunctionUploadComponent;
  let fixture: ComponentFixture<AutoFunctionUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoFunctionUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoFunctionUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
