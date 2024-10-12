import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOfficelocationComponent } from './create-officelocation.component';

describe('CreateOfficelocationComponent', () => {
  let component: CreateOfficelocationComponent;
  let fixture: ComponentFixture<CreateOfficelocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOfficelocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOfficelocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
