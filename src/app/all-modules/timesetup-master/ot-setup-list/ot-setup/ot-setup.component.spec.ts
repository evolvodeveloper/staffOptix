import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtSetupComponent } from './ot-setup.component';

describe('OtSetupComponent', () => {
  let component: OtSetupComponent;
  let fixture: ComponentFixture<OtSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
