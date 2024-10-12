import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePayrulesSetupComponent } from './create-payrules-setup.component';

describe('CreatePayrulesSetupComponent', () => {
  let component: CreatePayrulesSetupComponent;
  let fixture: ComponentFixture<CreatePayrulesSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePayrulesSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePayrulesSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
