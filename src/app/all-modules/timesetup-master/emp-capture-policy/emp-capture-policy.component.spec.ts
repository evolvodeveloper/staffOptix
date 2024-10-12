import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpCapturePolicyComponent } from './emp-capture-policy.component';

describe('EmpCapturePolicyComponent', () => {
  let component: EmpCapturePolicyComponent;
  let fixture: ComponentFixture<EmpCapturePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmpCapturePolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpCapturePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
