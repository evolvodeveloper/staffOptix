import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtSetupListComponent } from './ot-setup-list.component';

describe('OtSetupListComponent', () => {
  let component: OtSetupListComponent;
  let fixture: ComponentFixture<OtSetupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtSetupListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtSetupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
