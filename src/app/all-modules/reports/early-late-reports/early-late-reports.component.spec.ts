import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarlyLateReportsComponent } from './early-late-reports.component';

describe('EarlyLateReportsComponent', () => {
  let component: EarlyLateReportsComponent;
  let fixture: ComponentFixture<EarlyLateReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EarlyLateReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarlyLateReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
