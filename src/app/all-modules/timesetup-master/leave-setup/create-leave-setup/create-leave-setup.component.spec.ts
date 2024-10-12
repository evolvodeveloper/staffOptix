import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLeaveSetupComponent } from './create-leave-setup.component';

describe('CreateLeaveSetupComponent', () => {
  let component: CreateLeaveSetupComponent;
  let fixture: ComponentFixture<CreateLeaveSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateLeaveSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLeaveSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
