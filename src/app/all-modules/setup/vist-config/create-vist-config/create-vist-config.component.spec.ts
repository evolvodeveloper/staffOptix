import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVistConfigComponent } from './create-vist-config.component';

describe('CreateVistConfigComponent', () => {
  let component: CreateVistConfigComponent;
  let fixture: ComponentFixture<CreateVistConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVistConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateVistConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
