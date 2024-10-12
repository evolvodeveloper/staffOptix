import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtEmployeesListComponent } from './ot-employees-list.component';

describe('OtEmployeesListComponent', () => {
  let component: OtEmployeesListComponent;
  let fixture: ComponentFixture<OtEmployeesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtEmployeesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtEmployeesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
