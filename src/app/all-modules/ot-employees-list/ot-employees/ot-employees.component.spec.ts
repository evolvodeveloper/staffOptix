import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtEmployeesComponent } from './ot-employees.component';

describe('OtEmployeesComponent', () => {
  let component: OtEmployeesComponent;
  let fixture: ComponentFixture<OtEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtEmployeesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
