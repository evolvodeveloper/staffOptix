import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrolldetailsComponent } from './payrolldetails.component';

describe('PayrolldetailsComponent', () => {
  let component: PayrolldetailsComponent;
  let fixture: ComponentFixture<PayrolldetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrolldetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrolldetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
