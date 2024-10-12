import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeedataSyncComponent } from './employeedata-sync.component';

describe('EmployeedataSyncComponent', () => {
  let component: EmployeedataSyncComponent;
  let fixture: ComponentFixture<EmployeedataSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeedataSyncComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeedataSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
