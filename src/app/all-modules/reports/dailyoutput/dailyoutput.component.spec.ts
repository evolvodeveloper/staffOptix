import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyoutputComponent } from './dailyoutput.component';

describe('DailyoutputComponent', () => {
  let component: DailyoutputComponent;
  let fixture: ComponentFixture<DailyoutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyoutputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyoutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
