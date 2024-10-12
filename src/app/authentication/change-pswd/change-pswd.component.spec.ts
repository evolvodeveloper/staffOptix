import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePswdComponent } from './change-pswd.component';

describe('ChangePswdComponent', () => {
  let component: ChangePswdComponent;
  let fixture: ComponentFixture<ChangePswdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangePswdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePswdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
