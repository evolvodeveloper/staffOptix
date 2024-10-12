import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBranchItemComponent } from './add-branch-item.component';

describe('AddBranchItemComponent', () => {
  let component: AddBranchItemComponent;
  let fixture: ComponentFixture<AddBranchItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBranchItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBranchItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
