import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesetupMasterComponent } from './timesetup-master.component';

describe('TimesetupMasterComponent', () => {
  let component: TimesetupMasterComponent;
  let fixture: ComponentFixture<TimesetupMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesetupMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesetupMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
