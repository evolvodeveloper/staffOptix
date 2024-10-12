import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadsComponent } from './bulk-uploads.component';

describe('BulkUploadsComponent', () => {
  let component: BulkUploadsComponent;
  let fixture: ComponentFixture<BulkUploadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
