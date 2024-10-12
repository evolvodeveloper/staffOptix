import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFromHomeSetupComponent } from './work-from-home-setup.component';

describe('WorkFromHomeSetupComponent', () => {
  let component: WorkFromHomeSetupComponent;
  let fixture: ComponentFixture<WorkFromHomeSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkFromHomeSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkFromHomeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
