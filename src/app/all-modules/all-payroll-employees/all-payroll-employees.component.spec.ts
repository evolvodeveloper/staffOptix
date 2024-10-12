import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPayrollEmployeesComponent } from './all-payroll-employees.component';

describe('AllEmployeesComponent', () => {
  let component: AllPayrollEmployeesComponent;
  let fixture: ComponentFixture<AllPayrollEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllPayrollEmployeesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllPayrollEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
