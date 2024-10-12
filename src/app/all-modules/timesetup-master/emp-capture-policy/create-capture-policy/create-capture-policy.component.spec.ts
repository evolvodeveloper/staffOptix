import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCapturePolicyComponent } from './create-capture-policy.component';

describe('CreateCapturePolicyComponent', () => {
  let component: CreateCapturePolicyComponent;
  let fixture: ComponentFixture<CreateCapturePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCapturePolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCapturePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
