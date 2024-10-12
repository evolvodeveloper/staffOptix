import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePayrollMasterComponent } from './create-payroll-master.component';

describe('CreatePayrollMasterComponent', () => {
  let component: CreatePayrollMasterComponent;
  let fixture: ComponentFixture<CreatePayrollMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePayrollMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePayrollMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
