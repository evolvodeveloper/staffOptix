import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrulesSetupComponent } from './payrules-setup.component';

describe('PayrulesSetupComponent', () => {
  let component: PayrulesSetupComponent;
  let fixture: ComponentFixture<PayrulesSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrulesSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrulesSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
