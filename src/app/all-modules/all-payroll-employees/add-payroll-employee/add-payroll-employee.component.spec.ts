import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPayrollEmployeeComponent } from './add-payroll-employee.component';

describe('AddEmployeeComponent', () => {
  let component: AddPayrollEmployeeComponent;
  let fixture: ComponentFixture<AddPayrollEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPayrollEmployeeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPayrollEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
