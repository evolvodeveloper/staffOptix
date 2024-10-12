import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtReportComponent } from './ot-report.component';

describe('OtReportComponent', () => {
  let component: OtReportComponent;
  let fixture: ComponentFixture<OtReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
