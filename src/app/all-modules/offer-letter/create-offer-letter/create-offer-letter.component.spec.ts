import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOfferLetterComponent } from './create-offer-letter.component';

describe('CreateOfferLetterComponent', () => {
  let component: CreateOfferLetterComponent;
  let fixture: ComponentFixture<CreateOfferLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOfferLetterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOfferLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
