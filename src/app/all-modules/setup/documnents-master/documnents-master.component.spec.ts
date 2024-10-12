import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumnentsMasterComponent } from './documnents-master.component';

describe('DocumnentsMasterComponent', () => {
  let component: DocumnentsMasterComponent;
  let fixture: ComponentFixture<DocumnentsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumnentsMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumnentsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
