import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanMasterComponent } from './create-loan-master.component';

describe('CreateLoanMasterComponent', () => {
  let component: CreateLoanMasterComponent;
  let fixture: ComponentFixture<CreateLoanMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateLoanMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLoanMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
