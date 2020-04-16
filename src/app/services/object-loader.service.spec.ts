import { TestBed } from '@angular/core/testing';

import { ObjectLoaderService } from './object-loader.service';

describe('ObjectLoaderService', () => {
  let service: ObjectLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
