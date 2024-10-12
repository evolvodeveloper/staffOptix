import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyRoasterComponent } from './daily-roaster.component';

describe('DailyRoasterComponent', () => {
  let component: DailyRoasterComponent;
  let fixture: ComponentFixture<DailyRoasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyRoasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyRoasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
