import { TestBed } from '@angular/core/testing';

import { BoardTilesService } from './board-tiles.service';

describe('BoardTilesService', () => {
  let service: BoardTilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardTilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
