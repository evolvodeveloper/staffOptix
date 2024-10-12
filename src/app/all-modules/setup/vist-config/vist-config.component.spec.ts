import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistConfigComponent } from './vist-config.component';

describe('VistConfigComponent', () => {
  let component: VistConfigComponent;
  let fixture: ComponentFixture<VistConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
