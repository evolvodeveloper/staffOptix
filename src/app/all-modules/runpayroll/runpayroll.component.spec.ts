import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunpayrollComponent } from './runpayroll.component';

describe('RunpayrollComponent', () => {
  let component: RunpayrollComponent;
  let fixture: ComponentFixture<RunpayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunpayrollComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunpayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
