import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferTemplateComponent } from './offer-template.component';

describe('OfferTemplateComponent', () => {
  let component: OfferTemplateComponent;
  let fixture: ComponentFixture<OfferTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
