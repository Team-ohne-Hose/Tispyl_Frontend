import { TestBed } from '@angular/core/testing';

import { MariaService } from './maria.service';

describe('MariaService', () => {
  let service: MariaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MariaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
