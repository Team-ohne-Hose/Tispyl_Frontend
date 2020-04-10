import { TestBed } from '@angular/core/testing';

import { SceneBuilderService } from './scene-builder.service';

describe('SceneBuilderService', () => {
  let service: SceneBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SceneBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
