import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHolidaycalendarComponent } from './create-holidaycalendar.component';

describe('CreateHolidaycalendarComponent', () => {
  let component: CreateHolidaycalendarComponent;
  let fixture: ComponentFixture<CreateHolidaycalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateHolidaycalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHolidaycalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
