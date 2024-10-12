import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyAttReportComponent } from './monthly-att-report.component';

describe('MonthlyAttReportComponent', () => {
  let component: MonthlyAttReportComponent;
  let fixture: ComponentFixture<MonthlyAttReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyAttReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyAttReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
