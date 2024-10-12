import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocAllowanceComponent } from './adhoc-allowance.component';

describe('AdhocAllowanceComponent', () => {
  let component: AdhocAllowanceComponent;
  let fixture: ComponentFixture<AdhocAllowanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdhocAllowanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdhocAllowanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
