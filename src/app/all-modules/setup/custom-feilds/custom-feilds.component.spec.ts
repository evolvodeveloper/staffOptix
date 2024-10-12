import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFeildsComponent } from './custom-feilds.component';

describe('CustomFeildsComponent', () => {
  let component: CustomFeildsComponent;
  let fixture: ComponentFixture<CustomFeildsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFeildsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFeildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
