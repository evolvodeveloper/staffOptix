import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DowloadPayslipsComponent } from './dowload-payslips.component';

describe('DowloadPayslipsComponent', () => {
  let component: DowloadPayslipsComponent;
  let fixture: ComponentFixture<DowloadPayslipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DowloadPayslipsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DowloadPayslipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
