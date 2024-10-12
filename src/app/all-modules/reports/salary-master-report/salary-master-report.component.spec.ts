import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryMasterReportComponent } from './salary-master-report.component';

describe('SalaryMasterReportComponent', () => {
  let component: SalaryMasterReportComponent;
  let fixture: ComponentFixture<SalaryMasterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryMasterReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryMasterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
