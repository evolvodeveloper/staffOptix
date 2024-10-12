import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingPolicySetupComponent } from './tracking-policy-setup.component';

describe('TrackingPolicySetupComponent', () => {
  let component: TrackingPolicySetupComponent;
  let fixture: ComponentFixture<TrackingPolicySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackingPolicySetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackingPolicySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
