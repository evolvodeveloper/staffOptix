import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCaptureMembersComponent } from './list-capture-members.component';

describe('ListCaptureMembersComponent', () => {
  let component: ListCaptureMembersComponent;
  let fixture: ComponentFixture<ListCaptureMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCaptureMembersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCaptureMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
