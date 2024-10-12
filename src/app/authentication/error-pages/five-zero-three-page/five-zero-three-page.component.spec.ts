import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiveZeroThreePageComponent } from './five-zero-three-page.component';

describe('FiveZeroThreePageComponent', () => {
  let component: FiveZeroThreePageComponent;
  let fixture: ComponentFixture<FiveZeroThreePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiveZeroThreePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiveZeroThreePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
