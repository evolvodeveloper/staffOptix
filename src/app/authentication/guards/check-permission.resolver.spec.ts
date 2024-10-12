import { TestBed } from '@angular/core/testing';

import { CheckPermissionResolver } from './check-permission.resolver';

describe('CheckPermissionResolver', () => {
  let resolver: CheckPermissionResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CheckPermissionResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
