import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpBankinfoComponent } from './emp-bankinfo.component';

describe('EmpBankinfoComponent', () => {
  let component: EmpBankinfoComponent;
  let fixture: ComponentFixture<EmpBankinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmpBankinfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpBankinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
