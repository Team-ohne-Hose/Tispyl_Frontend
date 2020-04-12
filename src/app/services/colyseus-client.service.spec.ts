import { TestBed } from '@angular/core/testing';

import { ColyseusClientService } from './colyseus-client.service';

describe('ColyseusClientService', () => {
  let service: ColyseusClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColyseusClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
