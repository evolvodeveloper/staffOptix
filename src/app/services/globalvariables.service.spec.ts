import { TestBed } from '@angular/core/testing';

import { GlobalvariablesService } from './globalvariables.service';

describe('GlobalvariablesService', () => {
  let service: GlobalvariablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalvariablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
