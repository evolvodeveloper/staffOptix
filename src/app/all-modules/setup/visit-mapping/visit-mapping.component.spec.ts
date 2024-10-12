import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitMappingComponent } from './visit-mapping.component';

describe('VisitMappingComponent', () => {
  let component: VisitMappingComponent;
  let fixture: ComponentFixture<VisitMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
