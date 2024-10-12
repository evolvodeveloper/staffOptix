import { TestBed } from '@angular/core/testing';

import { HttpPutService } from './http-put.service';

describe('HttpPutService', () => {
  let service: HttpPutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpPutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
