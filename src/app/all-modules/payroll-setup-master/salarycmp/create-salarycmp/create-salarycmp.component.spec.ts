import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSalarycmpComponent } from './create-salarycmp.component';

describe('CreateSalarycmpComponent', () => {
  let component: CreateSalarycmpComponent;
  let fixture: ComponentFixture<CreateSalarycmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSalarycmpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSalarycmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
