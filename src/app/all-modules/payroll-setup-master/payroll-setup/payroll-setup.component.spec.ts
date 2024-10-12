import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollTypesComponent } from './payroll-setup.component';

describe('PayrollTypesComponent', () => {
  let component: PayrollTypesComponent;
  let fixture: ComponentFixture<PayrollTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayrollTypesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PayrollTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
