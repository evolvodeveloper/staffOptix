import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetLogComponent } from './timesheet-log.component';

describe('TimesheetLogComponent', () => {
  let component: TimesheetLogComponent;
  let fixture: ComponentFixture<TimesheetLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
