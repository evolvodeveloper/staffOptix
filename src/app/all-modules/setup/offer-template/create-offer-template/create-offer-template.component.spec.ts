import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOfferTemplateComponent } from './create-offer-template.component';

describe('CreateOfferTemplateComponent', () => {
  let component: CreateOfferTemplateComponent;
  let fixture: ComponentFixture<CreateOfferTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOfferTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOfferTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
