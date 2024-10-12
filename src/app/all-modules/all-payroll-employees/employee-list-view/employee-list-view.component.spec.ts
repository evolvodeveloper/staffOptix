import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeListViewComponent } from './employee-list-view.component';

describe('EmployeeListViewComponent', () => {
  let component: EmployeeListViewComponent;
  let fixture: ComponentFixture<EmployeeListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeListViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
