import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeviceLocationComponent } from './create-device-location.component';

describe('CreateDeviceLocationComponent', () => {
  let component: CreateDeviceLocationComponent;
  let fixture: ComponentFixture<CreateDeviceLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDeviceLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDeviceLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
