import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollMasterComponent } from './payroll-master.component';

describe('PayrollMasterComponent', () => {
  let component: PayrollMasterComponent;
  let fixture: ComponentFixture<PayrollMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
