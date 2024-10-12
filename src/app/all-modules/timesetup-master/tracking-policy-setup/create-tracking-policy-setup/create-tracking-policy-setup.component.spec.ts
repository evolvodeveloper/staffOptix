import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTrackingPolicySetupComponent } from './create-tracking-policy-setup.component';

describe('CreateTrackingPolicySetupComponent', () => {
  let component: CreateTrackingPolicySetupComponent;
  let fixture: ComponentFixture<CreateTrackingPolicySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTrackingPolicySetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTrackingPolicySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
