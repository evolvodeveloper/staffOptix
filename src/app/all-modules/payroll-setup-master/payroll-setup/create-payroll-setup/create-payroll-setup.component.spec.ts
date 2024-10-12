import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePayrollTypeComponent } from './create-payroll-setup.component';

describe('CreatePayrollTypeComponent', () => {
  let component: CreatePayrollTypeComponent;
  let fixture: ComponentFixture<CreatePayrollTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePayrollTypeComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CreatePayrollTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
