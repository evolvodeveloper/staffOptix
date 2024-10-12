import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InialChangePswdComponent } from './inial-change-pswd.component';

describe('InialChangePswdComponent', () => {
  let component: InialChangePswdComponent;
  let fixture: ComponentFixture<InialChangePswdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InialChangePswdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InialChangePswdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
