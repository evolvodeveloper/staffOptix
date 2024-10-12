import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollSetupMasterComponent } from './payroll-setup-master.component';

describe('PayrollSetupMasterComponent', () => {
  let component: PayrollSetupMasterComponent;
  let fixture: ComponentFixture<PayrollSetupMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollSetupMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollSetupMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
