import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxComponent } from './income-tax.component';

describe('IncomeTaxComponent', () => {
  let component: IncomeTaxComponent;
  let fixture: ComponentFixture<IncomeTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
