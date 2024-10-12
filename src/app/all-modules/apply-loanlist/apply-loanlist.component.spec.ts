import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyLoanlistComponent } from './apply-loanlist.component';

describe('ApplyLoanlistComponent', () => {
  let component: ApplyLoanlistComponent;
  let fixture: ComponentFixture<ApplyLoanlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplyLoanlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyLoanlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
