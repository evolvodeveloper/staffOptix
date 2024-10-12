import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollComponentListComponent } from './payroll-component-list.component';

describe('PayrollComponentListComponent', () => {
  let component: PayrollComponentListComponent;
  let fixture: ComponentFixture<PayrollComponentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollComponentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollComponentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
