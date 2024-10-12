import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarycmpComponent } from './salarycmp.component';

describe('SalarycmpComponent', () => {
  let component: SalarycmpComponent;
  let fixture: ComponentFixture<SalarycmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalarycmpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarycmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
