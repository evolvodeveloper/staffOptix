import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanMasterComponent } from './loan-master.component';

describe('LoanMasterComponent', () => {
  let component: LoanMasterComponent;
  let fixture: ComponentFixture<LoanMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
