import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCustomFeildsComponent } from './create-custom-feilds.component';

describe('CreateCustomFeildsComponent', () => {
  let component: CreateCustomFeildsComponent;
  let fixture: ComponentFixture<CreateCustomFeildsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCustomFeildsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCustomFeildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
