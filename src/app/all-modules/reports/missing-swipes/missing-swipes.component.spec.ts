import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingSwipesComponent } from './missing-swipes.component';

describe('MissingSwipesComponent', () => {
  let component: MissingSwipesComponent;
  let fixture: ComponentFixture<MissingSwipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissingSwipesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissingSwipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
