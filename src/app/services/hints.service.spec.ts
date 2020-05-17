import { TestBed } from '@angular/core/testing';

import { HintsService } from './hints.service';

describe('HintsService', () => {
  let service: HintsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HintsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
