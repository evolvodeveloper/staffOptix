import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftmodifyModalComponent } from './shiftmodify-modal.component';

describe('ShiftmodifyModalComponent', () => {
  let component: ShiftmodifyModalComponent;
  let fixture: ComponentFixture<ShiftmodifyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShiftmodifyModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftmodifyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
