import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicemasterComponent } from './devicemaster.component';

describe('DevicemasterComponent', () => {
  let component: DevicemasterComponent;
  let fixture: ComponentFixture<DevicemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevicemasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
