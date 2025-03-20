import { TestBed } from '@angular/core/testing';

import { TawkServiceService } from './tawk-service.service';

describe('TawkServiceService', () => {
  let service: TawkServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TawkServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
