import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowRunPayrollComponent } from './show-run-payroll.component';

describe('ShowRunPayrollComponent', () => {
  let component: ShowRunPayrollComponent;
  let fixture: ComponentFixture<ShowRunPayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowRunPayrollComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowRunPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
