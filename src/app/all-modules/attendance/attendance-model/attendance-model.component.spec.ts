import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceModelComponent } from './attendance-model.component';

describe('AttendanceModelComponent', () => {
  let component: AttendanceModelComponent;
  let fixture: ComponentFixture<AttendanceModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
