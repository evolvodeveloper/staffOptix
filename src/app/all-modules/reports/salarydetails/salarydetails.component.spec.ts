import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarydetailsComponent } from './salarydetails.component';

describe('SalarydetailsComponent', () => {
  let component: SalarydetailsComponent;
  let fixture: ComponentFixture<SalarydetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalarydetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarydetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
