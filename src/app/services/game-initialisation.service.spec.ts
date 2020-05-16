import { TestBed } from '@angular/core/testing';

import { GameInitialisationService } from './game-initialisation.service';

describe('GameInitialisationService', () => {
  let service: GameInitialisationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameInitialisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
