import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxComponentsComponent } from './tax-components.component';

describe('TaxComponentsComponent', () => {
  let component: TaxComponentsComponent;
  let fixture: ComponentFixture<TaxComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxComponentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
